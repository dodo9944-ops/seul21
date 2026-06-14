// REB(한국부동산원) 사업타당성 분석 리버스 프록시
// ------------------------------------------------------------
// 사업타당성 검토(feasibility-check.html) 임베드 전용.
// 브라우저의 /sotong/* 요청을 서버에서 https://www.reb.or.kr/sotong/* 로 중계한다.
// - X-Frame-Options / CSP 제거 → 우리 도메인 iframe 안에서 표시 가능
// - 세션 쿠키(JSESSIONID 등) 양방향 중계 → 다단계 분석 흐름 유지
// - 응답 HTML 내 절대 reb URL → 루트 상대경로로 치환 → 하위 요청도 프록시 경유
// 지도/GIS(binzib.reb.or.kr)는 reb 자체 서버사이드 프록시(/sotong/.../gis/proxy.do)를
// 거치므로 본 함수가 /sotong/* 만 중계하면 연쇄적으로 처리된다.
//
// (대장 명시 지시: 2026-06-14 "사업타당성 검토 메뉴에 분석기 업로드" + "전체 프록시" 선택)

const REB_ORIGIN = 'https://www.reb.or.kr';

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// 이미 파싱된 req.body 가 있으면 그것으로 본문을 복원, 없으면 원시 스트림을 읽는다.
async function resolveBody(req) {
  const ct = (req.headers['content-type'] || '').toLowerCase();
  if (req.body !== undefined && req.body !== null) {
    if (Buffer.isBuffer(req.body)) return req.body;
    if (typeof req.body === 'string') return Buffer.from(req.body, 'utf8');
    if (typeof req.body === 'object') {
      if (ct.includes('application/json')) return Buffer.from(JSON.stringify(req.body), 'utf8');
      // urlencoded(혹은 그 외 객체)
      return Buffer.from(new URLSearchParams(req.body).toString(), 'utf8');
    }
  }
  try { return await readRawBody(req); } catch { return undefined; }
}

// reb 절대주소를 루트 상대경로로 (HTML 텍스트 응답 한정)
function rewriteHtml(html) {
  return html
    .replace(/https?:\/\/www\.reb\.or\.kr/gi, '')
    .replace(/(["'(\s])\/\/www\.reb\.or\.kr/gi, '$1');
}

module.exports = async function handler(req, res) {
  try {
    // 리라이트로 전달된 원본 경로 추출
    const q = { ...req.query };
    let path = q.__path;
    if (Array.isArray(path)) path = path[0];
    delete q.__path;
    if (!path) { res.statusCode = 400; return res.end('reb-proxy: missing path'); }
    if (!path.startsWith('/')) path = '/' + path;

    // 남은 쿼리스트링 재조립
    const usp = new URLSearchParams();
    for (const k of Object.keys(q)) {
      const v = q[k];
      if (Array.isArray(v)) v.forEach((x) => usp.append(k, x));
      else if (v !== undefined) usp.append(k, v);
    }
    const qs = usp.toString();
    const target = REB_ORIGIN + path + (qs ? '?' + qs : '');

    // 업스트림 요청 헤더
    const headers = {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Referer': REB_ORIGIN + '/',
      'Origin': REB_ORIGIN,
      'Accept': req.headers['accept'] || '*/*',
      'Accept-Language': req.headers['accept-language'] || 'ko-KR,ko;q=0.9,en;q=0.8',
    };
    if (req.headers['content-type']) headers['Content-Type'] = req.headers['content-type'];
    if (req.headers['cookie']) headers['Cookie'] = req.headers['cookie'];
    if (req.headers['x-requested-with']) headers['X-Requested-With'] = req.headers['x-requested-with'];

    let body;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await resolveBody(req);
    }

    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
    });

    res.statusCode = upstream.status;

    const skip = new Set([
      'x-frame-options', 'content-security-policy', 'content-security-policy-report-only',
      'content-encoding', 'content-length', 'transfer-encoding', 'connection',
      'set-cookie', 'strict-transport-security',
    ]);
    upstream.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (skip.has(k)) return;
      if (k === 'location') {
        const loc = value.replace(/^https?:\/\/(www\.)?reb\.or\.kr/i, '');
        res.setHeader('Location', loc);
        return;
      }
      res.setHeader(key, value);
    });

    // 세션 쿠키 중계: Path 를 / 로, Domain 제거 → 우리 도메인 전역에서 유지
    const setCookies = typeof upstream.headers.getSetCookie === 'function'
      ? upstream.headers.getSetCookie()
      : [];
    if (setCookies.length) {
      const rewritten = setCookies.map((c) =>
        c.replace(/;\s*Domain=[^;]+/i, '')
         .replace(/;\s*Path=[^;]+/i, '; Path=/')
      );
      res.setHeader('Set-Cookie', rewritten);
    }

    const ct = upstream.headers.get('content-type') || 'application/octet-stream';
    if (/text\/html/i.test(ct)) {
      const html = await upstream.text();
      const out = rewriteHtml(html);
      res.setHeader('Content-Type', ct);
      return res.end(out);
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', ct);
    return res.end(buf);
  } catch (e) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('reb-proxy error: ' + (e && e.message ? e.message : String(e)));
  }
};
