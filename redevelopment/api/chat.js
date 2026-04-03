module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const systemPrompt = `당신은 (주)세울엔지니어링의 AI 상담사입니다.
회사 정보:
- 회사명: (주)세울엔지니어링
- 분야: 도시정비 전문 엔지니어링 (재개발, 재건축, 소규모정비사업, 도시계획, PM/CM)
- 주요 실적: 한남3구역, 둔촌주공, 흑석9구역 등
- 서비스: 사업성 검토, 인허가 대응, 조합 운영지원, 이해관계 조율
- 정비사업 7단계 프로세스: 기본계획 → 정비구역지정 → 조합설립 → 사업시행인가 → 관리처분인가 → 착공·시공 → 준공·입주
- 웹사이트: https://seul21.com

답변 규칙:
1. 항상 한국어로 친절하게 답변하세요.
2. 정비사업, 재개발, 재건축 관련 질문에 전문적으로 답변하세요.
3. 회사 문의는 홈페이지 '문의하기' 페이지를 안내하세요.
4. 답변은 간결하고 이해하기 쉽게 작성하세요.
5. 모르는 내용은 솔직히 모른다고 하고, 전문 상담을 권유하세요.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    return res.status(200).json({ reply: data.content[0].text });
  } catch (err) {
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};
