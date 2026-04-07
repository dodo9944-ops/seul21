module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const OLLAMA_URL = process.env.OLLAMA_API_URL;
  if (!OLLAMA_URL) return res.status(200).json({ online: false });

  try {
    const resp = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(5000) });
    if (!resp.ok) return res.status(200).json({ online: false });
    const data = await resp.json();
    const hasGemma = data.models?.some(m => m.name.includes('gemma4'));
    return res.status(200).json({ online: hasGemma });
  } catch (e) {
    return res.status(200).json({ online: false });
  }
};
