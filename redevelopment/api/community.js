const REPO = 'dodo9944-ops/seul21';
const FILE_PATH = 'redevelopment/data/community.json';
const GITHUB_API = 'https://api.github.com';

async function ghFetch(path, opts = {}) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...opts,
    headers: {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json', ...(opts.headers || {})
    }
  });
  return res.json();
}

async function getData() {
  const data = await ghFetch(`/repos/${REPO}/contents/${FILE_PATH}`);
  const raw = Buffer.from(data.content, 'base64');
  const content = new TextDecoder('utf-8').decode(raw);
  return { items: JSON.parse(content), sha: data.sha };
}

async function saveData(items, sha) {
  const jsonStr = JSON.stringify(items, null, 2);
  const bytes = new TextEncoder().encode(jsonStr);
  const content = Buffer.from(bytes).toString('base64');
  await ghFetch(`/repos/${REPO}/contents/${FILE_PATH}`, {
    method: 'PUT',
    body: JSON.stringify({ message: `커뮤니티 데이터 업데이트`, content, sha })
  });
}

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    });
  } catch (e) { /* 텔레그램 실패해도 글 등록은 유지 */ }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key, x-owner-id');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ADMIN_KEY = process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.slice(-8) : 'admin123';

  try {
    // GET: 글 목록
    if (req.method === 'GET') {
      const { items } = await getData();
      return res.status(200).json({ posts: items, total: items.length });
    }

    // POST: 글 작성
    if (req.method === 'POST') {
      const { title, category, content, author, images, attachments, ownerId, ownerEmail } = req.body;
      if (!title || !content) return res.status(400).json({ error: '제목과 내용은 필수입니다.' });
      const { items, sha } = await getData();
      const now = new Date();
      const dateStr = now.toISOString().slice(0,10) + ' ' +
        String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
      const newPost = {
        id: Date.now().toString(36),
        title, category: category || '정보', content,
        images: images || [], attachments: attachments || [],
        author: author || '익명', date: dateStr,
        ownerId: ownerId || '', ownerEmail: ownerEmail || '',
        views: 0, comments: 0, likes: 0, status: '공개'
      };
      items.unshift(newPost);
      await saveData(items, sha);

      // 텔레그램 알림
      const preview = content.length > 200 ? content.substring(0, 200) + '...' : content;
      const attInfo = (newPost.attachments && newPost.attachments.length) ?
        `\n📎 <b>첨부파일:</b> ${newPost.attachments.map(a => a.name).join(', ')}` : '';
      const tgMsg = `📝 <b>[커뮤니티 새 글]</b>\n\n` +
        `<b>카테고리:</b> ${newPost.category}\n` +
        `<b>제목:</b> ${newPost.title}\n` +
        `<b>작성자:</b> ${newPost.author}\n` +
        `<b>작성일:</b> ${newPost.date}\n\n` +
        `<b>내용:</b>\n${preview}${attInfo}\n\n` +
        `🔗 https://seul21.com/pages/community-detail.html?id=${newPost.id}`;
      sendTelegram(tgMsg);

      return res.status(201).json({ message: '게시글 등록 완료', id: newPost.id });
    }

    // PUT: 글 수정 (관리자 또는 작성자 본인)
    if (req.method === 'PUT') {
      const adminKey = req.headers['x-admin-key'];
      const ownerIdHdr = req.headers['x-owner-id'] || '';
      const isAdmin = adminKey === ADMIN_KEY;
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'id 누락' });
      const { items, sha } = await getData();
      const idx = items.findIndex(i => i.id === id);
      if (idx === -1) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
      const target = items[idx];
      const isOwner = !!ownerIdHdr && !!target.ownerId && String(target.ownerId) === String(ownerIdHdr);
      if (!isAdmin && !isOwner) return res.status(403).json({ error: '수정 권한이 없습니다.' });
      // 본인 수정 시 변경 가능 필드 제한
      let nextUpdates = updates;
      if (!isAdmin) {
        const allowed = ['title', 'category', 'content', 'images', 'attachments'];
        nextUpdates = {};
        allowed.forEach(k => { if (k in updates) nextUpdates[k] = updates[k]; });
      }
      items[idx] = { ...target, ...nextUpdates };
      await saveData(items, sha);
      return res.status(200).json({ message: '수정 완료' });
    }

    // DELETE: 글 삭제 (관리자 또는 작성자 본인)
    if (req.method === 'DELETE') {
      const adminKey = req.headers['x-admin-key'];
      const ownerIdHdr = req.headers['x-owner-id'] || '';
      const isAdmin = adminKey === ADMIN_KEY;
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id 누락' });
      const { items, sha } = await getData();
      const target = items.find(i => i.id === id);
      if (!target) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
      const isOwner = !!ownerIdHdr && !!target.ownerId && String(target.ownerId) === String(ownerIdHdr);
      if (!isAdmin && !isOwner) return res.status(403).json({ error: '삭제 권한이 없습니다.' });
      const filtered = items.filter(i => i.id !== id);
      await saveData(filtered, sha);
      return res.status(200).json({ message: '삭제 완료' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: '서버 오류: ' + err.message });
  }
};
