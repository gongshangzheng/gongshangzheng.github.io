#!/usr/bin/env node
/**
 * Local preview server for gongshangzheng.github.io
 * Serves files from public/ with:
 *   - File watching on src/, templates/, config.json → auto rebuild
 *   - LiveReload injection → auto browser refresh after rebuild
 *
 * Usage:
 *   node preview.js              # serve only (static)
 *   node preview.js --watch      # serve + file watching + auto rebuild + LiveReload
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname);
const PUBLIC = path.join(ROOT, 'public');

// ---------- LiveReload snippet ----------
const LR_SNIPPET = `<script>(()=>{const s=new WebSocket('ws://localhost:35729');s.onmessage=e=>{if(e.data==='reload')location.reload()};s.onclose=()=>{console.log('LiveReload disconnected')}})();</script>`;
const LR_PORT = 35729;

// ---------- MIME types ----------
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

// ---------- Args ----------
const WATCH = process.argv.includes('--watch');

// ---------- LiveReload WebSocket server ----------
let lrClients = [];
let lrWss = null;

function startLiveReload() {
  const { WebSocketServer } = require('ws');
  // ws is a dev dependency; fall back gracefully if not installed
  try {
    lrWss = new WebSocketServer({ port: LR_PORT });
    lrWss.on('connection', (ws) => {
      lrClients.push(ws);
      ws.on('close', () => { lrClients = lrClients.filter(c => c !== ws); });
    });
    lrWss.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.log(`   ⚠ LiveReload port ${LR_PORT} in use, skipping WS server`);
      } else {
        console.error('   ⚠ LiveReload WS error:', e.message);
      }
      lrWss = null;
    });
    if (lrWss) console.log(`   🔌 LiveReload WS on port ${LR_PORT}`);
  } catch (_) {
    console.log('   ⚠ "ws" package not found, LiveReload disabled (npm i -D ws to enable)');
  }
}

function notifyReload() {
  lrClients.forEach(ws => {
    if (ws.readyState === 1) ws.send('reload');
  });
}

// ---------- File watcher + auto rebuild ----------
let buildTimer = null;
let building = false;

function runBuild() {
  if (building) return;
  building = true;
  const t0 = Date.now();
  try {
    execSync('node build.js', { cwd: ROOT, stdio: 'pipe' });
    const ms = Date.now() - t0;
    console.log(`   ✅ Rebuilt in ${ms}ms`);
    notifyReload();
  } catch (e) {
    console.error('   ❌ Build failed:');
    console.error(e.stderr ? e.stderr.toString().trim() : e.message);
  } finally {
    building = false;
  }
}

function scheduleBuild() {
  if (buildTimer) clearTimeout(buildTimer);
  // Debounce: wait 200ms after last change before rebuilding
  buildTimer = setTimeout(runBuild, 200);
}

function startWatcher() {
  const watchDirs = [
    path.join(ROOT, 'src'),
    path.join(ROOT, 'lib'),
    path.join(ROOT, 'templates'),
    path.join(ROOT, 'data'),
  ].filter(p => fs.existsSync(p));

  const watchFiles = [
    path.join(ROOT, 'config.json'),
    path.join(ROOT, 'build.js'),
  ].filter(p => fs.existsSync(p));

  const ignored = /node_modules|\.git|public/;

  watchDirs.forEach(dir => {
    fs.watch(dir, { recursive: true }, (event, filename) => {
      if (!filename || ignored.test(filename)) return;
      console.log(`   📝 Changed: src/${filename}`);
      scheduleBuild();
    });
  });

  watchFiles.forEach(file => {
    fs.watch(file, () => {
      console.log(`   📝 Changed: ${path.basename(file)}`);
      scheduleBuild();
    });
  });

  console.log(`   👀 Watching: ${watchDirs.map(d => path.basename(d)).join(', ')} + config.json`);
}

// ---------- HTTP server ----------
function serve(res, filePath, status = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const ct = MIME[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, {'Content-Type':'text/plain'}); res.end('Not Found'); return; }
    // Inject LiveReload snippet into HTML pages
    if (ext === '.html' && WATCH) {
      const html = data.toString('utf8');
      const injected = html.replace('</body>', LR_SNIPPET + '\n</body>');
      data = Buffer.from(injected, 'utf8');
    }
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

// ---------- Start ----------
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
  if (WATCH) {
    startLiveReload();
    startWatcher();
  }
  console.log('   Ctrl+C to stop');
});
