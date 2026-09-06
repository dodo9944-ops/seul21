const crypto = require('crypto');

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const DEDUP_TTL_SECONDS = 86400; // 동일 IP는 24시간 내 재조회 시 1회로 집계

async function kv(pathParts) {
  const url = KV_URL + '/' + pathParts.map(encodeURIComponent).join('/');
  const res = await fetch(url, { headers: { Authorization: 'Bearer ' + KV_TOKEN } });
  if (!res.ok) throw new Error('KV request failed: ' + res.status);
  return res.json();
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.socket && req.socket.remoteAddress || 'unknown';
}

function hashIp(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 24);
}

function safeKey(s) {
  return String(s || '').replace(/[^a-zA-Z0-9_\-가-힣.]/g, '_').slice(0, 120);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!KV_URL || !KV_TOKEN) return res.status(500).json({ error: 'KV 저장소 미연결 (KV_REST_API_URL/TOKEN 없음)' });

  const { action, scope, id, ids } = req.body || {};
  if (!scope) return res.status(400).json({ error: 'scope 필수' });
  const sScope = safeKey(scope);

  try {
    if (action === 'batch') {
      if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'ids 배열 필수' });
      const keys = ids.map(i => 'vwc:' + sScope + ':' + safeKey(i));
      const data = await kv(['mget', ...keys]);
      const counts = {};
      ids.forEach((i, idx) => { counts[i] = parseInt((data.result || [])[idx], 10) || 0; });
      return res.status(200).json({ counts });
    }

    // 기본 동작: 조회 1건 등록 (동일 IP는 24시간 내 1회로 집계)
    if (!id) return res.status(400).json({ error: 'id 필수' });
    const sId = safeKey(id);
    const ip = clientIp(req);
    const ipHash = hashIp(ip);
    const dedupKey = 'vwd:' + sScope + ':' + sId + ':' + ipHash;
    const countKey = 'vwc:' + sScope + ':' + sId;

    const setRes = await kv(['set', dedupKey, '1', 'EX', String(DEDUP_TTL_SECONDS), 'NX']);
    let counted = false;
    let count;
    if (setRes.result === 'OK') {
      const incrRes = await kv(['incr', countKey]);
      count = incrRes.result;
      counted = true;
    } else {
      const getRes = await kv(['get', countKey]);
      count = parseInt(getRes.result, 10) || 0;
    }
    return res.status(200).json({ count, counted });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
