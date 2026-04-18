module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // 텔레그램 웹훅 설정 (?webhook=info|set|delete)
  const wh = req.query.webhook;
  if (wh) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return res.status(500).json({ error: 'No bot token' });
    const TGAPI = `https://api.telegram.org/bot${token}`;
    try {
      if (wh === 'set') {
        const r = await fetch(`${TGAPI}/setWebhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: 'https://seul21.vercel.app/api/chat-expert-webhook' })
        });
        return res.status(200).json({ webhook: 'set', result: await r.json() });
      }
      if (wh === 'delete') {
        const r = await fetch(`${TGAPI}/deleteWebhook`);
        return res.status(200).json({ webhook: 'delete', result: await r.json() });
      }
      const r = await fetch(`${TGAPI}/getWebhookInfo`);
      return res.status(200).json({ webhook: 'info', result: await r.json() });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // 사이트 상태 정보 반환
  const status = {
    site: 'seul21.com',
    status: 'online',
    timestamp: new Date().toISOString(),
    pages: {
      main: '/',
      about: '/pages/about.html',
      services: '/pages/services.html',
      portfolio: '/pages/portfolio.html',
      community: '/pages/community.html',
      contact: '/pages/contact.html',
      areas: '/pages/areas.html',
      news: '/pages/news.html',
      library: '/pages/library.html'
    },
    chatbot: true,
    ssl: true,
    domain: {
      primary: 'seul21.com',
      www: 'www.seul21.com'
    }
  };

  return res.status(200).json(status);
};
