# 세울엔지니어링 공식 홈페이지

프리미엄 네이비·골드 톤의 정적 웹사이트입니다.

## 폴더 구조

```
seul/
├── index.html            # 메인 페이지 (히어로 + 4개 핵심 카드)
├── pages/                # 서브 페이지
│   ├── about.html
│   ├── services.html
│   ├── projects.html
│   └── contact.html
├── assets/
│   ├── css/style.css     # 프리미엄 테마 + 반응형 + safe-area
│   ├── js/main.js        # 인터랙션
│   └── images/           # (이미지 추가 위치)
├── admin/
│   └── index.html        # 관리자 로그인 스텁
├── .gitignore
└── README.md
```

## 주요 특징

- **프리미엄 네이비·골드 팔레트** (`--navy-900` ~ `--gold-500`)
- **히어로 영역**: 좌측 카피/통계 + 우측 4개 핵심 서비스 카드 (2x2 그리드)
- **모바일 하단 고정 메뉴바** (홈/서비스/프로젝트/전화/문의)
- **iPhone safe-area 대응** — `env(safe-area-inset-*)`, `viewport-fit=cover`
- **Google Fonts**: Cormorant Garamond + Noto Sans KR
- 모바일 ≤ 900px에서 상단 메뉴 숨김 → 하단바로 전환
- `prefers-reduced-motion` 지원

## 실행 방법

HTML/CSS/JS 만으로 된 정적 사이트라 별도 빌드가 필요 없습니다.

### 1) 가장 빠른 방법 — 파일 더블클릭
`index.html`을 브라우저로 열면 됩니다.

### 2) 로컬 서버 (권장)
일부 기능(폰트 preconnect 등)은 `file://`보다 `http://`에서 더 정확하게 동작합니다.

```bash
# Python 3
cd C:/seul
python -m http.server 5500
# → http://localhost:5500 접속
```

```bash
# Node.js (npx)
cd C:/seul
npx serve .
```

```bash
# VS Code
# "Live Server" 확장 설치 후 index.html 우클릭 → "Open with Live Server"
```

### 3) 모바일에서 확인
같은 Wi-Fi에서 PC IP로 접속 (`http://192.168.x.x:5500`) 하거나,
Chrome DevTools의 iPhone 시뮬레이터(특히 iPhone 14 Pro)에서 safe-area 적용을 확인하세요.

## 다음 단계 제안

- `assets/images/` 에 실제 프로젝트 사진·로고 추가
- `admin/`에 실제 CMS/백엔드 연동 (Firebase, Supabase 등)
- Open Graph/Twitter 메타 태그 추가
- Favicon/PWA manifest 추가
