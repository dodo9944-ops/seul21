const MCP_URL = 'https://korean-law-mcp.fly.dev/mcp';

async function mcpFetch(body, sessionId) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream'
  };
  if (sessionId) headers['Mcp-Session-Id'] = sessionId;

  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  const newSession = res.headers.get('mcp-session-id') || sessionId;
  const ct = (res.headers.get('content-type') || '');

  if (ct.includes('text/event-stream')) {
    const text = await res.text();
    const msgs = [];
    for (const line of text.split('\n')) {
      if (line.startsWith('data:')) {
        try { msgs.push(JSON.parse(line.slice(5).trim())); } catch (e) { /* skip */ }
      }
    }
    return { data: msgs.find(m => m.id === body.id) || msgs[msgs.length - 1], sessionId: newSession };
  }

  return { data: await res.json(), sessionId: newSession };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    // 1. MCP 세션 초기화
    const init = await mcpFetch({
      jsonrpc: '2.0', method: 'initialize',
      params: {
        protocolVersion: '2025-03-26',
        capabilities: {},
        clientInfo: { name: 'seul21-law', version: '1.0.0' }
      },
      id: 1
    });

    // 2. initialized 알림
    await mcpFetch(
      { jsonrpc: '2.0', method: 'notifications/initialized', params: {} },
      init.sessionId
    );

    // 3. chain_full_research 호출 (법령+판례+해석례 병렬 검색)
    const tool = await mcpFetch({
      jsonrpc: '2.0', method: 'tools/call',
      params: { name: 'chain_full_research', arguments: { query: message } },
      id: 2
    }, init.sessionId);

    // MCP 결과에서 텍스트 추출
    let lawData = '';
    if (tool.data && tool.data.result && tool.data.result.content) {
      lawData = tool.data.result.content
        .filter(c => c.type === 'text')
        .map(c => c.text)
        .join('\n');
    }

    if (!lawData) {
      return res.status(200).json({
        reply: '관련 법령 정보를 찾지 못했습니다.\n질문을 좀 더 구체적으로 입력해주세요.'
      });
    }

    // 토큰 절약을 위해 최대 12000자로 제한
    if (lawData.length > 12000) lawData = lawData.substring(0, 12000) + '\n...(이하 생략)';

    // 4. Claude로 사용자 친화적 답변 생성
    const systemPrompt = `당신은 (주)세울엔지니어링의 법률 상담 AI입니다.
아래에 한국 법령 검색 시스템(법제처 API)에서 조회한 결과가 있습니다.
이 결과를 바탕으로 사용자의 질문에 정확하고 이해하기 쉽게 답변하세요.

답변 규칙:
1. 항상 한국어로 친절하게 답변하세요.
2. 관련 법령명과 조문을 정확히 인용하세요.
3. 판례가 있으면 핵심 판시사항을 요약하세요.
4. 정비사업(재개발·재건축) 관련이면 특히 상세하게 답변하세요.
5. 답변은 구조화하되 간결하게 작성하세요.
6. 법적 판단이 필요한 경우 전문가 상담을 권유하세요.
7. 출처(법령명, 판례번호)를 답변 끝에 간단히 표시하세요.`;

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
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
        messages: [{ role: 'user', content: `사용자 질문: ${message}\n\n법령 검색 결과:\n${lawData}` }]
      })
    });

    const claudeData = await claudeRes.json();
    if (claudeData.error) return res.status(500).json({ error: claudeData.error.message });

    return res.status(200).json({ reply: claudeData.content[0].text });
  } catch (err) {
    console.error('Law chat error:', err);
    return res.status(500).json({ error: '법률 상담 서버 오류가 발생했습니다.' });
  }
};
