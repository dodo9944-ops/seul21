// 브이월드(VWorld, 국토교통부 공개 오픈API) 서버사이드 프록시
// ------------------------------------------------------------
// AI 부지분석(site-analyzer.html) 전용. 브라우저는 이 함수만 호출하고,
// 실제 VWorld 인증키(VWORLD_API_KEY, Vercel 환경변수)는 서버에서만 사용해
// 클라이언트 JS 번들에 노출되지 않는다.
//
// 지원 액션(?api=):
//   tile    — 배경지도/위성 타일 중계 (WMTS)      ?api=tile&layer=Base|Satellite|Hybrid&z=&x=&y=
//   geocode — 주소 → 좌표 + 법정동코드/지번        ?api=geocode&address=...
//   landchar— PNU → 지목/면적/공시지가/용도지역     ?api=landchar&pnu=...
//
// VWORLD_API_KEY 미설정 시(발급 전 개발 단계) 모든 액션이 화면 확인용
// 목업 데이터로 폴백한다 — 실제 키 등록 후 자동으로 실사용으로 전환된다.
// (대장 지시 2026-08-30: pro.aicon.city 유사 도구를 빛세움 홈페이지에 추가)

const VWORLD_KEY = process.env.VWORLD_API_KEY || '';
const VWORLD_HOST = 'https://api.vworld.kr';

function sendJson(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

async function fetchBuffer(url) {
  const r = await fetch(url);
  const buf = Buffer.from(await r.arrayBuffer());
  return { status: r.status, contentType: r.headers.get('content-type') || 'application/octet-stream', buf };
}

// 법정동코드(10) + 산여부(1) + 본번(4) + 부번(4) = PNU(19)
function buildPnu(bcode, jibun) {
  if (!bcode || !jibun) return null;
  const isMountain = /산/.test(jibun);
  const nums = jibun.replace(/산/g, '').split('-');
  const bun = String(parseInt(nums[0], 10) || 0).padStart(4, '0');
  const ji = String(parseInt(nums[1], 10) || 0).padStart(4, '0');
  return `${bcode}${isMountain ? '1' : '0'}${bun}${ji}`;
}

function mockGeocode(address) {
  return {
    ok: true, mock: true,
    address,
    x: 127.1147, y: 37.5301, // 강동구 인근 임시 좌표(빛세움 사옥 근방)
    bcode: '1174010600', jibun: '123-4',
    pnu: buildPnu('1174010600', '123-4'),
    roadAddr: address, jibunAddr: address,
  };
}

function mockLandChar(pnu) {
  return {
    ok: true, mock: true,
    pnu,
    jimok: '대', area: 462.3, officialPrice: 4850000,
    useZone1: '제2종일반주거지역',
  };
}

module.exports = async function handler(req, res) {
  try {
    const api = req.query.api;

    if (api === 'tile') {
      const { layer = 'Base', z, x, y } = req.query;
      if (!VWORLD_KEY) { res.statusCode = 204; return res.end(); } // 키 없으면 빈 타일(지도는 흰 배경으로 표시)
      const ext = layer === 'Satellite' || layer === 'Hybrid' ? 'jpeg' : 'png';
      const url = `${VWORLD_HOST}/req/wmts/1.0.0/${VWORLD_KEY}/${layer}/${z}/${y}/${x}.${ext}`;
      const { status, contentType, buf } = await fetchBuffer(url);
      res.statusCode = status;
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.end(buf);
    }

    if (api === 'geocode') {
      const address = (req.query.address || '').trim();
      if (!address) return sendJson(res, 400, { ok: false, error: 'address required' });
      if (!VWORLD_KEY) return sendJson(res, 200, mockGeocode(address));

      const url = `${VWORLD_HOST}/req/address?service=address&request=getcoord&version=2.0&crs=epsg:4326`
        + `&address=${encodeURIComponent(address)}&refine=true&simple=false&format=json&type=parcel&key=${VWORLD_KEY}`;
      const r = await fetch(url);
      const data = await r.json();
      const result = data && data.response;
      if (!result || result.status !== 'OK') {
        return sendJson(res, 200, { ok: false, error: 'not_found', raw: result && result.status });
      }
      const point = result.result.point;
      const st = result.refined && result.refined.structure;
      const bcode = st && (st.level4LC || st.level4AC) || null;
      const jibun = st && st.detail || null;
      return sendJson(res, 200, {
        ok: true, address,
        x: parseFloat(point.x), y: parseFloat(point.y),
        bcode, jibun, pnu: buildPnu(bcode, jibun),
        roadAddr: result.refined && result.refined.text,
      });
    }

    if (api === 'landchar') {
      const pnu = (req.query.pnu || '').trim();
      if (!pnu) return sendJson(res, 400, { ok: false, error: 'pnu required' });
      if (!VWORLD_KEY) return sendJson(res, 200, mockLandChar(pnu));

      const url = `${VWORLD_HOST}/req/data?service=data&request=GetFeature&data=LT_C_LNDCHRACTER`
        + `&key=${VWORLD_KEY}&format=json&size=1&page=1&attrFilter=pnu:=:${pnu}`;
      const r = await fetch(url);
      const data = await r.json();
      const feature = data && data.response && data.response.result
        && data.response.result.featureCollection
        && data.response.result.featureCollection.features
        && data.response.result.featureCollection.features[0];
      if (!feature) return sendJson(res, 200, { ok: false, error: 'not_found', pnu });
      const p = feature.properties || {};
      return sendJson(res, 200, {
        ok: true, pnu,
        jimok: p.jimok, area: parseFloat(p.lndpclAr || p.area || 0),
        officialPrice: parseInt(p.pblntfPclnd || p.jgongsiga || 0, 10),
        useZone1: p.prposArea1Nm || p.useZone1,
      });
    }

    return sendJson(res, 400, { ok: false, error: 'unknown api' });
  } catch (e) {
    return sendJson(res, 500, { ok: false, error: String(e && e.message || e) });
  }
};
