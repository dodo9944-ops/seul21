const REPO = 'dodo9944-ops/seul21';
const FILE_PATH = 'redevelopment/data/expert-chats.json';
const GITHUB_API = 'https://api.github.com';
const MCP_URL = 'https://korean-law-mcp.fly.dev/mcp';
const TELEGRAM_API = 'https://api.telegram.org/bot';

// ─── 법률 키워드 감지 ───
const LAW_KEYWORDS = [
  '법', '법률', '법령', '조문', '조항', '판례', '판결', '소송',
  '도시정비법', '도정법', '재개발', '재건축', '정비사업',
  '주택법', '건축법', '국토계획', '보상법', '특별법',
  '조합', '총회', '관리처분', '사업시행', '인가', '매도청구',
  '감정평가', '분양', '이주', '철거', '청산', '비례율',
  '시행령', '시행규칙', '고시', '지침', '규정',
  '제명', '해임', '의결', '정족수', '위반', '처벌', '과태료'
];

function isLawQuestion(text) {
  if (!text) return false;
  const t = text.toLowerCase();
  // 명시적 법률 요청
  if (t.includes('/법률') || t.includes('/law') || t.includes('/legal')) return true;
  // 키워드 2개 이상 매칭 또는 핵심 키워드 1개
  const coreKeywords = ['법률', '법령', '판례', '조문', '도시정비법', '도정법'];
  if (coreKeywords.some(k => t.includes(k))) return true;
  const matchCount = LAW_KEYWORDS.filter(k => t.includes(k)).length;
  return matchCount >= 2;
}

// ─── MCP 법률 검색 ───
async function mcpFetch(body, sessionId) {
  const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream' };
  if (sessionId) headers['Mcp-Session-Id'] = sessionId;
  const res = await fetch(MCP_URL, { method: 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(25000) });
  const newSession = res.headers.get('mcp-session-id') || sessionId;
  const ct = (res.headers.get('content-type') || '');
  if (ct.includes('text/event-stream')) {
    const text = await res.text();
    const msgs = [];
    for (const line of text.split('\n')) {
      if (line.startsWith('data:')) {
        try { msgs.push(JSON.parse(line.slice(5).trim())); } catch (e) { /* skip */ }
      }
    }
    return { data: msgs.find(m => m.id === body.id) || msgs[msgs.length - 1], sessionId: newSession };
  }
  return { data: await res.json(), sessionId: newSession };
}

async function fetchMcpLaw(query) {
  try {
    const init = await mcpFetch({
      jsonrpc: '2.0', method: 'initialize',
      params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'seul21-telegram-law', version: '1.0.0' } },
      id: 1
    });
    await mcpFetch({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }, init.sessionId);
    const tool = await mcpFetch({
      jsonrpc: '2.0', method: 'tools/call',
      params: { name: 'chain_full_research', arguments: { query } },
      id: 2
    }, init.sessionId);
    if (tool.data && tool.data.result && tool.data.result.content) {
      const text = tool.data.result.content.filter(c => c.type === 'text').map(c => c.text).join('\n');
      if (text && !text.includes('조회 실패') && !text.includes('검색 결과가 없습니다')) {
        return text.length > 12000 ? text.substring(0, 12000) + '\n...(이하 생략)' : text;
      }
    }
  } catch (e) { console.log('MCP error:', e.message); }
  return null;
}

// ─── Claude로 법률 답변 생성 (출처 필수) ───
async function generateLawAnswer(question, lawData) {
  const systemPrompt = `당신은 (주)세울엔지니어링의 법률 상담 AI입니다.
텔레그램을 통해 들어온 법률 질문에 답변합니다.

답변 규칙:
1. 한국어로 친절하고 정확하게 답변하세요.
2. 관련 법령명과 구체적 조문(제○조 제○항)을 반드시 인용하세요.
3. 핵심 판례가 있으면 사건번호와 판시사항을 요약하세요.
4. 답변 구조: ① 핵심 답변 → ② 근거 법령 → ③ 관련 판례(있으면) → ④ 실무 참고사항
5. 텔레그램 메시지이므로 2000자 이내로 간결하게 작성하세요.
6. 법적 판단이 필요한 사항은 전문가 상담을 권유하세요.

⚠️ 반드시 답변 끝에 아래 형식으로 출처를 표시하세요:
━━━━━━━━━━━━━━
📚 출처
• [인용한 법령명, 조문번호]
• [인용한 판례번호 (있는 경우)]
• 국가법령정보센터: https://open.law.go.kr
• (주)세울엔지니어링 AI 법률상담
━━━━━━━━━━━━━━
${lawData ? '\n\n아래에 법령 검색 시스템(법제처 API)에서 조회한 참고 데이터가 있습니다. 이 데이터를 우선 활용하고 출처를 정확히 밝히세요.' : ''}`;

  const userContent = lawData ? `질문: ${question}\n\n법령 검색 결과:\n${lawData}` : question;

  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }]
    })
  });

  const data = await claudeRes.json();
  if (data.error) throw new Error(data.error.message);
  return data.content[0].text;
}

// ─── 텔레그램 메시지 전송 ───
async function sendTelegram(chatId, text, replyToId) {
  const body = { chat_id: chatId, text, parse_mode: 'HTML' };
  if (replyToId) body.reply_to_message_id = replyToId;
  // 텔레그램 메시지 길이 제한 (4096자)
  if (text.length > 4096) {
    const parts = [];
    let remaining = text;
    while (remaining.length > 0) {
      parts.push(remaining.substring(0, 4000));
      remaining = remaining.substring(4000);
    }
    for (const part of parts) {
      await fetch(`${TELEGRAM_API}${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: part, parse_mode: 'HTML' })
      });
    }
    return;
  }
  await fetch(`${TELEGRAM_API}${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

// ─── GitHub 데이터 관리 (기존 전문가 상담용) ───
async function ghFetch(path, opts = {}) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...opts,
    headers: {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    }
  });
  return res.json();
}

async function getData() {
  try {
    const data = await ghFetch(`/repos/${REPO}/contents/${FILE_PATH}`);
    if (!data.content) return { items: {}, sha: null };
    const raw = Buffer.from(data.content, 'base64');
    return { items: JSON.parse(new TextDecoder('utf-8').decode(raw)), sha: data.sha };
  } catch (e) {
    return { items: {}, sha: null };
  }
}

async function saveData(items, sha) {
  const jsonStr = JSON.stringify(items, null, 2);
  const content = Buffer.from(new TextEncoder().encode(jsonStr)).toString('base64');
  const body = { message: `전문가 답변 업데이트`, content };
  if (sha) body.sha = sha;
  await ghFetch(`/repos/${REPO}/contents/${FILE_PATH}`, { method: 'PUT', body: JSON.stringify(body) });
}

// ─── 메인 핸들러 ───
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET 요청: 웹훅 설정/조회 (setup 용도)
  if (req.method === 'GET') {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return res.status(500).json({ error: 'No bot token' });
    const action = req.query.action || 'info';
    const TGAPI = `https://api.telegram.org/bot${token}`;
    try {
      if (action === 'set') {
        const r = await fetch(`${TGAPI}/setWebhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: 'https://seul21.vercel.app/api/chat-expert-webhook' })
        });
        return res.status(200).json({ action: 'set', result: await r.json() });
      }
      if (action === 'delete') {
        const r = await fetch(`${TGAPI}/deleteWebhook`);
        return res.status(200).json({ action: 'delete', result: await r.json() });
      }
      const r = await fetch(`${TGAPI}/getWebhookInfo`);
      return res.status(200).json({ action: 'info', result: await r.json() });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const update = req.body;
    const msg = update.message;
    if (!msg || !msg.text) return res.status(200).json({ ok: true });

    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const text = msg.text.trim();

    // ━━━ 1. 법률 질문 자동 감지 → MCP 법률 서버로 답변 ━━━
    // (답장 메시지는 전문가 상담 답변이므로 법률 감지 제외)
    if (!msg.reply_to_message && isLawQuestion(text)) {
      // "검색 중" 안내 메시지
      await sendTelegram(chatId, '⚖️ 법령 검색 중입니다... 잠시만 기다려주세요.', messageId);

      const lawData = await fetchMcpLaw(text);
      const answer = await generateLawAnswer(text, lawData);
      await sendTelegram(chatId, answer, messageId);

      return res.status(200).json({ ok: true, type: 'law' });
    }

    // ━━━ 2. 기존 전문가 상담 답장 처리 ━━━
    if (msg.reply_to_message) {
      const origText = msg.reply_to_message.text || '';
      const match = origText.match(/세션: (.+)/);
      if (match) {
        const sid = match[1].trim();
        const now = new Date().toISOString();
        const { items, sha } = await getData();
        if (items[sid]) {
          items[sid].messages.push({ role: 'expert', text, time: now });
          items[sid].lastActivity = now;
          await saveData(items, sha);
          return res.status(200).json({ ok: true, delivered: true });
        }
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(200).json({ ok: true, error: err.message });
  }
};
