/**
 * 세울엔지니어링 — 종합 사업성 분석 서비스
 * 정비사업 전문가용 사업성 검토 도구
 */
(function(){
'use strict';

/* ════════════════════════════════════════
   CONSTANTS & CONFIG
   ════════════════════════════════════════ */
var CFG = {
  RATIO_LOW: 1.00, RATIO_MID: 1.10, RATIO_HIGH: 1.20,
  BURDEN_LOW: 0.10, BURDEN_MID: 0.30,
  COST_RESERVE_WARN: 0.10, COST_FINANCE_WARN: 0.15, COST_OPER_WARN: 0.08,
  SQM_PER_PYEONG: 3.3058,
  STORAGE_KEY: 'seul_comp_analysis',
  PROJECT_TYPES: ['재건축','재개발','소규모 정비사업','리모델링','기타'],
  PHASES: ['추진위 구성','조합설립인가','사업시행인가','관리처분 준비','관리처분인가','착공','시공중','준공'],
  SCENARIOS: ['기준안','보수안','낙관안']
};

/* ════════════════════════════════════════
   UTILITIES
   ════════════════════════════════════════ */
function fmt(n){if(n===null||n===undefined||isNaN(n))return'0';return Math.round(n).toLocaleString('ko-KR')}
function fmtWon(n){if(!n||isNaN(n))return'-';var a=Math.abs(n);if(a>=1e12)return(n/1e12).toFixed(1)+'조';if(a>=1e11)return(n/1e11).toFixed(1)+'천억';if(a>=1e8)return(n/1e8).toFixed(0)+'억';if(a>=1e4)return(n/1e4).toFixed(0)+'만';return fmt(n)+'원'}
function fmtPct(n,d){d=d||2;if(!n||isNaN(n))return'-';return(n*100).toFixed(d)+'%'}
function pn(v){if(!v)return 0;return parseFloat(String(v).replace(/[^0-9.\-]/g,''))||0}
function sqmToPy(sqm){return sqm/CFG.SQM_PER_PYEONG}
function pyToSqm(py){return py*CFG.SQM_PER_PYEONG}

/* ════════════════════════════════════════
   DATA MODEL
   ════════════════════════════════════════ */
var D = {
  // Step 1: 기초
  projectType:'재건축', projectName:'', location:'', zoneArea:0, siteArea:0,
  grossFloorArea:0, farExisting:0, farPlanned:0, bcr:0,
  memberCount:0, ownerCount:0, existingUnits:0, plannedUnits:0,
  generalUnits:0, rentalUnits:0, hasCommercial:false, phase:'추진위 구성',
  // Step 3: 종전자산
  prevAssetMode:'simple', prevAssetTotal:0,
  prevTypes:[{name:'24평형',count:0,avgValue:0},{name:'32평형',count:0,avgValue:0},{name:'상가',count:0,avgValue:0}],
  // Step 4: 종후자산
  postMemberValue:0, postGeneralValue:0, postCommercialValue:0, postReserveValue:0, postEtcValue:0,
  // Step 5: 분양가
  generalAvgPrice:0, memberAvgPrice:0, commercialPrice:0,
  // Step 6: 보류지
  reserveUnits:0, reserveAvgPrice:0, reserveCommercialArea:0, reserveCommercialPrice:0,
  // Step 7: 사업비
  costMode:'ratio', // 'ratio' or 'detail'
  costConstruction:0, costDesign:0, costSupervision:0, costDemolition:0,
  costSurvey:0, costPM:0, costOperation:0, costMeeting:0,
  costFinance:0, costRelocation:0, costTax:0, costInfra:0,
  costEtc:0, costReserve:0,
  // 비율 모드용
  costRatioDesign:3, costRatioSupervision:2, costRatioDemolition:5,
  costRatioFinance:8, costRatioOperation:3, costRatioEtc:2, costRatioReserve:5,
  // Step 9: 시나리오
  scenarios:[
    {name:'기준안',costChange:0,priceChange:0,financeChange:0,reserveChange:0},
    {name:'보수안',costChange:10,priceChange:-5,financeChange:20,reserveChange:-10},
    {name:'낙관안',costChange:-5,priceChange:5,financeChange:-10,reserveChange:10}
  ]
};

/* ════════════════════════════════════════
   CALCULATION ENGINE
   ════════════════════════════════════════ */
var Engine = {
  prevAssetTotal: function(){
    if(D.prevAssetMode==='simple') return D.prevAssetTotal;
    var total=0;
    D.prevTypes.forEach(function(t){total+=(t.count||0)*(t.avgValue||0)});
    return total;
  },
  totalRevenue: function(){
    var genRev = D.generalUnits * D.generalAvgPrice;
    var memRev = D.postMemberValue || (D.memberCount * D.memberAvgPrice);
    var comRev = D.postCommercialValue || D.commercialPrice;
    var resRev = (D.reserveUnits * D.reserveAvgPrice) + (D.reserveCommercialArea * D.reserveCommercialPrice);
    return genRev + memRev + comRev + resRev + (D.postEtcValue||0);
  },
  totalCost: function(){
    if(D.costMode==='ratio' && D.costConstruction>0){
      var c = D.costConstruction;
      return c + c*D.costRatioDesign/100 + c*D.costRatioSupervision/100 + c*D.costRatioDemolition/100 +
             c*D.costRatioFinance/100 + c*D.costRatioOperation/100 + c*D.costRatioEtc/100 + c*D.costRatioReserve/100;
    }
    return D.costConstruction + D.costDesign + D.costSupervision + D.costDemolition +
           D.costSurvey + D.costPM + D.costOperation + D.costMeeting +
           D.costFinance + D.costRelocation + D.costTax + D.costInfra + D.costEtc + D.costReserve;
  },
  costBreakdown: function(){
    if(D.costMode==='ratio' && D.costConstruction>0){
      var c=D.costConstruction;
      return [
        {name:'공사비',value:c},{name:'설계비',value:c*D.costRatioDesign/100},
        {name:'감리비',value:c*D.costRatioSupervision/100},{name:'철거비',value:c*D.costRatioDemolition/100},
        {name:'금융비용',value:c*D.costRatioFinance/100},{name:'운영비',value:c*D.costRatioOperation/100},
        {name:'기타',value:c*D.costRatioEtc/100},{name:'예비비',value:c*D.costRatioReserve/100}
      ];
    }
    return [
      {name:'공사비',value:D.costConstruction},{name:'설계비',value:D.costDesign},
      {name:'감리비',value:D.costSupervision},{name:'철거비',value:D.costDemolition},
      {name:'측량/용역',value:D.costSurvey},{name:'PM/관리',value:D.costPM},
      {name:'운영비',value:D.costOperation},{name:'총회/홍보',value:D.costMeeting},
      {name:'금융비용',value:D.costFinance},{name:'이주비금융',value:D.costRelocation},
      {name:'세금/공과',value:D.costTax},{name:'기반시설',value:D.costInfra},
      {name:'기타',value:D.costEtc},{name:'예비비',value:D.costReserve}
    ].filter(function(i){return i.value>0});
  },
  postAssetTotal: function(){
    return this.totalRevenue() - this.totalCost();
  },
  ratio: function(){
    var prev = this.prevAssetTotal();
    if(prev<=0) return 0;
    return this.postAssetTotal() / prev;
  },
  avgBurden: function(){
    var rights = this.prevAssetTotal() * this.ratio();
    var avgMemberPrice = D.memberAvgPrice || (D.memberCount>0 ? (D.postMemberValue||0)/D.memberCount : 0);
    if(D.memberCount<=0 || avgMemberPrice<=0) return 0;
    var avgRights = rights / D.memberCount;
    return avgMemberPrice - avgRights;
  },
  burdenByType: function(){
    var r = this.ratio();
    return D.prevTypes.map(function(t){
      var rights = (t.avgValue||0) * r;
      var memberPrice = D.memberAvgPrice || 0;
      return {name:t.name, count:t.count, avgPrev:t.avgValue, rights:rights, burden:memberPrice-rights, isRefund:memberPrice<rights};
    }).filter(function(t){return t.count>0});
  },
  scenarioCalc: function(sc){
    var costAdj = this.totalCost() * (1 + (sc.costChange||0)/100);
    var revAdj = this.totalRevenue() * (1 + (sc.priceChange||0)/100);
    var finAdj = (D.costFinance||0) * (sc.financeChange||0)/100;
    costAdj += finAdj;
    var postAdj = revAdj - costAdj;
    var prev = this.prevAssetTotal();
    var ratioAdj = prev>0 ? postAdj/prev : 0;
    var avgRightsAdj = prev>0 ? postAdj / D.memberCount : 0;
    var avgBurdenAdj = (D.memberAvgPrice||0) - avgRightsAdj;
    return {name:sc.name,totalRev:revAdj,totalCost:costAdj,postAsset:postAdj,ratio:ratioAdj,avgBurden:avgBurdenAdj};
  },
  insights: function(){
    var msgs=[];
    var r=this.ratio();
    if(r>=CFG.RATIO_MID) msgs.push('현재 입력 기준에서는 종후자산 형성 수준이 종전자산을 상회하여 비례율이 '+(r*100).toFixed(1)+'%로 추정됩니다.');
    else if(r>=CFG.RATIO_LOW) msgs.push('비례율이 '+(r*100).toFixed(1)+'%로 사업성이 보통 수준입니다. 사업비 절감 또는 분양가 확보가 중요합니다.');
    else if(r>0) msgs.push('비례율이 '+(r*100).toFixed(1)+'%로 사업성이 낮습니다. 사업비 구조 재검토가 필요합니다.');

    var tc=this.totalCost(),tr=this.totalRevenue();
    if(tc>0 && D.costFinance/tc>CFG.COST_FINANCE_WARN) msgs.push('총사업비 대비 금융비용 비중이 높아 분담금 민감도가 큰 구조로 판단됩니다.');

    var base=this.scenarioCalc(D.scenarios[0]),pessim=this.scenarioCalc(D.scenarios[1]);
    if(base.avgBurden>0 && pessim.avgBurden>0){
      var diff=pessim.avgBurden-base.avgBurden;
      if(diff>0) msgs.push('보수 시나리오 적용 시 평균분담금이 '+fmtWon(diff)+' 상승할 수 있습니다.');
    }
    return msgs;
  },
  costWarnings: function(){
    var warns=[];
    var bd=this.costBreakdown();
    var total=this.totalCost();
    if(total<=0)return warns;
    bd.forEach(function(b){
      var pct=b.value/total;
      if(b.name==='예비비'&&pct>CFG.COST_RESERVE_WARN) warns.push(b.name+' 비중 과다 ('+fmtPct(pct)+')');
      if(b.name==='금융비용'&&pct>CFG.COST_FINANCE_WARN) warns.push(b.name+' 비중 과다 ('+fmtPct(pct)+')');
      if(b.name==='운영비'&&pct>CFG.COST_OPER_WARN) warns.push(b.name+' 비중 과다 ('+fmtPct(pct)+')');
    });
    return warns;
  }
};

/* ════════════════════════════════════════
   BADGE HELPERS
   ════════════════════════════════════════ */
function rBadge(r){
  if(r>=CFG.RATIO_HIGH)return'<span class="ca-badge ca-good">사업성 양호 ('+fmtPct(r)+')</span>';
  if(r>=CFG.RATIO_LOW)return'<span class="ca-badge ca-normal">사업성 보통 ('+fmtPct(r)+')</span>';
  if(r>0)return'<span class="ca-badge ca-bad">사업성 낮음 ('+fmtPct(r)+')</span>';
  return'<span class="ca-badge ca-neutral">미산출</span>';
}

/* ════════════════════════════════════════
   STEP DEFINITIONS
   ════════════════════════════════════════ */
var STEPS = [
  {id:'basic',title:'기초 데이터',icon:'fa-building'},
  {id:'prev',title:'종전자산',icon:'fa-landmark'},
  {id:'post',title:'종후자산·분양가',icon:'fa-city'},
  {id:'cost',title:'사업비',icon:'fa-coins'},
  {id:'result',title:'분석 결과',icon:'fa-chart-pie'},
  {id:'scenario',title:'시나리오 비교',icon:'fa-code-compare'}
];
var curStep = 0;

/* ════════════════════════════════════════
   RENDER
   ════════════════════════════════════════ */
function renderComprehensive(){
  var wrap = document.getElementById('compWrap');
  if(!wrap)return;

  // Summary bar
  var r=Engine.ratio(), ab=Engine.avgBurden(), tc=Engine.totalCost(), tr=Engine.totalRevenue();
  var sumHTML='<div class="ca-sum">'+
    '<div class="ca-sum-item"><span class="ca-sum-label">비례율</span><span class="ca-sum-val">'+(r>0?fmtPct(r):'-')+'</span></div>'+
    '<div class="ca-sum-item"><span class="ca-sum-label">평균분담금</span><span class="ca-sum-val">'+(ab?fmtWon(ab):'-')+'</span></div>'+
    '<div class="ca-sum-item"><span class="ca-sum-label">총사업비</span><span class="ca-sum-val">'+(tc>0?fmtWon(tc):'-')+'</span></div>'+
    '<div class="ca-sum-item"><span class="ca-sum-label">총수입</span><span class="ca-sum-val">'+(tr>0?fmtWon(tr):'-')+'</span></div>'+
  '</div>';

  // Left nav
  var navHTML='<div class="ca-nav">';
  STEPS.forEach(function(s,i){
    navHTML+='<button class="ca-nav-btn'+(i===curStep?' active':'')+'" onclick="CA.goStep('+i+')"><i class="fa-solid '+s.icon+'"></i><span>'+s.title+'</span></button>';
  });
  navHTML+='<div class="ca-nav-actions"><button class="cm-btn" onclick="CA.fillExample()"><i class="fa-solid fa-lightbulb"></i> 예시값</button><button class="cm-btn" onclick="CA.resetAll()"><i class="fa-solid fa-rotate-left"></i> 초기화</button><button class="cm-btn" onclick="CA.saveData()"><i class="fa-solid fa-floppy-disk"></i> 저장</button><button class="cm-btn" onclick="CA.exportExcel()" style="background:#0A6847;color:#fff;border-color:#0A6847;margin-top:4px;"><i class="fa-solid fa-file-excel"></i> 엑셀 내보내기</button></div>';
  navHTML+='</div>';

  // Right panel — step content
  var panelHTML='<div class="ca-panel">'+buildStep(curStep)+'</div>';

  wrap.innerHTML = sumHTML + '<div class="ca-main">' + navHTML + panelHTML + '</div>';

  // Bind inputs
  wrap.querySelectorAll('input[data-field]').forEach(function(inp){
    inp.addEventListener('input',function(){
      var f=this.dataset.field;
      if(f.indexOf('prevTypes.')===0){
        var parts=f.split('.');
        var idx=parseInt(parts[1]),prop=parts[2];
        D.prevTypes[idx][prop]=pn(this.value);
      } else if(f.indexOf('scenarios.')===0){
        var parts=f.split('.');
        var idx=parseInt(parts[1]),prop=parts[2];
        D.scenarios[idx][prop]=pn(this.value);
      } else {
        D[f]=pn(this.value);
      }
      updateSummary();
    });
    inp.addEventListener('focus',function(){this.value=this.value.replace(/[^0-9.\-]/g,'')});
    inp.addEventListener('blur',function(){
      var v=pn(this.value);
      if(v&&this.dataset.unit!=='pct'&&this.dataset.unit!=='ratio')this.value=fmt(v);
    });
  });
  wrap.querySelectorAll('select[data-field]').forEach(function(sel){
    sel.addEventListener('change',function(){D[this.dataset.field]=this.value;updateSummary()});
  });
}

function updateSummary(){
  var sum=document.querySelector('.ca-sum');
  if(!sum)return;
  var r=Engine.ratio(),ab=Engine.avgBurden(),tc=Engine.totalCost(),tr=Engine.totalRevenue();
  var items=sum.querySelectorAll('.ca-sum-val');
  if(items[0])items[0].textContent=r>0?fmtPct(r):'-';
  if(items[1])items[1].textContent=ab?fmtWon(ab):'-';
  if(items[2])items[2].textContent=tc>0?fmtWon(tc):'-';
  if(items[3])items[3].textContent=tr>0?fmtWon(tr):'-';
  // 결과/시나리오 탭이면 리렌더
  if(curStep===4||curStep===5){
    var panel=document.querySelector('.ca-panel');
    if(panel)panel.innerHTML=buildStep(curStep);
  }
}

/* ════════════════════════════════════════
   STEP BUILDERS
   ════════════════════════════════════════ */
function field(dataField,label,unit,val){
  var v=val!==undefined?val:(typeof D[dataField]==='number'&&D[dataField]?fmt(D[dataField]):'');
  var u=unit||'원';
  return'<div class="ca-fg"><label>'+label+'</label><div class="ca-input-wrap"><input type="text" data-field="'+dataField+'" data-unit="'+(unit==='%'?'pct':'')+'" value="'+v+'" inputmode="numeric"><span class="ca-unit">'+u+'</span></div></div>';
}
function row(){return'<div class="ca-row">'+Array.from(arguments).join('')+'</div>'}
function sec(icon,title){return'<div class="ca-sec"><i class="fa-solid '+icon+'"></i> '+title+'</div>'}

function buildStep(idx){
  var h='<div class="ca-step-head"><h3>'+STEPS[idx].title+'</h3><div style="display:flex;gap:8px;align-items:center">';
  if(idx===0){
    h+='<label style="display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:6px;border:1.5px dashed rgba(195,165,105,0.35);background:rgba(195,165,105,0.04);color:var(--gray-600);font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap">';
    h+='<i class="fa-solid fa-file-arrow-up" style="color:#C3A569"></i> 파일 가져오기';
    h+='<input type="file" accept=".xlsx,.xls,.csv" onchange="CA.importFile(this)" style="display:none">';
    h+='</label>';
    h+='<button class="cm-btn" onclick="CA.downloadTemplate()" style="font-size:11px;white-space:nowrap"><i class="fa-solid fa-download"></i> 양식</button>';
  }
  if(idx<STEPS.length-1)h+='<button class="cm-btn primary" onclick="CA.goStep('+(idx+1)+')">다음 단계 <i class="fa-solid fa-arrow-right"></i></button>';
  h+='</div></div>';

  if(idx===0){
    // 기초 데이터
    h+=sec('fa-tag','사업 기본정보');
    h+='<div class="ca-fg"><label>사업유형</label><select data-field="projectType">'+CFG.PROJECT_TYPES.map(function(t){return'<option'+(D.projectType===t?' selected':'')+'>'+t+'</option>'}).join('')+'</select></div>';
    h+=row(field('siteArea','대지면적','㎡'),field('grossFloorArea','연면적','㎡'));
    h+=row(field('farPlanned','계획 용적률','%'),field('bcr','건폐율','%'));
    h+=sec('fa-users','세대·조합원');
    h+=row(field('memberCount','조합원 수','명'),field('existingUnits','기존 세대수','세대'));
    h+=row(field('plannedUnits','계획 세대수','세대'),field('generalUnits','일반분양 세대수','세대'));
    h+=row(field('rentalUnits','임대주택 세대수','세대'));
  }
  else if(idx===1){
    // 종전자산
    h+=sec('fa-landmark','종전자산 입력');
    h+='<div class="ca-fg"><label>입력 방식</label><div style="display:flex;gap:8px;margin-bottom:12px">'+
      '<button class="cm-btn'+(D.prevAssetMode==='simple'?' primary':'')+'" onclick="CA.setPrevMode(\'simple\')">간편 입력</button>'+
      '<button class="cm-btn'+(D.prevAssetMode==='detail'?' primary':'')+'" onclick="CA.setPrevMode(\'detail\')">유형별 상세 입력</button></div></div>';
    if(D.prevAssetMode==='simple'){
      h+=field('prevAssetTotal','종전자산 총액','원');
    } else {
      D.prevTypes.forEach(function(t,i){
        h+='<div class="ca-sec" style="font-size:12px"><i class="fa-solid fa-layer-group"></i> '+t.name+'</div>';
        h+=row(
          '<div class="ca-fg"><label>소유자 수</label><div class="ca-input-wrap"><input type="text" data-field="prevTypes.'+i+'.count" value="'+(t.count||'')+'" inputmode="numeric"><span class="ca-unit">명</span></div></div>',
          '<div class="ca-fg"><label>평균 종전자산가액</label><div class="ca-input-wrap"><input type="text" data-field="prevTypes.'+i+'.avgValue" value="'+(t.avgValue?fmt(t.avgValue):'')+'" inputmode="numeric"><span class="ca-unit">원</span></div></div>'
        );
      });
      h+='<button class="cm-btn" onclick="CA.addPrevType()" style="margin-top:8px"><i class="fa-solid fa-plus"></i> 유형 추가</button>';
      var prevTotal=Engine.prevAssetTotal();
      h+='<div class="ca-result-mini">종전자산 합계: <strong>'+fmtWon(prevTotal)+'</strong></div>';
    }
  }
  else if(idx===2){
    // 종후자산 + 분양가
    h+=sec('fa-city','분양가 입력');
    h+=row(field('generalAvgPrice','일반분양 평균가','원'),field('memberAvgPrice','조합원 분양 평균가','원'));
    h+=row(field('commercialPrice','상가 분양수입 총액','원'));
    h+=sec('fa-warehouse','보류지');
    h+=row(field('reserveUnits','보류지 세대수','세대'),field('reserveAvgPrice','보류지 평균 처분가','원'));
    h+=field('postEtcValue','기타 수입','원');
    var tr=Engine.totalRevenue();
    h+='<div class="ca-result-mini">총수입 추정: <strong>'+fmtWon(tr)+'</strong></div>';
  }
  else if(idx===3){
    // 사업비
    h+=sec('fa-coins','사업비 입력 방식');
    h+='<div style="display:flex;gap:8px;margin-bottom:14px">'+
      '<button class="cm-btn'+(D.costMode==='ratio'?' primary':'')+'" onclick="CA.setCostMode(\'ratio\')">총공사비 기준 비율</button>'+
      '<button class="cm-btn'+(D.costMode==='detail'?' primary':'')+'" onclick="CA.setCostMode(\'detail\')">세부항목 직접입력</button></div>';
    if(D.costMode==='ratio'){
      h+=field('costConstruction','총공사비','원');
      h+=sec('fa-percentage','비율 설정 (총공사비 대비 %)');
      h+=row(field('costRatioDesign','설계비','%'),field('costRatioSupervision','감리비','%'));
      h+=row(field('costRatioDemolition','철거비','%'),field('costRatioFinance','금융비용','%'));
      h+=row(field('costRatioOperation','운영비','%'),field('costRatioEtc','기타','%'));
      h+=field('costRatioReserve','예비비','%');
    } else {
      h+=row(field('costConstruction','공사비','원'),field('costDesign','설계비','원'));
      h+=row(field('costSupervision','감리비','원'),field('costDemolition','철거비','원'));
      h+=row(field('costSurvey','측량/용역비','원'),field('costPM','PM/관리비','원'));
      h+=row(field('costOperation','조합운영비','원'),field('costMeeting','총회/홍보비','원'));
      h+=row(field('costFinance','금융비용','원'),field('costRelocation','이주비 금융','원'));
      h+=row(field('costTax','세금/공과','원'),field('costInfra','기반시설 부담금','원'));
      h+=row(field('costEtc','기타비용','원'),field('costReserve','예비비','원'));
    }
    var tc=Engine.totalCost();
    h+='<div class="ca-result-mini">총사업비 합계: <strong>'+fmtWon(tc)+'</strong></div>';
    var warns=Engine.costWarnings();
    if(warns.length) h+='<div class="ca-warns">'+warns.map(function(w){return'<div class="ca-warn"><i class="fa-solid fa-triangle-exclamation"></i> '+w+'</div>'}).join('')+'</div>';
  }
  else if(idx===4){
    // 결과
    var r=Engine.ratio(),tr=Engine.totalRevenue(),tc=Engine.totalCost(),
        prev=Engine.prevAssetTotal(),post=Engine.postAssetTotal(),ab=Engine.avgBurden();
    h+=sec('fa-chart-pie','핵심 결과');
    h+='<div class="ca-kpi-grid">'+
      '<div class="ca-kpi"><div class="ca-kpi-val">'+(r>0?fmtPct(r):'-')+'</div><div class="ca-kpi-label">비례율</div>'+rBadge(r)+'</div>'+
      '<div class="ca-kpi"><div class="ca-kpi-val">'+(ab?fmtWon(ab):'-')+'</div><div class="ca-kpi-label">예상 평균분담금</div></div>'+
      '<div class="ca-kpi"><div class="ca-kpi-val">'+fmtWon(tr)+'</div><div class="ca-kpi-label">총수입</div></div>'+
      '<div class="ca-kpi"><div class="ca-kpi-val">'+fmtWon(tc)+'</div><div class="ca-kpi-label">총사업비</div></div>'+
    '</div>';

    h+=sec('fa-table','수입·비용 구조');
    h+='<div class="ca-table"><table><tr><th>항목</th><th>금액</th><th>비중</th></tr>';
    h+='<tr><td>종전자산 총액</td><td>'+fmtWon(prev)+'</td><td>-</td></tr>';
    h+='<tr><td>총수입</td><td>'+fmtWon(tr)+'</td><td>100%</td></tr>';
    h+='<tr><td>총사업비</td><td>'+fmtWon(tc)+'</td><td>'+(tr>0?fmtPct(tc/tr):'-')+'</td></tr>';
    h+='<tr><td>종후자산</td><td>'+fmtWon(post)+'</td><td>'+(tr>0?fmtPct(post/tr):'-')+'</td></tr>';
    h+='</table></div>';

    // 사업비 구성
    h+=sec('fa-list','사업비 구성');
    var bd=Engine.costBreakdown();
    h+='<div class="ca-table"><table><tr><th>항목</th><th>금액</th><th>비중</th></tr>';
    bd.forEach(function(b){h+='<tr><td>'+b.name+'</td><td>'+fmtWon(b.value)+'</td><td>'+(tc>0?fmtPct(b.value/tc):'-')+'</td></tr>'});
    h+='</table></div>';

    // 유형별 분담금
    if(D.prevAssetMode==='detail'){
      var types=Engine.burdenByType();
      if(types.length){
        h+=sec('fa-users','유형별 평균 분담금');
        h+='<div class="ca-table"><table><tr><th>유형</th><th>인원</th><th>평균종전</th><th>권리가액</th><th>분담금</th></tr>';
        types.forEach(function(t){
          h+='<tr><td>'+t.name+'</td><td>'+t.count+'명</td><td>'+fmtWon(t.avgPrev)+'</td><td>'+fmtWon(t.rights)+'</td><td class="'+(t.isRefund?'ca-green':'')+'">'+fmtWon(Math.abs(t.burden))+(t.isRefund?' (환급)':'')+'</td></tr>';
        });
        h+='</table></div>';
      }
    }

    // 인사이트
    var insights=Engine.insights();
    if(insights.length){
      h+=sec('fa-lightbulb','분석 인사이트');
      h+='<div class="ca-insights">'+insights.map(function(m){return'<div class="ca-insight"><i class="fa-solid fa-circle-info"></i> '+m+'</div>'}).join('')+'</div>';
    }
  }
  else if(idx===5){
    // 시나리오 비교
    h+=sec('fa-code-compare','시나리오 설정');
    D.scenarios.forEach(function(sc,i){
      h+='<div class="ca-scenario-box"><div class="ca-scenario-title">'+sc.name+'</div>';
      h+=row(
        '<div class="ca-fg"><label>공사비 변동(%)</label><div class="ca-input-wrap"><input type="text" data-field="scenarios.'+i+'.costChange" value="'+(sc.costChange||0)+'" data-unit="pct"><span class="ca-unit">%</span></div></div>',
        '<div class="ca-fg"><label>분양가 변동(%)</label><div class="ca-input-wrap"><input type="text" data-field="scenarios.'+i+'.priceChange" value="'+(sc.priceChange||0)+'" data-unit="pct"><span class="ca-unit">%</span></div></div>'
      );
      h+=row(
        '<div class="ca-fg"><label>금융비용 변동(%)</label><div class="ca-input-wrap"><input type="text" data-field="scenarios.'+i+'.financeChange" value="'+(sc.financeChange||0)+'" data-unit="pct"><span class="ca-unit">%</span></div></div>',
        '<div class="ca-fg"><label>보류지 변동(%)</label><div class="ca-input-wrap"><input type="text" data-field="scenarios.'+i+'.reserveChange" value="'+(sc.reserveChange||0)+'" data-unit="pct"><span class="ca-unit">%</span></div></div>'
      );
      h+='</div>';
    });

    // 비교표
    h+=sec('fa-table','시나리오 비교 결과');
    var results=D.scenarios.map(function(sc){return Engine.scenarioCalc(sc)});
    h+='<div class="ca-table"><table><tr><th>항목</th>';
    results.forEach(function(r){h+='<th>'+r.name+'</th>'});
    h+='</tr>';
    h+='<tr><td>비례율</td>';results.forEach(function(r){h+='<td>'+fmtPct(r.ratio)+'</td>'});h+='</tr>';
    h+='<tr><td>총수입</td>';results.forEach(function(r){h+='<td>'+fmtWon(r.totalRev)+'</td>'});h+='</tr>';
    h+='<tr><td>총사업비</td>';results.forEach(function(r){h+='<td>'+fmtWon(r.totalCost)+'</td>'});h+='</tr>';
    h+='<tr><td>평균분담금</td>';results.forEach(function(r){h+='<td>'+fmtWon(r.avgBurden)+'</td>'});h+='</tr>';
    h+='</table></div>';

    if(results.length>=2){
      var diff=results[1].avgBurden-results[0].avgBurden;
      h+='<div class="ca-insights"><div class="ca-insight"><i class="fa-solid fa-triangle-exclamation"></i> 보수안 대비 기준안 평균분담금 차이: <strong>'+fmtWon(diff)+'</strong></div></div>';
    }
  }

  h+='<div class="cm-notice" style="margin-top:20px"><i class="fa-solid fa-circle-info"></i> 본 분석 결과는 입력값 기준의 참고용 추정치입니다. 실제 사업성 판단은 감정평가, 설계, 인허가, 금융조건 등에 따라 달라질 수 있습니다.</div>';
  return h;
}

/* ════════════════════════════════════════
   ACTIONS
   ════════════════════════════════════════ */
function goStep(n){curStep=n;renderComprehensive()}
function setPrevMode(m){D.prevAssetMode=m;renderComprehensive()}
function setCostMode(m){D.costMode=m;renderComprehensive()}
function addPrevType(){
  D.prevTypes.push({name:(D.prevTypes.length+1)+'번 유형',count:0,avgValue:0});
  renderComprehensive();
}
function fillExample(){
  D.projectType='재건축';D.siteArea=50000;D.grossFloorArea=350000;D.farPlanned=299;
  D.memberCount=1200;D.existingUnits=1200;D.plannedUnits=2500;D.generalUnits=1300;
  D.prevAssetMode='detail';
  D.prevTypes=[{name:'24평형',count:600,avgValue:350000000},{name:'32평형',count:500,avgValue:480000000},{name:'상가',count:100,avgValue:600000000}];
  D.generalAvgPrice=900000000;D.memberAvgPrice=700000000;D.commercialPrice=80000000000;
  D.reserveUnits=50;D.reserveAvgPrice=800000000;D.postEtcValue=10000000000;
  D.costMode='ratio';D.costConstruction=800000000000;
  D.costRatioDesign=3;D.costRatioSupervision=2;D.costRatioDemolition=4;
  D.costRatioFinance=8;D.costRatioOperation=3;D.costRatioEtc=2;D.costRatioReserve=5;
  if(typeof App!=='undefined')App.toast('예시 데이터가 입력되었습니다.','success');
  renderComprehensive();
}
function resetAll(){
  Object.keys(D).forEach(function(k){
    if(typeof D[k]==='number')D[k]=0;
    else if(typeof D[k]==='string'&&k!=='projectType'&&k!=='prevAssetMode'&&k!=='costMode'&&k!=='phase')D[k]='';
  });
  D.prevTypes=[{name:'24평형',count:0,avgValue:0},{name:'32평형',count:0,avgValue:0},{name:'상가',count:0,avgValue:0}];
  D.scenarios=[
    {name:'기준안',costChange:0,priceChange:0,financeChange:0,reserveChange:0},
    {name:'보수안',costChange:10,priceChange:-5,financeChange:20,reserveChange:-10},
    {name:'낙관안',costChange:-5,priceChange:5,financeChange:-10,reserveChange:10}
  ];
  localStorage.removeItem(CFG.STORAGE_KEY);
  curStep=0;
  renderComprehensive();
}
function saveData(){
  try{localStorage.setItem(CFG.STORAGE_KEY,JSON.stringify(D));if(typeof App!=='undefined')App.toast('분석 데이터가 저장되었습니다.','success')}catch(e){}
}
function loadData(){
  try{var s=localStorage.getItem(CFG.STORAGE_KEY);if(s){var d=JSON.parse(s);Object.assign(D,d);return true}}catch(e){}return false;
}

/* ════════════════════════════════════════
   INIT
   ════════════════════════════════════════ */
loadData();

/* ════════════════════════════════════════
   FILE IMPORT — 엑셀/CSV 파일 입력
   ════════════════════════════════════════ */
function downloadTemplate(){
  var hdr=['항목','값','단위','비고'];
  var rows=[
    hdr,
    ['사업유형','재건축','','재건축/재개발/소규모 정비사업/리모델링/기타'],
    ['사업명','','','예: ○○구역 재건축 정비사업'],
    ['소재지','','','예: 서울시 ○○구 ○○동'],
    ['진행단계','추진위 구성','','추진위 구성/조합설립인가/사업시행인가/관리처분 준비/관리처분인가/착공/시공중/준공'],
    ['대지면적','0','㎡',''],
    ['연면적','0','㎡',''],
    ['계획용적률','0','%',''],
    ['건폐율','0','%',''],
    ['조합원수','0','명',''],
    ['기존세대수','0','세대',''],
    ['계획세대수','0','세대',''],
    ['일반분양세대수','0','세대',''],
    ['임대세대수','0','세대',''],
    ['종전자산총액','0','원','간편입력 시 직접 입력'],
    ['일반분양평균가','0','원/세대',''],
    ['조합원분양평균가','0','원/세대',''],
    ['상가분양총액','0','원',''],
    ['보류지세대수','0','세대',''],
    ['보류지평균가','0','원',''],
    ['기타수입','0','원',''],
    ['공사비','0','원',''],
    ['설계비비율','3','%','공사비 대비'],
    ['감리비비율','2','%','공사비 대비'],
    ['철거비비율','5','%','공사비 대비'],
    ['금융비용비율','8','%','공사비 대비'],
    ['운영비비율','3','%','공사비 대비'],
    ['기타비율','2','%','공사비 대비'],
    ['예비비비율','5','%','공사비 대비']
  ];
  var csv='\uFEFF'+rows.map(function(r){return r.map(function(c){var s=String(c);if(s.indexOf(',')>=0)s='"'+s+'"';return s}).join(',')}).join('\r\n');
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='세울엔지니어링_사업성분석_입력양식.csv';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  if(typeof App!=='undefined')App.toast('입력양식이 다운로드되었습니다.','success');
}

function importFile(input){
  var file=input.files&&input.files[0];
  if(!file)return;
  var reader=new FileReader();
  reader.onload=function(e){
    var text=e.target.result;
    var lines=text.split(/\r?\n/).filter(function(l){return l.trim()});
    var map={};
    lines.forEach(function(line,i){
      if(i===0)return; // skip header
      var cols=[];var inQ=false,cur='';
      for(var c=0;c<line.length;c++){
        if(line[c]==='"'){inQ=!inQ}
        else if(line[c]===','&&!inQ){cols.push(cur.trim());cur=''}
        else{cur+=line[c]}
      }
      cols.push(cur.trim());
      if(cols[0])map[cols[0]]=cols[1]||'';
    });
    var g=function(k){return map[k]||''};
    var n=function(k){return pn(g(k))};

    // 매핑
    if(g('사업유형'))D.projectType=g('사업유형');
    if(g('사업명'))D.projectName=g('사업명');
    if(g('소재지'))D.location=g('소재지');
    if(g('진행단계'))D.phase=g('진행단계');
    D.siteArea=n('대지면적');
    D.grossFloorArea=n('연면적');
    D.farPlanned=n('계획용적률');
    D.bcr=n('건폐율');
    D.memberCount=n('조합원수');
    D.existingUnits=n('기존세대수');
    D.plannedUnits=n('계획세대수');
    D.generalUnits=n('일반분양세대수');
    D.rentalUnits=n('임대세대수');
    if(n('종전자산총액')>0){D.prevAssetMode='simple';D.prevAssetTotal=n('종전자산총액')}
    D.generalAvgPrice=n('일반분양평균가');
    D.memberAvgPrice=n('조합원분양평균가');
    D.commercialPrice=n('상가분양총액');
    D.reserveUnits=n('보류지세대수');
    D.reserveAvgPrice=n('보류지평균가');
    D.postEtcValue=n('기타수입');
    D.costConstruction=n('공사비');
    D.costMode='ratio';
    if(n('설계비비율'))D.costRatioDesign=n('설계비비율');
    if(n('감리비비율'))D.costRatioSupervision=n('감리비비율');
    if(n('철거비비율'))D.costRatioDemolition=n('철거비비율');
    if(n('금융비용비율'))D.costRatioFinance=n('금융비용비율');
    if(n('운영비비율'))D.costRatioOperation=n('운영비비율');
    if(n('기타비율'))D.costRatioEtc=n('기타비율');
    if(n('예비비비율'))D.costRatioReserve=n('예비비비율');

    renderComprehensive();
    if(typeof App!=='undefined')App.toast('파일에서 '+Object.keys(map).length+'개 항목을 가져왔습니다.','success');
  };
  reader.readAsText(file,'UTF-8');
  input.value='';
}

/* ════════════════════════════════════════
   EXCEL EXPORT — 시트간 수식 연동 완전판
   ════════════════════════════════════════ */
function exportExcel(){
  if(typeof XLSX==='undefined'){if(typeof App!=='undefined')App.toast('엑셀 라이브러리 로딩 중입니다. 잠시 후 다시 시도해주세요.','info');return}
  var wb=XLSX.utils.book_new();
  var N='#,##0',P='0.00%';
  function colW(ws,widths){ws['!cols']=widths.map(function(w){return{wch:w}});return ws}
  function fmtCells(ws,refs,z){refs.forEach(function(ref){if(ws[ref]){if(!ws[ref].s)ws[ref].s={};ws[ref].z=z}})}
  function numFmt(ws,col,startRow,count,z){for(var i=0;i<count;i++){var ref=XLSX.utils.encode_cell({r:startRow+i,c:col});if(ws[ref]){ws[ref].z=z}}}

  /* ── 스타일 정의 ── */
  var STL={
    title:{font:{bold:true,sz:14,color:{rgb:'FFFFFF'}},fill:{fgColor:{rgb:'0A0F1C'}},alignment:{horizontal:'left',vertical:'center'}},
    secTitle:{font:{bold:true,sz:11,color:{rgb:'0A0F1C'}},fill:{fgColor:{rgb:'F0EDE5'}},border:{bottom:{style:'thin',color:{rgb:'C3A569'}}}},
    hdr:{font:{bold:true,sz:10,color:{rgb:'FFFFFF'}},fill:{fgColor:{rgb:'142644'}},alignment:{horizontal:'center'},border:{bottom:{style:'thin',color:{rgb:'C3A569'}}}},
    label:{font:{sz:10,color:{rgb:'444444'}},fill:{fgColor:{rgb:'FAFBFC'}},border:{bottom:{style:'hair',color:{rgb:'E0E0E0'}}}},
    val:{font:{sz:10,color:{rgb:'0A0F1C'}},alignment:{horizontal:'right'},border:{bottom:{style:'hair',color:{rgb:'E0E0E0'}}}},
    sum:{font:{bold:true,sz:11,color:{rgb:'0A0F1C'}},fill:{fgColor:{rgb:'F5F0E6'}},border:{top:{style:'thin',color:{rgb:'C3A569'}},bottom:{style:'double',color:{rgb:'C3A569'}}}},
    gold:{font:{bold:true,sz:11,color:{rgb:'0A0F1C'}},fill:{fgColor:{rgb:'C3A569'}},alignment:{horizontal:'center'}},
    note:{font:{sz:9,italic:true,color:{rgb:'888888'}}}
  };
  function applyStyle(ws,ref,stl){if(ws[ref]){ws[ref].s=stl}else{ws[ref]={v:'',t:'s',s:stl}}}
  function styleRow(ws,row,cols,stl){for(var c=0;c<cols;c++){var ref=XLSX.utils.encode_cell({r:row,c:c});applyStyle(ws,ref,stl)}}
  function styleRange(ws,r1,r2,col,stl){for(var r=r1;r<=r2;r++){var ref=XLSX.utils.encode_cell({r:r,c:col});applyStyle(ws,ref,stl)}}

  /* ═══════════════════════════════════════════
     Sheet 1: 기본데이터 (입력값만, 수식 없음)
     ═══════════════════════════════════════════ */
  var s1=[
    ['(주)세울엔지니어링 — 종합 사업성 분석'],
    ['생성일시',new Date().toLocaleString('ko-KR')],
    [],
    ['항목','값','단위'],
    ['사업유형',D.projectType,''],
    ['사업명',D.projectName||'-',''],
    ['소재지',D.location||'-',''],
    ['진행단계',D.phase,''],
    [],
    ['구역·면적 정보'],
    ['항목','값','단위'],
    ['정비구역면적',D.zoneArea,'㎡'],
    ['대지면적',D.siteArea,'㎡'],
    ['연면적',D.grossFloorArea,'㎡'],
    ['기존 용적률',D.farExisting,'%'],
    ['계획 용적률',D.farPlanned,'%'],
    ['건폐율',D.bcr,'%'],
    [],
    ['세대·조합원 정보'],
    ['항목','값','단위'],
    ['조합원 수',D.memberCount,'명'],
    ['토지등소유자 수',D.ownerCount,'명'],
    ['기존 세대수',D.existingUnits,'세대'],
    ['계획 세대수',D.plannedUnits,'세대'],
    ['일반분양 세대수',D.generalUnits,'세대'],
    ['임대 세대수',D.rentalUnits,'세대']
  ];
  var ws1=XLSX.utils.aoa_to_sheet(s1);
  colW(ws1,[24,20,8]);
  ws1['!merges']=[{s:{r:0,c:0},e:{r:0,c:2}}];
  styleRow(ws1,0,3,STL.title);
  styleRow(ws1,3,3,STL.hdr);styleRow(ws1,10,3,STL.hdr);styleRow(ws1,19,3,STL.hdr);
  applyStyle(ws1,XLSX.utils.encode_cell({r:9,c:0}),STL.secTitle);
  applyStyle(ws1,XLSX.utils.encode_cell({r:18,c:0}),STL.secTitle);
  for(var i1=4;i1<=7;i1++){applyStyle(ws1,XLSX.utils.encode_cell({r:i1,c:0}),STL.label);applyStyle(ws1,XLSX.utils.encode_cell({r:i1,c:1}),STL.val)}
  for(var i2=11;i2<=16;i2++){applyStyle(ws1,XLSX.utils.encode_cell({r:i2,c:0}),STL.label);applyStyle(ws1,XLSX.utils.encode_cell({r:i2,c:1}),STL.val)}
  for(var i3=20;i3<=25;i3++){applyStyle(ws1,XLSX.utils.encode_cell({r:i3,c:0}),STL.label);applyStyle(ws1,XLSX.utils.encode_cell({r:i3,c:1}),STL.val)}
  XLSX.utils.book_append_sheet(wb,ws1,'기본데이터');

  /* ═══════════════════════════════════════════
     Sheet 2: 종전자산 — 유형별 B*C 수식, SUM 합계
     Row layout (1-indexed):
       1: 제목
       3: 산정방식
       5: 헤더 (유형/세대수/평균평가액/소계/산출식)
       6~: 유형별 데이터 행 (가변)
       빈행
       합계행 → prevSumRow
     ═══════════════════════════════════════════ */
  var prev=Engine.prevAssetTotal();
  var s2=[
    ['종전자산 평가'],
    [],
    ['산정방식',D.prevAssetMode==='simple'?'총액 직접입력':'유형별 상세입력'],
    []
  ];
  /* 종전자산 합계가 위치할 행 번호 (1-indexed, 시트간 참조용) */
  var prevSumRow;
  var prevDataFirstRow; /* 데이터 시작 행 (1-indexed) */
  var prevDataLastRow;  /* 데이터 마지막 행 (1-indexed) */

  if(D.prevAssetMode==='detail'){
    s2.push(['유형','세대수','평균 평가액(원)','소계(원)','산출식']);
    /* 헤더가 s2[4] = 0-indexed row 4 = 1-indexed row 5 */
    var prevValidTypes=[];
    D.prevTypes.forEach(function(t){if(t.count>0)prevValidTypes.push(t)});
    prevDataFirstRow=6; /* 첫 데이터 = 1-indexed row 6 */
    prevValidTypes.forEach(function(t,i){
      var r1=prevDataFirstRow+i; /* 1-indexed 행 번호 */
      s2.push([t.name,t.count,t.avgValue,{t:'n',f:'B'+r1+'*C'+r1},'세대수 x 평균평가액']);
    });
    prevDataLastRow=prevDataFirstRow+prevValidTypes.length-1;
    s2.push([]);
    prevSumRow=prevDataLastRow+2; /* 빈행 건너뛴 합계 행 */
    s2.push(['종전자산 합계','','',{t:'n',f:'SUM(D'+prevDataFirstRow+':D'+prevDataLastRow+')'}]);
  } else {
    s2.push(['종전자산 총액',prev,'원']);
    prevSumRow=5; /* simple 모드: B5에 총액 */
    prevDataFirstRow=5;
    prevDataLastRow=5;
  }
  var ws2=XLSX.utils.aoa_to_sheet(s2);
  colW(ws2,[16,12,20,20,20]);
  ws2['!merges']=[{s:{r:0,c:0},e:{r:0,c:4}}];
  styleRow(ws2,0,5,STL.title);
  if(D.prevAssetMode==='detail'){
    styleRow(ws2,4,5,STL.hdr);
    for(var p=prevDataFirstRow-1;p<=prevDataLastRow-1;p++){
      applyStyle(ws2,XLSX.utils.encode_cell({r:p,c:0}),STL.label);
      numFmt(ws2,2,p,1,N);numFmt(ws2,3,p,1,N);
    }
    styleRow(ws2,prevSumRow-1,5,STL.sum);
    fmtCells(ws2,[XLSX.utils.encode_cell({r:prevSumRow-1,c:3})],N);
  }
  XLSX.utils.book_append_sheet(wb,ws2,'종전자산');

  /* ═══════════════════════════════════════════
     Sheet 3: 종후자산 — B*C 수식, SUM 합계
     Row layout (1-indexed):
       1: 제목
       3: 헤더
       4: 일반분양  → B4*C4
       5: 조합원분양 → B5*C5
       6: 상가      → 직접입력 (C6에 값)
       7: 보류지    → B7*C7
       8: 기타      → 직접입력 (D8에 값)
       9: 빈행
      10: 총수입 합계 → SUM(D4:D8)
      11: 빈행
      12: 참고문구
     ═══════════════════════════════════════════ */
  var comRev=D.postCommercialValue||D.commercialPrice;
  var etcRev=D.postEtcValue||0;
  var s3=[
    ['종후자산 · 분양수입 산출'],
    [],
    ['항목','세대수/수량','단가(원)','금액(원)','산출식'],
    ['일반분양 수입',D.generalUnits,D.generalAvgPrice,{t:'n',f:'B4*C4'},'세대수 x 일반분양 평균가'],
    ['조합원분양 수입',D.memberCount,D.memberAvgPrice,{t:'n',f:'B5*C5'},'조합원수 x 조합원분양 평균가'],
    ['상가 분양수입','',comRev,comRev,'직접입력'],
    ['보류지 수입',D.reserveUnits,D.reserveAvgPrice,{t:'n',f:'B7*C7'},'보류지 세대 x 평균가'],
    ['기타 수입','','',etcRev,'직접입력'],
    [],
    ['총수입 합계','','',{t:'n',f:'SUM(D4:D8)'},'= SUM(일반분양~기타)'],
    [],
    ['※ 종후자산 = 총수입 - 총사업비 (사업비 시트 참조)']
  ];
  /* 종후자산 총수입 합계 = 항상 D10 (1-indexed row 10) */
  var revSumRow=10;
  var ws3=XLSX.utils.aoa_to_sheet(s3);
  colW(ws3,[18,14,18,22,28]);
  ws3['!merges']=[{s:{r:0,c:0},e:{r:0,c:4}}];
  styleRow(ws3,0,5,STL.title);
  styleRow(ws3,2,5,STL.hdr);
  for(var r3=3;r3<=7;r3++){applyStyle(ws3,XLSX.utils.encode_cell({r:r3,c:0}),STL.label);numFmt(ws3,2,r3,1,N);numFmt(ws3,3,r3,1,N)}
  styleRow(ws3,9,5,STL.sum);
  fmtCells(ws3,[XLSX.utils.encode_cell({r:9,c:3})],N);
  applyStyle(ws3,XLSX.utils.encode_cell({r:11,c:0}),STL.note);
  XLSX.utils.book_append_sheet(wb,ws3,'종후자산');

  /* ═══════════════════════════════════════════
     Sheet 4: 사업비 — 비율모드 시 공사비 참조 수식
     Row layout (1-indexed):
       1: 제목
       3: 산정방식
       5: 헤더
       6: 공사비 (직접입력 기준값)
       7~: 나머지 항목 (가변)  → ratio: B6*비율/100
       빈행
       합계행 → costSumRow
     ═══════════════════════════════════════════ */
  var bd=Engine.costBreakdown();
  var tc=Engine.totalCost();
  var s4=[
    ['사업비 내역'],
    [],
    ['산정방식',D.costMode==='ratio'?'공사비 대비 비율 산출':'항목별 직접입력'],
    [],
    ['항목','금액(원)','비중(%)','산출근거']
  ];
  var costStartRow=6; /* 1-indexed row 6 = 0-indexed row 5 */
  var costConstructionRow=costStartRow; /* 공사비 행 = B6 */
  var ratioMap={'설계비':'costRatioDesign','감리비':'costRatioSupervision','철거비':'costRatioDemolition',
                '금융비용':'costRatioFinance','운영비':'costRatioOperation','기타':'costRatioEtc','예비비':'costRatioReserve'};

  bd.forEach(function(b,i){
    var r1=costStartRow+i; /* 현재 행 (1-indexed) */
    var row;
    if(D.costMode==='ratio'&&b.name!=='공사비'){
      var rk=ratioMap[b.name];
      var ratio=rk?D[rk]||0:0;
      /* 금액: =B6*비율/100 (공사비 셀 참조), 비중: =B행/B합계행 */
      row=[b.name,
           {t:'n',f:'B'+costConstructionRow+'*'+ratio+'/100'},
           null, /* 비중은 나중에 수식 삽입 */
           '공사비 x '+ratio+'%'];
    } else {
      /* 공사비 또는 detail 모드: 값 직접입력 */
      row=[b.name,b.value,null,b.name==='공사비'?'기준입력':'직접입력'];
    }
    s4.push(row);
  });
  s4.push([]);
  var costDataLastRow=costStartRow+bd.length-1;
  var costSumRow=costDataLastRow+2; /* 빈행 건너뛴 합계 행 */
  s4.push(['총사업비 합계',
           {t:'n',f:'SUM(B'+costStartRow+':B'+costDataLastRow+')'},
           1,
           '']);

  var ws4=XLSX.utils.aoa_to_sheet(s4);
  colW(ws4,[16,22,12,28]);
  ws4['!merges']=[{s:{r:0,c:0},e:{r:0,c:3}}];
  styleRow(ws4,0,4,STL.title);
  styleRow(ws4,4,4,STL.hdr);
  for(var c4=0;c4<bd.length;c4++){
    var cr=costStartRow-1+c4;
    applyStyle(ws4,XLSX.utils.encode_cell({r:cr,c:0}),STL.label);
  }
  styleRow(ws4,costSumRow-1,4,STL.sum);

  /* 비중(C열) 수식 삽입: =B행/B합계행 */
  bd.forEach(function(b,i){
    var r1=costStartRow+i;
    var cRef=XLSX.utils.encode_cell({r:r1-1,c:2}); /* C열 (0-indexed col 2) */
    ws4[cRef]={t:'n',f:'IF(B$'+costSumRow+'=0,0,B'+r1+'/B$'+costSumRow+')',z:P};
  });
  /* 합계행 비중 = 100% */
  var costSumPctRef=XLSX.utils.encode_cell({r:costSumRow-1,c:2});
  if(ws4[costSumPctRef])ws4[costSumPctRef].z=P;
  /* B열 금액 천단위 포맷 */
  numFmt(ws4,1,costStartRow-1,bd.length,N);
  fmtCells(ws4,[XLSX.utils.encode_cell({r:costSumRow-1,c:1})],N);
  XLSX.utils.book_append_sheet(wb,ws4,'사업비');

  /* ═══════════════════════════════════════════
     Sheet 5: 분석결과 — 시트간 참조 수식 사용
     Row layout (1-indexed):
       1: 제목
       3: 헤더
       4: 총수입(A)       → =종후자산!D{revSumRow}
       5: 총사업비(B)     → =사업비!B{costSumRow}
       6: 종후자산(C=A-B) → =B4-B5
       7: 종전자산(D)     → =종전자산!D{prevSumRow} 또는 B{prevSumRow}
       8: 빈행
       9: 비례율(C/D)     → =IF(B7=0,0,B6/B7)
      10: 빈행
      11: 분담금 헤더
      12: 1인당 평균 권리가액 → =IF(조합원수=0,0,B6/조합원수)
      13: 조합원 분양 평균가  → 입력값
      14: 평균 추정 분담금    → =B13-B12
      15: 빈행
      16: 유형별 제목
      17: 유형별 헤더
      18~: 유형별 데이터   → 권리가액=C행*B$9, 분담금=조합원분양가-D행
     ═══════════════════════════════════════════ */
  var bt=Engine.burdenByType();
  /* 종전자산 참조: detail=D열, simple=B열 */
  var prevRef=D.prevAssetMode==='detail'
    ?("'종전자산'!D"+prevSumRow)
    :("'종전자산'!B"+prevSumRow);
  var memberCount=D.memberCount||0;

  var s5=[
    ['분석 결과 — 비례율 · 분담금 산출'],
    [],
    ['핵심 지표','값','산출식'],
    ['총수입(A)',        {t:'n',f:"'종후자산'!D"+revSumRow},            '= 종후자산!D'+revSumRow],
    ['총사업비(B)',      {t:'n',f:"'사업비'!B"+costSumRow},             '= 사업비!B'+costSumRow],
    ['종후자산(C=A-B)',  {t:'n',f:'B4-B5'},                             '= B4 - B5'],
    ['종전자산(D)',      {t:'n',f:prevRef},                             '= '+prevRef],
    [],
    ['비례율 (C÷D)',    {t:'n',f:'IF(B7=0,0,B6/B7)'},                  '= B6 / B7'],
    [],
    ['분담금 산출','값','산출식'],
    ['1인당 평균 권리가액',{t:'n',f:'IF('+memberCount+'=0,0,B6/'+memberCount+')'},'= 종후자산 / 조합원수('+memberCount+'명)'],
    ['조합원 분양 평균가',D.memberAvgPrice,                             '입력값'],
    ['평균 추정 분담금',  {t:'n',f:'B13-B12'},                          '= B13 - B12'],
    [],
    ['유형별 분담금 추정'],
    ['유형','세대수','종전 평가액(원)','권리가액(원)','추정 분담금(원)','환급/납부']
  ];
  /* 유형별 데이터: 1-indexed row 18부터 */
  var btStartRow=18;
  bt.forEach(function(t,i){
    var r1=btStartRow+i;
    s5.push([
      t.name,
      t.count,
      t.avgPrev,
      {t:'n',f:'C'+r1+'*B$9'},              /* 권리가액 = 종전평가액 * 비례율 */
      {t:'n',f:'B$13-D'+r1},                /* 분담금 = 조합원분양가 - 권리가액 */
      {t:'s',f:'IF(E'+r1+'<0,"환급","납부")'}  /* 음수면 환급 */
    ]);
  });
  var ws5=XLSX.utils.aoa_to_sheet(s5);
  colW(ws5,[22,18,20,18,18,10]);
  ws5['!merges']=[{s:{r:0,c:0},e:{r:0,c:5}}];
  styleRow(ws5,0,6,STL.title);
  styleRow(ws5,2,3,STL.hdr);
  for(var r5=3;r5<=6;r5++){applyStyle(ws5,XLSX.utils.encode_cell({r:r5,c:0}),STL.label)}
  applyStyle(ws5,XLSX.utils.encode_cell({r:8,c:0}),STL.gold);
  applyStyle(ws5,XLSX.utils.encode_cell({r:8,c:1}),STL.gold);
  fmtCells(ws5,[XLSX.utils.encode_cell({r:8,c:1})],P);
  styleRow(ws5,10,3,STL.hdr);
  for(var r5b=11;r5b<=13;r5b++){applyStyle(ws5,XLSX.utils.encode_cell({r:r5b,c:0}),STL.label)}
  applyStyle(ws5,XLSX.utils.encode_cell({r:13,c:0}),STL.sum);
  applyStyle(ws5,XLSX.utils.encode_cell({r:13,c:1}),STL.sum);
  fmtCells(ws5,[
    XLSX.utils.encode_cell({r:3,c:1}),XLSX.utils.encode_cell({r:4,c:1}),
    XLSX.utils.encode_cell({r:5,c:1}),XLSX.utils.encode_cell({r:6,c:1}),
    XLSX.utils.encode_cell({r:11,c:1}),XLSX.utils.encode_cell({r:12,c:1}),
    XLSX.utils.encode_cell({r:13,c:1})
  ],N);
  styleRow(ws5,16,6,STL.hdr);
  bt.forEach(function(t,i){
    var br=btStartRow-1+i;
    applyStyle(ws5,XLSX.utils.encode_cell({r:br,c:0}),STL.label);
    numFmt(ws5,2,br,1,N);numFmt(ws5,3,br,1,N);numFmt(ws5,4,br,1,N);
  });
  XLSX.utils.book_append_sheet(wb,ws5,'분석결과');

  /* ═══════════════════════════════════════════
     Sheet 6: 최종결과 — 분석결과 참조 + 시나리오 수식
     Row layout (1-indexed):
       1: 제목
       3: 헤더
       4: 기준안  → 분석결과 직접 참조
       5: 보수안  → 기준안 * 변동률 수식
       6: 낙관안  → 기준안 * 변동률 수식
       7: 빈행
       8: 종합 의견
       9~: 의견 내용
     ═══════════════════════════════════════════ */
  var sc=D.scenarios.map(function(s){return Engine.scenarioCalc(s)});
  var ins=Engine.insights();
  var warns=Engine.costWarnings();
  var s6=[
    ['최종 종합 결과 — 시나리오 비교'],
    [],
    ['시나리오','총수입(원)','총사업비(원)','종후자산(원)','비례율','평균분담금(원)']
  ];
  /* Row 4 (기준안): 분석결과 시트 직접 참조 */
  s6.push([
    '기준안',
    {t:'n',f:"'분석결과'!B4"},   /* 총수입 */
    {t:'n',f:"'분석결과'!B5"},   /* 총사업비 */
    {t:'n',f:"'분석결과'!B6"},   /* 종후자산 */
    {t:'n',f:"'분석결과'!B9"},   /* 비례율 */
    {t:'n',f:"'분석결과'!B14"}   /* 평균분담금 */
  ]);
  /* Row 5~6 (보수안, 낙관안): 기준안 기반 변동 수식 */
  D.scenarios.forEach(function(s,i){
    if(i===0)return; /* 기준안은 이미 삽입 */
    var r1=4+i; /* 1-indexed: 보수안=5, 낙관안=6 */
    var costPct=s.costChange||0;
    var pricePct=s.priceChange||0;
    /* 이름에 변동률 표시 */
    var label=s.name;
    if(costPct||pricePct) label+='(사업비'+(costPct>=0?'+':'')+costPct+'%,분양가'+(pricePct>=0?'+':'')+pricePct+'%)';
    s6.push([
      label,
      {t:'n',f:'B4*(1+'+pricePct+'/100)'},              /* 총수입 변동 */
      {t:'n',f:'C4*(1+'+costPct+'/100)'},                /* 총사업비 변동 */
      {t:'n',f:'B'+r1+'-C'+r1},                          /* 종후자산 = 총수입-총사업비 */
      {t:'n',f:"IF('분석결과'!B7=0,0,D"+r1+"/'분석결과'!B7)"}, /* 비례율 = 종후자산/종전자산 */
      {t:'n',f:"'분석결과'!B13-(IF('분석결과'!B7=0,0,D"+r1+"/"+memberCount+"))"} /* 분담금 = 분양가-권리가액 */
    ]);
  });
  s6.push([]);
  s6.push(['종합 의견']);
  ins.forEach(function(m){s6.push(['',m])});
  if(warns.length>0){
    s6.push([]);s6.push(['경고 사항']);
    warns.forEach(function(m){s6.push(['',m])});
  }
  s6.push([]);
  s6.push(['※ 본 분석은 입력 데이터 기준의 추정치이며, 실제 사업 여건에 따라 달라질 수 있습니다.']);
  s6.push(['※ (주)세울엔지니어링 | seul21.com | '+new Date().toLocaleDateString('ko-KR')]);
  var ws6=XLSX.utils.aoa_to_sheet(s6);
  colW(ws6,[30,18,18,18,12,18]);
  ws6['!merges']=[{s:{r:0,c:0},e:{r:0,c:5}}];
  styleRow(ws6,0,6,STL.title);
  styleRow(ws6,2,6,STL.hdr);
  var scCount=D.scenarios.length;
  for(var si=0;si<scCount;si++){
    applyStyle(ws6,XLSX.utils.encode_cell({r:3+si,c:0}),si===0?STL.gold:STL.label);
    fmtCells(ws6,[XLSX.utils.encode_cell({r:3+si,c:4})],P);
    [1,2,3,5].forEach(function(col){fmtCells(ws6,[XLSX.utils.encode_cell({r:3+si,c:col})],N)});
  }
  /* 의견 제목 */
  var noteStart=3+scCount+1;
  applyStyle(ws6,XLSX.utils.encode_cell({r:noteStart,c:0}),STL.secTitle);
  /* 면책 */
  var lastR=s6.length-1;
  applyStyle(ws6,XLSX.utils.encode_cell({r:lastR,c:0}),STL.note);
  applyStyle(ws6,XLSX.utils.encode_cell({r:lastR-1,c:0}),STL.note);
  XLSX.utils.book_append_sheet(wb,ws6,'최종결과');

  /* ── 파일 다운로드 ── */
  var fname='세울엔지니어링_사업성분석_'+(D.projectName||'종합')+'_'+new Date().toISOString().slice(0,10)+'.xlsx';
  XLSX.writeFile(wb,fname);
  if(typeof App!=='undefined')App.toast('엑셀 파일(6개 시트)이 다운로드되었습니다.','success');
}

window.CA = {
  render: renderComprehensive,
  goStep: goStep,
  setPrevMode: setPrevMode,
  setCostMode: setCostMode,
  addPrevType: addPrevType,
  fillExample: fillExample,
  resetAll: resetAll,
  saveData: saveData,
  exportExcel: exportExcel,
  importFile: importFile,
  downloadTemplate: downloadTemplate
};

})();
