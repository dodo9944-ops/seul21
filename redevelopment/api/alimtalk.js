const REPO = 'dodo9944-ops/seul21';
const FILE_PATH = 'redevelopment/data/alimtalk.json';
const LOG_PATH = 'redevelopment/data/alimtalk-logs.json';
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

async function getFileData(filePath) {
  const data = await ghFetch(`/repos/${REPO}/contents/${filePath}`);
  if (!data.content) return { items: [], sha: data.sha || null };
  const raw = Buffer.from(data.content, 'base64');
  const content = new TextDecoder('utf-8').decode(raw);
  return { items: JSON.parse(content), sha: data.sha };
}

async function saveFileData(filePath, items, sha, message) {
  const jsonStr = JSON.stringify(items, null, 2);
  const bytes = new TextEncoder().encode(jsonStr);
  const content = Buffer.from(bytes).toString('base64');
  await ghFetch(`/repos/${REPO}/contents/${filePath}`, {
    method: 'PUT',
    body: JSON.stringify({ message, content, sha })
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ADMIN_KEY = process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.slice(-8) : 'admin123';
  const action = req.query.action || '';

  try {
    // ========== 공개 API ==========

    // POST: 알림톡 신청
    if (req.method === 'POST' && action === 'subscribe') {
      const { name, phone, interests, privacyConsent, alimtalkConsent } = req.body;
      if (!name || !phone) return res.status(400).json({ error: '이름과 휴대전화번호는 필수입니다.' });
      if (!privacyConsent || !alimtalkConsent) return res.status(400).json({ error: '필수 동의 항목을 확인해주세요.' });
      const phoneClean = phone.replace(/[^0-9]/g, '');
      if (!/^01[0-9]{8,9}$/.test(phoneClean)) return res.status(400).json({ error: '올바른 휴대전화번호를 입력해주세요.' });

      const { items, sha } = await getFileData(FILE_PATH);
      const existing = items.find(i => i.phone === phoneClean);
      if (existing && existing.status === 'active') {
        return res.status(409).json({ error: '이미 등록된 번호입니다.' });
      }

      if (existing && existing.status === 'unsubscribed') {
        existing.status = 'active';
        existing.name = name;
        existing.interests = interests || [];
        existing.resubscribedAt = new Date().toISOString().slice(0, 10);
      } else {
        items.unshift({
          id: Date.now().toString(36),
          name,
          phone: phoneClean,
          interests: interests || [],
          status: 'active',
          subscribedAt: new Date().toISOString().slice(0, 10),
          unsubscribedAt: ''
        });
      }
      await saveFileData(FILE_PATH, items, sha, `알림톡 신청: ${name} (${new Date().toISOString().slice(0,10)})`);

      const activeCount = items.filter(i => i.status === 'active').length;
      try {
        const tgToken = process.env.TELEGRAM_BOT_TOKEN;
        const tgChatId = process.env.TELEGRAM_CHAT_ID;
        if (tgToken && tgChatId) {
          const msg = `🔔 카카오 알림톡 새 신청!\n\n👤 이름: ${name}\n📱 번호: ${phoneClean}\n📌 관심분야: ${(interests || []).join(', ') || '미선택'}\n📅 신청일: ${new Date().toISOString().slice(0,10)}\n\n📊 현재 총 수신자: ${activeCount}명`;
          await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: tgChatId, text: msg, parse_mode: 'HTML' })
          });
        }
      } catch (e) {}

      return res.status(201).json({ message: '카카오 알림톡 신청이 완료되었습니다.' });
    }

    // POST: 수신거부 (해지)
    if (req.method === 'POST' && action === 'unsubscribe') {
      const { phone } = req.body;
      if (!phone) return res.status(400).json({ error: '휴대전화번호를 입력해주세요.' });
      const phoneClean = phone.replace(/[^0-9]/g, '');
      const { items, sha } = await getFileData(FILE_PATH);
      const target = items.find(i => i.phone === phoneClean && i.status === 'active');
      if (!target) return res.status(404).json({ error: '등록된 번호를 찾을 수 없습니다.' });

      target.status = 'unsubscribed';
      target.unsubscribedAt = new Date().toISOString().slice(0, 10);
      await saveFileData(FILE_PATH, items, sha, `알림톡 해지: ${phoneClean} (${new Date().toISOString().slice(0,10)})`);

      const remainActive = items.filter(i => i.status === 'active').length;
      try {
        const tgToken = process.env.TELEGRAM_BOT_TOKEN;
        const tgChatId = process.env.TELEGRAM_CHAT_ID;
        if (tgToken && tgChatId) {
          const msg = `🔕 알림톡 수신거부\n\n👤 이름: ${target.name}\n📱 번호: ${phoneClean}\n📅 해지일: ${target.unsubscribedAt}\n\n📊 현재 총 수신자: ${remainActive}명`;
          await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: tgChatId, text: msg })
          });
        }
      } catch (e) {}

      return res.status(200).json({ message: '알림톡 수신이 해지되었습니다.' });
    }

    // ========== 관리자 API ==========

    // GET: 신청자 목록 조회
    if (req.method === 'GET' && action === 'subscribers') {
      const key = req.headers['x-admin-key'];
      if (key !== ADMIN_KEY) return res.status(401).json({ error: '관리자 인증 필요' });
      const { items } = await getFileData(FILE_PATH);
      return res.status(200).json({ subscribers: items, total: items.length });
    }

    // GET: 발송 이력 조회
    if (req.method === 'GET' && action === 'logs') {
      const key = req.headers['x-admin-key'];
      if (key !== ADMIN_KEY) return res.status(401).json({ error: '관리자 인증 필요' });
      const { items } = await getFileData(LOG_PATH);
      return res.status(200).json({ logs: items, total: items.length });
    }

    // POST: 알림 발송 (대기 상태로 저장)
    if (req.method === 'POST' && action === 'send') {
      const key = req.headers['x-admin-key'];
      if (key !== ADMIN_KEY) return res.status(401).json({ error: '관리자 인증 필요' });
      const { title, link, targetType, targetInterests } = req.body;
      if (!title) return res.status(400).json({ error: '제목은 필수입니다.' });

      const { items: subscribers } = await getFileData(FILE_PATH);
      const activeList = subscribers.filter(s => s.status === 'active');

      let targets;
      if (targetType === 'interests' && targetInterests && targetInterests.length > 0) {
        targets = activeList.filter(s => s.interests.some(i => targetInterests.includes(i)));
      } else {
        targets = activeList;
      }

      const logEntry = {
        id: Date.now().toString(36),
        title,
        link: link || '',
        targetType: targetType || 'all',
        targetInterests: targetInterests || [],
        targetCount: targets.length,
        targets: targets.map(t => ({ name: t.name, phone: t.phone })),
        status: 'pending',
        message: `[빛세움] 주요뉴스가 업데이트되었습니다.\n제목: ${title}\n확인하기: ${link || ''}`,
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        sentAt: ''
      };

      const { items: logs, sha: logSha } = await getFileData(LOG_PATH);
      logs.unshift(logEntry);
      await saveFileData(LOG_PATH, logs, logSha, `알림 발송 대기: ${title}`);

      // 실발송 연동 지점 (추후 카카오 알림톡 API 연동)
      // const kakaoResult = await sendKakaoAlimtalk(logEntry);

      return res.status(201).json({
        message: `발송 대기 등록 완료 (대상 ${targets.length}명)`,
        logId: logEntry.id
      });
    }

    // PUT: 신청자 상태 변경 (관리자)
    if (req.method === 'PUT') {
      const key = req.headers['x-admin-key'];
      if (key !== ADMIN_KEY) return res.status(401).json({ error: '관리자 인증 필요' });
      const { id, ...updates } = req.body;
      const { items, sha } = await getFileData(FILE_PATH);
      const idx = items.findIndex(i => i.id === id);
      if (idx === -1) return res.status(404).json({ error: '신청자를 찾을 수 없습니다.' });
      items[idx] = { ...items[idx], ...updates };
      await saveFileData(FILE_PATH, items, sha, `알림톡 신청자 수정 (${new Date().toISOString().slice(0,10)})`);
      return res.status(200).json({ message: '수정 완료' });
    }

    // DELETE: 신청자 삭제 (관리자)
    if (req.method === 'DELETE') {
      const key = req.headers['x-admin-key'];
      if (key !== ADMIN_KEY) return res.status(401).json({ error: '관리자 인증 필요' });
      const { id } = req.body;
      const { items, sha } = await getFileData(FILE_PATH);
      const filtered = items.filter(i => i.id !== id);
      await saveFileData(FILE_PATH, filtered, sha, `알림톡 신청자 삭제 (${new Date().toISOString().slice(0,10)})`);
      return res.status(200).json({ message: '삭제 완료' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: '서버 오류: ' + err.message });
  }
};
