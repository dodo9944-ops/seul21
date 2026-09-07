var OfficeData = {
  adminAccount: { username: 'admin', password: 'admin1234', name: '이찬호', role: '대표이사', department: '경영지원팀', email: 'ceo@seul21.com', phone: '010-2230-9210' },
  settings: { companyName: '세울엔지니어링', ceo: '이찬호', address: '경기도 하남시 감일백제로 70, 204동 1104호', phone: '02-6925-0720', bizNo: '474-81-02756', workStart: '09:00', workEnd: '18:00', lunchStart: '12:00', lunchEnd: '13:00' },
  departments: [
    { id: 'dept1', name: '경영지원팀', head: '이찬호', memberCount: 3, color: '#2563EB' },
    { id: 'dept2', name: '도시정비1팀', head: '박상민', memberCount: 3, color: '#22C55E' },
    { id: 'dept3', name: '도시정비2팀', head: '김영수', memberCount: 2, color: '#F59E0B' },
    { id: 'dept4', name: '기술팀', head: '정현우', memberCount: 2, color: '#8B5CF6' },
    { id: 'dept5', name: '영업팀', head: '최동혁', memberCount: 2, color: '#EF4444' }
  ],
  employees: [
    { id: 'emp1', name: '이찬호', department: '경영지원팀', position: '대표이사', email: 'ceo@seul21.com', phone: '010-2230-9210', joinDate: '2020-03-01', status: 'active' },
    { id: 'emp2', name: '한지은', department: '경영지원팀', position: '과장', email: 'han@seul21.com', phone: '010-3344-5566', joinDate: '2021-06-15', status: 'active' },
    { id: 'emp3', name: '오세연', department: '경영지원팀', position: '사원', email: 'oh@seul21.com', phone: '010-7788-9900', joinDate: '2024-01-02', status: 'active' },
    { id: 'emp4', name: '박상민', department: '도시정비1팀', position: '팀장', email: 'park@seul21.com', phone: '010-1122-3344', joinDate: '2020-08-01', status: 'active' },
    { id: 'emp5', name: '김도윤', department: '도시정비1팀', position: '대리', email: 'kimd@seul21.com', phone: '010-5566-7788', joinDate: '2022-03-15', status: 'active' },
    { id: 'emp6', name: '이수빈', department: '도시정비1팀', position: '사원', email: 'lee@seul21.com', phone: '010-9900-1122', joinDate: '2025-02-01', status: 'active' },
    { id: 'emp7', name: '김영수', department: '도시정비2팀', position: '팀장', email: 'kimy@seul21.com', phone: '010-2233-4455', joinDate: '2021-01-10', status: 'active' },
    { id: 'emp8', name: '장서윤', department: '도시정비2팀', position: '대리', email: 'jang@seul21.com', phone: '010-6677-8899', joinDate: '2023-05-20', status: 'leave' },
    { id: 'emp9', name: '정현우', department: '기술팀', position: '팀장', email: 'jung@seul21.com', phone: '010-3344-1122', joinDate: '2020-11-01', status: 'active' },
    { id: 'emp10', name: '윤지민', department: '기술팀', position: '대리', email: 'yoon@seul21.com', phone: '010-7788-3344', joinDate: '2023-09-01', status: 'active' },
    { id: 'emp11', name: '최동혁', department: '영업팀', position: '팀장', email: 'choi@seul21.com', phone: '010-4455-6677', joinDate: '2021-04-01', status: 'active' },
    { id: 'emp12', name: '신하영', department: '영업팀', position: '사원', email: 'shin@seul21.com', phone: '010-8899-0011', joinDate: '2025-07-01', status: 'active' }
  ],
  approvals: [
    { id: 'ap1', type: '지출결의서', title: '4월 사무용품 구매 결의', content: '프린터 토너 및 사무용품 일괄 구매 요청합니다.', requester: '한지은', requesterDept: '경영지원팀', status: '대기', createdAt: '2026-04-01T09:30:00', amount: 350000, priority: '일반', attachments: 1, approvalLine: [{ name: '한지은', position: '과장', status: '요청', date: '2026-04-01' }, { name: '이찬호', position: '대표이사', status: '대기', date: '' }] },
    { id: 'ap2', type: '휴가신청서', title: '연차 휴가 신청 (4/7~4/8)', content: '개인 사유로 연차 사용합니다.', requester: '김도윤', requesterDept: '도시정비1팀', status: '승인', createdAt: '2026-03-28T14:00:00', priority: '일반', attachments: 0, approvalLine: [{ name: '김도윤', position: '대리', status: '요청', date: '2026-03-28' }, { name: '박상민', position: '팀장', status: '승인', date: '2026-03-29' }, { name: '이찬호', position: '대표이사', status: '승인', date: '2026-03-29' }] },
    { id: 'ap3', type: '출장신청서', title: '서울시청 정비사업 협의 출장', content: '서울시 도시정비과 협의를 위한 출장입니다.', requester: '박상민', requesterDept: '도시정비1팀', status: '대기', createdAt: '2026-04-02T10:00:00', amount: 50000, priority: '긴급', attachments: 0, approvalLine: [{ name: '박상민', position: '팀장', status: '요청', date: '2026-04-02' }, { name: '이찬호', position: '대표이사', status: '대기', date: '' }] },
    { id: 'ap4', type: '품의서', title: 'CAD 소프트웨어 라이선스 갱신', content: 'AutoCAD 2026 라이선스 5석 연간 갱신 요청.', requester: '정현우', requesterDept: '기술팀', status: '대기', createdAt: '2026-04-03T11:00:00', amount: 12000000, priority: '일반', attachments: 2, approvalLine: [{ name: '정현우', position: '팀장', status: '요청', date: '2026-04-03' }, { name: '한지은', position: '과장', status: '대기', date: '' }, { name: '이찬호', position: '대표이사', status: '대기', date: '' }] },
    { id: 'ap5', type: '기안서', title: '2026년 2분기 업무 계획', content: '2분기 도시정비 사업 추진 계획 보고드립니다.', requester: '김영수', requesterDept: '도시정비2팀', status: '승인', createdAt: '2026-03-25T09:00:00', priority: '일반', attachments: 3, approvalLine: [{ name: '김영수', position: '팀장', status: '요청', date: '2026-03-25' }, { name: '이찬호', position: '대표이사', status: '승인', date: '2026-03-26' }] },
    { id: 'ap6', type: '지출결의서', title: '클라이언트 미팅 식대', content: '강남구청 담당자 업무 미팅 식대 청구합니다.', requester: '최동혁', requesterDept: '영업팀', status: '반려', createdAt: '2026-03-30T16:00:00', amount: 180000, priority: '일반', attachments: 1, approvalLine: [{ name: '최동혁', position: '팀장', status: '요청', date: '2026-03-30' }, { name: '이찬호', position: '대표이사', status: '반려', date: '2026-03-31' }] },
    { id: 'ap7', type: '휴가신청서', title: '오전 반차 신청 (4/10)', content: '병원 진료를 위한 오전 반차 신청합니다.', requester: '이수빈', requesterDept: '도시정비1팀', status: '대기', createdAt: '2026-04-05T09:00:00', priority: '일반', attachments: 0, approvalLine: [{ name: '이수빈', position: '사원', status: '요청', date: '2026-04-05' }, { name: '박상민', position: '팀장', status: '대기', date: '' }] },
    { id: 'ap8', type: '지출결의서', title: '택시비 청구 (현장 조사)', content: '가산동 재건축 현장 조사 택시비 청구.', requester: '윤지민', requesterDept: '기술팀', status: '임시저장', createdAt: '2026-04-04T17:00:00', amount: 45000, priority: '일반', attachments: 0, approvalLine: [{ name: '윤지민', position: '대리', status: '요청', date: '' }] },
    { id: 'ap9', type: '출장신청서', title: '하남시 감일지구 현장 방문', content: '감일지구 정비사업 현장 점검 출장.', requester: '김영수', requesterDept: '도시정비2팀', status: '승인', createdAt: '2026-03-20T08:30:00', amount: 30000, priority: '일반', attachments: 0, approvalLine: [{ name: '김영수', position: '팀장', status: '요청', date: '2026-03-20' }, { name: '이찬호', position: '대표이사', status: '승인', date: '2026-03-21' }] },
    { id: 'ap10', type: '기안서', title: '사무실 좌석 배치 변경 제안', content: '업무 효율 향상을 위한 좌석 재배치 제안.', requester: '한지은', requesterDept: '경영지원팀', status: '대기', createdAt: '2026-04-06T10:30:00', priority: '일반', attachments: 1, approvalLine: [{ name: '한지은', position: '과장', status: '요청', date: '2026-04-06' }, { name: '이찬호', position: '대표이사', status: '대기', date: '' }] }
  ],
  attendance: [
    { id: 'att1', employeeId: 'emp1', employeeName: '이찬호', date: '2026-04-07', clockIn: '08:45', clockOut: '18:30', status: '정상', workHours: 8.75, overtime: 0.5, note: '' },
    { id: 'att2', employeeId: 'emp2', employeeName: '한지은', date: '2026-04-07', clockIn: '09:00', clockOut: '18:00', status: '정상', workHours: 8, overtime: 0, note: '' },
    { id: 'att3', employeeId: 'emp4', employeeName: '박상민', date: '2026-04-07', clockIn: '08:30', clockOut: '19:00', status: '정상', workHours: 9.5, overtime: 1, note: '현장 점검' },
    { id: 'att4', employeeId: 'emp5', employeeName: '김도윤', date: '2026-04-07', clockIn: '', clockOut: '', status: '휴가', workHours: 0, overtime: 0, note: '연차' },
    { id: 'att5', employeeId: 'emp1', employeeName: '이찬호', date: '2026-04-06', clockIn: '08:50', clockOut: '18:15', status: '정상', workHours: 8.4, overtime: 0, note: '' },
    { id: 'att6', employeeId: 'emp1', employeeName: '이찬호', date: '2026-04-05', clockIn: '09:10', clockOut: '18:00', status: '지각', workHours: 7.8, overtime: 0, note: '교통 체증' },
    { id: 'att7', employeeId: 'emp1', employeeName: '이찬호', date: '2026-04-04', clockIn: '08:55', clockOut: '18:20', status: '정상', workHours: 8.4, overtime: 0, note: '' },
    { id: 'att8', employeeId: 'emp1', employeeName: '이찬호', date: '2026-04-03', clockIn: '08:40', clockOut: '19:30', status: '정상', workHours: 9.8, overtime: 1.5, note: '프로젝트 마감' },
    { id: 'att9', employeeId: 'emp1', employeeName: '이찬호', date: '2026-04-02', clockIn: '09:00', clockOut: '18:00', status: '정상', workHours: 8, overtime: 0, note: '' },
    { id: 'att10', employeeId: 'emp1', employeeName: '이찬호', date: '2026-04-01', clockIn: '08:30', clockOut: '18:00', status: '정상', workHours: 8.5, overtime: 0, note: '' },
    { id: 'att11', employeeId: 'emp2', employeeName: '한지은', date: '2026-04-06', clockIn: '09:05', clockOut: '18:00', status: '정상', workHours: 8, overtime: 0, note: '' },
    { id: 'att12', employeeId: 'emp4', employeeName: '박상민', date: '2026-04-06', clockIn: '08:20', clockOut: '18:45', status: '정상', workHours: 9.4, overtime: 0.7, note: '' },
    { id: 'att13', employeeId: 'emp7', employeeName: '김영수', date: '2026-04-07', clockIn: '09:00', clockOut: '18:00', status: '정상', workHours: 8, overtime: 0, note: '' },
    { id: 'att14', employeeId: 'emp9', employeeName: '정현우', date: '2026-04-07', clockIn: '08:50', clockOut: '18:30', status: '정상', workHours: 8.7, overtime: 0.5, note: '' },
    { id: 'att15', employeeId: 'emp11', employeeName: '최동혁', date: '2026-04-07', clockIn: '09:15', clockOut: '17:00', status: '조퇴', workHours: 6.75, overtime: 0, note: '개인 사유' }
  ],
  reports: [
    { id: 'rpt1', type: '일일업무', title: '4/7 일일 업무 보고', author: '김도윤', authorDept: '도시정비1팀', content: '가산동 재건축 추진위원회 자료 작성 완료. 내일 제출 예정.', tasks: [{ task: '추진위 자료 작성', status: '완료', progress: 100 }, { task: '현장 사진 촬영', status: '완료', progress: 100 }, { task: '보고서 검토', status: '진행중', progress: 60 }], createdAt: '2026-04-07T17:30:00', comments: 1 },
    { id: 'rpt2', type: '주간업무', title: '3/31~4/4 주간 업무 보고', author: '박상민', authorDept: '도시정비1팀', content: '금주 주요 성과 및 차주 계획입니다.', tasks: [{ task: '서울시청 협의', status: '완료', progress: 100 }, { task: '사업성 분석 보고서', status: '진행중', progress: 80 }, { task: '조합원 설명회 준비', status: '보류', progress: 30 }, { task: '현장 안전점검', status: '완료', progress: 100 }], createdAt: '2026-04-04T18:00:00', comments: 2 },
    { id: 'rpt3', type: '월간업무', title: '3월 월간 업무 보고', author: '김영수', authorDept: '도시정비2팀', content: '3월 도시정비2팀 업무 실적 보고.', tasks: [{ task: '하남 감일지구 진도 관리', status: '완료', progress: 100 }, { task: '인허가 서류 제출', status: '완료', progress: 100 }, { task: '예산 집행 현황 정리', status: '완료', progress: 100 }], createdAt: '2026-04-01T09:00:00', comments: 0 },
    { id: 'rpt4', type: '일일업무', title: '4/6 일일 업무 보고', author: '윤지민', authorDept: '기술팀', content: '도면 수정 작업 진행 중.', tasks: [{ task: 'A구역 도면 수정', status: '진행중', progress: 70 }, { task: 'B구역 측량 데이터 정리', status: '완료', progress: 100 }], createdAt: '2026-04-06T18:00:00', comments: 0 },
    { id: 'rpt5', type: '주간업무', title: '3/24~3/28 주간 업무 보고', author: '최동혁', authorDept: '영업팀', content: '신규 고객 미팅 3건, 계약 체결 1건.', tasks: [{ task: '강남구청 미팅', status: '완료', progress: 100 }, { task: '제안서 작성', status: '완료', progress: 100 }, { task: '계약서 검토', status: '진행중', progress: 50 }], createdAt: '2026-03-28T17:00:00', comments: 3 }
  ],
  calendar: [
    { id: 'ev1', title: '전체 회의', type: '회의', startDate: '2026-04-07', endDate: '2026-04-07', time: '10:00~11:00', location: '대회의실', attendees: '전직원', description: '주간 전체 회의', color: '#2563EB' },
    { id: 'ev2', title: '서울시청 방문', type: '출장', startDate: '2026-04-08', endDate: '2026-04-08', time: '14:00~17:00', location: '서울시청', attendees: '박상민, 김도윤', description: '정비사업 협의', color: '#F59E0B' },
    { id: 'ev3', title: '조합원 설명회', type: '업무', startDate: '2026-04-10', endDate: '2026-04-10', time: '15:00~17:00', location: '현장 사무소', attendees: '도시정비1팀', description: '가산동 재건축 조합원 설명회', color: '#22C55E' },
    { id: 'ev4', title: '석가탄신일', type: '공휴일', startDate: '2026-04-12', endDate: '2026-04-12', time: '', location: '', attendees: '', description: '법정 공휴일', color: '#EF4444' },
    { id: 'ev5', title: '팀장 회의', type: '회의', startDate: '2026-04-09', endDate: '2026-04-09', time: '09:30~10:30', location: '소회의실', attendees: '박상민, 김영수, 정현우, 최동혁', description: '팀장 정기회의', color: '#2563EB' },
    { id: 'ev6', title: 'CAD 교육', type: '업무', startDate: '2026-04-14', endDate: '2026-04-15', time: '10:00~16:00', location: '교육장', attendees: '기술팀 전원', description: 'AutoCAD 2026 신기능 교육', color: '#22C55E' },
    { id: 'ev7', title: '하남 현장 점검', type: '출장', startDate: '2026-04-16', endDate: '2026-04-16', time: '09:00~12:00', location: '하남시 감일지구', attendees: '김영수, 장서윤', description: '감일지구 현장 점검', color: '#F59E0B' },
    { id: 'ev8', title: '월간 실적 보고', type: '회의', startDate: '2026-04-30', endDate: '2026-04-30', time: '14:00~16:00', location: '대회의실', attendees: '전직원', description: '4월 실적 보고 및 5월 계획', color: '#2563EB' },
    { id: 'ev9', title: '어린이날', type: '공휴일', startDate: '2026-05-05', endDate: '2026-05-05', time: '', location: '', attendees: '', description: '법정 공휴일', color: '#EF4444' },
    { id: 'ev10', title: '고객 미팅', type: '회의', startDate: '2026-04-11', endDate: '2026-04-11', time: '11:00~12:00', location: '외부', attendees: '최동혁, 신하영', description: '신규 사업 제안', color: '#2563EB' }
  ],
  boards: [
    { id: 'bd1', category: '공지사항', title: '2026년 2분기 워크샵 안내', author: '이찬호', authorDept: '경영지원팀', content: '2분기 워크샵을 아래와 같이 안내드립니다.\n\n일시: 2026년 5월 16일(금) ~ 17일(토)\n장소: 양평 리조트\n대상: 전 직원\n\n참석 여부를 4월 30일까지 경영지원팀에 알려주세요.', createdAt: '2026-04-05T09:00:00', views: 45, comments: 3, isPinned: true, attachments: 1 },
    { id: 'bd2', category: '공지사항', title: '사무실 냉난방기 점검 안내', author: '한지은', authorDept: '경영지원팀', content: '4월 12일(토) 오전 중 사무실 냉난방기 정기 점검이 진행됩니다. 업무에 참고 바랍니다.', createdAt: '2026-04-03T11:00:00', views: 38, comments: 0, isPinned: false, attachments: 0 },
    { id: 'bd3', category: '자유게시판', title: '점심 맛집 추천해주세요', author: '오세연', authorDept: '경영지원팀', content: '사무실 근처 맛집 추천 부탁드립니다! 특히 혼밥 가능한 곳이면 좋겠어요.', createdAt: '2026-04-06T12:30:00', views: 22, comments: 5, isPinned: false, attachments: 0 },
    { id: 'bd4', category: '자유게시판', title: '사내 동호회 모집 (등산)', author: '정현우', authorDept: '기술팀', content: '주말 등산 동호회를 만들려고 합니다. 관심 있으신 분들 댓글 남겨주세요!', createdAt: '2026-04-04T15:00:00', views: 18, comments: 4, isPinned: false, attachments: 0 },
    { id: 'bd5', category: '부서게시판', title: '도시정비1팀 업무 분장 변경 안내', author: '박상민', authorDept: '도시정비1팀', content: '4월부터 업무 분장이 일부 변경됩니다. 첨부 파일 확인 바랍니다.', createdAt: '2026-04-01T10:00:00', views: 15, comments: 1, isPinned: false, attachments: 1 },
    { id: 'bd6', category: '공지사항', title: '정보보안 교육 필수 이수 안내', author: '한지은', authorDept: '경영지원팀', content: '전 직원 대상 정보보안 교육을 4월 중 반드시 이수해 주세요. 온라인 교육 링크를 첨부합니다.', createdAt: '2026-04-02T09:00:00', views: 52, comments: 0, isPinned: true, attachments: 1 },
    { id: 'bd7', category: '자유게시판', title: '이번 주 금요일 회식 참석 조사', author: '최동혁', authorDept: '영업팀', content: '이번 주 금요일 저녁 회식 참석 가능하신 분 댓글 부탁드립니다.', createdAt: '2026-04-07T09:30:00', views: 30, comments: 8, isPinned: false, attachments: 0 },
    { id: 'bd8', category: '부서게시판', title: '기술팀 장비 점검 일정', author: '정현우', authorDept: '기술팀', content: '측량 장비 정기 점검을 실시합니다.\n\n일시: 4/15(화)\n장소: 장비실\n대상: 전 장비', createdAt: '2026-04-06T14:00:00', views: 8, comments: 0, isPinned: false, attachments: 0 }
  ],
  documents: [
    { id: 'doc1', category: '계약서', title: '표준 용역 계약서', description: '도시정비 사업 표준 용역 계약서 양식', lastModified: '2026-03-15', downloads: 24, fileSize: '256KB' },
    { id: 'doc2', category: '보고서', title: '사업성 분석 보고서 템플릿', description: '재개발/재건축 사업성 분석 보고서 양식', lastModified: '2026-03-20', downloads: 18, fileSize: '512KB' },
    { id: 'doc3', category: '신청서', title: '연차 휴가 신청서', description: '연차/반차/병가 휴가 신청 양식', lastModified: '2026-01-05', downloads: 56, fileSize: '128KB' },
    { id: 'doc4', category: '신청서', title: '출장 신청서', description: '국내/해외 출장 신청 양식', lastModified: '2026-01-05', downloads: 32, fileSize: '148KB' },
    { id: 'doc5', category: '회의록', title: '회의록 양식', description: '팀 회의 / 전체 회의 회의록 표준 양식', lastModified: '2026-02-10', downloads: 41, fileSize: '96KB' },
    { id: 'doc6', category: '계약서', title: '비밀유지 서약서 (NDA)', description: '프로젝트 관련 비밀유지 서약서', lastModified: '2026-03-01', downloads: 12, fileSize: '180KB' },
    { id: 'doc7', category: '보고서', title: '주간 업무 보고서 양식', description: '주간 업무 실적 및 계획 보고서', lastModified: '2026-02-15', downloads: 65, fileSize: '164KB' },
    { id: 'doc8', category: '기타', title: '경비 청구서', description: '교통비, 식대 등 경비 청구 양식', lastModified: '2026-01-10', downloads: 78, fileSize: '112KB' },
    { id: 'doc9', category: '계약서', title: '하도급 계약서', description: '하도급 업체 계약 표준 양식', lastModified: '2026-03-25', downloads: 8, fileSize: '320KB' },
    { id: 'doc10', category: '기타', title: '명함 신청서', description: '직원 명함 제작 신청 양식', lastModified: '2026-02-20', downloads: 15, fileSize: '84KB' }
  ],
  notifications: [
    { id: 'noti1', type: 'approval', title: '결재 요청', message: '한지은님이 지출결의서를 요청했습니다.', isRead: false, createdAt: '2026-04-01T09:30:00', link: 'approval.html' },
    { id: 'noti2', type: 'approval', title: '결재 요청', message: '박상민님이 출장신청서를 요청했습니다.', isRead: false, createdAt: '2026-04-02T10:00:00', link: 'approval.html' },
    { id: 'noti3', type: 'board', title: '새 공지사항', message: '2026년 2분기 워크샵 안내가 등록되었습니다.', isRead: false, createdAt: '2026-04-05T09:00:00', link: 'board.html' },
    { id: 'noti4', type: 'calendar', title: '일정 알림', message: '내일 전체 회의가 있습니다 (10:00~11:00).', isRead: true, createdAt: '2026-04-06T18:00:00', link: 'calendar.html' },
    { id: 'noti5', type: 'approval', title: '결재 요청', message: '정현우님이 품의서를 요청했습니다.', isRead: false, createdAt: '2026-04-03T11:00:00', link: 'approval.html' },
    { id: 'noti6', type: 'system', title: '시스템 알림', message: '비밀번호 변경 후 90일이 경과했습니다.', isRead: true, createdAt: '2026-04-01T00:00:00', link: 'mypage.html' },
    { id: 'noti7', type: 'attendance', title: '근태 알림', message: '4/5(토) 지각이 기록되었습니다.', isRead: true, createdAt: '2026-04-05T09:15:00', link: 'attendance.html' },
    { id: 'noti8', type: 'approval', title: '결재 요청', message: '이수빈님이 휴가신청서를 요청했습니다.', isRead: false, createdAt: '2026-04-05T09:00:00', link: 'approval.html' }
  ]
};
