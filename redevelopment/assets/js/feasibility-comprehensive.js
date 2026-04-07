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
  var h='<div class="ca-step-head"><h3>'+STEPS[idx].title+'</h3>';
  if(idx<STEPS.length-1)h+='<button class="cm-btn primary" onclick="CA.goStep('+(idx+1)+')">다음 단계 <i class="fa-solid fa-arrow-right"></i></button>';
  h+='</div>';

  if(idx===0){
    // 파일 입력
    h+='<div class="ca-file-upload" style="margin-bottom:16px;padding:16px 20px;border:1.5px dashed rgba(195,165,105,0.3);border-radius:10px;background:rgba(195,165,105,0.03);text-align:center">';
    h+='<i class="fa-solid fa-file-arrow-up" style="font-size:20px;color:#C3A569;margin-bottom:8px;display:block"></i>';
    h+='<p style="font-size:13px;color:var(--gray-600);margin-bottom:10px">엑셀/CSV 파일로 기초데이터를 한 번에 입력할 수 있습니다</p>';
    h+='<label style="display:inline-flex;align-items:center;gap:6px;padding:8px 20px;border-radius:6px;background:#0A0F1C;color:#fff;font-size:12px;font-weight:700;cursor:pointer">';
    h+='<i class="fa-solid fa-upload"></i> 파일 선택 (xlsx, csv)';
    h+='<input type="file" accept=".xlsx,.xls,.csv" onchange="CA.importFile(this)" style="display:none">';
    h+='</label>';
    h+='<button class="cm-btn" onclick="CA.downloadTemplate()" style="margin-left:8px;font-size:11px"><i class="fa-solid fa-download"></i> 입력양식 다운로드</button>';
    h+='</div>';
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
   EXCEL EXPORT — 모든 연산 세부 표기
   ════════════════════════════════════════ */
function exportExcel(){
  var r=Engine.ratio(),ab=Engine.avgBurden(),tc=Engine.totalCost(),tr=Engine.totalRevenue();
  var pa=Engine.postAssetTotal(),prev=Engine.prevAssetTotal();
  var bd=Engine.costBreakdown(),bt=Engine.burdenByType();
  var sc=D.scenarios.map(function(s){return Engine.scenarioCalc(s)});
  var ins=Engine.insights(),warns=Engine.costWarnings();

  var rows=[];
  var h=function(t){rows.push([t]);rows.push([])};
  var r2=function(a,b,c,d,e){rows.push([a||'',b||'',c||'',d||'',e||''])};

  /* 표지 */
  h('세울엔지니어링 — 종합 사업성 분석 보고서');
  r2('생성일시',new Date().toLocaleString('ko-KR'));
  r2('사업유형',D.projectType);r2('사업명',D.projectName);r2('소재지',D.location);r2('진행단계',D.phase);
  rows.push([]);

  /* 1. 기초 데이터 */
  h('1. 기초 데이터');
  r2('정비구역면적(㎡)',D.zoneArea);r2('대지면적(㎡)',D.siteArea);
  r2('연면적(㎡)',D.grossFloorArea);r2('기존용적률(%)',D.farExisting);r2('계획용적률(%)',D.farPlanned);r2('건폐율(%)',D.bcr);
  r2('조합원수(명)',D.memberCount);r2('토지등소유자수(명)',D.ownerCount);
  r2('기존세대수',D.existingUnits);r2('계획세대수',D.plannedUnits);
  r2('일반분양세대수',D.generalUnits);r2('임대세대수',D.rentalUnits);
  rows.push([]);

  /* 2. 종전자산 */
  h('2. 종전자산 평가');
  r2('산정방식',D.prevAssetMode==='simple'?'총액 직접입력':'유형별 상세입력');
  r2('종전자산 합계(원)',prev);
  if(D.prevAssetMode==='detail'){
    r2('유형','세대수','평균평가액(원)','소계(원)');
    D.prevTypes.forEach(function(t){
      if(t.count>0) r2(t.name,t.count,t.avgValue,t.count*t.avgValue);
    });
    r2('','','합계',prev);
  }
  rows.push([]);

  /* 3. 종후자산·분양가 */
  h('3. 종후자산 · 분양가');
  r2('일반분양 평균가(원/세대)',D.generalAvgPrice);
  r2('조합원분양 평균가(원/세대)',D.memberAvgPrice);
  r2('상가 총가(원)',D.commercialPrice);
  r2('보류지 세대수',D.reserveUnits);r2('보류지 평균가(원)',D.reserveAvgPrice);
  r2('기타수입(원)',D.postEtcValue);
  rows.push([]);
  r2('[연산] 총수입 산출');
  r2('일반분양 수입',D.generalUnits+'세대 × '+fmt(D.generalAvgPrice)+'원','=',D.generalUnits*D.generalAvgPrice);
  var memRev=D.postMemberValue||(D.memberCount*D.memberAvgPrice);
  r2('조합원분양 수입',D.memberCount+'세대 × '+fmt(D.memberAvgPrice)+'원','=',memRev);
  r2('상가 수입','','=',D.postCommercialValue||D.commercialPrice);
  var resRev=(D.reserveUnits*D.reserveAvgPrice)+(D.reserveCommercialArea*D.reserveCommercialPrice);
  r2('보류지 수입',D.reserveUnits+'세대 × '+fmt(D.reserveAvgPrice)+'원','=',resRev);
  r2('기타수입','','=',D.postEtcValue||0);
  r2('총수입 합계','','=',tr);
  rows.push([]);

  /* 4. 사업비 */
  h('4. 사업비 내역');
  r2('산정방식',D.costMode==='ratio'?'공사비 대비 비율':'항목별 직접입력');
  r2('항목','금액(원)','비중(%)','산출근거');
  bd.forEach(function(b){
    var pct=tc>0?(b.value/tc*100).toFixed(1)+'%':'-';
    var basis='';
    if(D.costMode==='ratio'&&b.name!=='공사비'){
      var ratioKey={'설계비':'costRatioDesign','감리비':'costRatioSupervision','철거비':'costRatioDemolition','금융비용':'costRatioFinance','운영비':'costRatioOperation','기타':'costRatioEtc','예비비':'costRatioReserve'};
      var rk=ratioKey[b.name];
      if(rk) basis='공사비 '+fmt(D.costConstruction)+'원 × '+(D[rk]||0)+'%';
    }
    r2(b.name,b.value,pct,basis);
  });
  r2('총사업비 합계',tc,'100%');
  rows.push([]);

  /* 5. 핵심 산출 결과 */
  h('5. 핵심 분석 결과');
  r2('[비례율 산출]');
  r2('종후자산','총수입 - 총사업비','= '+fmt(tr)+' - '+fmt(tc),'=',pa);
  r2('비례율','종후자산 ÷ 종전자산','= '+fmt(pa)+' ÷ '+fmt(prev),'=',(r*100).toFixed(2)+'%');
  rows.push([]);
  r2('[평균분담금 산출]');
  var avgRights=prev>0&&D.memberCount>0?pa/D.memberCount:0;
  r2('1인당 평균 권리가액','종후자산 ÷ 조합원수','= '+fmt(pa)+' ÷ '+D.memberCount,'=',avgRights);
  r2('평균분담금','조합원분양가 - 평균권리가액','= '+fmt(D.memberAvgPrice)+' - '+fmt(avgRights),'=',ab);
  rows.push([]);

  /* 6. 유형별 분담금 */
  if(bt.length>0){
    h('6. 유형별 분담금 추정');
    r2('유형','세대수','종전평가액','권리가액(비례율적용)','추정분담금');
    bt.forEach(function(t){
      r2(t.name,t.count,t.avgPrev,t.rights,t.burden);
    });
    rows.push([]);
  }

  /* 7. 시나리오 비교 */
  h('7. 시나리오 비교');
  r2('시나리오','총수입','총사업비','종후자산','비례율','평균분담금');
  sc.forEach(function(s){
    r2(s.name,s.totalRev,s.totalCost,s.postAsset,(s.ratio*100).toFixed(2)+'%',s.avgBurden);
  });
  rows.push([]);

  /* 8. 분석 의견 */
  if(ins.length>0||warns.length>0){
    h('8. 분석 의견 및 경고');
    ins.forEach(function(m){r2('[의견]',m)});
    warns.forEach(function(m){r2('[경고]',m)});
    rows.push([]);
  }

  r2('※ 본 분석은 입력 데이터 기준의 추정치이며, 실제 사업 여건에 따라 달라질 수 있습니다.');
  r2('※ (주)세울엔지니어링 | seul21.com');

  /* CSV → Excel 변환 (UTF-8 BOM) */
  var csv='\uFEFF';
  rows.forEach(function(row){
    csv+=row.map(function(cell){
      var s=String(cell==null?'':cell);
      if(s.indexOf(',')>=0||s.indexOf('"')>=0||s.indexOf('\n')>=0) s='"'+s.replace(/"/g,'""')+'"';
      return s;
    }).join(',')+'\r\n';
  });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;
  a.download='세울엔지니어링_사업성분석_'+(D.projectName||'종합분석')+'_'+new Date().toISOString().slice(0,10)+'.csv';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);
  if(typeof App!=='undefined')App.toast('엑셀 파일이 다운로드되었습니다.','success');
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
</script>
