api/proxyhunyuan.js
export default async function handler(req, res) {
  // 1. 允许你的前端跨域请求
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 2. 处理浏览器的预检请求
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // 3. 腾讯混元的官方接口地址
  const targetUrl = 'https://api.hunyuan.cloud.tencent.com/v1/chat/completions';

  try {
    // 4. 把前端的请求转发给腾讯
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization // 把前端传的 sk-xxx Key 传过去
      },
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    // 5. 把腾讯的结果原样返回给前端
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy request failed', details: error.message });
  }
}
