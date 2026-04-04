# 세울 데이터 스키마 문서

> 이 문서는 세울 웹사이트에서 사용하는 데이터 구조와 API를 정의합니다.

---

## 개요

세울은 **클라이언트 측 데이터 관리** 방식을 사용합니다.

- **초기 데이터:** `assets/data/mock-data.js` 파일의 `MOCK` 객체에 정의
- **런타임 저장소:** 브라우저 `localStorage` (키 접두사: `rdc_`)
- **데이터 서비스:** `assets/js/data-service.js`의 `DataService` 모듈이 CRUD 및 쿼리 기능 제공
- **인증 저장소:** `sessionStorage` (관리자: `rdc_admin`, 사용자: `rdc_user`)

### 동작 원리

1. 페이지 로드 시 `DataService`가 `localStorage`에서 데이터를 조회합니다.
2. `localStorage`에 해당 컬렉션이 없으면 `MOCK` 객체에서 초기 데이터를 복사하여 `localStorage`에 저장합니다.
3. 이후 모든 CRUD 작업은 `localStorage`를 대상으로 수행됩니다.
4. 향후 실 API 전환 시 `data-service.js` 파일만 교체하면 됩니다.

---

## 컬렉션별 스키마

### areas (구역)

재개발/재건축 정비구역 정보

| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `id` | string | 고유 식별자 | `"a1"` |
| `name` | string | 구역 이름 | `"한남3구역"` |
| `type` | string | 사업 유형 | `"재개발"` / `"재건축"` |
| `district` | string | 자치구 | `"용산구"` |
| `dong` | string | 동 | `"한남동"` |
| `stage` | string | 사업 단계 | `"관리처분인가"` |
| `premium` | number | 프리미엄 (만원/3.3㎡) | `5800` |
| `change` | number | 변동폭 (만원) | `200` |
| `changeDir` | string | 변동 방향 | `"up"` / `"down"` / `"flat"` |
| `ratio` | number | 비례율 (%) | `112` |
| `totalHouseholds` | number | 총 세대수 | `5200` |
| `totalArea` | number | 총 대지면적 (㎡) | `128000` |
| `floorArea` | number | 연면적 (㎡) | `320000` |
| `buildingCoverage` | number | 건폐율 (%) | `45` |
| `floorAreaRatio` | number | 용적률 (%) | `299` |
| `developer` | string | 시공사 | `"현대건설 컨소시엄"` |
| `approvalDate` | string | 인가일 (YYYY-MM-DD) | `"2025-09-15"` |
| `completionDate` | string | 준공 예정일 (YYYY-MM-DD) | `"2029-06-30"` |
| `description` | string | 구역 설명 | 자유 텍스트 |
| `tags` | string[] | 태그 배열 | `["한강뷰", "역세권"]` |
| `featured` | boolean | 추천 구역 여부 | `true` |
| `hot` | boolean | 인기 구역 여부 | `true` |
| `image` | string | 대표 이미지 경로 | `""` |
| `lat` | number | 위도 | `37.5340` |
| `lng` | number | 경도 | `126.9980` |
| `createdAt` | string | 등록일 (YYYY-MM-DD) | `"2026-01-15"` |

**stage 허용값:** `정비구역지정`, `조합설립인가`, `사업시행인가`, `관리처분인가`, `착공`, `입주예정`

---

### listings (매물)

입주권, 분양권, 토지, 매매 매물 정보

| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `id` | string | 고유 식별자 | `"l1"` |
| `areaId` | string | 연결 구역 ID (areas.id 참조) | `"a1"` |
| `areaName` | string | 구역 이름 | `"한남3구역"` |
| `type` | string | 매물 유형 | `"입주권"` / `"분양권"` / `"토지"` / `"매매"` |
| `district` | string | 자치구 | `"용산구"` |
| `price` | number | 가격 (만원) | `125000` |
| `priceText` | string | 가격 텍스트 | `"12억 5,000만"` |
| `size` | number | 면적 (㎡) | `84` |
| `sizeType` | string | 면적 유형 | `"전용 84㎡"` |
| `premium` | number | 프리미엄 (만원) | `58000` |
| `floor` | string | 층수 | `"12층"` |
| `description` | string | 매물 설명 | 자유 텍스트 |
| `tags` | string[] | 태그 배열 | `["관리처분인가", "한강뷰"]` |
| `status` | string | 매물 상태 | `"매물"` / `"거래완료"` / `"비공개"` |
| `featured` | boolean | 추천 매물 여부 | `true` |
| `hot` | boolean | 인기 매물 여부 | `true` |
| `seller` | string | 매도인 이름 | `"김민수"` |
| `phone` | string | 연락처 | `"010-1234-5678"` |
| `createdAt` | string | 등록일 | `"2026-03-28"` |

---

### news (뉴스)

재개발/재건축 관련 뉴스 기사

| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `id` | string | 고유 식별자 | `"n1"` |
| `title` | string | 뉴스 제목 | `"서울시, 2026 정비사업 촉진..."` |
| `category` | string | 카테고리 | `"정책"` / `"시장분석"` / `"분석"` / `"개발호재"` |
| `summary` | string | 요약문 | 목록 표시용 |
| `content` | string | 본문 내용 | 줄바꿈(\n) 포함 자유 텍스트 |
| `author` | string | 작성자 | `"김기자"` |
| `date` | string | 작성일 | `"2026-04-02"` |
| `views` | number | 조회수 | `2840` |
| `image` | string | 대표 이미지 경로 | `""` |
| `tags` | string[] | 태그 배열 | `["정비사업", "특별법"]` |
| `featured` | boolean | 추천 뉴스 여부 | `true` |

---

### columns (칼럼)

전문가 칼럼

| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `id` | string | 고유 식별자 | `"c1"` |
| `title` | string | 칼럼 제목 | `"2026 재개발 시장 전망과 투자전략"` |
| `author` | string | 작성자 이름 | `"김정민 변호사"` |
| `authorRole` | string | 직함/소속 | `"법무법인 한울 대표변호사"` |
| `avatar` | string | 프로필 이미지 경로 | `""` |
| `summary` | string | 요약문 | 목록 표시용 |
| `content` | string | 본문 (마크다운 지원) | `**굵은글씨**` 형식 |
| `date` | string | 작성일 | `"2026-04-01"` |
| `views` | number | 조회수 | `3250` |
| `tags` | string[] | 태그 배열 | `["투자전략", "시장전망"]` |
| `featured` | boolean | 추천 칼럼 여부 | `true` |

---

### community (커뮤니티)

사용자 게시글

| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `id` | string | 고유 식별자 | `"p1"` |
| `title` | string | 게시글 제목 | `"한남3구역 입주권 지금 매수해도 될까요?"` |
| `category` | string | 카테고리 | `"질문"` / `"정보"` / `"후기"` / `"분석"` / `"칼럼"` |
| `author` | string | 작성자 닉네임 | `"투자초보맘"` |
| `content` | string | 본문 내용 | 자유 텍스트 |
| `comments` | number | 댓글 수 | `23` |
| `views` | number | 조회수 | `1250` |
| `date` | string | 작성일시 | `"2026-04-02 10:46"` |
| `likes` | number | 좋아요 수 | `45` |

---

### faq (자주 묻는 질문)

| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `id` | string | 고유 식별자 | `"f1"` |
| `category` | string | 카테고리 | `"일반"` / `"계정"` / `"시세"` / `"투자"` |
| `question` | string | 질문 | `"세울은 어떤 서비스인가요?"` |
| `answer` | string | 답변 | 자유 텍스트 |

---

### notices (공지사항)

| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `id` | string | 고유 식별자 | `"nt1"` |
| `title` | string | 공지 제목 | `"[공지] 세울 서비스 오픈 안내"` |
| `content` | string | 공지 내용 | 자유 텍스트 |
| `date` | string | 작성일 | `"2026-04-01"` |
| `important` | boolean | 중요 공지 여부 | `true` |

---

### schedule (일정)

| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `id` | string | 고유 식별자 | `"s1"` |
| `date` | string | 일정 날짜 | `"2026-04-05"` |
| `title` | string | 일정 제목 | `"한남3구역 조합원 총회"` |
| `area` | string | 관련 구역 | `"한남3구역"` (없으면 빈 문자열) |
| `description` | string | 상세 설명 | `"관리처분계획 변경 안건"` |

---

### banners (배너)

| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `id` | string | 고유 식별자 | `"b1"` |
| `title` | string | 배너 제목 | `"2026 정비사업 촉진법 시행"` |
| `subtitle` | string | 부제목 | `"인허가 기간 대폭 단축"` |
| `link` | string | 클릭 시 이동 URL | `"/pages/news-detail.html?id=n1"` |
| `order` | number | 표시 순서 (오름차순) | `1` |
| `active` | boolean | 활성 여부 | `true` |
| `type` | string | 배너 유형 | `"hero"` / `"side"` |

---

### inquiries (문의)

| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `id` | string | 고유 식별자 | `"q1"` |
| `name` | string | 문의자 이름 | `"이철수"` |
| `email` | string | 이메일 | `"lee@test.com"` |
| `phone` | string | 연락처 | `"010-1111-2222"` |
| `type` | string | 문의 유형 | `"시세문의"` / `"투자상담"` / `"법률상담"` |
| `title` | string | 문의 제목 | `"한남3구역 최신 시세 문의"` |
| `content` | string | 문의 내용 | 자유 텍스트 |
| `status` | string | 처리 상태 | `"접수"` / `"처리중"` / `"답변완료"` |
| `answer` | string | 답변 내용 | 자유 텍스트 (미답변 시 빈 문자열) |
| `date` | string | 문의일 | `"2026-03-28"` |
| `answeredAt` | string | 답변일 | `"2026-03-29"` (미답변 시 빈 문자열) |

---

### members (회원)

| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `id` | string | 고유 식별자 | `"m1"` |
| `name` | string | 회원 이름 | `"홍길동"` |
| `email` | string | 이메일 | `"dodo6666@naver.com"` |
| `phone` | string | 연락처 | `"010-0000-0000"` |
| `role` | string | 역할 | `"admin"` / `"user"` |
| `joinDate` | string | 가입일 | `"2026-01-01"` |
| `status` | string | 상태 | `"활성"` / `"휴면"` / `"정지"` |

---

### settings (사이트 설정)

단일 객체 (배열이 아님)

| 필드 | 타입 | 설명 | 기본값 |
|------|------|------|--------|
| `siteName` | string | 사이트 이름 | `"세울"` |
| `siteDescription` | string | 사이트 설명 | `"대한민국 No.1 재개발·재건축 종합정보 플랫폼"` |
| `siteKeywords` | string | 검색 키워드 (쉼표 구분) | `"재개발,재건축,도시정비..."` |
| `contactPhone` | string | 대표 전화 | `"010-2230-9210"` |
| `contactEmail` | string | 대표 이메일 | `"dodo6666@naver.com"` |
| `address` | string | 회사 주소 | `"서울특별시 영등포구 국회대로76길 18"` |
| `businessNumber` | string | 사업자등록번호 | `"761-86-02796"` |
| `ceo` | string | 대표자 | `"이창우"` |
| `workingHours` | string | 영업시간 | `"평일 09:00 – 18:00 / 토요일 09:00 – 13:00"` |
| `maintenanceMode` | boolean | 점검 모드 | `false` |
| `popupEnabled` | boolean | 팝업 활성화 | `false` |
| `popupTitle` | string | 팝업 제목 | `""` |
| `popupContent` | string | 팝업 내용 | `""` |
| `ogImage` | string | OG 이미지 경로 | `"/assets/img/og-image.png"` |

> **참고:** `settings`는 배열이 아닌 단일 객체입니다. `DataService.getSettings()` / `DataService.updateSettings(changes)`로 접근합니다.

---

### legalGuides (법률/세금 가이드)

| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `id` | string | 고유 식별자 | `"lg1"` |
| `category` | string | 카테고리 | `"양도소득세"` / `"취득세"` / `"종합부동산세"` / `"절차·서류"` |
| `title` | string | 가이드 제목 | `"재개발 입주권 양도세 완전 가이드"` |
| `content` | string | 본문 (마크다운 지원) | 자유 텍스트 |

---

### adminAccount (관리자 계정)

단일 객체 (배열이 아님)

| 필드 | 타입 | 설명 | 기본값 |
|------|------|------|--------|
| `username` | string | 관리자 아이디 | `"admin"` |
| `password` | string | 관리자 비밀번호 | `"admin1234"` |
| `name` | string | 관리자 이름 | `"관리자"` |

> **주의:** 비밀번호가 평문으로 저장됩니다. 실 서비스에서는 반드시 서버 측 해싱 적용이 필요합니다.

---

## DataService API 레퍼런스

`DataService`는 IIFE(즉시 실행 함수)로 구현된 모듈로, `window.DataService`로 전역 접근 가능합니다.

### 기본 CRUD

#### `getAll(collection)`

컬렉션의 모든 데이터를 배열로 반환합니다.

```javascript
const areas = DataService.getAll('areas');
// => [{ id: 'a1', name: '한남3구역', ... }, ...]
```

#### `getById(collection, id)`

컬렉션에서 특정 ID의 데이터를 반환합니다. 없으면 `null`.

```javascript
const area = DataService.getById('areas', 'a1');
// => { id: 'a1', name: '한남3구역', ... }
```

#### `create(collection, item)`

새 항목을 컬렉션에 추가합니다. `id`와 `createdAt`은 자동 생성됩니다. 목록의 맨 앞(최신순)에 삽입됩니다.

```javascript
const newArea = DataService.create('areas', {
  name: '새구역',
  type: '재개발',
  district: '마포구',
  // ...
});
// => { id: 'a_lxyz1234', name: '새구역', createdAt: '2026-04-02', ... }
```

**ID 생성 규칙:** `{컬렉션명 첫글자}_{타임스탬프(base36)}{랜덤4자리(base36)}`

#### `update(collection, id, changes)`

기존 항목을 수정합니다. `changes` 객체의 필드만 업데이트됩니다. 성공 시 수정된 객체, 없으면 `null`.

```javascript
const updated = DataService.update('areas', 'a1', { premium: 6000, change: 200 });
// => { id: 'a1', name: '한남3구역', premium: 6000, ... }
```

#### `remove(collection, id)`

컬렉션에서 해당 ID의 항목을 삭제합니다. 반환값 없음.

```javascript
DataService.remove('areas', 'a1');
```

### 쿼리

#### `query(collection, options)`

필터링, 검색, 정렬, 페이지네이션을 지원하는 고급 조회 함수입니다.

**옵션:**

| 옵션 | 타입 | 설명 |
|------|------|------|
| `filter` | object | 필드별 필터 조건 (`{ district: '용산구', type: '재개발' }`) |
| `search` | string | 검색어 |
| `searchFields` | string[] | 검색 대상 필드 (`['name', 'description']`) |
| `sort` | string | 정렬 (`'필드명:asc'` 또는 `'필드명:desc'`) |
| `page` | number | 페이지 번호 (기본: 1) |
| `pageSize` | number | 페이지당 항목 수 (기본: 10) |

**반환값:**

```javascript
{
  data: [],       // 현재 페이지의 데이터 배열
  total: 0,       // 전체 결과 수 (필터/검색 적용 후)
  page: 1,        // 현재 페이지
  pageSize: 10,   // 페이지 크기
  totalPages: 0   // 전체 페이지 수
}
```

**사용 예시:**

```javascript
// 용산구 재개발 구역, 프리미엄 높은 순, 1페이지
const result = DataService.query('areas', {
  filter: { district: '용산구', type: '재개발' },
  sort: 'premium:desc',
  page: 1,
  pageSize: 10
});

// 구역 이름으로 검색
const result = DataService.query('areas', {
  search: '한남',
  searchFields: ['name', 'description']
});
```

**필터 특수값:** `''`, `null`, `undefined`, `'전체'`는 해당 필터를 무시합니다.

### 설정 관련

#### `getSettings()`

사이트 설정 객체를 반환합니다.

```javascript
const settings = DataService.getSettings();
// => { siteName: '세울', contactPhone: '010-2230-9210', ... }
```

#### `updateSettings(changes)`

설정을 부분 업데이트합니다.

```javascript
DataService.updateSettings({ maintenanceMode: true });
```

### 즐겨찾기

#### `getFavorites(type)`

특정 타입의 즐겨찾기 ID 배열을 반환합니다.

```javascript
const favAreas = DataService.getFavorites('areas');
// => ['a1', 'a3']
```

#### `toggleFavorite(type, id)`

즐겨찾기를 토글합니다. 이미 있으면 제거, 없으면 추가.

```javascript
DataService.toggleFavorite('areas', 'a1');
```

#### `isFavorite(type, id)`

즐겨찾기 여부를 반환합니다.

```javascript
DataService.isFavorite('areas', 'a1');
// => true / false
```

**localStorage 키:** `rdc_fav_{type}` (예: `rdc_fav_areas`)

### 인증

#### 관리자 인증

```javascript
// 로그인
DataService.adminLogin('admin', 'admin1234');  // => true / false

// 로그인 상태 확인
DataService.isAdminLoggedIn();  // => true / false

// 관리자 이름 조회
DataService.getAdminName();  // => '관리자'

// 로그아웃
DataService.adminLogout();
```

#### 사용자 인증

```javascript
// 로그인 (이메일 기반, 비밀번호 검증 없음 - mock)
DataService.userLogin('kim@test.com', '');  // => user 객체 / null

// 로그인 상태 확인
DataService.isUserLoggedIn();  // => true / false

// 현재 사용자 정보
DataService.getCurrentUser();  // => { loggedIn, id, name, email }

// 로그아웃
DataService.userLogout();
```

### 대시보드 통계

#### `getDashboardStats()`

관리자 대시보드용 통계를 반환합니다.

```javascript
DataService.getDashboardStats();
// => {
//   totalAreas: 10,
//   totalListings: 8,
//   totalMembers: 5,
//   totalInquiries: 3,
//   pendingInquiries: 1,
//   totalNews: 6,
//   totalPosts: 8,
//   totalColumns: 5
// }
```

### 데이터 초기화

#### `resetAll()`

모든 데이터를 초기화합니다.

```javascript
DataService.resetAll();
location.reload();  // 새로고침하면 mock-data에서 재로딩
```

**동작:**
1. `localStorage`에서 `rdc_` 접두사로 시작하는 모든 키를 삭제
2. `sessionStorage`를 전체 초기화 (로그인 세션 포함)
3. 새로고침 후 `MOCK` 객체에서 초기 데이터가 자동 복원

---

## localStorage 키 구조

| 키 | 저장 내용 | 타입 |
|------|------|------|
| `rdc_areas` | 구역 데이터 | JSON 배열 |
| `rdc_listings` | 매물 데이터 | JSON 배열 |
| `rdc_news` | 뉴스 데이터 | JSON 배열 |
| `rdc_columns` | 칼럼 데이터 | JSON 배열 |
| `rdc_community` | 커뮤니티 데이터 | JSON 배열 |
| `rdc_faq` | FAQ 데이터 | JSON 배열 |
| `rdc_notices` | 공지사항 데이터 | JSON 배열 |
| `rdc_schedule` | 일정 데이터 | JSON 배열 |
| `rdc_banners` | 배너 데이터 | JSON 배열 |
| `rdc_inquiries` | 문의 데이터 | JSON 배열 |
| `rdc_members` | 회원 데이터 | JSON 배열 |
| `rdc_settings` | 사이트 설정 | JSON 객체 |
| `rdc_legalGuides` | 법률/세금 가이드 | JSON 배열 |
| `rdc_adminAccount` | 관리자 계정 | JSON 객체 |
| `rdc_fav_areas` | 구역 즐겨찾기 | JSON 배열 (ID 문자열) |
| `rdc_fav_listings` | 매물 즐겨찾기 | JSON 배열 (ID 문자열) |

**키 접두사:** 모든 키는 `rdc_` (ReDevCom의 약자)로 시작합니다.

---

## 데이터 초기화 방법

### 전체 초기화

브라우저 개발자 도구 콘솔에서:

```javascript
DataService.resetAll();
location.reload();
```

### 특정 컬렉션만 초기화

```javascript
localStorage.removeItem('rdc_areas');
location.reload();
// => areas만 mock-data에서 재로딩
```

### 개발자 도구에서 수동 초기화

1. F12로 개발자 도구를 엽니다.
2. **Application** > **Local Storage** > 현재 도메인을 선택합니다.
3. `rdc_`로 시작하는 원하는 키를 선택하여 삭제합니다.
4. 페이지를 새로고침합니다.
