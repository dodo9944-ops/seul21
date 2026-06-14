// 주소검색 프록시 (사업타당성 검토 임베드 전용)
// ------------------------------------------------------------
// 한국부동산원 분석 페이지(.do)는 juso.go.kr 주소 구성요소
// (siNm/sggNm/emdNm/lnbrMnnm/lnbrSlno/mtYn)를 요구한다.
// 그러나 juso.go.kr 는 Vercel(클라우드) IP 를 차단하므로 서버에서 직접 호출이 불가하다.
// → 카카오 로컬(주소검색) API(dapi.kakao.com, 클라우드 접근 가능)로 검색하고
//   응답을 juso 와 동일한 JSON 구조로 매핑해 반환한다. (juso 직접호출은 폴백)
//
// 필요 환경변수: KAKAO_CLIENT_ID (카카오 REST API 키 · 소셜로그인과 동일 앱, 로컬 API 활성화 필요)

const KAKAO_ADDR = 'https://dapi.kakao.com/v2/local/search/address.json';
const KAKAO_KEYWORD = 'https://dapi.kakao.com/v2/local/search/keyword.json';
const JUSO_URL = 'https://www.juso.go.kr/addrlink/addrLinkApi.do';
const JUSO_CONFM_KEY = 'U01TX0FVVEgyMDIyMDcxMzE1MDI1ODExMjc4NTE=';

function jusoCommon(extra) {
  return Object.assign({ errorCode: '0', errorMessage: '정상', totalCount: '0', currentPage: '1', countPerPage: '10' }, extra);
}

// 카카오 주소 document → juso juso[] 항목으로 매핑
function fromKakaoAddress(doc) {
  const a = doc.address || {};
  const r = doc.road_address || {};
  return {
    roadAddr: r.address_name || '',
    jibunAddr: a.address_name || doc.address_name || '',
    siNm: a.region_1depth_name || r.region_1depth_name || '',
    sggNm: a.region_2depth_name || r.region_2depth_name || '',
    emdNm: a.region_3depth_name || r.region_3depth_name || '',
    lnbrMnnm: a.main_address_no || r.main_building_no || '',
    lnbrSlno: a.sub_address_no || r.sub_building_no || '',
    zipNo: r.zone_no || '',
    mtYn: (a.mountain_yn === 'Y') ? '1' : '0',
    bdNm: r.building_name || doc.place_name || '',
    admCd: a.b_code || '',
  };
}

async function searchKakao(keyword, size, key) {
  const headers = { Authorization: 'KakaoAK ' + key };
  // 1) 주소 검색
  let r = await fetch(KAKAO_ADDR + '?query=' + encodeURIComponent(keyword) + '&size=' + size, { headers });
  let d = await r.json();
  let docs = (d && d.documents) || [];
  // 2) 주소 결과가 없으면 키워드(건물명/장소) 검색으로 보완
  if (!docs.length) {
    r = await fetch(KAKAO_KEYWORD + '?query=' + encodeURIComponent(keyword) + '&size=' + size, { headers });
    d = await r.json();
    docs = (d && d.documents) || [];
  }
  return docs.map(fromKakaoAddress).filter((x) => x.jibunAddr || x.roadAddr);
}

async function searchJuso(keyword, currentPage, countPerPage) {
  const form = new URLSearchParams({
    confmKey: JUSO_CONFM_KEY, currentPage, countPerPage, keyword, resultType: 'json',
  });
  const r = await fetch(JUSO_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Referer': 'https://www.reb.or.kr/',
    },
    body: form.toString(),
  });
  const data = await r.json();
  return (data && data.results && data.results.juso) || [];
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const src = (req.method === 'GET') ? (req.query || {}) : (req.body || req.query || {});
  const keyword = (src.keyword || '').toString().trim();
  const currentPage = (src.currentPage || '1').toString();
  const countPerPage = (src.countPerPage || '10').toString();
  const size = Math.max(1, Math.min(parseInt(countPerPage, 10) || 10, 30));

  res.setHeader('Content-Type', 'application/json; charset=UTF-8');

  if (!keyword) {
    return res.status(200).json({ results: { common: jusoCommon({ errorCode: '-9', errorMessage: '검색어가 없습니다.', currentPage, countPerPage }), juso: [] } });
  }

  const kakaoKey = process.env.KAKAO_CLIENT_ID;
  let juso = [];
  let via = '';

  // 1차: 카카오 로컬 API
  if (kakaoKey) {
    try {
      juso = await searchKakao(keyword, size, kakaoKey);
      via = 'kakao';
    } catch (e) { /* 폴백 진행 */ }
  }

  // 2차: juso 직접 (Vercel 차단 시 실패할 수 있음 / 로컬·허용IP용 폴백)
  if (!juso.length) {
    try {
      juso = await searchJuso(keyword, currentPage, countPerPage);
      if (juso.length) via = 'juso';
    } catch (e) { /* noop */ }
  }

  return res.status(200).json({
    results: {
      common: jusoCommon({ totalCount: String(juso.length), currentPage, countPerPage, via }),
      juso,
    },
  });
};
