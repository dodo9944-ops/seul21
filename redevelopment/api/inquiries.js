const REPO = 'dodo9944-ops/seul21';
const FILE_PATH = 'redevelopment/data/inquiries.json';
const GITHUB_API = 'https://api.github.com';
const ADMIN_LINK = 'https://seul21.vercel.app/admin/inquiries.html';
const EMAIL_RECIPIENTS = ['dodo66666@naver.com', 'dodo9944@mail.com', 'dodo9944@gmail.com'];

// ─── GitHub helpers ──────────────────────────────────────
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
      message: `문의 데이터 업데이트 (${new Date().toISOString().slice(0, 10)})`,
      content, sha
    })
  });
}

// ─── Multipart parser (no external deps) ─────────────────
function parseMultipart(body, boundary) {
  const parts = [];
  const boundaryBuffer = Buffer.from('--' + boundary);
  const endBuffer = Buffer.from('--' + boundary + '--');

  // Split by boundary
  let start = 0;
  const positions = [];
  for (let i = 0; i <= body.length - boundaryBuffer.length; i++) {
    if (body.slice(i, i + boundaryBuffer.length).equals(boundaryBuffer)) {
      positions.push(i);
    }
  }

  for (let p = 0; p < positions.length - 1; p++) {
    const partStart = positions[p] + boundaryBuffer.length + 2; // skip boundary + \r\n
    const partEnd = positions[p + 1] - 2; // skip \r\n before next boundary
    if (partStart >= partEnd) continue;
    const partData = body.slice(partStart, partEnd);

    // Find double CRLF separating headers from body
    let headerEnd = -1;
    for (let i = 0; i <= partData.length - 4; i++) {
      if (partData[i] === 0x0d && partData[i + 1] === 0x0a &&
          partData[i + 2] === 0x0d && partData[i + 3] === 0x0a) {
        headerEnd = i;
        break;
      }
    }
    if (headerEnd === -1) continue;

    const headerStr = partData.slice(0, headerEnd).toString('utf-8');
    const bodyData = partData.slice(headerEnd + 4);

    const headers = {};
    headerStr.split('\r\n').forEach(line => {
      const idx = line.indexOf(':');
      if (idx > 0) {
        headers[line.slice(0, idx).toLowerCase().trim()] = line.slice(idx + 1).trim();
      }
    });

    const cd = headers['content-disposition'] || '';
    const nameMatch = cd.match(/name="([^"]+)"/);
    const filenameMatch = cd.match(/filename="([^"]+)"/);
    const contentType = headers['content-type'] || 'text/plain';

    parts.push({
      name: nameMatch ? nameMatch[1] : '',
      filename: filenameMatch ? filenameMatch[1] : null,
      contentType,
      data: bodyData
    });
  }
  return parts;
}

// ─── Read request body as Buffer ─────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// ─── Phone masking: 010-1234-5678 → 010***5678 ──────────
function maskPhone(phone) {
  if (!phone) return '미입력';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length < 7) return phone;
  return digits.slice(0, 3) + '***' + digits.slice(-4);
}

// ─── KST timestamp: YYYY-MM-DD HH:MM ────────────────────
function kstNow() {
  const d = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 16).replace('T', ' ');
}

// ─── Telegram helpers ────────────────────────────────────
async function sendTelegram(text, retry = true) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    });
    if (!res.ok && retry) {
      // Retry once
      return sendTelegram(text, false);
    }
    return res.ok;
  } catch (e) {
    if (retry) return sendTelegram(text, false);
    return false;
  }
}

async function sendTelegramDocument(fileBuffer, filename, caption) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  try {
    // Build multipart/form-data manually
    const boundary = '----TGBoundary' + Date.now();
    const parts = [];

    // chat_id
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${chatId}\r\n`
    ));

    // caption (optional)
    if (caption) {
      parts.push(Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n`
      ));
    }

    // document
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="${filename}"\r\nContent-Type: application/octet-stream\r\n\r\n`
    ));
    parts.push(fileBuffer);
    parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

    const body = Buffer.concat(parts);

    const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
      body
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

// ─── Email via Resend API ────────────────────────────────
async function sendEmail({ subject, htmlBody, attachments }) {
  const apiKey = process.env.EMAIL_API_KEY;
  if (!apiKey) return { sent: false, reason: 'EMAIL_API_KEY 미설정' };

  try {
    const emailAttachments = (attachments || []).map(a => ({
      filename: a.filename,
      content: a.data.toString('base64')
    }));

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: '세울엔지니어링 <onboarding@resend.dev>',
        to: EMAIL_RECIPIENTS,
        subject,
        html: htmlBody,
        attachments: emailAttachments.length > 0 ? emailAttachments : undefined
      })
    });

    if (!res.ok) {
      const err = await res.text();
      return { sent: false, reason: `Resend API ${res.status}: ${err}` };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e.message };
  }
}

// ─── Build notification messages ─────────────────────────
function buildTelegramMessage({ type, name, phone, email, content, fileCount }) {
  let msg = `[세울 고객센터 문의 접수]\n━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `- 접수시간: ${kstNow()}\n`;
  msg += `- 문의유형: ${type || '기타'}\n`;
  msg += `- 문의자: ${name}\n`;
  msg += `- 연락처: ${maskPhone(phone)}\n`;
  msg += `- 이메일: ${email || '미입력'}\n`;
  msg += `- 문의요약: ${(content || '').substring(0, 100)}${content && content.length > 100 ? '...' : ''}\n`;
  msg += `- 긴급여부: 일반\n`;
  if (fileCount > 0) {
    msg += `- 첨부파일: ${fileCount}건 (별도 전송)\n`;
  }
  msg += `- 확인링크: ${ADMIN_LINK}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━`;
  return msg;
}

function buildEmailHtml({ type, name, phone, email, title, content, fileCount }) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:'Noto Sans KR',sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f8f9fa">
  <div style="background:#0A0F1C;color:#C3A569;padding:20px 24px;border-radius:12px 12px 0 0;font-size:18px;font-weight:800">
    세울엔지니어링 고객센터
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
    <h2 style="font-size:16px;color:#0A0F1C;margin:0 0 20px">신규 문의가 접수되었습니다</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:10px 12px;background:#f9fafb;font-weight:600;color:#374151;width:100px;border-bottom:1px solid #e5e7eb">접수시간</td><td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${kstNow()}</td></tr>
      <tr><td style="padding:10px 12px;background:#f9fafb;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb">문의유형</td><td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${type || '기타'}</td></tr>
      <tr><td style="padding:10px 12px;background:#f9fafb;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb">문의자</td><td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${name}</td></tr>
      <tr><td style="padding:10px 12px;background:#f9fafb;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb">연락처</td><td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${phone || '미입력'}</td></tr>
      <tr><td style="padding:10px 12px;background:#f9fafb;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb">이메일</td><td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${email || '미입력'}</td></tr>
      <tr><td style="padding:10px 12px;background:#f9fafb;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb">제목</td><td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${title}</td></tr>
      ${fileCount > 0 ? `<tr><td style="padding:10px 12px;background:#f9fafb;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb">첨부파일</td><td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${fileCount}건</td></tr>` : ''}
    </table>
    <div style="margin-top:20px;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px">
      <div style="font-size:13px;font-weight:600;color:#6b7280;margin-bottom:8px">문의 내용</div>
      <div style="font-size:14px;color:#1f2937;line-height:1.7;white-space:pre-wrap">${content}</div>
    </div>
    <div style="margin-top:24px;text-align:center">
      <a href="${ADMIN_LINK}" style="display:inline-block;padding:12px 32px;background:#0A0F1C;color:#C3A569;text-decoration:none;border-radius:8px;font-size:14px;font-weight:700">관리자 페이지에서 확인하기</a>
    </div>
  </div>
</body></html>`;
}

// ─── Parse request body (JSON or multipart) ──────────────
async function parseRequest(req) {
  const ct = req.headers['content-type'] || '';

  if (ct.includes('multipart/form-data')) {
    const boundaryMatch = ct.match(/boundary=(.+)/);
    if (!boundaryMatch) throw new Error('No boundary in multipart');
    const boundary = boundaryMatch[1].replace(/^["']|["']$/g, '');
    const rawBody = await readBody(req);
    const parts = parseMultipart(rawBody, boundary);

    const fields = {};
    const files = [];

    for (const part of parts) {
      if (part.filename) {
        files.push({
          filename: part.filename,
          contentType: part.contentType,
          data: part.data,
          size: part.data.length
        });
      } else {
        fields[part.name] = part.data.toString('utf-8');
      }
    }

    return { fields, files };
  }

  // Fallback: JSON body
  const body = req.body || {};
  return { fields: body, files: [] };
}

// ─── Main handler ────────────────────────────────────────
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
      const { fields, files } = await parseRequest(req);
      const { name, email, phone, type, title, content } = fields;

      if (!name || !title || !content) {
        return res.status(400).json({ error: '이름, 제목, 내용은 필수입니다.' });
      }

      // 1) GitHub 저장 (기존 로직 유지)
      const { items, sha } = await getData();
      const newItem = {
        id: Date.now().toString(36),
        name, email: email || '', phone: phone || '',
        type: type || '기타', title, content,
        files: files.map(f => ({
          name: f.filename,
          size: f.size < 1048576
            ? (f.size / 1024).toFixed(0) + 'KB'
            : (f.size / 1048576).toFixed(1) + 'MB'
        })),
        status: '접수',
        answer: '',
        date: new Date().toISOString().slice(0, 10),
        answeredAt: ''
      };
      items.unshift(newItem);
      await saveData(items, sha);

      // 2) 텔레그램 알림
      const tgMsg = buildTelegramMessage({
        type, name, phone, email, content,
        fileCount: files.length
      });
      const tgSent = await sendTelegram(tgMsg);

      // 첨부파일 텔레그램 전송
      if (files.length > 0) {
        let fileSentCount = 0;
        for (const f of files) {
          const sent = await sendTelegramDocument(
            f.data, f.filename,
            `[고객문의 첨부] ${name} - ${f.filename}`
          );
          if (sent) fileSentCount++;
        }
        // 일부 파일 전송 실패 경고
        if (fileSentCount < files.length) {
          await sendTelegram(
            `⚠️ 첨부파일 전송 경고\n문의자: ${name}\n전송: ${fileSentCount}/${files.length}건\n일부 파일이 전송되지 않았습니다. 관리자 페이지에서 확인하세요.`
          );
        }
      }

      // 3) 이메일 알림
      const emailResult = await sendEmail({
        subject: `[세울 고객센터] 신규 문의 접수 - ${type || '기타'}`,
        htmlBody: buildEmailHtml({
          type, name, phone, email, title, content,
          fileCount: files.length
        }),
        attachments: files
      });

      if (!emailResult.sent) {
        // 이메일 미발송 시 텔레그램으로 알림
        await sendTelegram(
          `⚠️ 이메일 알림 미발송\n사유: ${emailResult.reason}\n문의자: ${name} / ${type || '기타'}\n관리자 페이지에서 직접 확인하세요.\n${ADMIN_LINK}`
        );
      }

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
