module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return res.status(500).json({ error: 'Telegram 환경변수 미설정' });

  const { action, fileName, fileSize, folder, user } = req.body;
  if (!action || !fileName) return res.status(400).json({ error: 'action, fileName 필수' });

  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const timeStr = kst.toISOString().replace('T', ' ').slice(0, 19);

  const icon = action === 'upload' ? '📤' : '📥';
  const label = action === 'upload' ? '업로드' : '다운로드';

  const text = `${icon} <b>[웹하드 ${label}]</b>
━━━━━━━━━━━━━━━━━━━━
• 시간: ${timeStr}
• 사용자: ${user || '게스트'}
• 파일명: ${fileName}
• 크기: ${fileSize || '-'}
• 폴더: ${folder || '/'}
• 동작: ${label}
━━━━━━━━━━━━━━━━━━━━`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(200).json({ ok: false, error: e.message });
  }
};
