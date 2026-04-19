# 텔레그램 관리자 봇 설정 가이드

세울 홈페이지를 텔레그램으로 관리하는 봇입니다. 파일: `redevelopment/api/telegram-admin.js`

## 지원 명령

| 명령 | 설명 |
|---|---|
| `/status` | 사이트 헬스·최근 배포·최근 커밋 |
| `/deploy` | Vercel 재배포 트리거 |
| `/news_add` | 뉴스 등록 (대화형: 제목→카테고리→요약→본문→태그) |
| `/news_del <id>` | 뉴스 삭제 (자동 백업 브랜치 생성) |
| `/news_crawl` | 구글 뉴스 RSS로 정비사업 기사 수집·선택·등록 |
| `/case_add` | PDF/HWP 파일 업로드 → `redevelopment/downloads/`에 저장 |
| `/cancel` | 진행 중 위저드 취소 |
| `/help` | 명령어 목록 |

## 환경변수 (Vercel Project Settings → Environment Variables)

### 필수

| 변수 | 용도 | 발급 방법 |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | 텔레그램 봇 API 토큰 | @BotFather에서 `/newbot` 또는 기존 토큰 |
| `TELEGRAM_WEBHOOK_SECRET` | 웹훅 검증용 시크릿 | 랜덤 문자열 32~64자 (예: `openssl rand -hex 32`) |
| `TELEGRAM_ADMIN_IDS` | 관리자 user ID (쉼표 구분) | 텔레그램 @userinfobot에 `/start` |
| `GITHUB_TOKEN` | 리포 편집·브랜치 생성 | github.com/settings/tokens (scope: `repo`) |
| `VERCEL_DEPLOY_HOOK_URL` | 재배포 트리거 | Vercel 프로젝트 → Settings → Git → Deploy Hooks |

### 선택

| 변수 | 용도 |
|---|---|
| `VERCEL_API_TOKEN` | `/status`에서 최신 배포 상태 조회 |
| `VERCEL_PROJECT_ID` | 위와 함께 필요 |
| `VERCEL_TEAM_ID` | 팀 소유 프로젝트일 때 |
| `SITE_URL` | 헬스체크 URL (기본: `https://seul21.vercel.app`) |

## 배포 절차

1. **코드 푸시**
   ```bash
   git add redevelopment/api/telegram-admin.js redevelopment/docs/TELEGRAM_ADMIN_SETUP.md
   git commit -m "feat: 텔레그램 관리자 봇 (/status /deploy /news_add /news_del /news_crawl /case_add)"
   git push origin master
   ```

2. **Vercel 환경변수 등록** — 위 표의 필수 5개 먼저.

3. **자동 재배포** 완료 후 브라우저로 확인:
   ```
   https://seul21.vercel.app/api/telegram-admin
   ```
   응답 예시:
   ```json
   { "bot": "telegram-admin", "webhookUrl": "...", "required_env": [...] }
   ```

4. **웹훅 등록** — 브라우저에서 1회 호출:
   ```
   https://seul21.vercel.app/api/telegram-admin?action=set
   ```
   `{ "ok": true, "result": true, ... }` 나오면 성공.

5. **확인** — 텔레그램에서 봇 검색 후 `/start` → 메뉴가 뜨면 OK.

## 웹훅 관리

| URL | 동작 |
|---|---|
| `/api/telegram-admin?action=info` | 현재 웹훅 상태 조회 |
| `/api/telegram-admin?action=set` | 웹훅 등록/갱신 |
| `/api/telegram-admin?action=delete` | 웹훅 해제 |

## 보안 체크리스트

- [x] `TELEGRAM_WEBHOOK_SECRET`로 요청 헤더 검증 (타인이 웹훅 흉내내기 차단)
- [x] `TELEGRAM_ADMIN_IDS` 화이트리스트 (등록되지 않은 user ID는 전부 거부)
- [x] `/news_del` 실행 시 삭제 전 `backup-news-del-YYYYMMDDHHmm` 브랜치 자동 생성
- [x] 파일 업로드 20MB 제한
- [x] 세션은 15분 후 자동 만료
- [ ] (선택) Vercel 로그에 관리자 명령 이력 감사 — 추후 확장

## 동작 원리

```
[텔레그램 앱]
    ↓ (관리자 명령)
[Telegram Bot API]
    ↓ webhook POST (with x-telegram-bot-api-secret-token)
[Vercel Serverless: /api/telegram-admin]
    ↓ 시크릿 검증 + user ID 화이트리스트
[명령 라우터]
    ├── /status      → HEAD site + Vercel API + GitHub API
    ├── /deploy      → POST Vercel Deploy Hook
    ├── /news_add    → 세션 위저드 → mock-data.js 편집 커밋
    ├── /news_del    → 백업 브랜치 생성 후 삭제 커밋
    ├── /news_crawl  → Google News RSS → dedup → 선택 → 커밋
    └── /case_add    → Telegram 파일 받아서 /downloads/로 업로드 커밋
    ↓
[GitHub push → Vercel 자동 재배포]
    ↓ 1~2분
[반영 완료]
```

## 문제 해결

**Q. 메시지를 보내도 응답이 없음**
1. `?action=info`로 웹훅 URL이 올바른지 확인
2. Vercel 로그(Functions → telegram-admin)에서 에러 확인
3. `TELEGRAM_ADMIN_IDS`에 본인 user ID가 있는지 확인 (없으면 `권한 없음` 경고만 표시)

**Q. 뉴스 등록 후 홈페이지에 안 보임**
1. Vercel 배포가 완료됐는지 (2분 정도 소요)
2. 브라우저 캐시/서비스워커 삭제 후 재접속

**Q. `/news_del`이 실패할 때**
- `id`가 정확한지 확인 (`/news_add` 등록 메시지의 `n1`, `n2`...)
- 백업 브랜치는 생성됐지만 삭제 실패했다면, GitHub에서 해당 브랜치만 지우고 재시도

## 세션 파일

위저드 상태는 리포 내 `redevelopment/data/telegram-sessions.json`에 저장됨.

- 15분 지나면 자동 만료
- `/cancel`로 수동 제거
- 이 파일은 민감정보를 포함하지 않지만, 공개가 싫으면 `.gitignore`에 추가 고려 (단, Vercel Serverless는 파일시스템 쓰기 불가이므로 GitHub 저장 외 대안은 Vercel KV/Upstash로 확장해야 함)
