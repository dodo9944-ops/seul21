const REPO = 'dodo9944-ops/seul21';
const FILE_PATH = 'redevelopment/data/members.json';
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

async function getMembers() {
  const data = await ghFetch(`/repos/${REPO}/contents/${FILE_PATH}`);
  const raw = Buffer.from(data.content, 'base64');
  const content = new TextDecoder('utf-8').decode(raw);
  return { members: JSON.parse(content), sha: data.sha };
}

async function saveMembers(members, sha) {
  const jsonStr = JSON.stringify(members, null, 2);
  const bytes = new TextEncoder().encode(jsonStr);
  const content = Buffer.from(bytes).toString('base64');
  await ghFetch(`/repos/${REPO}/contents/${FILE_PATH}`, {
    method: 'PUT',
    body: JSON.stringify({ message: '소셜 로그인 회원 추가', content, sha })
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { provider, code, state } = req.body;

  try {
    let userInfo = null;

    // ── 네이버 로그인 ──
    if (provider === 'naver') {
      // 1) code로 access_token 발급
      const tokenRes = await fetch('https://nid.naver.com/oauth2.0/token?' + new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.NAVER_CLIENT_ID,
        client_secret: process.env.NAVER_CLIENT_SECRET,
        code, state
      }));
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) return res.status(401).json({ error: '네이버 인증 실패' });

      // 2) access_token으로 프로필 조회
      const profileRes = await fetch('https://openapi.naver.com/v1/nid/me', {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
      });
      const profileData = await profileRes.json();
      const p = profileData.response;
      userInfo = {
        name: p.name || p.nickname || '네이버사용자',
        email: p.email || '',
        phone: p.mobile ? p.mobile.replace(/\s/g, '') : '',
        provider: 'naver',
        providerId: p.id
      };
    }

    // ── 카카오 로그인 ──
    else if (provider === 'kakao') {
      const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.KAKAO_CLIENT_ID,
          redirect_uri: 'https://seul21.com/pages/login.html',
          code
        })
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) return res.status(401).json({ error: '카카오 인증 실패' });

      const profileRes = await fetch('https://kapi.kakao.com/v2/user/me', {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
      });
      const profileData = await profileRes.json();
      const ka = profileData.kakao_account || {};
      userInfo = {
        name: ka.profile?.nickname || '카카오사용자',
        email: ka.email || '',
        phone: ka.phone_number ? ka.phone_number.replace(/[^0-9\-]/g, '') : '',
        provider: 'kakao',
        providerId: String(profileData.id)
      };
    }

    // ── 구글 로그인 ──
    else if (provider === 'google') {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: 'https://seul21.com/pages/login.html',
          code
        })
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) return res.status(401).json({ error: '구글 인증 실패' });

      const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
      });
      const p = await profileRes.json();
      userInfo = {
        name: p.name || '구글사용자',
        email: p.email || '',
        phone: '',
        provider: 'google',
        providerId: p.id
      };
    }

    else {
      return res.status(400).json({ error: '지원하지 않는 로그인 방식입니다.' });
    }

    // ── 회원 조회/생성 ──
    const { members, sha } = await getMembers();
    let member = members.find(m =>
      m.provider === userInfo.provider && m.providerId === userInfo.providerId
    );

    if (!member) {
      // 신규 회원 자동 가입
      member = {
        id: Date.now().toString(36),
        name: userInfo.name,
        phone: userInfo.phone,
        email: userInfo.email,
        password: '',
        zipcode: '', address: '', area: '',
        grade: '일반', status: '활성',
        date: new Date().toISOString().slice(0, 10),
        memo: `${userInfo.provider} 소셜 로그인`,
        provider: userInfo.provider,
        providerId: userInfo.providerId
      };
      members.push(member);
      await saveMembers(members, sha);
    }

    return res.status(200).json({
      message: '로그인 성공',
      user: { id: member.id, name: member.name, grade: member.grade }
    });

  } catch (err) {
    return res.status(500).json({ error: '소셜 로그인 처리 실패: ' + err.message });
  }
};
