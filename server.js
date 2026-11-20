// 自带的极简静态服务器：不走 Altare 的 Static site 处理器（它会把 .html 301 成无扩展名路径，
// 再查不到就回退首页，多页站必然错位）。这里按“文件在不在”老老实实解析，找不到就真 404。
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.vtt': 'text/vtt; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.7z': 'application/x-7z-compressed',
};

function candidateSets(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const rel = path.normalize(clean).replace(/^([.][.][/\\])+/, '');
  const list = [];
  if (rel.endsWith('/')) list.push(rel + 'index.html');
  else list.push(rel, rel + '.html', path.join(rel, 'index.html'));
  return [...new Set(list)];
}

function send(res, code, body, headers) {
  res.writeHead(code, Object.assign({ 'Cache-Control': 'no-store' }, headers));
  res.end(body);
}

http.createServer((req, res) => {
  const urlPath = req.url || '/';
  if (urlPath === '/healthz' || urlPath === '/health') return send(res, 200, 'ok', { 'Content-Type': 'text/plain' });

  // 老写法 /guides.html 一律 301 到 /guides（我们站内链已经用无扩展名，这里是给旧链接和书签兜底）
  const bare = urlPath.split('?')[0];
  if (bare.length > 5 && bare.endsWith('.html') && bare !== '/index.html') {
    const clean = bare.slice(0, -5) + (bare.slice(0, -5).endsWith('/') ? '' : '/');
    return send(res, 301, '', { Location: clean + (urlPath.includes('?') ? urlPath.slice(urlPath.indexOf('?')) : '') });
  }

  for (const rel of candidateSets(urlPath)) {
    const abs = path.join(ROOT, rel);
    if (!abs.startsWith(ROOT)) continue;
    let st;
    try {
      st = fs.statSync(abs);
    } catch (e) {
      continue;
    }
    if (st.isDirectory()) continue;
    const ext = path.extname(abs).toLowerCase();
    const cache = ext === '.html' ? 'public, max-age=60'
      : /\.(mp4|webp|jpe?g|png|ico|woff2?)$/.test(ext) ? 'public, max-age=604800'
      : 'public, max-age=3600';
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': st.size,
      'Cache-Control': cache,
    });
    fs.createReadStream(abs).pipe(res);
    return;
  }

  const body = fs.existsSync(path.join(ROOT, '404.html'))
    ? fs.readFileSync(path.join(ROOT, '404.html'))
    : Buffer.from('<!doctype html><meta charset="utf-8"><h1>404 没有这个页面</h1><p><a href="/">回首页</a></p>', 'utf8');
  send(res, 404, body, { 'Content-Type': 'text/html; charset=utf-8' });
}).listen(PORT, '0.0.0.0', () => console.log('dlc-site 静态服务在 :' + PORT));
