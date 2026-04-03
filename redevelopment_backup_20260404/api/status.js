module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // 사이트 상태 정보 반환
  const status = {
    site: 'seul21.com',
    status: 'online',
    timestamp: new Date().toISOString(),
    pages: {
      main: '/',
      about: '/pages/about.html',
      services: '/pages/services.html',
      portfolio: '/pages/portfolio.html',
      community: '/pages/community.html',
      contact: '/pages/contact.html',
      areas: '/pages/areas.html',
      news: '/pages/news.html',
      library: '/pages/library.html'
    },
    chatbot: true,
    ssl: true,
    domain: {
      primary: 'seul21.com',
      www: 'www.seul21.com'
    }
  };

  return res.status(200).json(status);
};
