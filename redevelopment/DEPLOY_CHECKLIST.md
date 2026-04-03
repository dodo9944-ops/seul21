# 세울 배포 체크리스트

> 사이트를 실 서버에 배포할 때 확인해야 할 항목을 단계별로 정리한 문서입니다.

---

## 1. 사전 준비

### 도메인

- [ ] 도메인 구매 완료 (예: jaegaebal.com)
- [ ] DNS 네임서버 설정 완료
- [ ] www 서브도메인 리다이렉트 설정

### 호스팅

- [ ] 호스팅 서비스 선정 및 계정 생성
  - 정적 호스팅 권장: Netlify, Vercel, GitHub Pages, AWS S3 + CloudFront 등
  - 서버 호스팅: Nginx, Apache 등
- [ ] 호스팅 플랜 확인 (트래픽, 저장공간, 대역폭)
- [ ] FTP/SFTP 또는 Git 배포 환경 설정

### SSL 인증서

- [ ] SSL/TLS 인증서 발급 (Let's Encrypt 무료 인증서 또는 유료 인증서)
- [ ] HTTPS 강제 리다이렉트 설정 (HTTP -> HTTPS)
- [ ] 인증서 자동 갱신 설정

---

## 2. 파일 업로드

- [ ] 프로젝트 전체 파일을 서버에 업로드
- [ ] 디렉토리 구조 확인:

```
/
├── index.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── admin/
│   ├── login.html
│   ├── index.html
│   └── areas.html
├── pages/
│   ├── areas.html
│   ├── area-detail.html
│   ├── listings.html
│   ├── listing-detail.html
│   ├── news.html
│   ├── news-detail.html
│   ├── columns.html
│   ├── column-detail.html
│   ├── community.html
│   ├── community-detail.html
│   ├── community-write.html
│   ├── calculator.html
│   ├── map.html
│   ├── market.html
│   ├── reconstruction.html
│   ├── reconstruction-detail.html
│   ├── legal-guide.html
│   ├── notice.html
│   ├── faq.html
│   ├── contact.html
│   └── login.html
├── assets/
│   ├── css/
│   ├── js/
│   ├── data/
│   └── img/
└── reference/
```

- [ ] 모든 파일이 정상적으로 업로드되었는지 확인
- [ ] 파일 권한(permission) 확인 (HTML/CSS/JS: 644, 디렉토리: 755)

---

## 3. 도메인 설정

### sitemap.xml 도메인 변경

- [ ] `sitemap.xml` 파일을 열고 모든 URL의 도메인을 실제 도메인으로 변경

```xml
<!-- 변경 전 -->
<loc>https://example.com/</loc>

<!-- 변경 후 -->
<loc>https://jaegaebal.com/</loc>
```

### robots.txt 확인

- [ ] `robots.txt` 파일의 `Sitemap` 경로가 실제 도메인으로 되어 있는지 확인

```
User-agent: *
Allow: /

Sitemap: https://jaegaebal.com/sitemap.xml
```

- [ ] 관리자 페이지 크롤링 차단 확인 (필요 시):

```
Disallow: /admin/
```

### site.webmanifest 수정

- [ ] `site.webmanifest` 파일의 내용을 실제 사이트에 맞게 수정
  - `name`: 사이트 이름
  - `short_name`: 짧은 이름
  - `start_url`: 시작 URL
  - 아이콘 경로 확인

### OG 이미지 경로 확인

- [ ] `og:image` 메타 태그의 이미지 경로가 절대 경로(전체 URL)로 설정되어 있는지 확인

```html
<meta property="og:image" content="https://jaegaebal.com/assets/img/og-image.png">
```

- [ ] OG 이미지 파일이 서버에 존재하는지 확인
- [ ] OG 이미지 권장 크기: 1200x630px

---

## 4. 관리자 계정 보안

### mock-data.js 관리자 비밀번호 변경

- [ ] `assets/data/mock-data.js` 파일의 `adminAccount` 객체에서 기본 비밀번호를 변경

```javascript
// 변경 전 (기본값)
adminAccount: {
  username: 'admin',
  password: 'admin1234',   // 반드시 변경!
  name: '관리자'
}

// 변경 후
adminAccount: {
  username: 'admin',       // 아이디도 변경 권장
  password: '안전한비밀번호',
  name: '관리자'
}
```

- [ ] 비밀번호 복잡도 확인 (영문 대소문자 + 숫자 + 특수문자 조합 권장)
- [ ] 기존에 localStorage에 저장된 관리자 계정 정보가 있다면 데이터 초기화 수행

### 관리자 URL 접근 제한 검토

- [ ] `/admin/` 경로에 대한 접근 제한 설정 검토
  - IP 기반 접근 제한 (서버 설정)
  - 기본 인증(Basic Auth) 추가 레이어
- [ ] `admin/login.html`의 데모 계정 안내 문구 제거 또는 수정

```html
<!-- 삭제 또는 수정 필요 -->
<div class="demo-info">
    <i class="fa-solid fa-circle-info"></i> 데모 계정: admin / admin1234
</div>
```

> **중요:** 현재 인증 시스템은 클라이언트 측 mock 인증입니다. 실 서비스에서는 반드시 서버 측 인증으로 전환해야 합니다.

---

## 5. SEO 설정

### meta description 확인

- [ ] `index.html` 및 주요 페이지의 `<meta name="description">` 태그 확인
- [ ] 각 페이지별 고유한 설명문이 있는지 확인 (권장 길이: 50~160자)

### og:title, og:description 확인

- [ ] 모든 페이지의 Open Graph 태그 확인:

```html
<meta property="og:title" content="세울 - 대한민국 No.1 재개발·재건축 정보">
<meta property="og:description" content="전국 정비구역 현황, 실시간 시세, 매물 정보...">
<meta property="og:image" content="https://jaegaebal.com/assets/img/og-image.png">
<meta property="og:url" content="https://jaegaebal.com/">
<meta property="og:type" content="website">
```

- [ ] Twitter Card 태그 확인 (선택)

### 사이트맵 검색엔진 제출

- [ ] Google Search Console에 사이트 등록
  - 소유권 확인 (HTML 파일, DNS TXT 레코드, 또는 메타 태그)
  - `sitemap.xml` 제출
- [ ] Naver Search Advisor에 사이트 등록
  - 소유권 확인
  - 사이트맵 제출
- [ ] Daum/카카오 검색등록 (선택)
- [ ] Bing Webmaster Tools 등록 (선택)

---

## 6. 성능 최적화

### 이미지 최적화

- [ ] 모든 이미지를 웹 최적화 포맷으로 변환
  - JPEG: 품질 80~85%로 압축
  - PNG: 투명 배경이 필요한 경우만 사용, 나머지는 JPEG/WebP
  - WebP: 최신 브라우저 대응 시 사용 권장
- [ ] 이미지 크기 적정화 (필요 이상 큰 이미지 리사이즈)
- [ ] OG 이미지: 1200x630px 권장
- [ ] `<img>` 태그에 `width`, `height` 속성 지정 (CLS 방지)
- [ ] `loading="lazy"` 속성 추가 (스크롤 아래 이미지)

### CSS/JS 미니파이

- [ ] CSS 파일 미니파이
  - `common.css` -> `common.min.css`
  - `admin.css` -> `admin.min.css`
- [ ] JS 파일 미니파이
  - `common.js` -> `common.min.js`
  - `data-service.js` -> `data-service.min.js`
  - `mock-data.js` -> `mock-data.min.js`
- [ ] HTML 내 인라인 CSS/JS 최소화
- [ ] 미니파이 도구 예시: Terser(JS), cssnano(CSS), html-minifier(HTML)

### CDN 설정

- [ ] 정적 자산(이미지, CSS, JS, 폰트)에 대한 CDN 적용
- [ ] CDN 캐시 정책 설정
  - HTML: 짧은 캐시 (no-cache 또는 max-age=300)
  - CSS/JS: 파일명에 해시 추가 후 장기 캐시 (max-age=31536000)
  - 이미지: 장기 캐시 (max-age=2592000)
- [ ] 현재 사용 중인 외부 CDN 리소스 확인:
  - Google Fonts (Noto Sans KR)
  - Font Awesome 6.5.1
  - 외부 CDN 장애 시 대비 방안 검토

---

## 7. 테스트

### 모바일 반응형 테스트

- [ ] 주요 페이지를 다양한 화면 크기에서 테스트:
  - 모바일: 360px, 375px, 414px
  - 태블릿: 768px, 1024px
  - 데스크톱: 1280px, 1920px
- [ ] 관리자 페이지 사이드바 모바일 토글 동작 확인
- [ ] 메인 페이지 히어로 배너 반응형 확인
- [ ] 테이블, 폼 요소 모바일 레이아웃 확인

### 크로스 브라우저 테스트

- [ ] Chrome (최신)
- [ ] Safari (최신, macOS/iOS)
- [ ] Firefox (최신)
- [ ] Edge (최신)
- [ ] Samsung Internet (모바일)
- [ ] 최소 지원 브라우저 범위 결정

### 모든 링크 동작 확인

- [ ] 메인 네비게이션 메뉴 링크 전체 확인
- [ ] 푸터 링크 확인
- [ ] 관리자 사이드바 링크 확인
- [ ] 404 페이지 동작 확인 (존재하지 않는 URL 접근 시)
- [ ] 외부 링크 새 탭 열기(`target="_blank"`) 확인

### 폼 제출 테스트

- [ ] 관리자 로그인 폼
  - 올바른 계정으로 로그인
  - 잘못된 계정으로 로그인 시 에러 메시지
- [ ] 사용자 로그인 폼
- [ ] 문의 폼 (`pages/contact.html`)
  - 필수 필드 유효성 검사
  - 제출 후 데이터 저장 확인
- [ ] 커뮤니티 글쓰기 폼 (`pages/community-write.html`)
- [ ] 관리자 구역/매물/뉴스 등록·수정 폼

### 기능 테스트

- [ ] 관심구역 즐겨찾기 기능
- [ ] 검색 기능 (구역, 매물, 뉴스 등)
- [ ] 필터링 및 정렬
- [ ] 페이지네이션
- [ ] 비례율 계산기
- [ ] 지도 페이지 마커 표시 및 클릭

---

## 8. 백엔드 연동 시 (향후)

현재 사이트는 `localStorage` + `mock-data.js` 기반의 클라이언트 측 데이터로 동작합니다. 향후 실 서버 백엔드와 연동할 때 아래 항목을 검토합니다.

### data-service.js API 전환

- [ ] `assets/js/data-service.js` 파일의 내부 구현을 REST API 호출로 교체
  - 현재: `localStorage.getItem()` / `localStorage.setItem()`
  - 변경: `fetch()` 또는 `axios` 등 HTTP 클라이언트 사용
- [ ] 공개 API(public):
  - `getAll(collection)` -> `GET /api/{collection}`
  - `getById(collection, id)` -> `GET /api/{collection}/{id}`
  - `query(collection, options)` -> `GET /api/{collection}?filter=...&sort=...&page=...`
- [ ] 관리자 API(admin):
  - `create(collection, item)` -> `POST /api/admin/{collection}`
  - `update(collection, id, changes)` -> `PATCH /api/admin/{collection}/{id}`
  - `remove(collection, id)` -> `DELETE /api/admin/{collection}/{id}`
- [ ] DataService의 공개 인터페이스(`getAll`, `getById`, `create`, `update`, `remove`, `query`)는 유지하여 프론트엔드 코드 변경을 최소화

### localStorage -> 서버 DB

- [ ] 데이터베이스 선정 (MySQL, PostgreSQL, MongoDB 등)
- [ ] `mock-data.js`의 데이터를 DB 초기 시드 데이터로 마이그레이션
- [ ] 각 컬렉션별 DB 테이블/컬렉션 생성:
  - `areas`, `listings`, `news`, `columns`, `community`
  - `faq`, `notices`, `schedule`, `banners`
  - `inquiries`, `members`, `settings`, `legalGuides`
- [ ] `localStorage` 의존 코드 제거 (data-service.js 교체로 자동 해결)
- [ ] 즐겨찾기 기능: 서버 측 사용자별 즐겨찾기 저장으로 전환

### 인증 시스템 교체

- [ ] 현재 mock 인증을 실 인증 시스템으로 교체:
  - 관리자: `sessionStorage` 기반 -> JWT 또는 세션 기반 서버 인증
  - 사용자: `sessionStorage` 기반 -> OAuth 2.0 또는 이메일/비밀번호 인증
- [ ] 비밀번호 해싱 (bcrypt 등) 적용
- [ ] CSRF 토큰 적용
- [ ] 관리자 API에 인증 미들웨어 적용
- [ ] 로그인 시도 횟수 제한 (Brute Force 방지)
- [ ] 로그아웃 시 서버 측 세션/토큰 무효화

### 추가 검토 사항

- [ ] 파일 업로드 기능 (이미지 서버 저장)
- [ ] 실시간 알림 시스템 (WebSocket)
- [ ] 이메일 발송 기능 (문의 답변 알림)
- [ ] 정기 백업 설정
- [ ] 에러 로깅 및 모니터링

---

## 배포 후 확인

- [ ] HTTPS 접속 정상 여부
- [ ] 메인 페이지 로딩 속도 (3초 이내 권장)
- [ ] Google PageSpeed Insights 점수 확인
- [ ] 검색엔진 색인 요청 후 반영 확인
- [ ] 관리자 로그인 및 주요 기능 동작 확인
- [ ] 모바일에서 실제 디바이스 테스트
