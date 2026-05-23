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
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  // For debugging: check if a different case file already exists
  const dir = path.dirname(outPath);
  const base = path.basename(outPath);
  const existingFiles = fs.readdirSync(dir).filter(f => f.toLowerCase() === base.toLowerCase());
  if (relPath.includes('Mamba')) {
    console.log('WPUBLISH relPath:', relPath);
    console.log('WPUBLISH outPath:', outPath);
    console.log('WPUBLISH existing files with same lower:', existingFiles);
  }
  fs.writeFileSync(outPath, content, 'utf8');
  const afterWrite = fs.readFileSync(outPath, 'utf8');
  if (relPath.includes('Mamba')) {
    console.log('WPUBLISH afterWrite len:', afterWrite.length, 'first100:', afterWrite.slice(0, 80));
  }
  console.log(`✓ ${relPath}`);
}

module.exports = { copyDir, writePublic, walkDir };
