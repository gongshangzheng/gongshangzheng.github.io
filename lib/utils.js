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

function writePublic(publicDir, relPath, content) {
  const outPath = path.join(publicDir, relPath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content, 'utf8');
  console.log(`✓ ${relPath}`);
}

module.exports = { copyDir, writePublic };
