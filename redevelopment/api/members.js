const REPO = 'dodo9944-ops/seul21';
const FILE_PATH = 'redevelopment/data/members.json';
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

async function getMembers() {
  const data = await ghFetch(`/repos/${REPO}/contents/${FILE_PATH}`);
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return { members: JSON.parse(content), sha: data.sha };
}

async function saveMembers(members, sha) {
  const content = Buffer.from(JSON.stringify(members, null, 2), 'utf-8').toString('base64');
  await ghFetch(`/repos/${REPO}/contents/${FILE_PATH}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `회원 데이터 업데이트 (${new Date().toISOString().slice(0,10)})`,
      content,
      sha
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
    // GET: 회원 목록 (관리자용)
    if (req.method === 'GET') {
      const key = req.headers['x-admin-key'];
      if (key !== ADMIN_KEY) return res.status(401).json({ error: '관리자 인증 필요' });
      const { members } = await getMembers();
      return res.status(200).json({ members, total: members.length });
    }

    // POST: 회원가입
    if (req.method === 'POST') {
      const { action } = req.body;

      if (action === 'register') {
        const { name, phone, email, password, zipcode, address, area } = req.body;
        if (!name || !phone || !password) {
          return res.status(400).json({ error: '이름, 연락처, 비밀번호는 필수입니다.' });
        }
        const { members, sha } = await getMembers();
        if (members.find(m => m.phone === phone)) {
          return res.status(409).json({ error: '이미 등록된 연락처입니다.' });
        }
        const newMember = {
          id: Date.now().toString(36),
          name, phone, email: email || '',
          password, zipcode: zipcode || '',
          address: address || '', area: area || '',
          grade: '일반', status: '활성',
          date: new Date().toISOString().slice(0, 10),
          memo: ''
        };
        members.push(newMember);
        await saveMembers(members, sha);
        return res.status(201).json({ message: '회원가입 완료', id: newMember.id });
      }

      if (action === 'login') {
        const { phone, password } = req.body;
        const { members } = await getMembers();
        const member = members.find(m => m.phone === phone && m.password === password);
        if (!member) return res.status(401).json({ error: '연락처 또는 비밀번호가 일치하지 않습니다.' });
        if (member.status !== '활성') return res.status(403).json({ error: '비활성 계정입니다.' });
        return res.status(200).json({
          message: '로그인 성공',
          user: { id: member.id, name: member.name, grade: member.grade }
        });
      }

      return res.status(400).json({ error: 'action 필수 (register/login)' });
    }

    // PUT: 회원 수정 (관리자)
    if (req.method === 'PUT') {
      const key = req.headers['x-admin-key'];
      if (key !== ADMIN_KEY) return res.status(401).json({ error: '관리자 인증 필요' });
      const { id, ...updates } = req.body;
      const { members, sha } = await getMembers();
      const idx = members.findIndex(m => m.id === id);
      if (idx === -1) return res.status(404).json({ error: '회원을 찾을 수 없습니다.' });
      members[idx] = { ...members[idx], ...updates };
      await saveMembers(members, sha);
      return res.status(200).json({ message: '수정 완료' });
    }

    // DELETE: 회원 삭제 (관리자)
    if (req.method === 'DELETE') {
      const key = req.headers['x-admin-key'];
      if (key !== ADMIN_KEY) return res.status(401).json({ error: '관리자 인증 필요' });
      const { id } = req.body;
      const { members, sha } = await getMembers();
      const filtered = members.filter(m => m.id !== id);
      if (filtered.length === members.length) return res.status(404).json({ error: '회원을 찾을 수 없습니다.' });
      await saveMembers(filtered, sha);
      return res.status(200).json({ message: '삭제 완료' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: '서버 오류: ' + err.message });
  }
};
