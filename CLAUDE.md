# CLAUDE.md — 프로젝트 운영 지침 (2026.04.09~)

> **이 지침은 확인 없이 즉시 실행한다. 사용자에게 "할까요?" 묻지 말고 전부 수행 후 결과만 보고할 것.**

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
| 법령·조례 | `{gov:'원문URL', label:'출처명'}` | `'law0409a':{gov:'https://...', label:'하우징헤럴드 원문'}` |
| 판례·질의회신 | `{gov:'원문URL', label:'출처명'}` | `'case0409a':{gov:'https://...', label:'대법원 판례검색'}` |
| PDF 자료 | `{ext:'../downloads/files/파일.pdf'}` | — |

**⚠ fileMap에 미등록 + 주요뉴스가 아닌 항목 → "파일 준비 중입니다" 토스트 오류 발생**

### STEP 4. newsFileMap 등록 — index.html (주요뉴스만)

`index.html`의 `var newsFileMap={...}` 에 다운로드 HTML이 있는 뉴스 ID를 등록한다.
- 예: `'news0409e':'downloads/news_20260409e.html'`
- 다운로드 HTML이 없으면 등록 불필요 (자료실 주요뉴스 탭으로 자동 fallback)

### STEP 5. 다운로드 HTML 페이지 (가능하면 생성)

`redevelopment/downloads/` 에 상세 페이지를 생성하면 클릭 시 바로 열린다.
- 뉴스: `news_YYYYMMDD[a-z].html`
- 법령: `law_YYYYMMDD[a-z].html`
- 판례: `case_YYYYMMDD[a-z].html`

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

---

## 과거 장애 사례 (재발 방지)

| 날짜 | 증상 | 원인 | 조치 |
|------|------|------|------|
| 2026-04-09 | 법령·판례 항목 자료실 탭에서 미노출 | `catDefs` keys에 `'법령·조례'`, `'판례·질의회신'` 누락 | keys 배열 + _catKeyMap 추가 |
| 2026-04-09 | 법령·판례 클릭 시 "파일 준비 중" 토스트만 표시 | `fileMap`에 law/case ID 미등록 | fileMap에 gov 링크 등록 |
| 2026-04-09 | 뉴스 c/d/e/f 자동경로 생성 실패 | `handleDownload` regex가 `[ab]`만 처리 | `[a-z]`로 확장 |
| 2026-04-09 | 라이브 링크 404 | 도메인을 `seul21.vercel.app`으로 잘못 안내 | `seul21.com` 사용 |
