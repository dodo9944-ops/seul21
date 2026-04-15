const REPO = 'dodo9944-ops/seul21';
const UPLOAD_PATH = 'redevelopment/uploads/community/files';
const GITHUB_API = 'https://api.github.com';
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { filename, content, originalName } = req.body;
    if (!filename || !content) return res.status(400).json({ error: 'filename, content 필수' });

    // 파일 크기 체크 (base64 → 원본 약 75%)
    if (content.length * 0.75 > MAX_SIZE) {
      return res.status(400).json({ error: '10MB 초과' });
    }

    const filePath = `${UPLOAD_PATH}/${filename}`;

    const ghRes = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `커뮤니티 첨부파일 업로드: ${originalName || filename}`,
        content: content
      })
    });

    const data = await ghRes.json();

    if (data.content && data.content.download_url) {
      return res.status(201).json({
        url: data.content.download_url,
        filename: originalName || filename
      });
    }

    return res.status(500).json({ error: '업로드 실패', detail: data.message || '' });
  } catch (err) {
    return res.status(500).json({ error: '서버 오류: ' + err.message });
  }
};
