#!/usr/bin/env node
/**
 * Local preview server for gongshangzheng.github.io
 * Serves files from public/ directly (base_url = /)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PUBLIC = path.join('/Users/zhengxinyu/gongshangzheng.github.io', 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.webm': 'video/webm',
  '.xml': 'application/xml',
};

function serve(res, filePath, status = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const ct = MIME[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, {'Content-Type':'text/plain'}); res.end('Not Found'); return; }
    res.writeHead(status, {'Content-Type': ct});
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url);
  if (!p.startsWith('/')) p = '/' + p;

  // / -> index.html
  if (p === '/') p = '/index.html';

  const fp = path.join(PUBLIC, p);

  // Security: prevent path traversal
  if (!fp.startsWith(PUBLIC)) {
    res.writeHead(403); res.end('Forbidden');
    return;
  }

  fs.stat(fp, (err, stats) => {
    if (err) {
      // File not found: try .html suffix, then directory/index.html
      const html = path.join(PUBLIC, p.replace(/\/$/, '') + '.html');
      fs.stat(html, (e2, s2) => {
        if (!e2 && s2.isFile()) return serve(res, html);
        const idx = path.join(PUBLIC, p, 'index.html');
        fs.stat(idx, (e3, s3) => {
          if (!e3 && s3.isFile()) return serve(res, idx);
          res.writeHead(404, {'Content-Type':'text/plain'}); res.end('Not Found: ' + p);
        });
      });
      return;
    }
    if (stats.isFile()) return serve(res, fp);
    // Directory: try index.html inside it
    const idx = path.join(fp, 'index.html');
    fs.stat(idx, (e2, s2) => {
      if (!e2 && s2.isFile()) return serve(res, idx);
      // No index.html: try同名 .html (e.g. /categories/AI → categories/AI.html)
      const html = path.join(PUBLIC, p.replace(/\/$/, '') + '.html');
      fs.stat(html, (e3, s3) => {
        if (!e3 && s3.isFile()) return serve(res, html);
        res.writeHead(404, {'Content-Type':'text/plain'}); res.end('Not Found: ' + p);
      });
    });
  });
});

const PORT = 4000;
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`   Run: kill $(lsof -t -i :${PORT})`);
    process.exit(1);
  }
  throw e;
});
server.listen(PORT, () => {
  console.log(`🏠 Local preview → http://localhost:${PORT}/`);
  console.log('   Ctrl+C to stop');
});
