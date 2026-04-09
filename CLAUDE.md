# CLAUDE.md — 프로젝트 운영 지침

## 라이브 도메인
- 사이트 URL: **https://seul21.com**
- 홈페이지: https://seul21.com/
- 자료실: https://seul21.com/pages/library.html

## 배포 자동 반영 규칙
- 작업 완료 후 커밋·푸시 시, **master 브랜치에 자동 머지하고 푸시**까지 완료할 것 (별도 확인 불필요)
- PR 생성 없이 직접 머지 방식 사용
- 머지 후 라이브 링크를 안내할 것

---

## 자료실 데이터 추가 시 필수 체크리스트

자료실(`MOCK.library`)에 항목을 추가할 때 아래 **모든 항목**을 반드시 수행할 것.
하나라도 누락하면 라이브에서 필터 누락·토스트 오류·404 등이 발생한다.

### 1. 카테고리 매핑 확인
새 카테고리명을 사용할 경우, 기존 필터 키와 매칭되는지 확인하고 없으면 추가한다.

| 파일 | 위치 | 수정 대상 |
|------|------|-----------|
| `pages/library.html` | `catDefs` 배열 | 해당 탭의 `keys` 배열에 새 카테고리명 추가 |
| `index.html` | `_catKeyMap` 객체 | 새 카테고리명 → 기존 키 매핑 추가 |

현재 등록된 카테고리 매핑:
- **주요뉴스**: `'주요뉴스'`
- **법령·제도 탭**: `'법령'`, `'법령·조례'`
- **고시·공고 탭**: `'관련판례'`, `'지침'`, `'판례·질의회신'`
- **서식·매뉴얼 탭**: `'서식'`, `'가이드'`
- **입찰공고 탭**: `'입찰공고'`

### 2. fileMap 등록 (library.html)
`pages/library.html`의 `var fileMap={...}` 에 새 항목 ID를 반드시 추가한다.

- **뉴스(주요뉴스)**: 다운로드 HTML이 있으면 `{web:'../downloads/news_YYYYMMDD[x].html'}`
- **법령·조례**: 원문 출처 URL이 있으면 `{gov:'URL', label:'출처명'}`
- **판례·질의회신**: 원문 출처 URL이 있으면 `{gov:'URL', label:'출처명'}`
- **기타(서식·PDF 등)**: `{ext:'../downloads/files/파일명.pdf'}` 또는 `{web:'페이지URL'}`

**fileMap에 없고 주요뉴스도 아닌 항목은 "파일 준비 중입니다" 토스트만 표시되므로 반드시 등록할 것.**

### 3. newsFileMap 등록 (index.html) — 주요뉴스만 해당
`index.html`의 `var newsFileMap={...}` 에 새 뉴스 ID를 추가한다.
- 다운로드 HTML이 있으면: `'news0409e':'downloads/news_20260409e.html'`
- 없으면 등록하지 않아도 됨 (자료실 주요뉴스 탭으로 자동 fallback)

### 4. 다운로드 HTML 페이지 생성 (선택)
`redevelopment/downloads/` 에 해당 항목의 상세 페이지 HTML을 생성하면 클릭 시 바로 열림.
- 뉴스: `news_YYYYMMDD[a-z].html`
- 법령: `law_YYYYMMDD[a-z].html`
- 판례: `case_YYYYMMDD[a-z].html`

### 5. 라이브 검수
데이터 추가 후 반드시 아래 항목을 검수한다:
1. **카테고리 필터** — 자료실 각 탭에서 새 항목이 정상 노출되는지
2. **클릭 동작** — 항목 클릭 시 "파일 준비 중" 토스트가 아닌 정상 동작(페이지 이동 또는 다운로드)인지
3. **홈페이지 노출** — 주요뉴스는 홈페이지 뉴스 섹션, 기타는 자료실 섹션에 노출되는지
4. **건수 카운트** — 각 탭의 건수가 올바른지

---

## 핵심 파일 경로 (자료실 관련)

| 용도 | 경로 |
|------|------|
| 자료 데이터 | `redevelopment/assets/data/mock-data.js` → `MOCK.library` |
| 자료실 페이지 | `redevelopment/pages/library.html` |
| 홈페이지 | `redevelopment/index.html` |
| 다운로드 HTML | `redevelopment/downloads/` |
| 다운로드 PDF | `redevelopment/downloads/files/` |
