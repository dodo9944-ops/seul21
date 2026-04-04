/**
 * 세울 — Mock Data
 * 모든 초기 데이터. localStorage가 비어있을 때 이 데이터로 초기화.
 * 향후 실 API 전환 시 data-service.js만 교체하면 됨.
 */
const MOCK = {
  /* ──────────────────────────── 구역 ──────────────────────────── */
  areas: [
    { id:'a1', name:'한남3구역', type:'재개발', district:'용산구', dong:'한남동',
      stage:'관리처분인가', premium:5800, change:200, changeDir:'up', ratio:112,
      totalHouseholds:5200, totalArea:128000, floorArea:320000, buildingCoverage:45,
      floorAreaRatio:299, developer:'현대건설 컨소시엄', approvalDate:'2025-09-15',
      completionDate:'2029-06-30', description:'한남뉴타운 내 최대 규모 정비구역으로, 한강 조망권과 이태원·녹사평 생활권을 동시에 누릴 수 있는 서울 최고급 재개발 사업지입니다.',
      tags:['한강뷰','역세권','비례율112%','대단지'], featured:true, hot:true,
      image:'', lat:37.5340, lng:126.9980, createdAt:'2026-01-15' },
    { id:'a2', name:'흑석9구역', type:'재개발', district:'동작구', dong:'흑석동',
      stage:'사업시행인가', premium:3200, change:150, changeDir:'up', ratio:105,
      totalHouseholds:3800, totalArea:89000, floorArea:245000, buildingCoverage:42,
      floorAreaRatio:280, developer:'대우건설', approvalDate:'2025-06-20',
      completionDate:'2029-12-31', description:'흑석뉴타운의 핵심 구역으로 한강 조망과 9호선 흑석역 역세권의 뛰어난 입지를 갖추고 있습니다.',
      tags:['한강뷰','비례율105%','역세권'], featured:true, hot:false,
      image:'', lat:37.5080, lng:126.9630, createdAt:'2026-01-20' },
    { id:'a3', name:'신길1구역', type:'재개발', district:'영등포구', dong:'신길동',
      stage:'착공', premium:2900, change:80, changeDir:'up', ratio:108,
      totalHouseholds:4200, totalArea:112000, floorArea:298000, buildingCoverage:40,
      floorAreaRatio:295, developer:'삼성물산·GS건설', approvalDate:'2024-11-10',
      completionDate:'2028-03-31', description:'신길뉴타운 내 최대 규모 구역으로, 대방역·신길역 더블 역세권과 여의도 접근성이 강점입니다.',
      tags:['대단지','비례율108%','더블역세권'], featured:true, hot:false,
      image:'', lat:37.5010, lng:126.9170, createdAt:'2026-02-01' },
    { id:'a4', name:'이문1구역', type:'재개발', district:'동대문구', dong:'이문동',
      stage:'관리처분인가', premium:2750, change:300, changeDir:'up', ratio:98,
      totalHouseholds:4500, totalArea:135000, floorArea:340000, buildingCoverage:38,
      floorAreaRatio:299, developer:'현대엔지니어링', approvalDate:'2025-08-05',
      completionDate:'2029-09-30', description:'이문·휘경 뉴타운의 중심 구역으로 외대앞역 초역세권이며 동북선 경전철 개통 수혜가 기대됩니다.',
      tags:['역세권','비례율98%','급등구역'], featured:true, hot:false,
      image:'', lat:37.5970, lng:127.0570, createdAt:'2026-02-10' },
    { id:'a5', name:'장위4구역', type:'재개발', district:'성북구', dong:'장위동',
      stage:'조합설립인가', premium:1850, change:0, changeDir:'flat', ratio:95,
      totalHouseholds:2800, totalArea:75000, floorArea:198000, buildingCoverage:42,
      floorAreaRatio:270, developer:'미정', approvalDate:'2025-03-15',
      completionDate:'2030-12-31', description:'장위뉴타운 내 위치한 구역으로, 동북선 경전철 개통 시 교통여건 대폭 개선이 예상됩니다.',
      tags:['역세권(예정)','경전철수혜'], featured:false, hot:false,
      image:'', lat:37.6130, lng:127.0520, createdAt:'2026-02-15' },
    { id:'a6', name:'수색13구역', type:'재개발', district:'은평구', dong:'수색동',
      stage:'정비구역지정', premium:1200, change:-50, changeDir:'down', ratio:0,
      totalHouseholds:1500, totalArea:42000, floorArea:110000, buildingCoverage:45,
      floorAreaRatio:250, developer:'미정', approvalDate:'',
      completionDate:'', description:'수색·증산 뉴타운 내 구역으로, DMC 개발 수혜와 GTX-A 정차역 인근 입지가 장기 투자 매력입니다.',
      tags:['GTX수혜','DMC인접'], featured:false, hot:false,
      image:'', lat:37.5820, lng:126.8960, createdAt:'2026-03-01' },
    { id:'a7', name:'노량진1구역', type:'재개발', district:'동작구', dong:'노량진동',
      stage:'사업시행인가', premium:2400, change:120, changeDir:'up', ratio:102,
      totalHouseholds:3200, totalArea:82000, floorArea:218000, buildingCoverage:40,
      floorAreaRatio:285, developer:'포스코이앤씨', approvalDate:'2025-07-01',
      completionDate:'2029-06-30', description:'노량진역 초역세권으로 1·9호선 환승역 도보 3분, 한강 조망까지 갖춘 입지입니다.',
      tags:['초역세권','한강뷰','비례율102%'], featured:false, hot:false,
      image:'', lat:37.5130, lng:126.9430, createdAt:'2026-03-05' },
    { id:'a8', name:'둔촌주공', type:'재건축', district:'강동구', dong:'둔촌동',
      stage:'입주예정', premium:4500, change:50, changeDir:'up', ratio:115,
      totalHouseholds:12032, totalArea:195000, floorArea:620000, buildingCoverage:18,
      floorAreaRatio:299, developer:'HDC현대·현대건설·대우건설·롯데건설', approvalDate:'2019-12-27',
      completionDate:'2026-12-31', description:'둔촌동 대단지 재건축으로 12,032세대 메가시티. 강동구 최대 랜드마크가 될 예정입니다.',
      tags:['메가단지','입주예정','비례율115%'], featured:true, hot:false,
      image:'', lat:37.5270, lng:127.1440, createdAt:'2026-01-10' },
    { id:'a9', name:'은마아파트', type:'재건축', district:'강남구', dong:'대치동',
      stage:'정비구역지정', premium:6200, change:400, changeDir:'up', ratio:0,
      totalHouseholds:4424, totalArea:168000, floorArea:450000, buildingCoverage:20,
      floorAreaRatio:299, developer:'미정', approvalDate:'',
      completionDate:'', description:'대치동 학군과 강남 중심 입지의 대표 재건축 단지. 안전진단 통과 후 본격 사업 추진 중입니다.',
      tags:['강남핵심','학군최고','대단지'], featured:true, hot:true,
      image:'', lat:37.5010, lng:127.0630, createdAt:'2026-02-20' },
    { id:'a10', name:'잠실주공5단지', type:'재건축', district:'송파구', dong:'잠실동',
      stage:'조합설립인가', premium:5500, change:200, changeDir:'up', ratio:0,
      totalHouseholds:3930, totalArea:138000, floorArea:380000, buildingCoverage:22,
      floorAreaRatio:299, developer:'미정', approvalDate:'2025-12-01',
      completionDate:'', description:'잠실 핵심 입지의 재건축 단지로, 롯데월드타워 인접 및 2·8호선 더블역세권입니다.',
      tags:['잠실핵심','더블역세권','대단지'], featured:false, hot:false,
      image:'', lat:37.5110, lng:127.0840, createdAt:'2026-03-10' }
  ],

  /* ──────────────────────────── 매물 ──────────────────────────── */
  listings: [
    { id:'l1', areaId:'a1', areaName:'한남3구역', type:'입주권', district:'용산구',
      price:125000, priceText:'12억 5,000만', size:84, sizeType:'전용 84㎡',
      premium:58000, floor:'', description:'한강 조망 가능 고층 배정 예정. 프리미엄 5.8억 포함. 현재 이주 완료 상태.',
      tags:['관리처분인가','한강뷰','역세권'], status:'매물', featured:true, hot:true,
      seller:'김민수', phone:'010-1234-5678', createdAt:'2026-03-28' },
    { id:'l2', areaId:'a2', areaName:'흑석9구역', type:'입주권', district:'동작구',
      price:82000, priceText:'8억 2,000만', size:59, sizeType:'전용 59㎡',
      premium:32000, floor:'', description:'한강뷰 예정 세대. 흑석역 도보 5분. 사업시행인가 완료.',
      tags:['사업시행인가','한강뷰'], status:'매물', featured:true, hot:false,
      seller:'박영희', phone:'010-2345-6789', createdAt:'2026-03-25' },
    { id:'l3', areaId:'a4', areaName:'이문1구역', type:'분양권', district:'동대문구',
      price:68000, priceText:'6억 8,000만', size:74, sizeType:'전용 74㎡',
      premium:27500, floor:'', description:'외대앞역 도보 3분 초역세권. 관리처분인가 완료.',
      tags:['관리처분인가','역세권'], status:'매물', featured:true, hot:false,
      seller:'이준혁', phone:'010-3456-7890', createdAt:'2026-03-20' },
    { id:'l4', areaId:'a3', areaName:'신길1구역', type:'입주권', district:'영등포구',
      price:73000, priceText:'7억 3,000만', size:84, sizeType:'전용 84㎡',
      premium:29000, floor:'', description:'2027 입주 예정. 대방역·신길역 더블 역세권.',
      tags:['착공','대단지'], status:'매물', featured:true, hot:false,
      seller:'정수현', phone:'010-4567-8901', createdAt:'2026-03-15' },
    { id:'l5', areaId:'a5', areaName:'장위4구역', type:'토지', district:'성북구',
      price:41000, priceText:'4억 1,000만', size:45, sizeType:'대지 45㎡',
      premium:18500, floor:'', description:'조합설립 완료. 동북선 경전철 개통 수혜 예상.',
      tags:['조합설립인가','역세권(예정)'], status:'매물', featured:false, hot:false,
      seller:'최은지', phone:'010-5678-9012', createdAt:'2026-03-10' },
    { id:'l6', areaId:'a7', areaName:'노량진1구역', type:'입주권', district:'동작구',
      price:95000, priceText:'9억 5,000만', size:84, sizeType:'전용 84㎡',
      premium:24000, floor:'', description:'노량진역 도보 3분. 한강 조망 고층 배정.',
      tags:['사업시행인가','역세권'], status:'매물', featured:true, hot:false,
      seller:'한지민', phone:'010-6789-0123', createdAt:'2026-03-05' },
    { id:'l7', areaId:'a9', areaName:'은마아파트', type:'매매', district:'강남구',
      price:268000, priceText:'26억 8,000만', size:76, sizeType:'전용 76㎡',
      premium:62000, floor:'12층', description:'대치동 학군 최고 입지. 재건축 추진 중. 안전진단 통과.',
      tags:['강남핵심','재건축추진'], status:'매물', featured:false, hot:true,
      seller:'윤서준', phone:'010-7890-1234', createdAt:'2026-02-28' },
    { id:'l8', areaId:'a8', areaName:'둔촌주공', type:'분양권', district:'강동구',
      price:155000, priceText:'15억 5,000만', size:84, sizeType:'전용 84㎡',
      premium:45000, floor:'25층', description:'둔촌올림픽파크에비뉴포레. 연내 입주 예정.',
      tags:['입주예정','메가단지'], status:'매물', featured:false, hot:false,
      seller:'강다은', phone:'010-8901-2345', createdAt:'2026-02-20' }
  ],

  /* ──────────────────────────── 뉴스 ──────────────────────────── */
  news: [
    { id:'n1', title:'서울시, 2026 정비사업 촉진 특별법 시행 본격화', category:'정책',
      summary:'서울시가 정비사업 활성화를 위한 특별법 시행에 본격 돌입했다. 주요 내용은 인허가 기간 단축과 용적률 인센티브 확대로, 정비구역 지정부터 착공까지 평균 소요 기간을 기존 12년에서 8년으로 줄이겠다는 목표다.',
      content:'서울시는 1일 \"2026 정비사업 촉진 특별법\"의 본격 시행을 발표했다. 이번 특별법의 핵심은 인허가 절차의 획기적 단축이다.\n\n주요 내용은 다음과 같다.\n\n1. 인허가 통합심의 도입: 기존 6단계 심의를 3단계로 통합\n2. 용적률 인센티브 확대: 공공기여 비율에 따라 최대 120%까지 추가 부여\n3. 이주비 지원 강화: 세입자 이주비를 기존 대비 30% 인상\n4. 분쟁조정위원회 상설화: 조합-시공사 간 분쟁 신속 해결\n\n서울시 도시정비과 관계자는 \"이번 특별법으로 현재 정체되어 있는 다수의 정비사업이 빠르게 추진력을 얻을 것\"이라며 \"특히 사업시행인가 이전 단계의 구역들이 가장 큰 수혜를 받을 것으로 예상한다\"고 밝혔다.\n\n부동산 전문가들은 이번 정책이 수도권 재개발 시장에 긍정적 영향을 미칠 것으로 전망하면서도, 공급 확대에 따른 일시적 프리미엄 조정 가능성에 대해서도 주의를 당부했다.',
      author:'김기자', date:'2026-04-02', views:2840, image:'',
      tags:['정비사업','특별법','서울시'], featured:true },
    { id:'n2', title:'수도권 재개발 프리미엄 3개월 연속 상승 기록', category:'시장분석',
      summary:'수도권 주요 정비구역의 프리미엄이 3개월 연속 상승세를 이어가고 있다. 특히 한남3구역과 이문1구역의 상승폭이 두드러진다.',
      content:'한국부동산원의 최신 통계에 따르면, 수도권 주요 20개 정비구역의 평균 프리미엄이 3개월 연속 상승했다.\n\n구역별 상승률을 보면 이문1구역이 전월 대비 12.3%로 가장 높았으며, 한남3구역(3.6%), 흑석9구역(4.9%) 순이다.\n\n전문가들은 정비사업 촉진법 시행 기대감과 금리 인하 전망이 복합적으로 작용한 결과로 분석하고 있다.',
      author:'박기자', date:'2026-04-01', views:1956, image:'',
      tags:['프리미엄','상승세','시장분석'], featured:true },
    { id:'n3', title:'조합원 분양가 상한제 개정안 국회 통과', category:'정책',
      summary:'조합원 분양가 상한제 개정안이 국회 본회의를 통과했다. 기존 분양가 상한 기준이 현실화되면서 조합원 부담이 일부 줄어들 전망이다.',
      content:'국회는 지난 31일 본회의에서 \"주택법 일부개정법률안\"을 의결했다. 이번 개정안의 핵심은 조합원 분양가 산정 시 감정평가 기준 시점을 사업시행인가일에서 관리처분인가일로 변경하는 것이다.\n\n이에 따라 사업 기간 중 상승한 토지가격이 반영되어 조합원 분양가가 현실화되고, 결과적으로 추가 분담금 부담이 줄어들 것으로 예상된다.',
      author:'이기자', date:'2026-03-31', views:3420, image:'',
      tags:['분양가상한제','국회','조합원'], featured:true },
    { id:'n4', title:'강북 재개발 입주권, 투자 수익률 분석 리포트', category:'분석',
      summary:'강북권 주요 재개발 구역의 입주권 투자 수익률을 분석한 결과, 사업시행인가 단계의 구역이 가장 높은 수익률을 기록했다.',
      content:'본지가 강북권 15개 정비구역의 최근 3년 간 입주권 거래 데이터를 분석한 결과, 사업시행인가 전후로 매수한 경우의 평균 수익률이 45.2%로 가장 높았다.\n\n구역별로는 한남3구역 62.8%, 이문1구역 51.3%, 장위4구역 38.7% 순이었다. 관리처분인가 이후 매수 건의 평균 수익률은 22.3%였다.',
      author:'최기자', date:'2026-03-30', views:4150, image:'',
      tags:['투자수익률','강북재개발','입주권'], featured:false },
    { id:'n5', title:'GTX-A 운행 개시, 수색·증산 뉴타운 수혜 전망', category:'개발호재',
      summary:'GTX-A 노선 개통으로 수색·증산 뉴타운 일대의 교통 여건이 크게 개선될 전망이다.',
      content:'GTX-A 노선이 올해 하반기 개통 예정인 가운데, 수색·증산 뉴타운 일대가 최대 수혜 지역으로 꼽히고 있다.\n\n수색13구역의 경우 GTX-A 수색역까지 도보 10분 거리로, 개통 후 서울역까지 10분대, 삼성역까지 20분대 이동이 가능해진다.',
      author:'정기자', date:'2026-03-28', views:2310, image:'',
      tags:['GTX','수색뉴타운','교통호재'], featured:false },
    { id:'n6', title:'2026년 상반기 정비구역 추가 지정 현황', category:'정책',
      summary:'서울시가 2026년 상반기 신규 정비구역 5곳을 추가 지정했다. 마포구, 성동구, 중랑구 등이 포함됐다.',
      content:'서울시 도시재생본부는 올해 상반기 신규 정비구역 5곳을 추가로 지정했다고 밝혔다. 새로 지정된 구역은 마포구 아현동 일대, 성동구 금호동 4가, 중랑구 면목동 일대, 동대문구 전농동 일대, 관악구 봉천동 일대다.',
      author:'한기자', date:'2026-03-25', views:1890, image:'',
      tags:['신규지정','정비구역','서울시'], featured:false }
  ],

  /* ──────────────────────────── 전문가 칼럼 ──────────────────────────── */
  columns: [
    { id:'c1', title:'2026 재개발 시장 전망과 투자전략', author:'김정민 변호사',
      authorRole:'법무법인 한울 대표변호사', avatar:'',
      summary:'올해 하반기 수도권 재개발 시장의 핵심 변수와 구역별 투자 전략을 분석합니다.',
      content:'2026년 재개발 시장은 크게 세 가지 변수에 의해 좌우될 전망입니다.\n\n**첫째, 금리 정책입니다.** 한국은행이 연내 기준금리를 추가 인하할 경우, 부동산 시장 전반에 유동성이 유입되면서 재개발 프리미엄도 상승 압력을 받을 것입니다.\n\n**둘째, 정비사업 촉진법입니다.** 서울시의 정비사업 촉진 특별법은 인허가 기간을 대폭 단축시킬 것으로 예상되며, 이는 사업 리스크를 줄여 투자 매력도를 높일 것입니다.\n\n**셋째, 공급 물량입니다.** 2026~2028년 수도권 입주 물량이 역대 최저 수준으로 예상되면서, 신규 주택에 대한 수요가 재개발 구역으로 이동할 가능성이 높습니다.\n\n**투자전략 제언:**\n- 사업시행인가 전후 구역에 주목\n- 비례율 100% 이상 구역 우선 검토\n- 교통 호재(GTX, 신규 노선) 수혜 구역 장기 투자 고려\n- 분담금 추정이 명확한 구역 위주로 안전 투자',
      date:'2026-04-01', views:3250, tags:['투자전략','시장전망'], featured:true },
    { id:'c2', title:'조합원 분담금, 이것만 알면 된다', author:'박세영 세무사',
      authorRole:'세무법인 더파트너스 대표', avatar:'',
      summary:'비례율, 권리가액, 분담금의 관계를 실제 사례로 쉽게 풀어드립니다.',
      content:'재개발·재건축 조합원이라면 반드시 이해해야 할 핵심 개념이 바로 \"분담금\"입니다.\n\n**분담금이란?**\n조합원이 새 아파트를 받기 위해 추가로 납부해야 하는 금액입니다.\n\n**계산 공식:**\n분담금 = 조합원 분양가 - 권리가액\n권리가액 = 종전자산 감정평가액 × 비례율\n비례율 = (종후자산 총액 - 총사업비) ÷ 종전자산 총액 × 100\n\n**실제 사례로 알아보기:**\n- 종전자산 감정평가액: 5억원\n- 비례율: 110%\n- 권리가액: 5억 × 110% = 5.5억원\n- 조합원 분양가(84㎡): 7억원\n- 분담금: 7억 - 5.5억 = 1.5억원\n\n비례율이 높을수록 분담금은 줄어들고, 종전자산 평가액이 높을수록 유리합니다.',
      date:'2026-03-28', views:5120, tags:['분담금','비례율','세금'], featured:true },
    { id:'c3', title:'입주권 vs 분양권, 뭐가 유리할까?', author:'이현우 공인중개사',
      authorRole:'한강부동산중개법인 대표', avatar:'',
      summary:'세금, 수익률, 리스크 관점에서 입주권과 분양권의 장단점을 비교합니다.',
      content:'입주권과 분양권, 겉보기에는 비슷해 보이지만 세금·수익률·리스크 면에서 큰 차이가 있습니다.\n\n**1. 세금 차이**\n- 입주권: 취득세 약 2.96%(원시취득) 또는 1.1~3.5%(승계취득, 가격대별 상이) — 세율은 취득 유형에 따라 다르므로 세무사 상담 권장\n- 분양권: 취득세 면제(잔금 시 부과), 양도세 단기 중과\n\n**2. 수익률**\n- 입주권: 사업 초기 매수 시 수익률 극대화 가능\n- 분양권: 청약 당첨 시 초기 자본 부담 적음\n\n**3. 리스크**\n- 입주권: 사업 지연, 추가 분담금 리스크\n- 분양권: 전매 제한, 실거주 의무\n\n**결론:** 투자 목적이라면 사업시행인가 단계의 입주권이, 실거주 목적이라면 분양권이 유리한 경우가 많습니다.',
      date:'2026-03-25', views:4080, tags:['입주권','분양권','비교분석'], featured:true },
    { id:'c4', title:'재개발 세금 절약 핵심 가이드', author:'송미란 세무사',
      authorRole:'세무법인 승우 파트너', avatar:'',
      summary:'재개발 투자 시 반드시 알아야 할 세금 절약 포인트를 정리합니다.',
      content:'재개발 투자에서 세금은 수익률을 좌우하는 핵심 변수입니다.\n\n**양도소득세 절약법:**\n1. 1세대 1주택 비과세 요건 충족 (2년 보유+거주)\n2. 장기보유특별공제 활용 (최대 80% 공제)\n3. 대체주택 취득 시 비과세 특례\n\n**취득세 절약법:**\n1. 조합원 입주권은 원시취득으로 2.96% 적용\n2. 85㎡ 이하 주택은 취득세 감면\n\n**종합부동산세:**\n1. 재개발 구역 내 주택은 멸실 후 주택 수 제외\n2. 관리처분인가 후에는 토지로 분류',
      date:'2026-03-22', views:3890, tags:['세금','절세','양도세'], featured:false },
    { id:'c5', title:'재건축 안전진단, A부터 Z까지', author:'최건호 건축사',
      authorRole:'구조안전기술사사무소 소장', avatar:'',
      summary:'재건축 안전진단의 평가 항목, 절차, 통과 기준을 상세히 해설합니다.',
      content:'재건축의 첫 관문인 안전진단. 평가 항목과 절차를 정확히 이해해야 합니다.\n\n**평가 항목 (4개 분야):**\n1. 구조안전성 (30점) - 내력벽, 기둥, 보의 상태\n2. 건축마감·설비 (25점) - 외벽, 지붕, 설비 노후도\n3. 주거환경 (25점) - 소음, 일조, 환기, 에너지효율\n4. 비용분석 (20점) - 보수비용 대비 재건축 비용\n\n**통과 기준:** 종합점수 30점 이하 (D등급)\n\n**절차:**\n정밀안전진단 → 적정성 검토 → 결과 통보 → 정비구역 지정',
      date:'2026-03-18', views:2650, tags:['재건축','안전진단','절차'], featured:false }
  ],

  /* ──────────────────────────── 커뮤니티 ──────────────────────────── */
  community: [
    { id:'p1', title:'한남3구역 입주권 지금 매수해도 될까요?', category:'질문',
      author:'투자초보맘', content:'한남3구역 입주권을 알아보고 있는데요. 현재 프리미엄이 5800만원 수준이라 좀 부담스럽기는 한데, 관리처분인가까지 나왔으니 안전한 투자인지 궁금합니다.\n\n현재 보유 현금은 약 13억 정도이고, 대출 없이 매수하고 싶은데 가능할까요? 분담금까지 합치면 총 얼마 정도 예상해야 할지도 알려주세요.',
      comments:23, views:1250, date:'2026-04-02 10:46', likes:45 },
    { id:'p2', title:'비례율 100% 넘는 구역 총정리 (2026년 4월)', category:'정보',
      author:'재개발전문가', content:'2026년 4월 기준 비례율 100% 이상인 구역을 정리해봤습니다.\n\n1. 둔촌주공 - 115%\n2. 한남3구역 - 112%\n3. 신길1구역 - 108%\n4. 흑석9구역 - 105%\n5. 노량진1구역 - 102%\n\n비례율이 100%를 넘는다는 건 종후자산이 사업비보다 크다는 의미로, 조합원 입장에서 유리한 상황입니다. 다만 이는 현재 감정평가 기준이며 향후 변동될 수 있습니다.',
      comments:45, views:3420, date:'2026-04-02 10:28', likes:128 },
    { id:'p3', title:'흑석9구역 조합원 총회 다녀왔습니다', category:'후기',
      author:'흑석주민', content:'오늘 흑석9구역 조합원 총회에 다녀왔습니다.\n\n주요 안건:\n1. 시공사 선정 건 - 대우건설 확정\n2. 관리처분계획 변경 건 - 원안 가결\n3. 추가 분담금 예상액 안내 - 84㎡ 기준 약 2.3억\n\n전체적으로 분위기가 좋았고, 예상보다 분담금이 적게 나와서 안도하는 분위기였습니다. 참석율도 72%로 높았습니다.',
      comments:18, views:890, date:'2026-04-02 09:00', likes:67 },
    { id:'p4', title:'이문1구역 급등 이유와 향후 전망 분석', category:'분석',
      author:'부동산분석가', content:'이문1구역 프리미엄이 최근 300만원이나 급등했습니다. 그 이유를 분석해보겠습니다.\n\n1. 동북선 경전철 확정: 이문역 신설로 더블 역세권화\n2. 정비사업 촉진법 수혜: 인허가 기간 단축 기대\n3. 주변 시세 상승: 이문·휘경 뉴타운 전반적 상승세\n4. 시공사 브랜드: 현대엔지니어링 선정으로 브랜드 프리미엄\n\n향후 전망: 관리처분인가 단계이므로 추가 상승 여력은 있으나, 단기 급등에 따른 조정 가능성도 있습니다.',
      comments:67, views:4560, date:'2026-04-01 22:15', likes:234 },
    { id:'p5', title:'재개발 투자 시 양도세 중과 어떻게 피하나요?', category:'질문',
      author:'세금고민맘', content:'현재 1주택자인데 재개발 입주권을 추가로 매수하려고 합니다. 이 경우 2주택이 되어 양도세 중과를 받게 되는지 궁금합니다.\n\n또한 관리처분인가 이후에는 입주권이 주택 수에 포함되지 않는다는 이야기를 들었는데 사실인가요?',
      comments:12, views:780, date:'2026-04-01 18:30', likes:23 },
    { id:'p6', title:'2026년 하반기 입주 예정 재개발 단지 목록', category:'정보',
      author:'입주정보통', content:'2026년 하반기 입주가 예정된 재개발·재건축 단지를 정리합니다.\n\n7월: 둔촌올림픽파크에비뉴포레 (12,032세대)\n8월: 래미안 원베일리 2차 (300세대)\n9월: 신반포 센트럴자이 (598세대)\n10월: 디에이치 클래스트 (549세대)\n11월: 래미안 라클래시 (1,097세대)\n12월: 힐스테이트 클래스티안 (865세대)',
      comments:34, views:2890, date:'2026-04-01 15:00', likes:89 },
    { id:'p7', title:'신길1구역 착공현장 방문 후기', category:'후기',
      author:'신길주민', content:'신길1구역이 드디어 착공했습니다! 현장에 다녀와서 후기를 남깁니다.\n\n현재 기존 건물 철거가 80% 정도 완료된 상태이고, 터파기 공사가 시작되었습니다. 현장 사무소에서 안내받은 바로는 2028년 3월 입주 예정이라고 합니다.\n\n현장 주변 교통 통제가 좀 심해서 주민분들 참고하시기 바랍니다.',
      comments:29, views:1560, date:'2026-04-01 10:00', likes:56 },
    { id:'p8', title:'재건축 초과이익환수제, 알아야 할 것들', category:'칼럼',
      author:'법률전문가K', content:'재건축 초과이익환수제가 부활하면서 재건축 투자자들의 관심이 높아지고 있습니다.\n\n핵심 내용:\n- 초과이익 = 준공 시점 집값 - 개시 시점 집값 - 정상 상승분 - 개발비용\n- 초과이익의 10~50%를 부담금으로 납부\n- 3억원까지 면제, 3~5억 10%, 5~7억 20%, 7~10억 30%, 10~15억 40%, 15억 초과 50%\n\n대응 전략:\n1. 1세대 1주택자 면제 요건 활용\n2. 장기보유 감면 적용\n3. 조합원 지위 양도 시점 최적화\n\n(2026년 현행 기준, 법 개정 시 변동 가능)',
      comments:51, views:3780, date:'2026-03-31 20:00', likes:167 }
  ],

  /* ──────────────────────────── FAQ ──────────────────────────── */
  faq: [
    { id:'f1', category:'일반', question:'세울은 어떤 서비스인가요?',
      answer:'세울은 대한민국 재개발·재건축·도시정비사업의 종합정보 플랫폼입니다. 전국 정비구역의 사업 현황, 실시간 시세, 매물 정보, 전문가 칼럼, 법률·세금 가이드 등을 제공하며, 비례율 계산기 등 실무 도구도 무료로 이용하실 수 있습니다.' },
    { id:'f2', category:'계정', question:'회원가입은 무료인가요?',
      answer:'네, 세울의 기본 회원가입은 완전 무료입니다. 이메일 인증만으로 가입이 완료되며, 시세 조회, 구역 정보 열람, 커뮤니티 이용 등 대부분의 서비스를 무료로 이용할 수 있습니다.' },
    { id:'f3', category:'시세', question:'프리미엄 시세는 어떻게 산정되나요?',
      answer:'프리미엄 시세는 실거래 데이터, 중개업소 호가, 전문가 평가를 종합하여 산정합니다. 매주 월요일 업데이트되며, 3.3㎡(1평)당 기준으로 표시됩니다. 실거래가와 차이가 있을 수 있으니 참고 자료로 활용해주세요.' },
    { id:'f4', category:'투자', question:'비례율이 뭔가요?',
      answer:'비례율은 정비사업의 수익성을 나타내는 핵심 지표입니다. 계산식은 (종후자산 총액 - 총사업비) ÷ 종전자산 총액 × 100입니다. 100% 이상이면 조합원 분담금 없이 새 아파트를 받을 수 있다는 의미이며, 낮을수록 추가 분담금이 커집니다. 실제 비례율은 공식 감정평가 결과에 따라 결정됩니다.' },
    { id:'f5', category:'투자', question:'입주권과 분양권의 차이는 뭔가요?',
      answer:'입주권은 재개발·재건축 조합원이 새 아파트를 받을 수 있는 권리이고, 분양권은 청약 당첨 후 분양받은 주택의 소유권을 이전받기 전 상태의 권리입니다. 세금, 전매 제한, 주택 수 산정 등에서 차이가 있습니다.' },
    { id:'f6', category:'일반', question:'매물 정보는 정확한가요?',
      answer:'매물 정보는 등록된 공인중개사가 직접 입력하며, 세울이 기본적인 검증을 수행합니다. 다만 시세 변동, 매물 상태 변경 등은 실시간 반영이 어려울 수 있으므로, 반드시 해당 중개사에 연락하여 최신 정보를 확인하시기 바랍니다.' },
    { id:'f7', category:'계정', question:'비밀번호를 잊어버렸어요.',
      answer:'로그인 페이지에서 \"비밀번호 찾기\"를 클릭하신 후, 가입 시 등록한 이메일 주소를 입력하시면 비밀번호 재설정 링크가 발송됩니다. 이메일이 오지 않는 경우 스팸함을 확인해주세요.' },
    { id:'f8', category:'시세', question:'관심구역 알림은 어떻게 설정하나요?',
      answer:'구역 상세 페이지에서 ☆ 아이콘을 눌러 관심구역으로 등록하시면, 해당 구역의 시세 변동, 사업 단계 변경, 주요 뉴스가 있을 때 알림을 받으실 수 있습니다. 알림 설정은 마이페이지에서 변경 가능합니다.' }
  ],

  /* ──────────────────────────── 공지사항 ──────────────────────────── */
  notices: [
    { id:'nt1', title:'[공지] 세울 서비스 오픈 안내', content:'안녕하세요, 세울입니다.\n\n대한민국 No.1 재개발·재건축 종합정보 플랫폼으로서 여러분께 최고의 서비스를 제공하기 위해 오픈하게 되었습니다.\n\n주요 서비스:\n- 전국 정비구역 현황 및 실시간 시세\n- 입주권·분양권 매물 정보\n- 비례율 계산기\n- 전문가 칼럼 및 법률·세금 가이드\n- 활발한 커뮤니티\n\n앞으로도 지속적인 업데이트로 더 나은 서비스를 제공하겠습니다. 감사합니다.', date:'2026-04-01', important:true },
    { id:'nt2', title:'[업데이트] 비례율 계산기 기능 개선 안내', content:'비례율 계산기에 다음 기능이 추가되었습니다.\n\n1. 분담금 시뮬레이션 기능\n2. 평형별 비교 기능\n3. PDF 다운로드 기능\n\n더 편리해진 계산기를 이용해보세요.', date:'2026-03-28', important:false },
    { id:'nt3', title:'[안내] 개인정보처리방침 개정 안내', content:'개인정보보호법 개정에 따라 개인정보처리방침이 일부 변경되었습니다.\n\n주요 변경사항:\n- 개인정보 보유기간 명확화\n- 제3자 제공 동의 절차 강화\n- 개인정보 파기 절차 상세화\n\n시행일: 2026년 4월 15일', date:'2026-03-25', important:true },
    { id:'nt4', title:'[점검] 4월 5일 시스템 정기점검 안내', content:'서비스 안정화를 위한 정기점검이 진행됩니다.\n\n일시: 2026년 4월 5일 (토) 02:00 ~ 06:00\n영향: 전 서비스 일시 중단\n\n점검 시간 동안에는 서비스 이용이 불가합니다. 양해 부탁드립니다.', date:'2026-03-20', important:false }
  ],

  /* ──────────────────────────── 일정 ──────────────────────────── */
  schedule: [
    { id:'s1', date:'2026-04-05', title:'한남3구역 조합원 총회', area:'한남3구역', description:'관리처분계획 변경 안건' },
    { id:'s2', date:'2026-04-08', title:'이문1구역 관리처분 공람', area:'이문1구역', description:'분양설계 열람 기간 시작' },
    { id:'s3', date:'2026-04-12', title:'서울시 정비사업 설명회', area:'', description:'시청 대강당, 14:00' },
    { id:'s4', date:'2026-04-15', title:'흑석9구역 시공사 선정', area:'흑석9구역', description:'입찰 마감 및 결과 발표' },
    { id:'s5', date:'2026-04-20', title:'신길1구역 착공식', area:'신길1구역', description:'현장 착공 기념행사' },
    { id:'s6', date:'2026-04-25', title:'장위4구역 추진위 회의', area:'장위4구역', description:'사업시행인가 추진 안건' },
    { id:'s7', date:'2026-05-02', title:'노량진1구역 조합 총회', area:'노량진1구역', description:'시공사 선정 안건' },
    { id:'s8', date:'2026-05-10', title:'둔촌주공 입주 설명회', area:'둔촌주공', description:'입주 절차 및 하자보수 안내' }
  ],

  /* ──────────────────────────── 배너 ──────────────────────────── */
  banners: [
    { id:'b1', title:'2026 정비사업 촉진법 시행', subtitle:'인허가 기간 대폭 단축', link:'/pages/news-detail.html?id=n1', order:1, active:true, type:'hero' },
    { id:'b2', title:'비례율 계산기 오픈', subtitle:'내 분담금을 미리 계산해보세요', link:'/pages/calculator.html', order:2, active:true, type:'hero' },
    { id:'b3', title:'무료 재개발 상담', subtitle:'전문 컨설턴트 1:1 맞춤 상담', link:'/pages/contact.html', order:1, active:true, type:'side' }
  ],

  /* ──────────────────────────── 문의 ──────────────────────────── */
  inquiries: [
    { id:'q1', name:'이철수', email:'lee@test.com', phone:'010-1111-2222', type:'시세문의',
      title:'한남3구역 최신 시세 문의', content:'한남3구역 전용 84㎡ 기준 현재 정확한 프리미엄과 총 매수비용이 궁금합니다.',
      status:'답변완료', answer:'현재 한남3구역 전용 84㎡ 기준 프리미엄은 약 5,800만원/3.3㎡ 수준입니다. 총 매수비용은 약 12~13억원 수준이며, 분담금 포함 시 약 14~15억원입니다.', date:'2026-03-28', answeredAt:'2026-03-29' },
    { id:'q2', name:'박영미', email:'park@test.com', phone:'010-3333-4444', type:'투자상담',
      title:'재개발 투자 초보 상담 요청', content:'재개발 투자를 처음 시작하려고 합니다. 투자금 5억 기준으로 추천할 만한 구역이 있을까요?',
      status:'접수', answer:'', date:'2026-04-01', answeredAt:'' },
    { id:'q3', name:'정민호', email:'jung@test.com', phone:'010-5555-6666', type:'법률상담',
      title:'조합원 지위 양도 관련 법률 문의', content:'조합원 지위를 양도할 때 필요한 서류와 절차가 궁금합니다. 양도세도 어떻게 되는지 알려주세요.',
      status:'처리중', answer:'', date:'2026-03-30', answeredAt:'' }
  ],

  /* ──────────────────────────── 회원 ──────────────────────────── */
  members: [
    { id:'m1', name:'홍길동', email:'admin@jaegaebal.com', phone:'010-0000-0000', role:'admin', joinDate:'2026-01-01', status:'활성' },
    { id:'m2', name:'김민수', email:'kim@test.com', phone:'010-1234-5678', role:'user', joinDate:'2026-02-15', status:'활성' },
    { id:'m3', name:'박영희', email:'park2@test.com', phone:'010-2345-6789', role:'user', joinDate:'2026-03-01', status:'활성' },
    { id:'m4', name:'이준혁', email:'lee2@test.com', phone:'010-3456-7890', role:'user', joinDate:'2026-03-10', status:'활성' },
    { id:'m5', name:'정수현', email:'jung2@test.com', phone:'010-4567-8901', role:'user', joinDate:'2026-03-15', status:'휴면' }
  ],

  /* ──────────────────────────── 사이트 설정 ──────────────────────────── */
  settings: {
    siteName: '세울',
    siteDescription: '대한민국 No.1 재개발·재건축 종합정보 플랫폼',
    siteKeywords: '재개발,재건축,도시정비,입주권,분양권,비례율,분담금,프리미엄',
    contactPhone: '1588-0000',
    contactEmail: 'info@jaegaebal.com',
    address: '서울특별시 강남구 테헤란로 123 재개발빌딩 5층',
    businessNumber: '000-00-00000',
    ceo: '홍길동',
    workingHours: '평일 09:00 – 18:00 / 토요일 09:00 – 13:00 (공휴일 휴무)',
    maintenanceMode: false,
    popupEnabled: false,
    popupTitle: '',
    popupContent: '',
    ogImage: '/assets/img/og-image.png'
  },

  /* ──────────────────────────── 법률·세금 가이드 ──────────────────────────── */
  legalGuides: [
    { id:'lg1', category:'양도소득세', title:'재개발 입주권 양도세 완전 가이드',
      content:'재개발 입주권을 양도할 때 발생하는 양도소득세에 대해 상세히 안내합니다.\n\n**1. 과세 기준**\n- 양도차익 = 양도가액 - 취득가액 - 필요경비\n- 기본공제: 250만원\n\n**2. 세율**\n- 1년 미만 보유: 70%\n- 1년 이상 2년 미만: 60%\n- 2년 이상: 기본세율 (6~45%)\n\n**3. 비과세 요건**\n- 1세대 1주택 + 2년 보유 + 2년 거주\n- 관리처분인가 이후 입주권은 주택으로 간주\n\n**4. 장기보유특별공제**\n- 3년 이상 보유 시 연 2% (최대 30%)\n- 거주 요건 충족 시 연 4% 추가 (최대 40%)\n- 합계 최대 80% 공제' },
    { id:'lg2', category:'취득세', title:'재개발·재건축 취득세 총정리',
      content:'재개발·재건축 관련 취득세를 항목별로 정리합니다.\n\n**1. 조합원 입주권 취득**\n- 원시취득: 2.96% (취득세 2.8% + 농특세 0.16%)\n- 85㎡ 초과: 3.16% (교육세 추가)\n\n**2. 승계취득 (매매)**\n- 6억 이하: 1.1%\n- 6~9억: 2.2%\n- 9억 초과: 3.3%\n- 다주택자 중과: 8~12%\n\n**3. 분양권 취득**\n- 잔금 납부 시 취득세 발생\n- 85㎡ 이하: 1.1~3.3%\n- 85㎡ 초과: 추가 0.2%' },
    { id:'lg3', category:'종합부동산세', title:'정비구역 내 부동산 종부세 가이드',
      content:'정비구역 내 부동산의 종합부동산세 처리 방법을 안내합니다.\n\n**1. 관리처분인가 전**\n- 기존 주택으로 과세\n- 주택 수에 포함\n\n**2. 관리처분인가 후**\n- 토지분만 종부세 과세\n- 주택분 종부세에서 제외\n- 입주권은 별도 관리\n\n**3. 대체주택 특례**\n- 관리처분인가일 이전 취득한 대체주택\n- 1세대 1주택 특례 적용 가능\n- 완공 후 2년 내 기존 주택 처분 필요' },
    { id:'lg4', category:'절차·서류', title:'재개발 사업 단계별 필요 서류',
      content:'재개발 사업 각 단계에서 필요한 서류를 정리합니다.\n\n**1. 조합설립인가**\n- 토지등기부등본\n- 건축물대장\n- 동의서 (재개발: 토지등소유자 70% 이상, 재건축: 구분소유자 70% 이상 — 2025년 개정 기준)\n\n**2. 사업시행인가**\n- 사업시행계획서\n- 설계도서\n- 환경영향평가서\n\n**3. 관리처분인가**\n- 관리처분계획서\n- 감정평가서 (2개 이상 감정평가법인)\n- 분양설계\n\n**4. 이주·철거**\n- 이주확인서\n- 보상금 수령 서류\n- 주민등록 이전 신고' }
  ],

  /* ──────────────────────────── 회사정보 ──────────────────────────── */
  companyInfo: {
    ceoName: '이창우',
    ceoTitle: '대표이사',
    ceoGreeting: '(주)세울엔지니어링은 재개발·재건축·소규모정비사업 전 과정에서\n조합원과 토지등소유자의 이익을 최우선으로 생각하며,\n사업성 검토부터 인허가, 총회 운영, 이해관계 조율까지\n체계적이고 투명한 정비사업 관리 서비스를 제공합니다.\n\n수십 건의 정비사업 수행 경험을 바탕으로\n각 구역의 특성에 맞는 맞춤형 전략을 수립하고,\n조합 운영의 효율성과 사업 추진의 안정성을 동시에 확보합니다.\n\n앞으로도 도시의 미래를 함께 세우는 신뢰할 수 있는 파트너가 되겠습니다.',
    history: [
      { year:'2026', items:['한남3구역 정비사업 수탁'] },
      { year:'2025', items:['정비사업 컨설팅 업무 개시','서울시 도시정비 협력업체 등록'] },
      { year:'2024', items:['도시정비 PM 사업부 신설','소규모정비사업 전문팀 구성'] },
      { year:'2023', items:['부동산개발 컨설팅 사업 시작','재개발·재건축 전문인력 확보'] },
      { year:'2022', items:['(주)세울엔지니어링으로 상호 변경'] },
      { year:'2019', items:['정비사업전문관리업 등록 (현산)','법인 설립'] }
    ],
    departments: [
      { name:'정비사업본부', teams:['재개발사업팀','재건축사업팀','소규모정비팀'] },
      { name:'기술본부', teams:['설계·인허가팀','감리팀','사업성분석팀'] },
      { name:'경영지원본부', teams:['총무·인사팀','재무·회계팀','법무팀'] }
    ],
    businessAreas: [
      { id:'ba1', title:'주택재개발 정비사업', icon:'fa-solid fa-building', desc:'노후·불량 주거지역의 주거환경을 개선하고 도시기능을 회복하는 재개발 사업 전 과정을 관리합니다.', details:'기본계획 수립 → 정비구역 지정 → 조합설립 → 사업시행인가 → 관리처분 → 착공·준공까지 전 단계 실무 지원' },
      { id:'ba2', title:'주택재건축 정비사업', icon:'fa-solid fa-city', desc:'기존 공동주택을 철거하고 새로운 주거단지를 건설하는 재건축 사업의 인허가와 조합 운영을 지원합니다.', details:'안전진단 → 정비계획 수립 → 조합설립인가 → 시공사 선정 → 사업시행·관리처분 → 이주·착공' },
      { id:'ba3', title:'소규모주택 정비사업', icon:'fa-solid fa-house-chimney', desc:'자율주택, 가로주택, 소규모재건축 등 소규모 정비사업의 기획부터 준공까지 원스톱 관리합니다.', details:'사업성 검토 → 조합설립/토지등소유자 동의 → 건축심의 → 사업시행인가 → 시공·감리 → 준공' },
      { id:'ba4', title:'도시계획(엔지니어링)', icon:'fa-solid fa-drafting-compass', desc:'도시계획 수립, 정비구역 지정, 용도지역 변경 등 도시공간 재편을 위한 엔지니어링 서비스를 제공합니다.', details:'기초조사 → 도시계획 수립 → 도시계획위원회 심의 대응 → 정비구역 지정 고시 → 후속 인허가 연계' },
      { id:'ba5', title:'정비구역지정·도시계획', icon:'fa-solid fa-map-location-dot', desc:'정비구역 지정을 위한 도시계획 수립과 행정 절차 대응, 도시·주거환경정비 기본계획 컨설팅을 수행합니다.', details:'기초조사 → 정비계획 수립 → 도시계획위원회 심의 → 정비구역 지정 고시 → 후속 인허가 연계' },
      { id:'ba6', title:'사업성분석(타당성 검토)', icon:'fa-solid fa-chart-pie', desc:'정비사업의 수익성과 실현 가능성을 종합 분석하여 사업 추진 여부와 최적 전략을 도출합니다.', details:'토지·건물 현황 분석 → 개발규모 산정 → 사업비·분담금 추정 → 비례율 시뮬레이션 → 타당성 보고서 작성' },
      { id:'ba7', title:'신속통합기획', icon:'fa-solid fa-forward-fast', desc:'서울시 신속통합기획 제도를 활용하여 정비사업 절차를 단축하고, 규제 유연화·디자인 혁신을 통해 사업을 빠르게 추진합니다.', details:'후보지 선정 → 통합기획안 수립 → 도시계획위원회 통합심의 → 정비계획·구역지정 일괄 처리 → 사업 착수' },
      { id:'ba8', title:'도시정비 PM/CM', icon:'fa-solid fa-diagram-project', desc:'정비사업 전문관리(PM)와 건설사업관리(CM) 서비스를 통해 사업 전반의 품질과 일정을 관리합니다.', details:'사업타당성 분석 → 추진전략 수립 → 설계·시공 관리 → 원가·공정 관리 → 준공 후 하자관리' }
    ]
  },

  /* ──────────────────────────── 업무실적 ──────────────────────────── */
  portfolio: [
    { id:'pf1', name:'한남3구역 주택재개발 정비사업', type:'재개발', district:'용산구', status:'진행중', year:'2026', scale:'5,200세대', role:'정비사업전문관리', description:'한남뉴타운 최대 규모 정비구역의 사업시행부터 관리처분까지 전 과정 관리', featured:true },
    { id:'pf2', name:'흑석9구역 주택재개발 정비사업', type:'재개발', district:'동작구', status:'진행중', year:'2025', scale:'3,800세대', role:'정비사업전문관리', description:'한강 조망 프리미엄 구역의 조합 운영 지원 및 시공사 선정 자문', featured:true },
    { id:'pf3', name:'이문1구역 주택재개발 정비사업', type:'재개발', district:'동대문구', status:'진행중', year:'2025', scale:'4,100세대', role:'사업성분석·인허가', description:'관리처분인가 단계 핵심 실무 및 분양설계 검토', featured:false },
    { id:'pf4', name:'둔촌주공 재건축 정비사업', type:'재건축', district:'강동구', status:'완료', year:'2024', scale:'12,032세대', role:'사업관리 자문', description:'국내 최대 규모 재건축 사업의 준공 단계 사업관리 자문', featured:true },
    { id:'pf5', name:'은마아파트 재건축 추진', type:'재건축', district:'강남구', status:'진행중', year:'2026', scale:'4,424세대', role:'추진전략 수립', description:'안전진단 통과 후 정비계획 수립 및 조합설립 추진 지원', featured:false },
    { id:'pf6', name:'신길1구역 주택재개발 정비사업', type:'재개발', district:'영등포구', status:'진행중', year:'2024', scale:'3,200세대', role:'착공·시공관리', description:'착공 단계 시공관리 및 조합원 이주 지원 실무', featured:false },
    { id:'pf7', name:'성수동 가로주택 정비사업', type:'소규모정비', district:'성동구', status:'완료', year:'2025', scale:'120세대', role:'사업 전과정 관리', description:'가로주택정비사업 기획부터 준공까지 원스톱 관리 수행', featured:false },
    { id:'pf8', name:'장위4구역 주택재개발 정비사업', type:'재개발', district:'성북구', status:'진행중', year:'2025', scale:'2,800세대', role:'조합운영 지원', description:'조합설립 단계의 동의서 징구 및 총회 운영 지원', featured:false },
    { id:'pf9', name:'수색13구역 주택재개발 정비사업', type:'재개발', district:'은평구', status:'진행중', year:'2026', scale:'1,500세대', role:'정비구역 지정 지원', description:'기본계획 수립 및 정비구역 지정 관련 행정 절차 대응', featured:false },
    { id:'pf10', name:'방배동 소규모재건축 정비사업', type:'소규모정비', district:'서초구', status:'완료', year:'2024', scale:'85세대', role:'사업 전과정 관리', description:'소규모재건축 사업 인허가 및 시공관리 전 과정 수행', featured:false }
  ],

  /* ──────────────────────────── 자료실 ──────────────────────────── */
  library: [
    { id:'lib1', category:'서식', title:'조합설립인가 신청서 서식', description:'정비사업 조합설립인가 신청 시 필요한 서식 일체', fileType:'hwp', fileSize:'245KB', date:'2026-03-15', downloads:156, tags:['조합설립','서식'] },
    { id:'lib2', category:'서식', title:'관리처분계획 변경인가 신청서', description:'관리처분계획 변경 시 제출하는 인가 신청서 양식', fileType:'hwp', fileSize:'312KB', date:'2026-03-10', downloads:98, tags:['관리처분','서식'] },
    { id:'lib3', category:'서식', title:'정비사업 조합원 총회 위임장', description:'조합원 총회 참석이 어려울 경우 사용하는 위임장 양식', fileType:'pdf', fileSize:'89KB', date:'2026-02-28', downloads:234, tags:['총회','위임장'] },
    { id:'lib4', category:'법령', title:'2026년 도시정비법 주요 개정 내용 요약', description:'도시정비법 2026년 7대 핵심 개정사항 전후 비교 및 영향 분석', fileType:'pdf', fileSize:'1.2MB', date:'2026-04-04', downloads:312, tags:['도정법','법령','개정'] },
    { id:'lib5', category:'법령', title:'서울시 정비사업 운영 가이드라인', description:'서울특별시 정비사업 운영 및 관리 기준 가이드라인', fileType:'pdf', fileSize:'3.8MB', date:'2025-12-20', downloads:187, tags:['서울시','가이드라인'] },
    { id:'lib6', category:'법령', title:'소규모주택정비법 시행령', description:'소규모주택 정비에 관한 특례법 시행령 전문', fileType:'pdf', fileSize:'890KB', date:'2025-11-15', downloads:145, tags:['소규모정비','시행령'] },
    { id:'lib7', category:'가이드', title:'정비사업 단계별 업무 체크리스트', description:'7단계 35개 업무 체크리스트 — 인쇄하여 실무에 바로 활용 가능', fileType:'pdf', fileSize:'156KB', date:'2026-04-04', downloads:278, tags:['체크리스트','단계별','실무'] },
    { id:'lib8', category:'가이드', title:'조합원 분담금 산정 완전 가이드', description:'비례율 공식, 권리가액, 분담금 산정법 + 실제 사례 분석 + FAQ', fileType:'pdf', fileSize:'2.1MB', date:'2026-04-04', downloads:345, tags:['분담금','비례율','계산'] },
    { id:'lib9', category:'가이드', title:'시공사 선정 평가 기준 해설', description:'정비사업 시공사 선정 시 평가 항목별 해설과 사례 분석', fileType:'pdf', fileSize:'1.5MB', date:'2026-01-28', downloads:167, tags:['시공사','선정'] },
    { id:'lib10', category:'가이드', title:'정비사업 감정평가 이해하기', description:'토지·건물 감정평가의 기준과 절차, 이의신청 방법 안내', fileType:'pdf', fileSize:'980KB', date:'2025-12-10', downloads:203, tags:['감정평가','가이드'] },
    { id:'lib11', category:'지침', title:'조합설립인가 신청 완전 가이드', description:'법적 근거, 동의율, 필요서류 17종 체크리스트, 절차 흐름도, 비용 안내', fileType:'pdf', fileSize:'1.8MB', date:'2026-04-04', downloads:124, tags:['조합설립','지침','인가'] },
    { id:'lib12', category:'지침', title:'정비구역 안전진단 실시 지침', description:'안전진단 대상 선정 기준, 평가 절차, 등급 판정 기준 안내', fileType:'pdf', fileSize:'2.3MB', date:'2026-02-22', downloads:98, tags:['안전진단','지침'] },
    { id:'lib13', category:'지침', title:'정비사업 회계처리 지침', description:'조합 회계 기준, 자금 집행 절차, 감사 대응 매뉴얼', fileType:'pdf', fileSize:'1.1MB', date:'2026-01-15', downloads:87, tags:['회계','지침'] },
    { id:'lib17', category:'지침', title:'정비사업 시공자 선정 업무 지침', description:'시공사 입찰 공고, 평가 기준, 선정 절차 및 계약 체결 지침', fileType:'pdf', fileSize:'1.5MB', date:'2026-03-25', downloads:76, tags:['시공자선정','지침'] },
    { id:'lib18', category:'지침', title:'정비구역 주민이주 및 보상 지침', description:'이주 일정 수립, 이주비 산정, 세입자 보상 절차 매뉴얼', fileType:'pdf', fileSize:'2.0MB', date:'2026-02-10', downloads:112, tags:['이주보상','지침'] },
    { id:'lib14', category:'보도자료', title:'2026년 1분기 정비사업 정책 동향 종합', description:'국토부·서울시·지자체 정비사업 정책 9건 종합 분석 + 대응 방안', fileType:'pdf', fileSize:'560KB', date:'2026-04-04', downloads:412, tags:['정책동향','보도자료','2026'] },
    { id:'lib15', category:'보도자료', title:'서울시 신속통합기획 2단계 대상지 선정', description:'서울시 신속통합기획 2단계 25개 구역 선정 결과 발표', fileType:'pdf', fileSize:'780KB', date:'2026-02-18', downloads:356, tags:['신속통합기획','보도자료'] },
    { id:'lib16', category:'보도자료', title:'소규모정비사업 특례법 개정안 국회 통과', description:'소규모정비사업 범위 확대 및 절차 간소화 내용 포함', fileType:'pdf', fileSize:'320KB', date:'2026-01-25', downloads:289, tags:['소규모정비','보도자료'] },
    { id:'lib19', category:'보도자료', title:'1기 신도시 정비사업 특별법 시행', description:'분당·일산·평촌·중동·산본 1기 신도시 재건축 특별법 시행 안내', fileType:'pdf', fileSize:'450KB', date:'2026-03-28', downloads:523, tags:['1기신도시','보도자료'] },
    { id:'lib20', category:'보도자료', title:'공공재개발 2차 후보지 10곳 추가 선정', description:'국토부 공공재개발 사업 2차 후보지 선정 결과 및 향후 일정 안내', fileType:'pdf', fileSize:'680KB', date:'2026-03-12', downloads:378, tags:['공공재개발','보도자료'] },
    { id:'lib21', category:'서식', title:'조합설립추진위원회 운영규정', description:'[국토교통부 행정규칙] 추진위 구성·운영·해산 운영규정 전문 (법제처 원문 링크)', fileType:'pdf', fileSize:'75KB', date:'2026-04-04', downloads:0, tags:['추진위원회','운영규정','행정규칙'] }
  ],

  /* ──────────────────────────── 관리자 계정 ──────────────────────────── */
  adminAccount: {
    username: 'admin',
    password: 'admin1234',
    name: '관리자'
  }
};

/* 전역 사용 가능하도록 export */
if (typeof window !== 'undefined') window.MOCK = MOCK;
