/**
 * 빛세움 — AI 부지분석 (pro.aicon.city 유사 기능, VWorld 공개API 기반)
 * 지도(배경/위성/지적편집도) · 주소검색 · 필지정보 · 건폐율·용적률 법정상한 · 주차대수 산정
 */
(function () {
  // ── 용도지역별 건폐율·용적률 법정 상한 (국토의 계획 및 이용에 관한 법률 시행령 제84·85조, 대통령령 상한)
  // 지자체 조례가 이보다 낮게 정하는 경우가 많으므로 참고용 상한치이다.
  var ZONE_LIMIT = {
    '제1종전용주거지역': { bcr: 50, far: 100 },
    '제2종전용주거지역': { bcr: 50, far: 150 },
    '제1종일반주거지역': { bcr: 60, far: 200 },
    '제2종일반주거지역': { bcr: 60, far: 250 },
    '제3종일반주거지역': { bcr: 50, far: 300 },
    '준주거지역': { bcr: 70, far: 500 },
    '중심상업지역': { bcr: 90, far: 1500 },
    '일반상업지역': { bcr: 80, far: 1300 },
    '근린상업지역': { bcr: 70, far: 900 },
    '유통상업지역': { bcr: 80, far: 1100 },
    '전용공업지역': { bcr: 70, far: 300 },
    '일반공업지역': { bcr: 70, far: 350 },
    '준공업지역': { bcr: 70, far: 400 },
    '보전녹지지역': { bcr: 20, far: 80 },
    '생산녹지지역': { bcr: 20, far: 100 },
    '자연녹지지역': { bcr: 20, far: 100 },
    '보전관리지역': { bcr: 20, far: 80 },
    '생산관리지역': { bcr: 20, far: 80 },
    '계획관리지역': { bcr: 40, far: 100 },
    '농림지역': { bcr: 20, far: 80 },
    '자연환경보전지역': { bcr: 20, far: 80 },
  };

  // ── 주차장법 시행령 별표1 부설주차장 설치기준 (시설면적 원단위, ㎡/대)
  var PARKING_UNIT = {
    '위락시설': 100,
    '문화·집회·종교·판매·운수·의료·운동·업무시설': 150,
    '제1·2종근린생활시설·숙박시설': 200,
    '단독주택·교육연구·노유자·수련·공장시설': 300,
  };

  var map, marker, currentLayer;
  var LAYER_DEFS = {
    Base: { label: '일반지도', ext: 'png' },
    Satellite: { label: '위성영상', ext: 'jpeg' },
    Hybrid: { label: '하이브리드', ext: 'jpeg' },
  };

  function tileUrl(layer) {
    return '/api/vworld-proxy?api=tile&layer=' + layer + '&z={z}&x={x}&y={y}';
  }

  function initMap() {
    map = L.map('saMap', { zoomControl: true }).setView([37.5301, 127.1147], 16);
    currentLayer = L.tileLayer(tileUrl('Base'), { maxZoom: 19, attribution: '© VWorld(국토교통부)' }).addTo(map);
  }

  function switchLayer(layer) {
    if (currentLayer) map.removeLayer(currentLayer);
    currentLayer = L.tileLayer(tileUrl(layer), { maxZoom: 19, attribution: '© VWorld(국토교통부)' }).addTo(map);
    document.querySelectorAll('.sa-layer-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.layer === layer); });
  }

  function setResultVisible(v) {
    var el = document.getElementById('saResult');
    if (el) el.style.display = v ? 'block' : 'none';
  }

  function renderZoneLimit(zoneName) {
    var el = document.getElementById('saZoneLimit');
    var limit = ZONE_LIMIT[zoneName];
    if (!limit) { el.innerHTML = '<span class="sa-muted">법정 상한 정보 없음 (' + (zoneName || '용도지역 미확인') + ')</span>'; return; }
    el.innerHTML =
      '<div class="sa-limit-row"><span>건폐율 상한</span><strong>' + limit.bcr + '%</strong></div>' +
      '<div class="sa-limit-row"><span>용적률 상한</span><strong>' + limit.far + '%</strong></div>' +
      '<p class="sa-note">국토계획법 시행령 대통령령 상한이며, 실제 적용은 지자체 조례를 따로 확인해야 합니다.</p>';
  }

  async function runSearch(address) {
    var btn = document.getElementById('saSearchBtn');
    btn.disabled = true; btn.textContent = '검색 중…';
    try {
      var r = await fetch('/api/vworld-proxy?api=geocode&address=' + encodeURIComponent(address));
      var g = await r.json();
      if (!g.ok) { App.toast('주소를 찾을 수 없습니다. 지번·도로명 주소를 다시 확인해 주세요.'); return; }

      map.setView([g.y, g.x], 18);
      if (marker) map.removeLayer(marker);
      marker = L.marker([g.y, g.x]).addTo(map);

      var lc = { ok: false };
      if (g.pnu) {
        var r2 = await fetch('/api/vworld-proxy?api=landchar&pnu=' + g.pnu);
        lc = await r2.json();
      }

      document.getElementById('saAddr').textContent = g.roadAddr || address;
      document.getElementById('saJimok').textContent = (lc.ok && lc.jimok) || '-';
      document.getElementById('saArea').textContent = (lc.ok && lc.area) ? lc.area.toLocaleString() + ' ㎡' : '-';
      document.getElementById('saPrice').textContent = (lc.ok && lc.officialPrice) ? lc.officialPrice.toLocaleString() + ' 원/㎡' : '-';
      document.getElementById('saZone').textContent = (lc.ok && lc.useZone1) || '미확인';
      renderZoneLimit(lc.ok && lc.useZone1);
      if (g.mock || lc.mock) {
        document.getElementById('saMockNotice').style.display = 'block';
      }
      setResultVisible(true);
    } catch (e) {
      App.toast('조회 중 오류가 발생했습니다.');
    } finally {
      btn.disabled = false; btn.textContent = '검색';
    }
  }

  function calcParking() {
    var unitKey = document.getElementById('pkType').value;
    var out = document.getElementById('pkResult');
    if (unitKey === 'housing') {
      var units = parseFloat(document.getElementById('pkAreaHousing').value) || 0;
      var perUnit = parseFloat(document.getElementById('pkPerUnit').value) || 1.0;
      if (units <= 0) { out.textContent = '세대수를 입력하세요.'; return; }
      var cnt = Math.ceil(units * perUnit);
      out.innerHTML = '세대수 ' + units + '세대 × 세대당 ' + perUnit + '대 = <strong>' + cnt + '대</strong>';
      return;
    }
    var area = parseFloat(document.getElementById('pkAreaNormal').value) || 0;
    var unit = PARKING_UNIT[unitKey];
    if (!unit || area <= 0) { out.textContent = '연면적을 입력하세요.'; return; }
    var cnt = Math.ceil(area / unit);
    out.innerHTML = '연면적 ' + area.toLocaleString() + '㎡ ÷ ' + unit + '㎡/대 = <strong>' + cnt + '대</strong>';
  }

  function bindUi() {
    document.getElementById('saSearchBtn').addEventListener('click', function () {
      var v = document.getElementById('saAddrInput').value.trim();
      if (v) runSearch(v);
    });
    document.getElementById('saAddrInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') document.getElementById('saSearchBtn').click();
    });
    document.querySelectorAll('.sa-layer-btn').forEach(function (b) {
      b.addEventListener('click', function () { switchLayer(b.dataset.layer); });
    });
    document.getElementById('pkType').addEventListener('change', function () {
      var isHousing = this.value === 'housing';
      document.getElementById('pkHousingRow').style.display = isHousing ? 'flex' : 'none';
      document.getElementById('pkNormalRow').style.display = isHousing ? 'none' : 'flex';
      document.getElementById('pkPerUnitRow').style.display = isHousing ? 'flex' : 'none';
    });
    document.getElementById('pkPerUnitRow').style.display = 'flex';
    document.getElementById('pkCalcBtn').addEventListener('click', calcParking);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMap();
    bindUi();
  });
})();
