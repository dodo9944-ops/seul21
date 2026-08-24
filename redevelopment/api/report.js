/**
 * 빛세움 — 처리보고 텔레그램 발송 API
 * POST /api/report { text: '보고 내용' }
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return res.status(500).json({ error: 'Telegram 환경변수 미설정' });

  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: '보고 내용(text)이 필요합니다.' });

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    });
    const data = await tgRes.json();
    return res.status(200).json({ ok: data.ok, message: '텔레그램 발송 완료' });
  } catch (e) {
    return res.status(500).json({ error: '텔레그램 발송 실패', detail: e.message });
  }
};
