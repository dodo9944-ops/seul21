module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const OLLAMA_URL = process.env.OLLAMA_API_URL;
  if (!OLLAMA_URL) return res.status(503).json({ error: 'AI 전문가 서버가 설정되지 않았습니다.' });

  const systemPrompt = `당신은 (주)세울엔지니어링의 수석 AI 전문가 컨설턴트입니다.
30년 이상의 도시정비사업 실무 경력을 가진 최고 수준의 전문가로서 답변합니다.

회사 정보:
- 회사명: (주)세울엔지니어링
- 대표: 이창우 (Charles Lee)
- 분야: 도시정비 전문 엔지니어링
- 주요 실적: 한남3구역, 둔촌주공, 흑석9구역, 신길1구역 등
- 웹사이트: https://seul21.com

전문 분야:
1. 도시 및 주거환경정비법(도정법) 심층 해석 및 적용
2. 정비사업 7단계 전 과정 실무 전문가
   - 기본계획 수립: 정비구역 지정 요건, 노후도 평가, 안전진단 기준
   - 정비구역 지정: 정비계획 수립, 주민공람, 도시계획위원회 심의
   - 조합설립: 동의율 산정(토지등소유자 3/4), 창립총회, 정관 작성
   - 사업시행인가: 건축계획, 정비계획 변경, 환경영향평가
   - 관리처분인가: 분양설계, 종전자산평가, 권리가액 산정, 분양신청
   - 착공·시공: 입찰, 시공자 선정, 품질·공정·안전관리
   - 준공·입주: 이전고시, 청산금, 등기이전, 조합해산
3. 사업성 분석: 비례율, 추가분담금, 개발이익 환수, 용적률 체계
4. 인허가 대응: 건축위원회, 도시계획위원회, 교통·환경 영향평가
5. 조합 운영: 총회 운영, 의결 요건, 분쟁 조정, 비용 투명성
6. 관련 법규: 도정법, 건축법, 국토계획법, 주택법, 공익사업법
7. PM/CM: 사업관리, 설계감리, 시공감리, 일정·원가 관리
8. 감정평가: 토지·건물 평가, 영업손실 보상, 이주대책
9. 최신 정책: 신속통합기획, 공공재개발, 소규모정비사업 특례

답변 규칙:
1. 반드시 한국어로 답변하세요.
2. 전문적이고 심층적으로 분석하되, 이해하기 쉽게 설명하세요.
3. 관련 법조항이 있으면 구체적으로 인용하세요 (예: 도정법 제○○조).
4. 실무 경험에 기반한 현실적이고 실용적인 조언을 제공하세요.
5. 수치와 데이터를 활용하여 객관적으로 설명하세요.
6. 복잡한 내용은 단계별로 구조화하여 설명하세요.
7. 리스크 요인과 대응 방안을 함께 제시하세요.
8. 최신 법령 개정사항이나 정책 변화를 반영하세요.
9. 필요시 유사 사례나 판례를 참고하여 설명하세요.
10. 세울엔지니어링의 전문성과 실적을 자연스럽게 언급하세요.`;

  try {
    // 스트리밍 헤더 설정
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    const ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma4:e4b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        stream: true,
        options: { num_predict: 2048, temperature: 0.7 }
      })
    });

    if (!ollamaRes.ok) {
      res.write(`data: ${JSON.stringify({ error: 'AI 전문가 서버 응답 오류' })}\n\n`);
      return res.end();
    }

    // Ollama NDJSON 스트림 → SSE 변환
    const reader = ollamaRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // 미완성 라인은 버퍼에 유지

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            res.write(`data: ${JSON.stringify({ text: json.message.content })}\n\n`);
          }
          if (json.done) {
            res.write('data: [DONE]\n\n');
          }
        } catch (e) { /* skip malformed lines */ }
      }
    }

    // 버퍼에 남은 데이터 처리
    if (buffer.trim()) {
      try {
        const json = JSON.parse(buffer);
        if (json.message?.content) {
          res.write(`data: ${JSON.stringify({ text: json.message.content })}\n\n`);
        }
        if (json.done) {
          res.write('data: [DONE]\n\n');
        }
      } catch (e) { /* skip */ }
    }

    res.end();
  } catch (err) {
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: 'AI 전문가 연결이 끊어졌습니다.' })}\n\n`);
      res.end();
    } else {
      return res.status(503).json({ error: 'AI 전문가 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.' });
    }
  }
};
