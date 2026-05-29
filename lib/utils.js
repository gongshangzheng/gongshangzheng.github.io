const fs = require('fs');
const path = require('path');

function sameFileByStat(srcStat, destStat) {
  return !!destStat && srcStat.size === destStat.size && Math.floor(srcStat.mtimeMs) === Math.floor(destStat.mtimeMs);
}

function walkFiles(dir, predicate = null) {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...walkFiles(full, predicate));
    } else if (!predicate || predicate(full, entry)) {
      result.push(full);
    }
  }
  return result;
}

function copyDir(src, dest, filterFn = null) {
  const stats = { copied: 0, skipped: 0, removed: 0 };
  if (!fs.existsSync(src)) return stats;

  const sourceFiles = walkFiles(src, (fullPath) => !filterFn || filterFn(fullPath));
  const expectedDest = new Set();

  for (const srcPath of sourceFiles) {
    const rel = path.relative(src, srcPath);
    const destPath = path.join(dest, rel);
    expectedDest.add(destPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    const srcStat = fs.statSync(srcPath);
    let destStat = null;
    try {
      destStat = fs.statSync(destPath);
    } catch (_) {}

    if (sameFileByStat(srcStat, destStat)) {
      stats.skipped++;
      continue;
    }

    fs.copyFileSync(srcPath, destPath);
    fs.utimesSync(destPath, srcStat.atime, srcStat.mtime);
    stats.copied++;
  }

  if (fs.existsSync(dest)) {
    const destFiles = walkFiles(dest);
    for (const destPath of destFiles) {
      if (!expectedDest.has(destPath)) {
        fs.unlinkSync(destPath);
        stats.removed++;
      }
    }
  }

  return stats;
}

function walkDir(dir) {
  return walkFiles(dir, (fullPath) => fullPath.endsWith('.md') || fullPath.endsWith('.html'));
}

function writePublic(publicDir, relPath, content) {
  const outPath = path.join(publicDir, relPath);
  const dir = path.dirname(outPath);
  fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(outPath)) {
    const existing = fs.readFileSync(outPath, 'utf8');
    if (existing === content) {
      return { written: false, skipped: true, path: outPath };
    }
  }

  const tmpPath = path.join(dir, 'tmp_' + Date.now() + '_' + Math.random().toString(36).slice(2) + '.tmp');
  fs.writeFileSync(tmpPath, content, 'utf8');
  fs.copyFileSync(tmpPath, outPath);
  fs.unlinkSync(tmpPath);
  if (process.env.BUILD_VERBOSE === '1') {
    console.log(`✓ ${relPath}`);
  }
  return { written: true, skipped: false, path: outPath };
}

module.exports = { copyDir, writePublic, walkDir, walkFiles };
