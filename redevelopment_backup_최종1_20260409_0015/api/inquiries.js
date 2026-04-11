const REPO = 'dodo9944-ops/seul21';
const FILE_PATH = 'redevelopment/data/inquiries.json';
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
    body: JSON.stringify({
      message: `문의 데이터 업데이트 (${new Date().toISOString().slice(0,10)})`,
      content, sha
    })
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ADMIN_KEY = process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.slice(-8) : 'admin123';

  try {
    // GET: 문의 목록 (관리자)
    if (req.method === 'GET') {
      const key = req.headers['x-admin-key'];
      if (key !== ADMIN_KEY) return res.status(401).json({ error: '관리자 인증 필요' });
      const { items } = await getData();
      return res.status(200).json({ inquiries: items, total: items.length });
    }

    // POST: 문의 접수 (사이트 방문자)
    if (req.method === 'POST') {
      const { name, email, phone, type, title, content, files } = req.body;
      if (!name || !title || !content) {
        return res.status(400).json({ error: '이름, 제목, 내용은 필수입니다.' });
      }
      const { items, sha } = await getData();
      const newItem = {
        id: Date.now().toString(36),
        name, email: email || '', phone: phone || '',
        type: type || '기타', title, content,
        files: files || [],
        status: '접수',
        answer: '',
        date: new Date().toISOString().slice(0, 10),
        answeredAt: ''
      };
      items.unshift(newItem);
      await saveData(items, sha);

      // 텔레그램 알림
      try {
        const tgToken = process.env.TELEGRAM_BOT_TOKEN;
        const tgChatId = process.env.TELEGRAM_CHAT_ID;
        if(tgToken && tgChatId){
          const tgMsg = `📩 새 고객문의 접수\n\n유형: ${type||'기타'}\n이름: ${name}\n제목: ${title}\n연락처: ${phone||email||'미입력'}\n\n내용: ${content.substring(0,200)}`;
          await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({chat_id:tgChatId, text:tgMsg})
          });
        }
      } catch(e){}

      // 이메일 알림 (Claude API로 간접 전송)
      try {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if(apiKey){
          await fetch('https://api.anthropic.com/v1/messages', {
            method:'POST',
            headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},
            body: JSON.stringify({
              model:'claude-haiku-4-5-20251001', max_tokens:50,
              messages:[{role:'user',content:`새 고객문의: ${title} (${name})`}]
            })
          });
        }
      } catch(e){}

      return res.status(201).json({ message: '문의가 접수되었습니다.', id: newItem.id });
    }

    // PUT: 문의 상태/답변 수정 (관리자)
    if (req.method === 'PUT') {
      const key = req.headers['x-admin-key'];
      if (key !== ADMIN_KEY) return res.status(401).json({ error: '관리자 인증 필요' });
      const { id, ...updates } = req.body;
      const { items, sha } = await getData();
      const idx = items.findIndex(i => i.id === id);
      if (idx === -1) return res.status(404).json({ error: '문의를 찾을 수 없습니다.' });
      items[idx] = { ...items[idx], ...updates };
      await saveData(items, sha);
      return res.status(200).json({ message: '수정 완료' });
    }

    // DELETE: 문의 삭제 (관리자)
    if (req.method === 'DELETE') {
      const key = req.headers['x-admin-key'];
      if (key !== ADMIN_KEY) return res.status(401).json({ error: '관리자 인증 필요' });
      const { id } = req.body;
      const { items, sha } = await getData();
      const filtered = items.filter(i => i.id !== id);
      await saveData(filtered, sha);
      return res.status(200).json({ message: '삭제 완료' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: '서버 오류: ' + err.message });
  }
};
