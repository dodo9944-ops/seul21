const REPO = 'dodo9944-ops/seul21';
const FILE_PATH = 'redevelopment/assets/data/mock-data.js';
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
  return res;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: 'GITHUB_TOKEN 미설정' });

  const { action, item } = req.body;
  if (!action || !item) return res.status(400).json({ error: 'action, item 필수' });

  try {
    // 1. 현재 mock-data.js 가져오기
    const getRes = await ghFetch(`/repos/${REPO}/contents/${FILE_PATH}`);
    const getData = await getRes.json();
    const raw = Buffer.from(getData.content, 'base64').toString('utf8');
    const sha = getData.sha;

    // 2. library 배열 찾기
    const libStart = raw.indexOf('library: [');
    if (libStart === -1) return res.status(500).json({ error: 'library 배열 없음' });

    // library 배열의 첫 번째 { 위치 찾기
    const arrStart = raw.indexOf('[', libStart);
    // 배열 끝 찾기 (중첩 대괄호 처리)
    let depth = 0, arrEnd = -1;
    for (let i = arrStart; i < raw.length; i++) {
      if (raw[i] === '[') depth++;
      if (raw[i] === ']') { depth--; if (depth === 0) { arrEnd = i; break; } }
    }
    if (arrEnd === -1) return res.status(500).json({ error: 'library 배열 끝 없음' });

    // 3. 현재 library 배열 파싱 (간단한 방식)
    const libStr = raw.substring(arrStart, arrEnd + 1);

    let newRaw = raw;

    if (action === 'add') {
      // 배열 맨 앞에 새 항목 추가
      const newItem = `\n    { id:'${item.id}', category:'${item.category}', title:'${(item.title||'').replace(/'/g,"\\'")}', description:'${(item.description||'').replace(/'/g,"\\'")}', fileType:'${item.fileType||'pdf'}', fileSize:'${item.fileSize||''}', date:'${item.date||''}', downloads:0, tags:[${(item.tags||[]).map(t=>"'"+t.replace(/'/g,"\\'")+"'").join(',')}] },`;
      newRaw = raw.substring(0, arrStart + 1) + newItem + raw.substring(arrStart + 1);

    } else if (action === 'update') {
      // 해당 ID 항목 찾아서 교체
      const idPattern = "id:'" + item.id + "'";
      const itemStart = raw.indexOf(idPattern);
      if (itemStart === -1) return res.status(404).json({ error: '항목 없음: ' + item.id });

      // { 시작 찾기
      let objStart = itemStart;
      while (objStart > 0 && raw[objStart] !== '{') objStart--;

      // } 끝 찾기 (중첩 처리)
      let objDepth = 0, objEnd = -1;
      for (let i = objStart; i < raw.length; i++) {
        if (raw[i] === '{') objDepth++;
        if (raw[i] === '}') { objDepth--; if (objDepth === 0) { objEnd = i; break; } }
      }
      if (objEnd === -1) return res.status(500).json({ error: '항목 끝 없음' });

      const replacement = `{ id:'${item.id}', category:'${item.category}', title:'${(item.title||'').replace(/'/g,"\\'")}', description:'${(item.description||'').replace(/'/g,"\\'")}', fileType:'${item.fileType||'pdf'}', fileSize:'${item.fileSize||''}', date:'${item.date||''}', downloads:${item.downloads||0}, tags:[${(item.tags||[]).map(t=>"'"+t.replace(/'/g,"\\'")+"'").join(',')}] }`;
      newRaw = raw.substring(0, objStart) + replacement + raw.substring(objEnd + 1);
    }

    // 4. GitHub에 저장
    const content = Buffer.from(newRaw, 'utf8').toString('base64');
    const putRes = await ghFetch(`/repos/${REPO}/contents/${FILE_PATH}`, {
      method: 'PUT',
      body: JSON.stringify({
        message: `자료실 ${action === 'add' ? '신규' : '수정'}: ${item.title || item.id}`,
        content,
        sha
      })
    });

    if (putRes.ok) {
      // 텔레그램 알림
      const tgToken = process.env.TELEGRAM_BOT_TOKEN;
      const tgChat = process.env.TELEGRAM_CHAT_ID;
      if (tgToken && tgChat) {
        const now = new Date(Date.now() + 9*60*60*1000);
        const label = action === 'add' ? '신규 등록' : '수정';
        await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: tgChat,
            text: `📋 <b>[자료실 ${label}]</b>\n• 제목: ${item.title}\n• 카테고리: ${item.category}\n• 시간: ${now.toISOString().slice(0,19).replace('T',' ')}`,
            parse_mode: 'HTML'
          })
        });
      }
      return res.status(200).json({ ok: true, action });
    } else {
      const err = await putRes.json();
      return res.status(500).json({ ok: false, error: err.message });
    }
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};
