module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not set' });

  const action = req.query.action || 'info';
  const TGAPI = `https://api.telegram.org/bot${token}`;

  try {
    if (action === 'set') {
      // 웹훅 등록
      const webhookUrl = 'https://seul21.vercel.app/api/chat-expert-webhook';
      const r = await fetch(`${TGAPI}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl })
      });
      const data = await r.json();
      return res.status(200).json({ action: 'setWebhook', webhookUrl, result: data });
    }

    if (action === 'delete') {
      const r = await fetch(`${TGAPI}/deleteWebhook`);
      const data = await r.json();
      return res.status(200).json({ action: 'deleteWebhook', result: data });
    }

    // 기본: 현재 웹훅 정보 조회
    const r = await fetch(`${TGAPI}/getWebhookInfo`);
    const data = await r.json();
    return res.status(200).json({ action: 'getWebhookInfo', result: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
