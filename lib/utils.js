const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const sp = path.join(src, item), dp = path.join(dest, item);
    fs.statSync(sp).isDirectory() ? copyDir(sp, dp) : fs.copyFileSync(sp, dp);
  }
}

function walkDir(dir) {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...walkDir(full));
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.html')) {
      result.push(full);
    }
  }
  return result;
}

function writePublic(publicDir, relPath, content) {
  const outPath = path.join(publicDir, relPath);
  const dir = path.dirname(outPath);
  fs.mkdirSync(dir, { recursive: true });
  // Unique temp path to avoid any case-collisions on APFS
  const tmpPath = path.join(dir, 'tmp_' + Date.now() + '_' + Math.random().toString(36).slice(2) + '.tmp');
  fs.writeFileSync(tmpPath, content, 'utf8');
  // Use copyFileSync + unlink to avoid rename overwrites
  fs.copyFileSync(tmpPath, outPath);
  fs.unlinkSync(tmpPath);
  console.log(`✓ ${relPath}`);
}

module.exports = { copyDir, writePublic, walkDir };
// DEBUG: Track all writePublic calls
const _writePublicCalls = [];
const _origWritePublic = writePublic;
