const REPO = 'dodo9944-ops/seul21';
const FILE_PATH = 'redevelopment/data/expert-chats.json';
const GITHUB_API = 'https://api.github.com';

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
  const body = { message: `전문가 상담 업데이트`, content };
  if (sha) body.sha = sha;
  await ghFetch(`/repos/${REPO}/contents/${FILE_PATH}`, { method: 'PUT', body: JSON.stringify(body) });
}

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return null;
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
  });
  return res.json();
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, sessionId } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    const { items, sha } = await getData();
    const sid = sessionId || 'S' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const now = new Date().toISOString();

    // 세션 생성 또는 추가
    if (!items[sid]) {
      items[sid] = { created: now, messages: [] };
    }
    items[sid].messages.push({ role: 'visitor', text: message, time: now });
    items[sid].lastActivity = now;

    // 오래된 세션 정리 (24시간 이상)
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    for (const key in items) {
      if (new Date(items[key].lastActivity || items[key].created).getTime() < cutoff) {
        delete items[key];
      }
    }

    await saveData(items, sha);

    // 텔레그램 알림
    const tgText = `📩 <b>전문가 상담 요청</b>\n━━━━━━━━━━━━\n💬 ${message}\n━━━━━━━━━━━━\n🔑 세션: <code>${sid}</code>\n\n이 메시지에 답장하면 방문자에게 전달됩니다.`;
    await sendTelegram(tgText);

    return res.status(200).json({ sessionId: sid, status: 'sent' });
  } catch (err) {
    return res.status(500).json({ error: '전송 중 오류가 발생했습니다.' });
  }
};
