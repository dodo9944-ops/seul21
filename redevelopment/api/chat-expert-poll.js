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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sid = req.query.sid;
  const after = parseInt(req.query.after) || 0; // 마지막으로 받은 메시지 수

  if (!sid) return res.status(400).json({ error: 'Session ID required' });

  try {
    const data = await ghFetch(`/repos/${REPO}/contents/${FILE_PATH}`);
    if (!data.content) return res.status(200).json({ messages: [] });

    const raw = Buffer.from(data.content, 'base64');
    const items = JSON.parse(new TextDecoder('utf-8').decode(raw));
    const session = items[sid];

    if (!session) return res.status(200).json({ messages: [] });

    // after 이후의 전문가 답변만 반환
    const newMessages = session.messages.slice(after).filter(m => m.role === 'expert');
    return res.status(200).json({
      messages: newMessages,
      total: session.messages.length
    });
  } catch (err) {
    return res.status(200).json({ messages: [] });
  }
};
