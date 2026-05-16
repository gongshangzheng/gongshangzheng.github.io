#!/usr/bin/env node
/**
 * Local preview server for HtmlBlogs
 * Strips the /HtmlBlogs/ base path so local viewing matches production URLs
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PUBLIC = path.join('/Users/zhengxinyu/gongshangzheng.github.io', 'public');
const BASE = '/HtmlBlogs'; // kept for backwards compat (strip old prefix if present)

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
  let p = req.url;

  // Strip /HtmlBlogs prefix if present (backwards compat)
  if (p.startsWith('/HtmlBlogs')) p = p.slice(10);
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
    if (err || !stats.isFile()) {
      // Try index.html for clean URLs
      const idx = path.join(PUBLIC, p.replace(/\/$/, '') + '.html');
      fs.stat(idx, (e2, s2) => {
        if (!e2 && s2.isFile()) serve(res, idx);
        else { res.writeHead(404, {'Content-Type':'text/plain'}); res.end('Not Found: ' + p); }
      });
      return;
    }
    serve(res, fp);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🏠 HtmlBlogs local preview → http://localhost:${PORT}/HtmlBlogs/`);
  console.log('   (base path /HtmlBlogs/ is stripped internally, no rebuild needed)');
  console.log('   Ctrl+C to stop');
});