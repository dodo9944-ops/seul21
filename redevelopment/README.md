# 세울 — 재개발·재건축 종합정보 플랫폼

대한민국 No.1 재개발·재건축·도시정비 종합정보 웹사이트의 프론트엔드 프로토타입입니다.

## 프로젝트 개요

- **목적**: 재개발·재건축 구역 정보, 시세, 매물, 뉴스, 커뮤니티를 통합 제공하는 포털 사이트
- **기술**: HTML5 + CSS3 + Vanilla JavaScript (정적 사이트, 빌드 도구 불필요)
- **데이터**: localStorage + JSON mock data 기반 (백엔드 없이 시연 가능)
- **디자인**: 삼성/네이버 부동산 스타일의 고급스러운 UI

## 폴더 구조

```
redevelopment/
├── index.html                # 메인 홈페이지
├── 404.html                  # 404 에러 페이지
├── robots.txt                # 검색엔진 크롤링 설정
├── sitemap.xml               # 사이트맵
├── site.webmanifest          # PWA 매니페스트
│
├── pages/                    # 퍼블릭 페이지
│   ├── areas.html            # 재개발 구역 목록
│   ├── area-detail.html      # 구역 상세
│   ├── reconstruction.html   # 재건축 구역 목록
│   ├── reconstruction-detail.html
│   ├── listings.html         # 매물 목록
│   ├── listing-detail.html   # 매물 상세
│   ├── market.html           # 시세·분석
│   ├── news.html             # 뉴스 목록
│   ├── news-detail.html      # 뉴스 상세
│   ├── columns.html          # 전문가 칼럼
│   ├── column-detail.html    # 칼럼 상세
│   ├── community.html        # 커뮤니티 목록
│   ├── community-detail.html # 커뮤니티 상세
│   ├── community-write.html  # 글쓰기
│   ├── legal-guide.html      # 법률·세금 가이드
│   ├── calculator.html       # 비례율 계산기
│   ├── map.html              # 정비구역 지도
│   ├── notice.html           # 공지사항
│   ├── faq.html              # FAQ
│   ├── contact.html          # 고객센터·1:1 문의
│   ├── login.html            # 로그인
│   ├── register.html         # 회원가입
│   ├── find-id.html          # 아이디 찾기
│   ├── reset-password.html   # 비밀번호 재설정
│   ├── mypage.html           # 마이페이지
│   └── favorites.html        # 관심구역·관심매물
│
├── admin/                    # 관리자 페이지
│   ├── login.html            # 관리자 로그인
│   ├── index.html            # 대시보드
│   ├── areas.html            # 구역 관리
│   ├── listings.html         # 매물 관리
│   ├── news.html             # 뉴스 관리
│   ├── columns.html          # 칼럼 관리
│   ├── community.html        # 게시글 관리
│   ├── inquiries.html        # 문의 관리
│   ├── banners.html          # 배너 관리
│   ├── schedule.html         # 일정 관리
│   ├── members.html          # 회원 관리
│   ├── settings.html         # 사이트 설정
│   ├── seo.html              # SEO 관리
│   └── menus.html            # 메뉴 관리
│
├── assets/
│   ├── css/
│   │   ├── common.css        # 공통 스타일 (디자인 토큰, 컴포넌트)
│   │   └── admin.css         # 관리자 전용 스타일
│   ├── js/
│   │   ├── common.js         # 공통 JS (헤더/푸터 주입, 유틸리티)
│   │   └── data-service.js   # 데이터 서비스 레이어 (CRUD, 인증)
│   ├── data/
│   │   └── mock-data.js      # 초기 더미 데이터
│   └── img/                  # 이미지 (placeholder)
│
├── reference/
│   └── design-home.png       # 디자인 참고 이미지
│
├── README.md                 # 이 파일
├── ADMIN_GUIDE.md            # 관리자 가이드
├── DEPLOY_CHECKLIST.md       # 배포 체크리스트
└── DATA_SCHEMA.md            # 데이터 스키마
```

## 페이지 목록 (총 40+ 페이지)

### 퍼블릭 (26페이지)
| 페이지 | 경로 | 설명 |
|--------|------|------|
| 메인 | `/index.html` | 히어로, 추천구역, 시세, 매물, 뉴스, 커뮤니티 |
| 재개발 목록 | `/pages/areas.html` | 필터, 정렬, 카드 리스트 |
| 재개발 상세 | `/pages/area-detail.html?id=` | 구역 정보, 매물, 지도 |
| 재건축 목록 | `/pages/reconstruction.html` | 재건축 전용 필터 |
| 재건축 상세 | `/pages/reconstruction-detail.html?id=` | 상세 정보 |
| 매물 목록 | `/pages/listings.html` | 유형별 필터, 가격대 |
| 매물 상세 | `/pages/listing-detail.html?id=` | 매물 정보, 문의 폼 |
| 시세·분석 | `/pages/market.html` | 시세 테이블, 차트 |
| 뉴스 목록 | `/pages/news.html` | 카테고리별 뉴스 |
| 뉴스 상세 | `/pages/news-detail.html?id=` | 기사 전문 |
| 칼럼 목록 | `/pages/columns.html` | 전문가 칼럼 카드 |
| 칼럼 상세 | `/pages/column-detail.html?id=` | 칼럼 전문 |
| 커뮤니티 | `/pages/community.html` | 카테고리 탭, 글 목록 |
| 커뮤니티 상세 | `/pages/community-detail.html?id=` | 글, 댓글, 좋아요 |
| 글쓰기 | `/pages/community-write.html` | 게시글 작성 |
| 법률·세금 | `/pages/legal-guide.html` | 가이드 카드 + 모달 |
| 비례율 계산기 | `/pages/calculator.html` | 인터랙티브 계산기 |
| 정비구역 지도 | `/pages/map.html` | 지도 UI (API 미연동) |
| 공지사항 | `/pages/notice.html` | 공지 목록 |
| FAQ | `/pages/faq.html` | 아코디언 FAQ |
| 고객센터 | `/pages/contact.html` | 문의 폼 |
| 로그인 | `/pages/login.html` | 로그인 폼 |
| 회원가입 | `/pages/register.html` | 가입 폼 |
| 아이디 찾기 | `/pages/find-id.html` | 아이디 조회 |
| 비번 재설정 | `/pages/reset-password.html` | 비번 리셋 |
| 마이페이지 | `/pages/mypage.html` | 회원 정보 |
| 관심목록 | `/pages/favorites.html` | 즐겨찾기 |

### 관리자 (14페이지)
| 페이지 | 경로 | 설명 |
|--------|------|------|
| 관리자 로그인 | `/admin/login.html` | 인증 |
| 대시보드 | `/admin/index.html` | KPI, 빠른 등록, 최근 활동 |
| 구역 관리 | `/admin/areas.html` | CRUD + 노출 토글 |
| 매물 관리 | `/admin/listings.html` | CRUD |
| 뉴스 관리 | `/admin/news.html` | CRUD + featured 토글 |
| 칼럼 관리 | `/admin/columns.html` | CRUD |
| 게시글 관리 | `/admin/community.html` | 조회 + 삭제 |
| 문의 관리 | `/admin/inquiries.html` | 답변 + 상태 변경 |
| 배너 관리 | `/admin/banners.html` | 순서, 활성 토글 |
| 일정 관리 | `/admin/schedule.html` | CRUD |
| 회원 관리 | `/admin/members.html` | 상태 관리 |
| 사이트 설정 | `/admin/settings.html` | 기본 설정 |
| SEO 관리 | `/admin/seo.html` | 메타 정보 |
| 메뉴 관리 | `/admin/menus.html` | 네비게이션 관리 |

## 실행 방법

### 방법 1: 직접 열기
`index.html`을 브라우저에서 직접 열기 (Chrome, Edge 권장)

### 방법 2: 로컬 서버 (권장)
```bash
# Python
cd redevelopment
python -m http.server 8080

# Node.js
npx serve .

# VS Code
# Live Server 확장 설치 후 index.html 우클릭 → Open with Live Server
```
`http://localhost:8080` 접속

### 관리자 접속
1. `/admin/login.html` 이동
2. 아이디: `admin` / 비밀번호: `admin1234`

### 퍼블릭 사용자 로그인 (데모)
1. `/pages/login.html` 이동
2. 이메일: `dodo6666@naver.com` (아무 이메일로 로그인 가능)

## 업로드 방법

1. `redevelopment/` 폴더 전체를 웹 호스팅 서버의 루트 디렉토리에 업로드
2. `sitemap.xml`의 도메인을 실제 도메인으로 변경
3. `robots.txt` 확인
4. 관리자 계정 비밀번호 변경 (mock-data.js)
5. 자세한 내용은 `DEPLOY_CHECKLIST.md` 참조

## 커스터마이징 포인트

| 항목 | 파일 | 설명 |
|------|------|------|
| 디자인 토큰 | `assets/css/common.css` | :root 변수 (색상, 폰트, 여백) |
| 초기 데이터 | `assets/data/mock-data.js` | 구역, 매물, 뉴스 등 모든 데이터 |
| 데이터 로직 | `assets/js/data-service.js` | CRUD, 인증, 검색 로직 |
| 공통 UI | `assets/js/common.js` | 헤더/푸터 HTML, 유틸리티 |
| 관리자 스타일 | `assets/css/admin.css` | 관리자 전용 레이아웃 |

## 기술 스택

- HTML5 시맨틱 마크업
- CSS3 (CSS 변수, Grid, Flexbox, 미디어 쿼리)
- Vanilla JavaScript (ES6+)
- Font Awesome 6.5 (아이콘)
- Noto Sans KR (웹폰트)
- localStorage (데이터 영속성)

## 라이선스

이 프로젝트는 시연·제안·프로토타이핑 목적으로 제작되었습니다.
