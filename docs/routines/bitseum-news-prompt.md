# 빛세움 주요뉴스 자동 게시 Routine 프롬프트 (세울엔지니어링 지침 동일 기준)

> **대장 지시(2026-09-17 KST)**: "빛세움 주요뉴스를 세울엔지니어링 주요뉴스 작성지침과 동일하게 적용하여 시행한다."
>
> 대상 Routine: `미경이-빛세움주요뉴스` (`trig_01TXMDLyXKA6tAoqutA3QBkX`, KST 06:30)
> 편집 경로: https://claude.ai/code/routines/trig_01TXMDLyXKA6tAoqutA3QBkX
>
> 본 Routine 은 대장이 http_api 로 생성하여 **Claude 가 프롬프트를 교체할 수 없다.** 아래 전문을 복사해 붙여넣으면 된다.
> 오후 회차(세울 KST 18:07 대응)를 신설하는 경우, 아래 전문에 "오후 수집 — 오전 게시분과 중복되지 않는 신규 기사만 선정한다"는 조건 한 줄을 §2 끝에 추가한다.

---

```
[빛세움(VISSEUM) 홈페이지 주요뉴스 자동 게시 — 매일 06:30 KST 실행]
※ 본 지침은 세울엔지니어링(seul21.com) 주요뉴스 작성지침과 동일 기준이다(대장 지시 2026-09-17).

0. 작업 대상(필수·최우선 확인)
이 저장소의 기본 브랜치(master)가 아니라 반드시 브랜치 backup-bitseum-rebrand-20260824 에서 작업한다. Bash로 'git fetch origin backup-bitseum-rebrand-20260824 && git checkout backup-bitseum-rebrand-20260824' 를 가장 먼저 실행한다. master 브랜치는 전혀 다른 세울엔지니어링 사이트이며 절대 건드리지 않는다.
라이브 도메인은 https://www.seul24.cloud (Vercel 프로젝트 lcw-coordinator, 조직 team_4OL3ZwhAAZCMeH0YaWVu0cGw).

0-1. [최우선] "오늘" 기준일 = KST
반드시 `TZ=Asia/Seoul date` 를 실행해 KST 오늘 날짜를 먼저 확정한다. mock-data 의 `date` 필드는 예외 없이 **KST 오늘(게시일)** 을 넣는다. 기사 보도일이 어제여도 date 는 게시일이다(보도일은 title 접두어와 본문 출처에만 적는다). UTC 날짜 사용 금지. 이 항목 위반은 CLAUDE.md 강력 제1조 §1 #13 시말서 대상이다.

1. 뉴스 검색
WebSearch/WebFetch로 재개발·재건축·도시정비 뉴스를 폭넓게 검색한다. 대상: 하우징헤럴드, 위클리한국주택경제신문(arunews), 재개발재건축매거진(jjmagazin)·한국도시환경헤럴드, 도시정비뉴스, 네이버뉴스, 주요 종합일간지·경제지, 국토교통부·서울시 보도자료. 최근 48시간 이내 기사 우선, 부족하면 최근 7일까지 확장한다.
검색어 예: 재개발, 재건축, 소규모재건축, 가로주택정비사업, 모아타운, 신속통합기획, 정비사업, 도시정비법, 빈집 및 소규모주택 정비법, 조합설립인가, 사업시행계획인가, 관리처분계획, 시공자 선정, 정비계획, 용적률, 분담금, 공사비, HUG, 이주비, 서울시 정비사업, 국토교통부 정비사업.

2. 기사 선정 — 목표 4~6건 (세울 수준. 과거의 "최대 3건" 상한은 폐지됨)
실무 중요도 순: ①국토부·서울시·자치구 정책/제도 변경 ②도시정비법·소규모주택정비법·조례 개정 ③인허가/행정절차 ④법원 판결·분쟁 ⑤공사비·금융·HUG·이주비 ⑥용적률·사업성·분담금 ⑦현장 직접 영향 사례.
제외: 단순 분양 홍보성, 동일 내용 반복, 자극적 부동산 기사, 실무 관련성 낮은 기사.
품질 낮은 기사로 억지로 채우지 않는다. 다만 4건 미만으로 마감할 때는 검색어를 3회 이상 바꿔 재검색한 뒤에도 적합 기사가 없었음을 로그에 사유와 함께 남긴다.

3. [중요] 사실관계 검증 의무
선정한 기사는 반드시 WebFetch 로 원문을 열어 발행일·매체명·기자명·본문 수치를 확인한 뒤 작성한다. 검색 스니펫만 보고 작성 금지. 확인되지 않은 수치·날짜·과장 표현 기재 절대 금지(CLAUDE.md 원칙). 발행일이 검색 결과와 다르면 원문 발행일을 따른다.

4. 작성 형식 — 세울 4단 구성 고정 (기존 ①요약/②출처/③시사점/④현장대응방안 형식은 폐지)
mock-data 의 title 은 `[주요뉴스][매체명][YYYY.MM.DD 보도일] 기사제목` 형식.
다운로드 HTML(downloads/news_YYYYMMDD[a-z].html) 본문은 다음 4개 <section class="dv-section"> 순서 고정:
  ① <h2>자료 개요</h2> — 보도 매체·일자와 핵심 내용을 1개 문단(3~5문장)으로.
  ② <h2>주요 내용</h2> — <ul> 안에 <li><strong>①항목명:</strong> 설명</li> 형태로 ①②③… 번호를 붙여 4~6개 항목. 기사에 실제로 나온 수치만 사용.
  ③ <h2>실무 참고</h2> — 조합·추진위·토지등소유자·정비사업전문관리업자 관점의 실무 대응(정관·규정 검토, 총회/대의원회 의결 필요 여부, 구청·서울시 사전협의, 법률자문, 일정 조정, 사업성 재검토, 조합원 안내, 인허가 보완, 금융·HUG·공사비 검토 중 해당 사항)을 1~2개 문단으로.
  ④ <h2>출처</h2> — `매체명 기자명 「기사제목」 | <a href="원문URL" target="_blank" rel="noopener">도메인</a> | YYYY.MM.DD 보도` 형태로 실제 클릭 가능한 링크 포함.
mock-data 의 description 은 위 4단을 `자료 개요 → … 주요 내용 → … 실무 참고 → … 출처 → …` 평문으로 압축해 담는다.
HTML head/footer·CSS 링크·브레드크럼·배지·'자료실로 돌아가기' 버튼 구조는 기존 downloads/news_20260917d.html 을 그대로 복사해 재사용한다(디자인 임의 변경 금지).

5. 게시 절차 (하나라도 빠지면 라이브 장애)
(1) redevelopment/assets/data/mock-data.js 의 MOCK.library 에 항목 추가 — id 는 news+MMDD(KST)+순차 알파벳(당일 기존 id 와 충돌 금지), category:'주요뉴스', fileType:'web', fileSize:'웹문서', date:KST 오늘, downloads:0, tags 배열.
(2) redevelopment/downloads/news_YYYYMMDD[a-z].html 생성(위 4단 형식).
(3) redevelopment/pages/library.html 의 fileMap 에 'newsMMDDx':{web:'../downloads/news_YYYYMMDDx.html'} 등록.
(4) redevelopment/index.html 의 newsFileMap 에 'newsMMDDx':'downloads/news_YYYYMMDDx.html' 등록.
(5) gov 외부링크 방식 금지 — 자체 HTML 상세페이지(web)만 사용.
(6) node --check redevelopment/assets/data/mock-data.js 로 구문 검증.

6. 중복 방지
추가 전 기존 MOCK.library 의 원문 URL·제목·내용을 대조해 동일하거나 사실상 동일한 기사는 게시하지 않는다. 같은 사건을 여러 매체가 보도했으면 원출처 1건만 선택한다.

7. 기존 데이터 보호(최우선)
기존 MOCK.library 항목·downloads/*.html·fileMap/newsFileMap 등록을 삭제·수정하지 않는다. 신규 추가만 한다. 기한 기반 자동 삭제는 이 작업에서 수행하지 않는다.

8. 캐시버스터 전수 동기화(필수)
mock-data.js 변경 시 redevelopment/**/*.html 전체의 mock-data.js?v= 를 KST 오늘 기반 새 값으로 일괄 치환하고, 치환 후 `grep -roh 'mock-data\.js?v=[0-9a-z]*' --include=*.html .` 결과가 1종이며 파라미터 없는 로드가 0건임을 확인한다.

9. 커밋·푸시
`git -c user.name=미경 -c user.email=mikyung@seul21.local commit` 으로 게시 건수·기사 제목·출처를 명시해 커밋하고 `git push origin backup-bitseum-rebrand-20260824` 로 푸시한다(master push 금지).

10. 배포·검수
Vercel MCP 커넥터가 있으면 lcw-coordinator 를 production 배포한다. 없거나 실패하면 억지로 다른 방법을 쓰지 말고 "커밋/푸시 완료, 배포는 대장 수동 실행 필요"라고 결과에 명시한다.
반영 후 추가한 각 기사 URL(https://www.seul24.cloud/downloads/news_YYYYMMDD[x].html)에 접속해 HTTP 200 을 확인한다. 404 면 원인을 고쳐 200 이 될 때까지 정상화한다. 홈·자료실에서 신규 항목 노출도 확인한다.

11. 실행 로그
redevelopment/logs/news-log.json 에 append 기록: 실행일시(KST), 검색 기사 수, 후보 수, 최종 선정 목록(제목/URL/게시물ID), 성공·실패 건수, 실패 사유, 목표 4~6건 미달 시 사유, 커밋 SHA, 배포 URL, 검수 결과(200/404).

12. 최종 원칙
기존 홈페이지 디자인·게시판 구조는 절대 변경하지 않는다. 세션 마지막에 게시한 기사 목록과 라이브 URL을 요약 보고한다.
```
