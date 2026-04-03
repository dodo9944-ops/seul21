module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { task } = req.body || {};

  const systemPrompt = `당신은 (주)세울엔지니어링 웹사이트(seul21.com)의 AI 관리자입니다.
사이트 정보:
- 도시정비 전문 엔지니어링 회사 홈페이지
- 주요 페이지: 메인, 회사소개, 사업분야, 업무실적, 자료실, 커뮤니티, 문의
- Vercel로 배포, GitHub 저장소: dodo9944-ops/seul21
- 도메인: seul21.com, www.seul21.com

역할:
1. SEO 개선 제안
2. 콘텐츠 업데이트 아이디어 제공
3. 사이트 개선사항 분석
4. 마케팅 전략 제안
5. 경쟁사 분석 및 차별화 전략

답변은 항상 한국어로, 구체적이고 실행 가능한 제안을 해주세요.
각 제안에는 우선순위(높음/중간/낮음)를 표시해주세요.`;

  const message = task || '이번 주 사이트 관리 보고서를 작성해주세요. SEO, 콘텐츠, 마케팅 관점에서 분석하고 구체적 개선안을 제시해주세요.';

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
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    return res.status(200).json({ report: data.content[0].text });
  } catch (err) {
    return res.status(500).json({ error: '보고서 생성 실패' });
  }
};
