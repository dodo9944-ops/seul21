const REPO = 'dodo9944-ops/seul21';
const GITHUB_API = 'https://api.github.com';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: 'GITHUB_TOKEN 미설정' });

  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const timeStr = kst.toISOString().replace('T', ' ').slice(0, 19);
  const message = (req.body && req.body.message) || '즉시 배포 트리거 (' + timeStr + ')';

  try {
    // 빈 커밋으로 Vercel 재배포 트리거 (GitHub API dispatch)
    const dispatchRes = await fetch(`${GITHUB_API}/repos/${REPO}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ event_type: 'deploy', client_payload: { message } })
    });

    // Vercel Deploy Hook (환경변수에 설정된 경우)
    const vercelHook = process.env.VERCEL_DEPLOY_HOOK;
    if (vercelHook) {
      await fetch(vercelHook, { method: 'POST' });
    }

    // 텔레그램 알림
    const tgToken = process.env.TELEGRAM_BOT_TOKEN;
    const tgChat = process.env.TELEGRAM_CHAT_ID;
    if (tgToken && tgChat) {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChat,
          text: `🚀 <b>[즉시 배포]</b>\n━━━━━━━━━━━━━━━━━━━━\n• 시간: ${timeStr}\n• 사유: ${message}\n• 상태: 배포 요청 완료\n━━━━━━━━━━━━━━━━━━━━`,
          parse_mode: 'HTML'
        })
      });
    }

    return res.status(200).json({ ok: true, message: '배포 요청 완료', time: timeStr });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};
