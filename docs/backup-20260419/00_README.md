# 세울엔지니어링 홈페이지 백업 패키지 — 2026-04-19

> **백업 라벨**: `backup-20260419`
> **백업 커밋**: `52574ee` (master HEAD 2026-04-19 오전 기준)
> **백업 사유**: 사용자 요청 (2026-04-19) — 전체 홈페이지 및 운영 자산 종합 백업
> **작성자**: Claude Code Agent

---

## 📦 이 패키지 구성

이 폴더(`docs/backup-20260419/`)는 **홈페이지 운영 문서 세트**입니다. 실제 소스 코드·데이터·업로드 파일은 이 문서 세트와 함께 **GitHub 백업 브랜치 + GitHub Actions ZIP 아티팩트 + Google Drive `00.공유폴더`** 3중으로 보관됩니다.

| 파일 | 내용 |
|------|------|
| `00_README.md` | 본 파일 — 백업 패키지 개요 |
| `01_홈페이지_전체구조도.md` | 사이트 전체 구조 다이어그램 (Mermaid) |
| `02_홈페이지_설명서.md` | 각 페이지·기능 사양 설명 |
| `03_홈페이지_제작설명서.md` | 기술 스택·디렉토리 구조·빌드 방법 |
| `04_홈페이지_유지관리설명서.md` | 일상 운영·장애 대응·배포 절차 |
| `05_연결프로그램_목록.md` | 외부 연동 시스템 전체 목록 |
| `06_로그인정보_템플릿.md` | 관리자 계정·API 키 기록 템플릿 |
| `07_인터넷연결_구성도.md` | 시스템 간 데이터 흐름 다이어그램 |
| `08_작업일지_누적.md` | git 커밋 기반 누적 작업 이력 |
| `09_백업복원_절차.md` | 백업 검증 및 복원 방법 |

---

## 🎯 백업 범위

### ✅ 포함 (이 백업으로 복원 가능)

1. **홈페이지 소스 전체** — `redevelopment/` 폴더 (HTML·CSS·JS)
2. **Serverless API** — `redevelopment/api/*.js`
3. **관리자 페이지** — `redevelopment/admin/*.html`
4. **인트라넷 페이지** — `redevelopment/intranet/*.html`
5. **공유 데이터** — `redevelopment/data/*.json`, `redevelopment/assets/data/mock-data.js`
6. **다운로드 자산** — `redevelopment/downloads/*.html`, `files/*`
7. **업로드 이미지** — `redevelopment/uploads/`, `redevelopment/jpg/`
8. **GitHub Actions 워크플로** — `.github/workflows/*.yml`
9. **운영 지침** — `CLAUDE.md`, `OPERATIONS.md`
10. **배포 설정** — `vercel.json`

### ⚠ 미포함 (별도 백업 필요)

다음 데이터는 **GitHub 저장소 밖**에 존재하여 이 백업에 포함되지 않습니다. 사용자가 별도 관리해야 합니다:

| 자산 | 보관 위치 | 백업 방법 |
|------|----------|----------|
| Vercel 환경변수 | Vercel Dashboard | Vercel Settings → Environment Variables 수동 export |
| GitHub Secrets | GitHub Settings | Secrets는 열람 불가 — 원본 발급처에서 재발급 |
| Telegram Bot Token | BotFather | @BotFather 에서 재발급 |
| Google OAuth Client | Google Cloud Console | Cloud Console에서 JSON 재다운로드 |
| Supabase DB 데이터 | Supabase Cloud | Supabase Dashboard → Database Backups |
| 도메인(seul21.com) 소유권 | 가비아(Gabia) | 가비아 계정 영수증/갱신 정보 |
| 웹하드 파일 원본 | 외부 웹하드 서비스 | 서비스 제공사 다운로드 기능 사용 |

---

## 🔗 백업 위치 (3중)

### 1. GitHub 브랜치 (영구)
```
브랜치: backup-20260419
태그:   backup-20260419-v1
URL:    https://github.com/dodo9944-ops/seul21/tree/backup-20260419
복원:   git checkout backup-20260419
```

### 2. GitHub Actions Artifacts (90일)
```
URL:   https://github.com/dodo9944-ops/seul21/actions
파일:  seul21_backup_20260419_<sha>.zip
트리거: .github/workflows/backup-to-gdrive.yml → Run workflow
```

### 3. Google Drive `00.공유폴더/세울21_백업/` (영구)
```
경로:  Google Drive / 00.공유폴더 / 세울21_백업 / backup-20260419/
구성:  seul21_backup_20260419_<sha>.zip + BACKUP_20260419.md
자동:  GitHub Actions 워크플로 성공 시 자동 업로드
```

> **사용자 로컬 PC 바탕화면 저장**은 Claude가 직접 수행할 수 없으므로, 위 3개 위치 중 한 곳에서 사용자가 직접 다운로드해야 합니다.

---

## 🚀 바탕화면으로 내려받기 (사용자 수동 작업)

### 방법 1: GitHub에서 ZIP 다운로드 (권장·가장 빠름)
1. 삼성 인터넷 또는 Edge 브라우저로 접속:
   `https://github.com/dodo9944-ops/seul21/archive/refs/heads/backup-20260419.zip`
2. 다운로드 폴더에 저장 → 바탕화면으로 이동

### 방법 2: GitHub Actions Artifact 다운로드
1. `https://github.com/dodo9944-ops/seul21/actions` 접속
2. "Backup to Google Drive" 워크플로 최신 실행 클릭
3. 페이지 하단 **Artifacts** 섹션에서 `seul21_backup_20260419` ZIP 다운로드

### 방법 3: Google Drive에서 다운로드
1. Google Drive → `00.공유폴더` → `세울21_백업` → `backup-20260419` 폴더
2. ZIP 파일 우클릭 → 다운로드

---

## 📌 백업 검증 체크리스트

백업 후 다음 항목을 사용자가 직접 확인:

- [ ] GitHub `backup-20260419` 브랜치가 원격에 존재하는가 (`git ls-remote origin | grep backup-20260419`)
- [ ] GitHub Actions 아티팩트에 ZIP 파일이 생성되었는가
- [ ] Google Drive `00.공유폴더`에 ZIP이 업로드되었는가 (시크릿 설정 시)
- [ ] 바탕화면에 다운로드한 ZIP 압축 풀기 정상 동작하는가
- [ ] 다운로드한 압축 안에 `redevelopment/`, `docs/backup-20260419/`, `.github/` 폴더가 있는가
