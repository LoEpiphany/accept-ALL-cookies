export default async function onRequest(context) {
  const { request } = context;
  
  // 1. 处理浏览器的预检请求 (OPTIONS)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // 2. 目标地址（腾讯 TokenHub 接口）
  const targetUrl = 'https://tokenhub.tencentmaas.com/v1/chat/completions';

  try {
    // 3. 转发请求给腾讯
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        // 把前端传过来的 Key 透传过去
        'Authorization': request.headers.get('Authorization') 
      },
      body: request.method === 'POST' ? await request.text() : undefined,
    });

    // 4. 把腾讯返回的结果原样返回给前端，并加上跨域头
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return newResponse;
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
