# CLAUDE.md — 프로젝트 운영 지침 (2026.04.09~)

> **이 지침은 확인 없이 즉시 실행한다. 사용자에게 "할까요?" 묻지 말고 전부 수행 후 결과만 보고할 것.**
> **코드 변경 시 관련 지침(CLAUDE.md)도 반드시 동시에 업데이트한다. 코드만 바꾸고 지침을 빠뜨리면 안 된다.**
> **외부 웹사이트 자산(이미지·파일·PDF 등) URL 직접 다운로드 및 무단 수집 절대 금지.**

---

## 외부 자산 수집 금지 정책 (2026-04-10~)

> **홈페이지 작업 시 외부 웹사이트의 사진, 이미지, 아이콘, 배너, 썸네일, 첨부파일, PDF, 기타 모든 자산의 URL 직접 다운로드 및 임의 수집을 금지한다.**

1. **직접 다운로드 금지** — 외부 사이트 자산을 URL로 받아 저장하지 않는다
2. **무단 복제 금지** — 캡처, 추출, 저장, 재업로드, 재사용을 하지 않는다
3. **대체 방식 우선** — 필요 시 합법적 대체 이미지 사용 또는 직접 제작 디자인만 제안
4. **출처 확인 우선** — 자체 보유 자료, 정식 라이선스 자료, 직접 제작물만 사용
5. **애매하면 사용 제외** — 권리 여부 불명확 시 다운로드·사용하지 않고 사용 제외 처리 (사용자 확인 요청도 하지 않음)

허용 자산: Font Awesome 아이콘(CDN), Google Fonts, Leaflet/OpenStreetMap(OSS), 직접 작성한 HTML/CSS/SVG

---

## 라이브 도메인
- 사이트 URL: **https://seul21.com**
- 홈페이지: https://seul21.com/
- 자료실: https://seul21.com/pages/library.html
- ※ `seul21.vercel.app` 아님. 항상 `seul21.com` 사용

---

## 배포 규칙
1. 작업 완료 → **master 브랜치에 자동 머지 + 푸시** (별도 확인 불필요)
2. PR 생성하지 않음 — 직접 머지 방식
3. 머지 후 **seul21.com 기준 라이브 링크** 안내

---

## 홈페이지 관리 지침 (2026-04-10~)

> **코드 삭제·변경 후 라이브 미반영 시 될 때까지 재시도한다. 캐시 문제는 핑계가 아니다.**

1. **삭제 요청 시 일괄 처리** — 동일 요소가 여러 파일에 있으면 전체 파일 검색(`Grep`) 후 병렬 삭제. 한 곳이라도 누락하면 안 된다
2. **배포 후 라이브 검수 필수** — master 푸시 후 반드시 라이브 반영 여부 확인. 미반영 시 Vercel 재배포 트리거(GitHub API `push_files`) 실행
3. **캐시 무효화 대응** — vercel.json에 HTML/JS/CSS `no-cache` 헤더 설정 유지. 그래도 캐시 잔존 시 GitHub MCP로 직접 커밋 푸시하여 강제 재배포
4. **최종 확인 → 텔레그램 보고** — 라이브 반영 확인 후 `/api/report` 또는 `admin/send-report.html`로 텔레그램 처리보고 발송
5. **안 되면 될 때까지** — 1회 실패로 포기하지 않는다. git push 실패 시 pull 후 재시도, 네트워크 오류 시 지수 백오프 재시도(최대 4회)

### [특별규정] 삭제·변경 작업 1회 완결 의무 (2026-04-10 신설)

> **삭제·변경 요청은 반드시 1회에 완결한다. 같은 작업을 2번 이상 요청받는 상황을 절대 만들지 않는다.**

1. **전수 조사 후 작업** — 삭제·변경 전 반드시 `Grep`으로 프로젝트 전체를 검색하여 해당 요소가 존재하는 모든 파일·모든 위치를 확인한다. 부분 검색 금지
2. **병렬 일괄 삭제** — 발견된 모든 위치를 한 번에 동시 삭제한다. 한 파일씩 순차 처리하다가 누락하는 일이 없도록 한다
3. **삭제 후 전수 재검증** — 삭제 작업 완료 후 동일한 `Grep` 검색을 재실행하여 잔존 0건을 확인한다. 0건이 아니면 추가 삭제
4. **CSS·JS 캐시 버스팅 필수** — 코드 삭제·변경 시 관련 파일의 `?v=` 버전 파라미터를 반드시 갱신하여 브라우저 캐시를 무효화한다
5. **GitHub API 강제 배포** — git push 후에도 라이브 미반영 시, 즉시 GitHub MCP `push_files`로 직접 커밋 푸시하여 Vercel 재배포를 강제 트리거한다. 단, `create_or_update_file`로 대용량 파일을 덮어쓸 때 내용 누락 절대 금지
6. **라이브 확인 없이 완료 보고 금지** — "코드에서 삭제했습니다"만으로 완료 보고하지 않는다. 반드시 라이브 사이트에서 해당 요소가 사라졌음을 확인한 후 보고한다
7. **위반 시** — 이 규정을 위반하여 같은 작업이 2회 이상 요청되면, 즉시 원인 분석 + 재발 방지 대책을 CLAUDE.md에 추가한다

---

## 자료실 데이터 추가 — 필수 실행 절차

자료실(`MOCK.library`)에 항목을 추가할 때 아래 **6단계를 전부 즉시 실행**한다.
하나라도 누락하면 라이브에서 필터 누락·"파일 준비 중" 토스트·404 등 장애가 발생한다.

### STEP 1. mock-data.js 데이터 추가
- 파일: `redevelopment/assets/data/mock-data.js` → `MOCK.library` 배열
- 필수 필드: `id`, `category`, `title`, `description`, `fileType`, `fileSize`, `date`, `downloads`, `tags`

### STEP 2. 카테고리 매핑 — 2곳 동시 수정

**(A) `pages/library.html` — catDefs**
```
var catDefs=[
  {key:'법령', keys:['법령','법령·조례'], ...},
  {key:'판례지침', keys:['관련판례','지침','판례·질의회신'], ...},
  ...
];
```
→ 새 카테고리명이 기존 `keys` 배열에 포함되는지 확인. 없으면 **즉시 추가**.

**(B) `index.html` — _catKeyMap**
```
var _catKeyMap={'법령':'법령','법령·조례':'법령','판례·질의회신':'판례지침', ...};
```
→ 새 카테고리명 → 기존 키 매핑이 있는지 확인. 없으면 **즉시 추가**.

현재 등록된 매핑:
| 자료실 탭 | catDefs keys | _catKeyMap |
|-----------|-------------|------------|
| 주요뉴스 | `'주요뉴스'` | `'주요뉴스':'주요뉴스'` |
| 법령·제도 | `'법령'`, `'법령·조례'` | `'법령':'법령'`, `'법령·조례':'법령'` |
| 고시·공고 | `'관련판례'`, `'지침'`, `'판례·질의회신'` | `'관련판례':'판례지침'`, `'지침':'판례지침'`, `'판례·질의회신':'판례지침'` |
| 서식·매뉴얼 | `'서식'`, `'가이드'` | `'서식':'서식가이드'`, `'가이드':'서식가이드'` |
| 입찰공고 | `'입찰공고'` | — |

### STEP 3. fileMap 등록 — library.html

`pages/library.html`의 `var fileMap={...}` 에 **모든 새 항목 ID**를 등록한다.

| 카테고리 | fileMap 형식 | 예시 |
|---------|-------------|------|
| 주요뉴스 (HTML 있음) | `{web:'../downloads/news_YYYYMMDD[x].html'}` | `'news0409a':{web:'../downloads/news_20260409a.html'}` |
| 법령·조례 | `{web:'../downloads/law_YYYYMMDD[x].html'}` | `'law0409a':{web:'../downloads/law_20260409a.html'}` |
| 판례·질의회신 | `{web:'../downloads/case_YYYYMMDD[x].html'}` | `'case0409a':{web:'../downloads/case_20260409a.html'}` |
| PDF 자료 | `{ext:'../downloads/files/파일.pdf'}` | — |

**⚠ fileMap에 미등록 + 주요뉴스가 아닌 항목 → "파일 준비 중입니다" 토스트 오류 발생**
**⚠ `gov` 링크(외부 사이트 연결) 사용 금지 — 반드시 자체 HTML 상세 페이지(`web`) 또는 PDF 직접 다운로드(`ext`) 방식만 사용**

### STEP 4. newsFileMap 등록 — index.html (주요뉴스만)

`index.html`의 `var newsFileMap={...}` 에 다운로드 HTML이 있는 뉴스 ID를 등록한다.
- 예: `'news0409e':'downloads/news_20260409e.html'`
- 다운로드 HTML이 없으면 등록 불필요 (자료실 주요뉴스 탭으로 자동 fallback)

### STEP 5. 다운로드 HTML 페이지 (필수 생성)

`redevelopment/downloads/` 에 상세 페이지를 **반드시** 생성한다. 외부 사이트 연결(`gov`) 금지.
- 뉴스: `news_YYYYMMDD[a-z].html`
- 법령: `law_YYYYMMDD[a-z].html`
- 판례: `case_YYYYMMDD[a-z].html`
- PDF 자료: `ext` 경로로 직접 다운로드 (별도 HTML 불필요)

### STEP 6. 라이브 검수 (필수)

커밋·푸시 **전에** 아래 항목을 코드 레벨에서 검증한다:

1. **카테고리 필터** — `catDefs`의 keys에 새 카테고리가 포함되는지
2. **fileMap 등록** — 새 ID가 fileMap에 있는지, 클릭 시 정상 동작할지
3. **newsFileMap** — 주요뉴스 ID가 newsFileMap에 있거나 fallback이 정상인지
4. **_catKeyMap** — 새 카테고리가 매핑되어 있는지
5. **홈페이지 노출** — 주요뉴스 3일 필터(`cutStr`), 자료실 최신 4건 필터 확인
6. **건수 일치** — 추가/삭제 건수가 맞는지

---

## 핵심 파일 경로

| 용도 | 경로 | 수정 포인트 |
|------|------|------------|
| 자료 데이터 | `redevelopment/assets/data/mock-data.js` | `MOCK.library` 배열 |
| 자료실 페이지 | `redevelopment/pages/library.html` | `catDefs`, `fileMap`, `handleDownload` |
| 홈페이지 | `redevelopment/index.html` | `newsFileMap`, `_catKeyMap`, `_libFileMap` |
| 다운로드 HTML | `redevelopment/downloads/` | 뉴스·법령·판례 상세페이지 |
| 다운로드 PDF | `redevelopment/downloads/files/` | PDF 원본 파일 |
| 커뮤니티 API | `redevelopment/api/community.js` | 글 CRUD + 텔레그램 알림 |
| 커뮤니티 데이터 | `redevelopment/data/community.json` | GitHub 저장소 직접 저장 |

---

## 커뮤니티 운영 정책 (2026-04-10~)

> **커뮤니티 글쓰기 시 텔레그램으로 즉시 알림 전달. 글은 API(GitHub)와 로컬 동시 저장.**

1. **글 작성** → `POST /api/community` → GitHub `community.json` 저장 + 텔레그램 알림 + 로컬 localStorage 동시 저장
2. **글 목록** → 로컬 데이터 + API 최신 데이터 병합 렌더링 (페이지 로드 시 자동)
3. **글 상세** → 로컬에 없으면 API에서 조회 후 표시
4. **텔레그램 알림 내용** → 카테고리, 제목, 작성자, 작성일, 내용 미리보기(200자), 상세 링크
5. **텔레그램 실패 시** → 글 등록은 정상 유지 (알림만 실패)
6. 환경변수: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` 필수

---

## 과거 장애 사례 (재발 방지)

| 날짜 | 증상 | 원인 | 조치 |
|------|------|------|------|
| 2026-04-09 | 법령·판례 항목 자료실 탭에서 미노출 | `catDefs` keys에 `'법령·조례'`, `'판례·질의회신'` 누락 | keys 배열 + _catKeyMap 추가 |
| 2026-04-09 | 법령·판례 클릭 시 "파일 준비 중" 토스트만 표시 | `fileMap`에 law/case ID 미등록 | fileMap에 gov 링크 등록 |
| 2026-04-09 | 뉴스 c/d/e/f 자동경로 생성 실패 | `handleDownload` regex가 `[ab]`만 처리 | `[a-z]`로 확장 |
| 2026-04-09 | 라이브 링크 404 | 도메인을 `seul21.vercel.app`으로 잘못 안내 | `seul21.com` 사용 |
| 2026-04-10 | 법령·판례 클릭 시 외부 사이트 confirm 대화상자 표시 | fileMap에 `gov` 링크만 등록, `handleDownload`에서 confirm+window.open 사용 | `gov` 제거 → 자체 HTML 상세 페이지(`web`) 생성으로 전환 |
| 2026-04-10 | PDF 다운로드 시 외부 사이트로 fallback | `checkFile` HEAD 요청 실패 시 `gov` 사이트로 리디렉션 | `checkFile` 제거, `ext` 파일 즉시 직접 다운로드로 변경 |

---

## 다운로드 정책 (2026-04-10~)

> **모든 첨부자료는 사이트 내 직접 다운로드/열람만 허용. 외부 사이트 연결 금지.**

1. **PDF 자료** (`ext`) → `a.download`로 즉시 다운로드. `checkFile` HEAD 요청 없음
2. **뉴스·법령·판례** (`web`) → 자체 HTML 상세 페이지로 이동. 외부 링크 금지
3. **`gov` 링크 사용 금지** — confirm 대화상자, window.open 외부 사이트 연결 절대 불가
4. 다운로드 우선순위: `ext`(직접 다운로드) > `web`(상세 페이지) > 없으면 토스트 안내
5. `index.html`의 `mainLibDownload`도 동일 정책 적용

---

## 전문가 상담 정책 (2026-04-10~)

> **전문가 상담은 회원가입 후 이용 가능. 비회원은 로그인 페이지로 리디렉션.**

1. **contact.html** (고객센터 폼) → 비로그인 시 폼 숨기고 로그인/회원가입 안내 표시. 로그인 시 이름·이메일 자동 채움(readOnly)
2. **chatbot.js** (전문가 탭) → 비로그인 시 전문가 탭 클릭하면 로그인/회원가입 안내 표시, 입력창 비활성화. AI 상담·법률상담은 비회원도 이용 가능
3. **index.html** (상담 문의 버튼 2곳) → 비로그인 클릭 시 `login.html`로 리디렉션
4. **consultation.html** (CTA 버튼) → 비로그인 클릭 시 `login.html`로 리디렉션
5. 로그인 체크: `DataService.isUserLoggedIn()` 사용 (sessionStorage `seul_user` 키 기반)

---

## 지침 변경 이력 — 신구대비 (2026-04-10)

### 1. 상단 운영 규칙 추가

| 구분 | 내용 |
|------|------|
| **구** | _(해당 규칙 없음)_ |
| **신** | **코드 변경 시 관련 지침(CLAUDE.md)도 반드시 동시에 업데이트한다. 코드만 바꾸고 지침을 빠뜨리면 안 된다.** |

### 2. STEP 3. fileMap 등록 — 법령·판례 형식 변경

| 구분 | 카테고리 | fileMap 형식 | 예시 |
|------|---------|-------------|------|
| **구** | 법령·조례 | `{gov:'원문URL', label:'출처명'}` | `'law0409a':{gov:'https://...', label:'하우징헤럴드 원문'}` |
| **신** | 법령·조례 | `{web:'../downloads/law_YYYYMMDD[x].html'}` | `'law0409a':{web:'../downloads/law_20260409a.html'}` |
| **구** | 판례·질의회신 | `{gov:'원문URL', label:'출처명'}` | `'case0409a':{gov:'https://...', label:'대법원 판례검색'}` |
| **신** | 판례·질의회신 | `{web:'../downloads/case_YYYYMMDD[x].html'}` | `'case0409a':{web:'../downloads/case_20260409a.html'}` |

### 3. STEP 3. fileMap 경고문 추가

| 구분 | 내용 |
|------|------|
| **구** | ⚠ fileMap에 미등록 + 주요뉴스가 아닌 항목 → "파일 준비 중입니다" 토스트 오류 발생 |
| **신** | ⚠ fileMap에 미등록 + 주요뉴스가 아닌 항목 → "파일 준비 중입니다" 토스트 오류 발생 |
|        | ⚠ **`gov` 링크(외부 사이트 연결) 사용 금지 — 반드시 자체 HTML 상세 페이지(`web`) 또는 PDF 직접 다운로드(`ext`) 방식만 사용** |

### 4. STEP 5. 다운로드 HTML 페이지 — 필수화

| 구분 | 내용 |
|------|------|
| **구** | 다운로드 HTML 페이지 **(가능하면 생성)** — 상세 페이지를 생성하면 클릭 시 바로 열린다. |
| **신** | 다운로드 HTML 페이지 **(필수 생성)** — 상세 페이지를 **반드시** 생성한다. 외부 사이트 연결(`gov`) 금지. |

### 5. handleDownload 로직 변경 (library.html)

| 구분 | 코드 |
|------|------|
| **구** | `if(m.ext){checkFile(m.ext,function(ok){if(ok){...다운로드...}else if(m.gov){window.open(m.gov)}else if(m.web){...}})}` |
| **신** | `if(m.ext){var a=document.createElement('a');a.href=m.ext;a.download=m.ext.split('/').pop();...a.click()...}` |
| **구** | `else if(m.gov){...confirm((m.label)+'에서 원문을 확인하시겠습니까?')...window.open(m.gov)}` |
| **신** | `else if(m.gov){window.open(m.gov);App.toast('...로 이동합니다')}` _(기존 항목 대비용. 신규 등록 시 gov 사용 금지)_ |

### 6. mainLibDownload 로직 변경 (index.html)

| 구분 | 코드 |
|------|------|
| **구** | `if(m.ext){var x=new XMLHttpRequest();x.open('HEAD',m.ext,true);x.onload=function(){if(x.status===200){...다운로드...}else if(m.gov){window.open(m.gov)}...};x.send()}` |
| **신** | `if(m.ext){var a=document.createElement('a');a.href=m.ext;a.download=m.ext.split('/').pop();...a.click()...}` |

### 7. 삭제된 코드

| 구분 | 내용 |
|------|------|
| **구** | `var fileCache={};` + `function checkFile(url,cb){...XMLHttpRequest HEAD...}` (library.html) |
| **신** | _(삭제됨 — 사전 파일 존재 확인 불필요)_ |

### 8. 다운로드 정책 섹션 신설

| 구분 | 내용 |
|------|------|
| **구** | _(해당 섹션 없음)_ |
| **신** | "다운로드 정책 (2026-04-10~)" 섹션 추가 — ext 직접 다운로드, web 자체 페이지, gov 금지 |

### 9. 전문가 상담 회원가입 필수화

| 구분 | 파일 | 내용 |
|------|------|------|
| **구** | `contact.html` | 누구나 상담 문의 폼 작성 가능 |
| **신** | `contact.html` | 비로그인 시 폼 숨김 → 로그인/회원가입 버튼 표시. 로그인 시 이름·이메일 자동 채움 |
| **구** | `chatbot.js` 전문가 탭 | 누구나 전문가 실시간 상담 이용 가능 |
| **신** | `chatbot.js` 전문가 탭 | 비로그인 시 "회원 전용 서비스" 안내 + 입력창 비활성화. AI·법률상담은 비회원 허용 |
| **구** | `index.html` 상담 버튼 | `<a href="pages/contact.html">` 직접 이동 |
| **신** | `index.html` 상담 버튼 | 비로그인 클릭 시 `login.html`로 리디렉션 (onclick 체크) |
| **구** | `consultation.html` CTA | `<a href="contact.html">` 직접 이동 |
| **신** | `consultation.html` CTA | 비로그인 클릭 시 `login.html`로 리디렉션 (onclick 체크) |
