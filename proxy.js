const http = require('http');
const https = require('https');

const PORT = 8080;

http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    let targetHost = 'aip.baidubce.com';
    let finalPath = req.url;

    // ⭐ 核心修改：将腾讯混元的请求转发给 TokenHub
    if (req.url.includes('/hunyuan')) {
        targetHost = 'tokenhub.tencentmaas.com';
        finalPath = req.url.replace('/hunyuan', '/v1'); // 替换为基础路径 /v1
    } else if (req.url.includes('/zhipu')) {
        targetHost = 'open.bigmodel.cn';
        finalPath = req.url.replace('/zhipu', '');
    }

    const options = {
        hostname: targetHost,
        port: 443,
        path: finalPath,
        method: req.method,
        headers: { ...req.headers, host: targetHost }
    };

    const proxyReq = https.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => { res.writeHead(500); res.end(err.message); });
    req.pipe(proxyReq);

}).listen(PORT, () => {
    console.log(`🚀 代理服务器已启动！正在监听 http://localhost:${PORT}`);
});