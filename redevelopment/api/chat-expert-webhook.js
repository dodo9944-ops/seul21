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
  const body = { message: `전문가 답변 업데이트`, content };
  if (sha) body.sha = sha;
  await ghFetch(`/repos/${REPO}/contents/${FILE_PATH}`, { method: 'PUT', body: JSON.stringify(body) });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const update = req.body;

    // 텔레그램 웹훅: 답장 메시지에서 세션ID 추출
    const msg = update.message;
    if (!msg || !msg.reply_to_message || !msg.text) {
      return res.status(200).json({ ok: true });
    }

    // 원본 메시지에서 세션ID 추출
    const origText = msg.reply_to_message.text || '';
    const match = origText.match(/세션: (.+)/);
    if (!match) return res.status(200).json({ ok: true, note: 'no session found' });

    const sid = match[1].trim();
    const replyText = msg.text;
    const now = new Date().toISOString();

    const { items, sha } = await getData();
    if (!items[sid]) return res.status(200).json({ ok: true, note: 'session not found' });

    items[sid].messages.push({ role: 'expert', text: replyText, time: now });
    items[sid].lastActivity = now;

    await saveData(items, sha);

    return res.status(200).json({ ok: true, delivered: true });
  } catch (err) {
    return res.status(200).json({ ok: true, error: err.message });
  }
};
