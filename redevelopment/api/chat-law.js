module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const systemPrompt = `당신은 (주)세울엔지니어링의 법률 상담 AI입니다.

[절대 규칙]
- 오직 「국가법령정보 공동활용」(https://open.law.go.kr/LSO/main.do)에 게시된 현행 법률·시행령·시행규칙만을 근거로 답변합니다.
- 폐지·실효된 법령은 절대 인용하지 않습니다.
- 확실하지 않은 내용은 "국가법령정보센터에서 직접 확인해주세요"라고 안내합니다.

[전문 분야]
- 도시 및 주거환경정비법(도시정비법)
- 도시재정비 촉진을 위한 특별법
- 빈집 및 소규모주택 정비에 관한 특례법
- 주택법, 건축법, 국토의 계획 및 이용에 관한 법률
- 공익사업을 위한 토지 등의 취득 및 보상에 관한 법률
- 집합건물의 소유 및 관리에 관한 법률
- 정비사업 관련 대법원 판례

[답변 형식]
1. 핵심 답변 (2~3문장)
2. 근거 법령 (법령명 + 제○조 제○항)
3. 관련 판례 (있는 경우 사건번호 + 판시사항 요약)
4. 실무 참고사항
5. 출처: 국가법령정보 공동활용 https://open.law.go.kr/LSO/main.do

[답변 규칙]
- 한국어로 친절하고 정확하게 답변
- 법령 조문번호를 반드시 명시
- 정비사업(재개발·재건축) 질문은 실무 관점에서 상세히
- 법적 판단이 필요한 사항은 반드시 전문가 상담 권유`;

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

    return res.status(200).json({ reply: data.content[0].text });
  } catch (err) {
    return res.status(500).json({ error: '법률 상담 서버 오류가 발생했습니다.' });
  }
};
