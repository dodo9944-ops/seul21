/**
 * 세울 홈페이지 텔레그램 관리자 봇 (Vercel Serverless)
 *
 * 웹훅 URL: https://seul21.vercel.app/api/telegram-admin
 *
 * 지원 명령:
 *   /status              - 사이트·배포·최근 커밋 상태
 *   /deploy              - Vercel 재배포 트리거
 *   /news_add            - 뉴스 등록 (대화형 위저드)
 *   /news_del <id|번호>  - 뉴스 삭제 (자동 백업 브랜치 생성)
 *   /news_crawl          - 정비사업 뉴스 RSS 수집 → 승인 → 등록
 *   /case_add            - PDF 업로드 → 사례집 등록
 *   /help                - 명령어 목록
 *   /cancel              - 진행 중 위저드 취소
 *
 * 필요한 환경변수 (Vercel):
 *   TELEGRAM_BOT_TOKEN          - @BotFather 토큰
 *   TELEGRAM_WEBHOOK_SECRET     - 웹훅 검증용 랜덤 문자열
 *   TELEGRAM_ADMIN_IDS          - 관리자 user ID 쉼표 구분 (예: "123,456")
 *   GITHUB_TOKEN                - PAT, scope: repo
 *   VERCEL_DEPLOY_HOOK_URL      - Vercel Git Deploy Hook URL (선택, 없으면 /deploy는 GitHub 빈 커밋 푸시로 fallback)
 *   VERCEL_API_TOKEN            - Vercel API 토큰 (선택, /status의 빌드상태)
 *   VERCEL_PROJECT_ID           - Vercel 프로젝트 ID (선택)
 *   VERCEL_TEAM_ID              - Vercel 팀 ID (팀 소유 프로젝트일 때)
 *   SITE_URL                    - 헬스체크 대상 (기본: https://seul21.vercel.app)
 */

'use strict';

const REPO = 'dodo9944-ops/seul21';
const REPO_BRANCH = 'master';
const GITHUB_API = 'https://api.github.com';
const TELEGRAM_API = 'https://api.telegram.org/bot';
const MOCK_DATA_PATH = 'redevelopment/assets/data/mock-data.js';
const SESSION_PATH = 'redevelopment/data/telegram-sessions.json';
const NEWS_DIR = 'redevelopment/downloads';
const CASE_DIR = 'redevelopment/downloads';
const PC_QUEUE_PATH = 'redevelopment/data/pc-queue.json';
const PC_QUEUE_TTL_MS = 7 * 24 * 3600 * 1000;
const PC_COMMANDS = new Set(['pc_info', 'pc_screen', 'pc_lock', 'pc_shutdown', 'pc_restart', 'pc_abort', 'pc_run', 'pc_ping', 'pc_youtube', 'pc_music', 'pc_trot', 'pc_mail', 'pc_claude']);
const PC_ALIASES = {
  '핑': 'pc_ping',
  '정보': 'pc_info',
  '화면': 'pc_screen',
  '잠금': 'pc_lock',
  '컴꺼': 'pc_shutdown',
  '재시작': 'pc_restart',
  '취소': 'pc_abort',
  '실행': 'pc_run',
  '유튜브': 'pc_youtube',
  '음악': 'pc_music',
  '트로트': 'pc_trot',
  '메일': 'pc_mail',
  '지메일': 'pc_mail',
  '클로드': 'pc_claude'
};
const DEFAULT_SITE_URL = 'https://seul21.vercel.app';

const NEWS_CATEGORIES = ['정책', '시장분석', '개발호재', '분석', '판례', '기타'];
const CRAWL_FEEDS = [
  'https://news.google.com/rss/search?q=%EC%A0%95%EB%B9%84%EC%82%AC%EC%97%85&hl=ko&gl=KR&ceid=KR:ko',
  'https://news.google.com/rss/search?q=%EC%9E%AC%EA%B0%9C%EB%B0%9C&hl=ko&gl=KR&ceid=KR:ko',
  'https://news.google.com/rss/search?q=%EC%9E%AC%EA%B1%B4%EC%B6%95&hl=ko&gl=KR&ceid=KR:ko'
];

// ══════════════════════════════════════════════════════════════
// 유틸
// ══════════════════════════════════════════════════════════════

function env(key, fallback) {
  const v = process.env[key];
  return (v === undefined || v === '') ? fallback : v;
}

function isAdmin(userId) {
  const list = env('TELEGRAM_ADMIN_IDS', '').split(',').map(s => s.trim()).filter(Boolean);
  return list.includes(String(userId));
}

function pad(n) { return String(n).padStart(2, '0'); }
function todayStr() {
  const d = new Date(Date.now() + 9 * 3600 * 1000); // KST
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}
function stampStr() {
  const d = new Date(Date.now() + 9 * 3600 * 1000);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}`;
}

function esc(s) {
  return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

// ══════════════════════════════════════════════════════════════
// 텔레그램 API
// ══════════════════════════════════════════════════════════════

async function tg(method, payload) {
  const token = env('TELEGRAM_BOT_TOKEN');
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN 미설정');
  const res = await fetch(`${TELEGRAM_API}${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram ${method}: ${data.description || 'unknown'}`);
  return data.result;
}

async function send(chatId, text, opts = {}) {
  const MAX = 4000;
  if (text.length <= MAX) {
    return tg('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true, ...opts });
  }
  // 길면 분할 전송
  const parts = [];
  for (let i = 0; i < text.length; i += MAX) parts.push(text.slice(i, i + MAX));
  for (let i = 0; i < parts.length; i++) {
    await tg('sendMessage', { chat_id: chatId, text: parts[i], parse_mode: 'HTML', disable_web_page_preview: true, ...(i === parts.length - 1 ? opts : {}) });
  }
}

async function answerCallback(callbackId, text) {
  try { await tg('answerCallbackQuery', { callback_query_id: callbackId, text }); } catch (_) { }
}

async function getTelegramFileUrl(fileId) {
  const token = env('TELEGRAM_BOT_TOKEN');
  const info = await tg('getFile', { file_id: fileId });
  return `https://api.telegram.org/file/bot${token}/${info.file_path}`;
}

// ══════════════════════════════════════════════════════════════
// GitHub API
// ══════════════════════════════════════════════════════════════

async function gh(path, opts = {}) {
  const token = env('GITHUB_TOKEN');
  if (!token) throw new Error('GITHUB_TOKEN 미설정');
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'User-Agent': 'seul21-telegram-admin',
      ...(opts.headers || {})
    }
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub ${path}: ${res.status} ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function ghGetFile(filePath, ref = REPO_BRANCH) {
  const data = await gh(`/repos/${REPO}/contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}?ref=${encodeURIComponent(ref)}`);
  if (!data.content) return { content: '', sha: null };
  const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
  return { content: decoded, sha: data.sha };
}

async function ghPutFile(filePath, content, message, sha, branch = REPO_BRANCH) {
  const body = {
    message,
    content: Buffer.from(content, 'utf-8').toString('base64'),
    branch
  };
  if (sha) body.sha = sha;
  return gh(`/repos/${REPO}/contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`, {
    method: 'PUT', body: JSON.stringify(body)
  });
}

async function ghCreateBranch(branchName, fromBranch = REPO_BRANCH) {
  const ref = await gh(`/repos/${REPO}/git/ref/heads/${fromBranch}`);
  return gh(`/repos/${REPO}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: ref.object.sha })
  });
}

async function ghLastCommit() {
  const commits = await gh(`/repos/${REPO}/commits?sha=${REPO_BRANCH}&per_page=1`);
  return commits[0];
}

// ══════════════════════════════════════════════════════════════
// 세션 (대화형 위저드 상태)
// ══════════════════════════════════════════════════════════════

async function loadSessions() {
  try {
    const { content, sha } = await ghGetFile(SESSION_PATH);
    if (!content) return { sessions: {}, sha: null };
    return { sessions: JSON.parse(content), sha };
  } catch (e) {
    // 파일 없음 → 빈 세션
    return { sessions: {}, sha: null };
  }
}

async function saveSessions(sessions, sha) {
  const content = JSON.stringify(sessions, null, 2);
  return ghPutFile(SESSION_PATH, content, 'chore(telegram): update sessions', sha);
}

async function getSession(userId) {
  const { sessions } = await loadSessions();
  const s = sessions[String(userId)];
  if (!s) return null;
  // 15분 이상 지난 세션은 폐기
  if (Date.now() - s.updatedAt > 15 * 60 * 1000) return null;
  return s;
}

async function setSession(userId, session) {
  const { sessions, sha } = await loadSessions();
  sessions[String(userId)] = { ...session, updatedAt: Date.now() };
  await saveSessions(sessions, sha);
}

async function clearSession(userId) {
  const { sessions, sha } = await loadSessions();
  if (!sessions[String(userId)]) return;
  delete sessions[String(userId)];
  await saveSessions(sessions, sha);
}

// ══════════════════════════════════════════════════════════════
// mock-data.js 편집 (뉴스 섹션)
// ══════════════════════════════════════════════════════════════

function nextNewsId(content) {
  const ids = [...content.matchAll(/id:'n(\d+)'/g)].map(m => parseInt(m[1], 10));
  return 'n' + (ids.length ? Math.max(...ids) + 1 : 1);
}

function insertNewsEntry(content, entry) {
  const anchor = content.indexOf('news: [');
  if (anchor < 0) throw new Error('mock-data.js: news 섹션 없음');
  // `news: [` 다음 줄에 삽입
  const insertPos = content.indexOf('\n', anchor) + 1;
  const block = formatNewsEntry(entry);
  return content.slice(0, insertPos) + block + content.slice(insertPos);
}

function formatNewsEntry(e) {
  const tagsStr = (e.tags || []).map(t => `'${t}'`).join(',');
  return `    { id:'${e.id}', title:${js(e.title)}, category:'${e.category}',\n`
    + `      summary:${js(e.summary)},\n`
    + `      content:${js(e.content)},\n`
    + `      author:'${e.author || '관리자'}', date:'${e.date}', views:0, image:'',\n`
    + `      tags:[${tagsStr}], featured:${e.featured ? 'true' : 'false'} },\n`;
}

function js(s) {
  // 문자열 리터럴로 안전하게 직렬화 (JSON이지만 뒤에 single-quote 스타일과 혼용)
  return JSON.stringify(String(s == null ? '' : s));
}

function removeNewsEntry(content, id) {
  // 해당 항목의 {...} 블록을 통째로 찾아 삭제 (뒤에 오는 콤마·개행 포함)
  const re = new RegExp(`\\s*\\{\\s*id:'${id}'[\\s\\S]*?\\}\\s*,?\\n?`);
  if (!re.test(content)) throw new Error(`id='${id}' 뉴스 없음`);
  return content.replace(re, '\n');
}

function extractNewsTitles(content) {
  // 중복제거용: 기존 뉴스 title 목록
  const block = content.slice(content.indexOf('news: ['));
  const end = block.indexOf('\n  ],');
  const section = block.slice(0, end > 0 ? end : block.length);
  const titles = [...section.matchAll(/title:['"`]([^'"`]+)['"`]/g)].map(m => m[1]);
  return titles;
}

// ══════════════════════════════════════════════════════════════
// 명령 핸들러: /status
// ══════════════════════════════════════════════════════════════

async function cmdStatus(msg) {
  const chatId = msg.chat.id;
  await send(chatId, '⏳ 상태 확인 중...');

  const siteUrl = env('SITE_URL', DEFAULT_SITE_URL);
  const started = Date.now();
  let siteStatus, responseMs;
  try {
    const r = await fetch(siteUrl, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
    responseMs = Date.now() - started;
    siteStatus = `${r.status} ${r.ok ? '✅' : '⚠️'}`;
  } catch (e) {
    siteStatus = `❌ ${e.message}`;
    responseMs = Date.now() - started;
  }

  let lastCommit = '(조회 실패)';
  try {
    const c = await ghLastCommit();
    const t = new Date(c.commit.author.date);
    const kst = new Date(t.getTime() + 9 * 3600 * 1000);
    lastCommit = `<code>${c.sha.slice(0, 7)}</code> ${esc(c.commit.message.split('\n')[0])}\n        by ${esc(c.commit.author.name)} · ${kst.toISOString().replace('T', ' ').slice(0, 16)}`;
  } catch (e) { lastCommit = `(조회 실패: ${e.message})`; }

  let vercel = '(Vercel API 미설정)';
  const vToken = env('VERCEL_API_TOKEN');
  const vProj = env('VERCEL_PROJECT_ID');
  if (vToken && vProj) {
    try {
      const qs = new URLSearchParams({ projectId: vProj, limit: '1' });
      if (env('VERCEL_TEAM_ID')) qs.set('teamId', env('VERCEL_TEAM_ID'));
      const r = await fetch(`https://api.vercel.com/v6/deployments?${qs}`, {
        headers: { Authorization: `Bearer ${vToken}` }
      });
      const d = await r.json();
      const dep = d.deployments && d.deployments[0];
      if (dep) {
        vercel = `${dep.state} ${dep.readyState || ''}\n        ${dep.url || ''}`;
      }
    } catch (e) { vercel = `(조회 실패: ${e.message})`; }
  }

  const text = [
    '📊 <b>세울 홈페이지 상태</b>',
    '',
    `🌐 사이트: ${siteStatus} (${responseMs}ms)`,
    `    ${esc(siteUrl)}`,
    '',
    `🚀 최근 Vercel 배포: ${vercel}`,
    '',
    `📝 최근 커밋:`,
    `    ${lastCommit}`,
    '',
    `🕐 ${todayStr()} ${new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(11, 16)} KST`
  ].join('\n');

  await send(chatId, text);
}

// ══════════════════════════════════════════════════════════════
// 명령 핸들러: /deploy
// ══════════════════════════════════════════════════════════════

async function cmdDeploy(msg) {
  const chatId = msg.chat.id;
  const hook = env('VERCEL_DEPLOY_HOOK_URL');

  if (hook) {
    await send(chatId, '🚀 배포 트리거 중 (deploy hook)...');
    try {
      const r = await fetch(hook, { method: 'POST' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        await send(chatId, `❌ 배포 실패: ${r.status}\n<code>${esc(JSON.stringify(d).slice(0, 500))}</code>`);
        return;
      }
      await send(chatId, `✅ 배포 시작됨\n<code>job: ${esc(d.job?.id || 'n/a')}</code>\n1~2분 후 <code>/status</code>로 확인하세요.`);
    } catch (e) {
      await send(chatId, `❌ 배포 오류: ${esc(e.message)}`);
    }
    return;
  }

  // Fallback: GitHub 빈 커밋 푸시 → Vercel이 자동 감지하여 재배포
  await send(chatId, '🚀 배포 트리거 중 (empty commit)...');
  try {
    const ref = await gh(`/repos/${REPO}/git/ref/heads/${REPO_BRANCH}`);
    const parentSha = ref.object.sha;
    const parentCommit = await gh(`/repos/${REPO}/git/commits/${parentSha}`);
    const newCommit = await gh(`/repos/${REPO}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message: `ci: redeploy via telegram /deploy (${stampStr()})`,
        tree: parentCommit.tree.sha,
        parents: [parentSha]
      })
    });
    await gh(`/repos/${REPO}/git/refs/heads/${REPO_BRANCH}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: newCommit.sha })
    });
    await send(chatId, `✅ 빈 커밋 푸시 완료\n<code>${esc(newCommit.sha.slice(0, 7))}</code>\nVercel 자동 배포가 1~2분 내 시작됩니다. <code>/status</code>로 확인하세요.`);
  } catch (e) {
    await send(chatId, `❌ 배포 오류: ${esc(e.message)}`);
  }
}

// ══════════════════════════════════════════════════════════════
// 명령 핸들러: /pc_* (로컬 PC 원격 제어)
// ══════════════════════════════════════════════════════════════

// 규칙 기반 한글 자연어 intent 추론 (LLM 없이 즉시 분기)
function matchNaturalIntent(text) {
  const t = String(text || '').trim();
  if (!t) return null;

  // 종료 (컴꺼, 컴퓨터 꺼, 전원 꺼, 종료)
  if (/(컴\S{0,3}꺼|컴퓨터.{0,4}(꺼|끄|오프|off)|전원.{0,4}(꺼|끄|off)|셧다운|shutdown)/i.test(t)
      && !/취소/.test(t)) return { cmd: 'pc_shutdown' };

  // 재시작
  if (/(재시작|재부팅|리부트|reboot|restart)/i.test(t)) return { cmd: 'pc_restart' };

  // 종료/재시작 취소
  if (/취소/.test(t) && /(종료|재시작|재부팅|shutdown|reboot)/i.test(t)) return { cmd: 'pc_abort' };

  // 잠금
  if (/(화면.{0,3}잠|잠\s*(금|가|궈|그)|lock\s*screen|잠금)/i.test(t)) return { cmd: 'pc_lock' };

  // 스크린샷
  if (/(스크린|화면).{0,4}(캡처|찍|잡|샷)|screenshot/i.test(t)) return { cmd: 'pc_screen' };

  // 시스템 정보
  if (/(시스템|pc|컴퓨터).{0,6}(정보|상태|알려|보여)|사양|cpu|메모리.{0,4}(얼마|보여|알려)/i.test(t)) return { cmd: 'pc_info' };

  // 트로트 (우선순위: 유튜브보다 먼저)
  if (/트로트/.test(t)) return { cmd: 'pc_trot' };

  // 유튜브 검색
  const ytm = t.match(/(?:유튜브|youtube)(?:에서)?\s*(.*?)\s*(?:틀어|재생|찾아|검색|켜)?\s*$/i);
  if (ytm && /유튜브|youtube/i.test(t)) {
    const q = (ytm[1] || '').trim();
    return { cmd: 'pc_youtube', args: q };
  }

  // 음악/노래
  const musicM = t.match(/(?:음악|노래)\s*(.*?)\s*(?:틀어|재생|찾아|켜)?\s*$/);
  if (musicM && /(음악|노래)/.test(t)) {
    const q = (musicM[1] || '').trim();
    return { cmd: 'pc_music', args: q };
  }

  // 지메일/메일
  if (/(지메일|메일|mail|gmail)/i.test(t)) {
    const emailMatch = t.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    const args = emailMatch ? emailMatch[0] : '';
    return { cmd: 'pc_mail', args };
  }

  // 클로드
  if (/(클로드|claude)/i.test(t) && /(켜|열|실행|시작|접속|로그인|login)/i.test(t)) {
    return { cmd: 'pc_claude' };
  }

  // 생존 확인
  if (/(브릿지|브리지|bridge|살아|있|있냐|on(line)?)/i.test(t) && /(확인|체크|있|살아|ping|핑)/i.test(t)) {
    return { cmd: 'pc_ping' };
  }

  return null;
}

// (선택) Anthropic API 기반 LLM intent 추론. ANTHROPIC_API_KEY 있을 때만 호출.
async function aiNaturalIntent(text) {
  const apiKey = env('ANTHROPIC_API_KEY');
  if (!apiKey) return null;
  const sys = '당신은 텔레그램 봇의 자연어 → 명령 해석기입니다. 사용자의 한국어 입력을 다음 JSON 스키마로 변환하세요: {"cmd":"pc_info|pc_screen|pc_lock|pc_shutdown|pc_restart|pc_abort|pc_run|pc_ping|pc_youtube|pc_music|pc_trot|pc_mail|none","args":"문자열"}. 매칭되지 않으면 cmd=none. JSON만 응답.';
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 128,
        system: sys,
        messages: [{ role: 'user', content: text }]
      })
    });
    if (!r.ok) return null;
    const d = await r.json();
    const raw = d?.content?.[0]?.text || '';
    const j = JSON.parse(raw);
    if (!j.cmd || j.cmd === 'none') return null;
    return { cmd: j.cmd, args: j.args || '' };
  } catch (_) {
    return null;
  }
}

async function enqueuePcTask(req) {
  const cutoff = Date.now() - PC_QUEUE_TTL_MS;
  for (let attempt = 0; attempt < 3; attempt++) {
    let content = '{"requests":[]}';
    let sha = null;
    try {
      const f = await ghGetFile(PC_QUEUE_PATH);
      content = f.content || content;
      sha = f.sha;
    } catch (_) { /* file may not exist yet */ }
    let q;
    try { q = JSON.parse(content); } catch { q = { requests: [] }; }
    if (!Array.isArray(q.requests)) q.requests = [];
    q.requests = q.requests.filter(r => r && typeof r.ts === 'number' && r.ts > cutoff);
    q.requests.push(req);
    try {
      await ghPutFile(PC_QUEUE_PATH, JSON.stringify(q), `chore(pc-queue): enqueue ${req.cmd} ${req.id}`, sha);
      return;
    } catch (e) {
      const m = String(e.message || '');
      if (!/409|sha|conflict/i.test(m) || attempt === 2) throw e;
    }
  }
}

async function cmdPc(msg, cmd, args) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const req = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    cmd,
    args: (args || []).join(' '),
    chat_id: chatId,
    user_id: String(userId),
    ts: Date.now()
  };
  try {
    await enqueuePcTask(req);
    await send(chatId, `📨 PC 요청 대기열 추가: <code>${esc(cmd)}</code>${req.args ? ' <code>' + esc(req.args) + '</code>' : ''}\n로컬 브릿지 응답까지 최대 15초 내.`);
  } catch (e) {
    await send(chatId, `❌ 큐 기록 실패: ${esc(String(e.message).slice(0, 300))}`);
  }
}

// ══════════════════════════════════════════════════════════════
// 명령 핸들러: /news_add (대화형 위저드)
// ══════════════════════════════════════════════════════════════

async function cmdNewsAddStart(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  await setSession(userId, { cmd: 'news_add', step: 'title', data: {} });
  await send(chatId,
    '📝 <b>뉴스 등록 시작</b>\n\n'
    + '단계 1/5: <b>제목</b>을 입력하세요.\n'
    + '(취소하려면 /cancel)'
  );
}

async function handleNewsAddStep(msg, session) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = (msg.text || '').trim();

  if (session.step === 'title') {
    if (text.length < 5) { await send(chatId, '제목이 너무 짧습니다. 다시 입력해주세요.'); return; }
    session.data.title = text;
    session.step = 'category';
    await setSession(userId, session);
    await send(chatId, `단계 2/5: <b>카테고리</b>를 선택하세요.`, {
      reply_markup: {
        inline_keyboard: NEWS_CATEGORIES.map(c => [{ text: c, callback_data: `news_add_cat:${c}` }])
      }
    });
    return;
  }
  if (session.step === 'summary') {
    if (text.length < 10) { await send(chatId, '요약이 너무 짧습니다. 10자 이상 입력해주세요.'); return; }
    session.data.summary = text;
    session.step = 'content';
    await setSession(userId, session);
    await send(chatId, '단계 4/5: <b>본문 내용</b>을 입력하세요. (줄바꿈 포함 가능)');
    return;
  }
  if (session.step === 'content') {
    if (text.length < 20) { await send(chatId, '본문이 너무 짧습니다. 20자 이상 입력해주세요.'); return; }
    session.data.content = text;
    session.step = 'tags';
    await setSession(userId, session);
    await send(chatId, '단계 5/5: <b>태그</b>를 쉼표로 구분해 입력하세요.\n예: <code>정비사업, 서울시, 특별법</code>');
    return;
  }
  if (session.step === 'tags') {
    session.data.tags = text.split(',').map(s => s.trim()).filter(Boolean).slice(0, 5);
    session.step = 'confirm';
    await setSession(userId, session);
    const d = session.data;
    await send(chatId,
      '✅ <b>확인</b>\n\n'
      + `<b>제목</b>: ${esc(d.title)}\n`
      + `<b>카테고리</b>: ${esc(d.category)}\n`
      + `<b>요약</b>: ${esc(d.summary)}\n`
      + `<b>본문</b>: ${esc(d.content.slice(0, 100))}${d.content.length > 100 ? '…' : ''}\n`
      + `<b>태그</b>: ${d.tags.map(esc).join(', ')}\n\n`
      + '등록하시겠습니까?',
      {
        reply_markup: {
          inline_keyboard: [[
            { text: '✅ 등록', callback_data: 'news_add_confirm:yes' },
            { text: '❌ 취소', callback_data: 'news_add_confirm:no' }
          ]]
        }
      }
    );
    return;
  }
}

async function finalizeNewsAdd(chatId, userId, session) {
  await send(chatId, '⏳ 등록 중... (mock-data.js 편집 + 커밋)');
  try {
    const d = session.data;
    const { content, sha } = await ghGetFile(MOCK_DATA_PATH);
    const id = nextNewsId(content);
    const entry = {
      id,
      title: d.title,
      category: d.category,
      summary: d.summary,
      content: d.content,
      author: '관리자',
      date: todayStr(),
      tags: d.tags,
      featured: false
    };
    const next = insertNewsEntry(content, entry);
    await ghPutFile(MOCK_DATA_PATH, next, `feat(news): ${d.title} (#${id}) via telegram-admin`, sha);
    await clearSession(userId);
    await send(chatId, `✅ 등록 완료: <code>${id}</code>\n배포가 자동으로 시작됩니다. 1~2분 후 반영됩니다.`);
  } catch (e) {
    await send(chatId, `❌ 등록 실패: ${esc(e.message)}`);
  }
}

// ══════════════════════════════════════════════════════════════
// 명령 핸들러: /news_del
// ══════════════════════════════════════════════════════════════

async function cmdNewsDel(msg, args) {
  const chatId = msg.chat.id;
  const id = (args[0] || '').trim();
  if (!id) {
    await send(chatId, '사용법: <code>/news_del n7</code>\n삭제 전에 백업 브랜치가 자동 생성됩니다.');
    return;
  }
  await send(chatId, `⏳ <code>${esc(id)}</code> 삭제 준비 중...`);
  try {
    const { content, sha } = await ghGetFile(MOCK_DATA_PATH);
    if (!new RegExp(`id:'${id}'`).test(content)) {
      await send(chatId, `❌ <code>${esc(id)}</code> 뉴스를 찾을 수 없습니다.`);
      return;
    }
    // 백업 브랜치 생성
    const backupBranch = `backup-news-del-${stampStr()}`;
    try {
      await ghCreateBranch(backupBranch);
    } catch (e) {
      await send(chatId, `⚠️ 백업 브랜치 생성 실패: ${esc(e.message)}\n안전을 위해 중단합니다.`);
      return;
    }
    const next = removeNewsEntry(content, id);
    await ghPutFile(MOCK_DATA_PATH, next, `chore(news): remove ${id} via telegram-admin`, sha);
    await send(chatId,
      `✅ <code>${esc(id)}</code> 삭제 완료\n`
      + `🛟 백업 브랜치: <code>${esc(backupBranch)}</code>\n`
      + `복구 필요 시: <code>git checkout ${backupBranch}</code>`);
  } catch (e) {
    await send(chatId, `❌ 삭제 실패: ${esc(e.message)}`);
  }
}

// ══════════════════════════════════════════════════════════════
// 명령 핸들러: /news_crawl
// ══════════════════════════════════════════════════════════════

async function cmdNewsCrawl(msg) {
  const chatId = msg.chat.id;
  await send(chatId, '🔍 정비사업 뉴스 수집 중... (네이버·구글 RSS)');
  try {
    const items = await crawlFeeds();
    if (!items.length) { await send(chatId, '수집 결과 없음.'); return; }

    // 중복 제거
    const { content } = await ghGetFile(MOCK_DATA_PATH);
    const existing = new Set(extractNewsTitles(content).map(normTitle));
    const fresh = items.filter(i => !existing.has(normTitle(i.title))).slice(0, 10);

    if (!fresh.length) { await send(chatId, '새로운 뉴스 없음. (전부 등록됨)'); return; }

    // 세션에 후보 저장
    await setSession(msg.from.id, { cmd: 'news_crawl', step: 'select', data: { candidates: fresh } });

    const lines = fresh.slice(0, 10).map((it, i) =>
      `${i + 1}. <b>${esc(it.title)}</b>\n   ${esc(it.source)} · ${esc(it.pubDate || '')}`
    );
    await send(chatId,
      `📰 <b>새 뉴스 ${fresh.length}건</b>\n\n${lines.join('\n\n')}\n\n아래 버튼으로 등록할 기사를 선택하세요.`,
      {
        reply_markup: {
          inline_keyboard: fresh.slice(0, 10).map((it, i) => [
            { text: `${i + 1}. ${it.title.slice(0, 40)}`, callback_data: `news_crawl_pick:${i}` }
          ]).concat([[{ text: '❌ 취소', callback_data: 'news_crawl_pick:cancel' }]])
        }
      }
    );
  } catch (e) {
    await send(chatId, `❌ 수집 실패: ${esc(e.message)}`);
  }
}

function normTitle(t) { return String(t).replace(/\s+/g, '').toLowerCase(); }

async function crawlFeeds() {
  const all = [];
  for (const url of CRAWL_FEEDS) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const xml = await r.text();
      const items = parseRss(xml);
      all.push(...items);
    } catch (_) { /* 개별 피드 실패는 무시 */ }
  }
  // 중복 제거 (제목 기준)
  const seen = new Set();
  const out = [];
  for (const it of all) {
    const key = normTitle(it.title);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  // 최신순
  out.sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0));
  return out;
}

function parseRss(xml) {
  const items = [];
  const re = /<item[\s\S]*?<\/item>/g;
  const matches = xml.match(re) || [];
  for (const m of matches) {
    const title = (m.match(/<title>([\s\S]*?)<\/title>/) || [, ''])[1]
      .replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim();
    const link = (m.match(/<link>([\s\S]*?)<\/link>/) || [, ''])[1].trim();
    const pubDate = (m.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [, ''])[1].trim();
    const source = (m.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [, ''])[1].trim();
    const description = (m.match(/<description>([\s\S]*?)<\/description>/) || [, ''])[1]
      .replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').replace(/<[^>]+>/g, '').trim();
    if (title) items.push({ title, link, pubDate, source, description });
  }
  return items;
}

async function finalizeNewsCrawlPick(chatId, userId, session, index) {
  const item = session.data.candidates[index];
  if (!item) { await send(chatId, '선택 오류'); return; }
  await send(chatId, `⏳ <b>${esc(item.title)}</b> 등록 중...`);
  try {
    const { content, sha } = await ghGetFile(MOCK_DATA_PATH);
    const id = nextNewsId(content);
    const entry = {
      id,
      title: item.title,
      category: guessCategory(item.title),
      summary: item.description ? item.description.slice(0, 200) : item.title,
      content: `출처: ${item.source || 'Google News'}\n원문 링크: ${item.link}\n\n${item.description || item.title}`,
      author: item.source || '외부 뉴스',
      date: todayStr(),
      tags: extractTags(item.title),
      featured: false
    };
    const next = insertNewsEntry(content, entry);
    await ghPutFile(MOCK_DATA_PATH, next, `feat(news): ${item.title} (#${id}) via crawl`, sha);
    await clearSession(userId);
    await send(chatId, `✅ 등록 완료: <code>${id}</code> — <b>${esc(item.title)}</b>`);
  } catch (e) {
    await send(chatId, `❌ 실패: ${esc(e.message)}`);
  }
}

function guessCategory(title) {
  const t = title;
  if (/판례|판결|소송|법원/.test(t)) return '판례';
  if (/시행|특별법|정책|고시|지침|규정/.test(t)) return '정책';
  if (/호재|개통|GTX|역세권|분양/.test(t)) return '개발호재';
  if (/분석|전망|상승|하락|리포트|통계/.test(t)) return '시장분석';
  return '기타';
}

function extractTags(title) {
  const keywords = ['재개발', '재건축', '정비사업', '서울시', 'GTX', '한남', '이문', '흑석', '장위', '분양', '비례율', '조합', '특별법', '정책'];
  return keywords.filter(k => title.includes(k)).slice(0, 5);
}

// ══════════════════════════════════════════════════════════════
// 명령 핸들러: /case_add
// ══════════════════════════════════════════════════════════════

async function cmdCaseAddStart(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  await setSession(userId, { cmd: 'case_add', step: 'file', data: {} });
  await send(chatId,
    '📎 <b>사례집/판례 등록</b>\n\n'
    + '단계 1/2: PDF 또는 HWP 파일을 <b>첨부</b>로 보내주세요.\n'
    + '(취소하려면 /cancel)'
  );
}

async function handleCaseAddFile(msg, session) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const doc = msg.document;
  if (!doc) { await send(chatId, '파일 첨부가 없습니다. 다시 시도해주세요.'); return; }
  if (doc.file_size > 20 * 1024 * 1024) { await send(chatId, '⚠️ 파일이 너무 큽니다 (20MB 초과). 분할 또는 압축 후 다시 업로드해주세요.'); return; }

  await send(chatId, `⏳ 파일 다운로드 중: ${esc(doc.file_name || 'unknown')}`);
  try {
    const url = await getTelegramFileUrl(doc.file_id);
    const r = await fetch(url);
    const buf = Buffer.from(await r.arrayBuffer());
    const ext = (doc.file_name || '').split('.').pop().toLowerCase();
    const safeName = `case_${stampStr()}.${ext}`;
    session.data.fileBase64 = buf.toString('base64');
    session.data.fileName = safeName;
    session.data.originalName = doc.file_name;
    session.step = 'title';
    await setSession(userId, session);
    await send(chatId, `단계 2/2: 이 자료의 <b>제목/설명</b>을 입력하세요.`);
  } catch (e) {
    await send(chatId, `❌ 다운로드 실패: ${esc(e.message)}`);
  }
}

async function finalizeCaseAdd(msg, session) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const title = (msg.text || '').trim();
  if (title.length < 3) { await send(chatId, '제목을 3자 이상 입력해주세요.'); return; }

  await send(chatId, '⏳ 저장소에 업로드 중...');
  try {
    const filePath = `${CASE_DIR}/${session.data.fileName}`;
    // 파일 업로드 (새 파일이므로 sha 없음)
    await gh(`/repos/${REPO}/contents/${filePath}`, {
      method: 'PUT',
      body: JSON.stringify({
        message: `docs(case): ${title} via telegram-admin`,
        content: session.data.fileBase64,
        branch: REPO_BRANCH
      })
    });
    await clearSession(userId);
    await send(chatId,
      `✅ 업로드 완료\n`
      + `📎 파일: <code>${esc(filePath)}</code>\n`
      + `📝 제목: ${esc(title)}\n\n`
      + `사례집 인덱스 반영은 별도 <code>/news_add</code>로 링크를 등록해주세요.`);
  } catch (e) {
    await send(chatId, `❌ 업로드 실패: ${esc(e.message)}`);
  }
}

// ══════════════════════════════════════════════════════════════
// 콜백 쿼리 처리
// ══════════════════════════════════════════════════════════════

async function handleCallback(q) {
  const chatId = q.message.chat.id;
  const userId = q.from.id;
  if (!isAdmin(userId)) { await answerCallback(q.id, '권한 없음'); return; }

  const [action, arg] = q.data.split(':');
  await answerCallback(q.id, '처리 중...');

  if (action === 'news_add_cat') {
    const session = await getSession(userId);
    if (!session || session.cmd !== 'news_add') return;
    session.data.category = arg;
    session.step = 'summary';
    await setSession(userId, session);
    await send(chatId, `단계 3/5: <b>요약</b>을 입력하세요. (100~300자 권장)`);
    return;
  }
  if (action === 'news_add_confirm') {
    const session = await getSession(userId);
    if (!session || session.cmd !== 'news_add') return;
    if (arg === 'yes') return finalizeNewsAdd(chatId, userId, session);
    await clearSession(userId);
    await send(chatId, '❌ 취소됨.');
    return;
  }
  if (action === 'news_crawl_pick') {
    if (arg === 'cancel') { await clearSession(userId); await send(chatId, '❌ 취소됨.'); return; }
    const session = await getSession(userId);
    if (!session || session.cmd !== 'news_crawl') return;
    return finalizeNewsCrawlPick(chatId, userId, session, parseInt(arg, 10));
  }
}

// ══════════════════════════════════════════════════════════════
// 명령 라우터
// ══════════════════════════════════════════════════════════════

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAdmin(userId)) {
    await send(chatId, `⚠️ 관리자 권한이 없습니다. (your id: <code>${userId}</code>)`);
    return;
  }

  // 1) 진행 중 위저드가 있으면 우선 처리
  const session = await getSession(userId);

  // 명시적 취소
  if (msg.text && msg.text.trim() === '/cancel') {
    await clearSession(userId);
    await send(chatId, '✅ 진행 중 작업 취소됨.');
    return;
  }

  if (session) {
    if (session.cmd === 'news_add' && ['title', 'summary', 'content', 'tags'].includes(session.step)) {
      return handleNewsAddStep(msg, session);
    }
    if (session.cmd === 'case_add' && session.step === 'file') {
      return handleCaseAddFile(msg, session);
    }
    if (session.cmd === 'case_add' && session.step === 'title') {
      return finalizeCaseAdd(msg, session);
    }
  }

  // 2) 명령어 처리
  const text = (msg.text || '').trim();
  if (!text.startsWith('/')) {
    const intent = matchNaturalIntent(text) || await aiNaturalIntent(text);
    if (intent) {
      const iArgs = intent.args ? String(intent.args).trim().split(/\s+/).filter(Boolean) : [];
      return cmdPc(msg, intent.cmd, iArgs);
    }
    await send(chatId, '이해하지 못한 요청입니다. 명령은 <code>/</code> 로 시작하거나 자연어로 "트로트 틀어", "컴퓨터 꺼", "화면 캡처" 같은 형식으로 입력하세요. <code>/help</code> 참고');
    return;
  }
  const [cmdRaw, ...args] = text.slice(1).split(/\s+/);
  const cmd = cmdRaw.split('@')[0].toLowerCase(); // /cmd@bot_name 대응

  switch (cmd) {
    case 'start':
    case 'help':
      return send(chatId,
        '🤖 <b>세울 홈페이지 관리자 봇</b>\n\n'
        + '<b>/status</b> — 사이트·배포·최근 커밋\n'
        + '<b>/deploy</b> — Vercel 재배포\n'
        + '<b>/news_add</b> — 뉴스 등록 (대화형)\n'
        + '<b>/news_del</b> <code>&lt;id&gt;</code> — 뉴스 삭제 (자동 백업)\n'
        + '<b>/news_crawl</b> — 정비사업 뉴스 수집·등록\n'
        + '<b>/case_add</b> — 사례집 PDF/HWP 업로드\n'
        + '<b>/cancel</b> — 진행 중 작업 취소\n\n'
        + '<b>🖥 로컬 PC 제어</b> (브릿지 필요, 한글 단축어 지원)\n'
        + '<b>/핑</b> (/pc_ping) — 브릿지 생존 확인\n'
        + '<b>/정보</b> (/pc_info) — 시스템 정보\n'
        + '<b>/화면</b> (/pc_screen) — 화면 캡처\n'
        + '<b>/잠금</b> (/pc_lock) — 화면 잠금\n'
        + '<b>/컴꺼</b> (/pc_shutdown) — 60초 후 종료 (/취소로 중단)\n'
        + '<b>/재시작</b> (/pc_restart) — 60초 후 재시작\n'
        + '<b>/취소</b> (/pc_abort) — 예약된 종료/재시작 취소\n'
        + '<b>/실행</b> <code>&lt;cmd&gt;</code> (/pc_run) — 화이트리스트 명령 실행\n'
        + '<b>/트로트</b> — 유튜브 트로트 메들리 검색·실행\n'
        + '<b>/음악</b> <code>&lt;검색어&gt;</code> — 유튜브 검색 재생 (기본: 트로트)\n'
        + '<b>/유튜브</b> <code>&lt;검색어&gt;</code> — 유튜브 검색 결과\n'
        + '<b>/메일</b> <code>&lt;받는이&gt; [제목] [본문]</code> — 지메일 작성창 열기\n'
        + '<b>/클로드</b> — claude.ai 로그인 페이지 열기\n\n'
        + '<b>🧠 자연어 입력</b>: "/"없이 한국어 문장도 해석. 예) "트로트 틀어줘", "컴퓨터 꺼", "화면 캡처", "클로드 켜줘"');
    case 'status': return cmdStatus(msg);
    case 'deploy': return cmdDeploy(msg);
    case 'news_add': case 'newsadd': return cmdNewsAddStart(msg);
    case 'news_del': case 'newsdel': return cmdNewsDel(msg, args);
    case 'news_crawl': case 'newscrawl': return cmdNewsCrawl(msg);
    case 'case_add': case 'caseadd': return cmdCaseAddStart(msg);
    default:
      if (PC_COMMANDS.has(cmd)) return cmdPc(msg, cmd, args);
      if (PC_ALIASES[cmdRaw]) return cmdPc(msg, PC_ALIASES[cmdRaw], args);
      return send(chatId, `알 수 없는 명령: <code>/${esc(cmd)}</code>\n<code>/help</code> 참고`);
  }
}

// ══════════════════════════════════════════════════════════════
// 로컬 PC 브릿지 응답 프록시
// ══════════════════════════════════════════════════════════════

async function handlePcReply(req, res) {
  try {
    const body = req.body || {};
    if (body.secret !== env('TELEGRAM_WEBHOOK_SECRET')) {
      return res.status(401).json({ error: 'invalid secret' });
    }
    const chatId = body.chat_id;
    if (!chatId) return res.status(400).json({ error: 'chat_id required' });
    const token = env('TELEGRAM_BOT_TOKEN');
    if (!token) return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN 미설정' });

    if (body.photo_base64) {
      const form = new FormData();
      form.append('chat_id', String(chatId));
      if (body.caption) form.append('caption', String(body.caption));
      const bytes = Buffer.from(body.photo_base64, 'base64');
      const blob = new Blob([bytes], { type: 'image/png' });
      form.append('photo', blob, 'screen.png');
      const r = await fetch(`${TELEGRAM_API}${token}/sendPhoto`, { method: 'POST', body: form });
      const d = await r.json().catch(() => ({}));
      return res.status(r.ok ? 200 : 500).json(d);
    }

    if (body.text) {
      await send(chatId, String(body.text));
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'text or photo_base64 required' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// ══════════════════════════════════════════════════════════════
// 웹훅 엔트리포인트
// ══════════════════════════════════════════════════════════════

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET: 설정용 엔드포인트
  if (req.method === 'GET') {
    const action = req.query.action;
    const token = env('TELEGRAM_BOT_TOKEN');
    const TGAPI = `https://api.telegram.org/bot${token}`;
    const webhookUrl = `${env('SITE_URL', DEFAULT_SITE_URL)}/api/telegram-admin`;

    if (action === 'set') {
      const secret = env('TELEGRAM_WEBHOOK_SECRET');
      const r = await fetch(`${TGAPI}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          secret_token: secret,
          allowed_updates: ['message', 'callback_query']
        })
      });
      return res.status(200).json(await r.json());
    }
    if (action === 'delete') {
      const r = await fetch(`${TGAPI}/deleteWebhook`);
      return res.status(200).json(await r.json());
    }
    if (action === 'info') {
      const r = await fetch(`${TGAPI}/getWebhookInfo`);
      return res.status(200).json(await r.json());
    }
    return res.status(200).json({
      bot: 'telegram-admin',
      webhookUrl,
      usage: '?action=set | ?action=info | ?action=delete',
      required_env: [
        'TELEGRAM_BOT_TOKEN', 'TELEGRAM_WEBHOOK_SECRET', 'TELEGRAM_ADMIN_IDS',
        'GITHUB_TOKEN', 'VERCEL_DEPLOY_HOOK_URL'
      ],
      optional_env: ['VERCEL_API_TOKEN', 'VERCEL_PROJECT_ID', 'VERCEL_TEAM_ID', 'SITE_URL']
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  // 로컬 PC 브릿지 응답 프록시 (텔레그램 웹훅과 별도 경로)
  if (req.query && req.query.action === 'pc_reply') {
    return handlePcReply(req, res);
  }

  // 웹훅 시크릿 검증
  const expectedSecret = env('TELEGRAM_WEBHOOK_SECRET');
  if (expectedSecret) {
    const got = req.headers['x-telegram-bot-api-secret-token'];
    if (got !== expectedSecret) {
      return res.status(401).json({ error: 'invalid secret' });
    }
  }

  // 항상 200을 빨리 리턴 (텔레그램 재전송 방지). 처리 중 에러는 채팅으로 보냄.
  res.status(200).json({ ok: true });

  try {
    const update = req.body || {};
    if (update.message) {
      await handleMessage(update.message);
    } else if (update.callback_query) {
      await handleCallback(update.callback_query);
    }
  } catch (e) {
    // 로깅만 (응답은 이미 끝남)
    console.error('[telegram-admin] error:', e);
    try {
      const chatId = (req.body?.message?.chat?.id) || (req.body?.callback_query?.message?.chat?.id);
      if (chatId) await send(chatId, `❌ 내부 오류: ${esc(e.message)}`);
    } catch (_) { }
  }
};
