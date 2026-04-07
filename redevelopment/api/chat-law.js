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
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25000)
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

async function fetchMcpLaw(query) {
  try {
    const init = await mcpFetch({
      jsonrpc: '2.0', method: 'initialize',
      params: {
        protocolVersion: '2025-03-26',
        capabilities: {},
        clientInfo: { name: 'seul21-law', version: '1.0.0' }
      },
      id: 1
    });

    await mcpFetch(
      { jsonrpc: '2.0', method: 'notifications/initialized', params: {} },
      init.sessionId
    );

    const tool = await mcpFetch({
      jsonrpc: '2.0', method: 'tools/call',
      params: { name: 'chain_full_research', arguments: { query } },
      id: 2
    }, init.sessionId);

    if (tool.data && tool.data.result && tool.data.result.content) {
      const text = tool.data.result.content
        .filter(c => c.type === 'text')
        .map(c => c.text)
        .join('\n');
      // 실제 법률 데이터가 포함된 경우만 반환
      if (text && !text.includes('조회 실패') && !text.includes('검색 결과가 없습니다')) {
        return text.length > 12000 ? text.substring(0, 12000) + '\n...(이하 생략)' : text;
      }
    }
  } catch (e) {
    console.log('MCP fallback:', e.message);
  }
  return null;
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
    // MCP 서버에서 법령 데이터 시도
    const mcpData = await fetchMcpLaw(message);

    const systemPrompt = `당신은 (주)세울엔지니어링의 법률 상담 AI입니다.
정비사업(재개발·재건축) 전문 법률 상담을 제공합니다.

전문 분야:
- 도시 및 주거환경정비법 (도시정비법)
- 도시재정비 촉진을 위한 특별법
- 빈집 및 소규모주택 정비에 관한 특례법
- 주택법, 건축법, 국토계획법
- 공익사업을 위한 토지 등의 취득 및 보상에 관한 법률
- 정비사업 관련 판례 및 행정심판례

답변 규칙:
1. 항상 한국어로 친절하고 정확하게 답변하세요.
2. 관련 법령명과 구체적 조문(제○조)을 인용하세요.
3. 핵심 판례가 있으면 사건번호와 판시사항을 요약하세요.
4. 정비사업 관련 질문은 실무적 관점에서 상세히 답변하세요.
5. 답변 구조: ① 핵심 답변 → ② 근거 법령 → ③ 관련 판례(있으면) → ④ 실무 참고사항
6. 법적 판단이 필요한 사항은 전문가 상담을 권유하세요.
7. 답변 끝에 반드시 출처를 표시하세요.
8. 출처에는 법제처 국가법령정보센터 링크를 포함하세요: https://open.law.go.kr/LSO/main.do
${mcpData ? '\n\n아래에 법령 검색 시스템에서 조회한 참고 데이터가 있습니다. 이 데이터를 우선 활용하세요.' : ''}`;

    const userContent = mcpData
      ? `사용자 질문: ${message}\n\n법령 검색 결과:\n${mcpData}`
      : message;

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
        messages: [{ role: 'user', content: userContent }]
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
