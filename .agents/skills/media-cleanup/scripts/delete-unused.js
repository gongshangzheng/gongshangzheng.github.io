#!/usr/bin/env node
/**
 * 删除未引用的媒体文件（默认只删图片，保留 PDF）。
 *
 * 用法：
 *   node scripts/delete-unused.js              # dry-run，只列出
 *   node scripts/delete-unused.js --apply     # 真正删除
 *   node scripts/delete-unused.js --apply --include-pdf   # 连未引用 PDF 一起删
 *
 * 安全：默认 dry-run。--apply 前自动创建备份分支。被文字提及的文件永不删除。
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const SCAN_SCRIPT = path.join(__dirname, 'find-unreferenced-media.js');

const IMG_RE = /\.(webp|png|jpe?g|gif|svg|bmp|tiff?)$/i;
const PDF_RE = /\.pdf$/i;
const VIDEO_RE = /\.(mp4|m4v|mov|avi|mkv|webm)$/i;

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function runScan() {
  const res = spawnSync('node', [SCAN_SCRIPT, '--json'], {
    encoding: 'utf8', cwd: ROOT, maxBuffer: 150 * 1024 * 1024,
  });
  if (res.status !== 0) {
    console.error('扫描失败：', res.stderr);
    process.exit(1);
  }
  return JSON.parse(res.stdout);
}

function createBackupBranch() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const branch = `cleanup-media-backup-${date}`;
  try {
    execSync(`git branch ${branch}`, { cwd: ROOT, stdio: 'pipe' });
    console.log(`✓ 已创建备份分支：${branch}\n`);
  } catch {
    console.log(`ℹ 备份分支已存在或 git 不可用：${branch}\n`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const includePdf = args.includes('--include-pdf');

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  删除未引用媒体');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  模式：${apply ? '执行 (--apply)' : '预览 (dry-run)'}`);
  console.log(`  范围：图片${includePdf ? ' + PDF + 视频' : '（保留 PDF/视频）'}`);
  console.log('');

  const report = runScan();
  let targets = report.safeToDelete.filter((x) => IMG_RE.test(x.file));
  if (includePdf) {
    targets = targets.concat(report.safeToDelete.filter((x) => PDF_RE.test(x.file) || VIDEO_RE.test(x.file)));
  }
  // never delete textually-mentioned files (they are not in safeToDelete anyway)

  if (targets.length === 0) {
    console.log('  没有可删除的文件。\n');
    return;
  }

  if (apply) createBackupBranch();

  const byDir = {};
  let totalBytes = 0, deleted = 0, missing = 0;
  for (const item of targets) {
    const abs = path.join(ROOT, item.file);
    if (!fs.existsSync(abs)) { missing++; continue; }
    const size = fs.statSync(abs).size;
    console.log(`  ${formatSize(size).padStart(9)}  ${item.file}`);
    if (apply) {
      fs.unlinkSync(abs);
      deleted++;
      totalBytes += size;
    } else {
      totalBytes += size;
    }
    const dir = item.file.split('/').slice(0, 3).join('/');
    byDir[dir] = (byDir[dir] || 0) + 1;
  }

  console.log('');
  console.log('──────────────────────────────────────────────────────────');
  console.log(`  共 ${targets.length} 个文件 / ${formatSize(totalBytes)}`);
  if (apply) {
    console.log(`  ✓ 已删除 ${deleted} 个，释放 ${formatSize(totalBytes)}`);
  } else {
    console.log(`  (dry-run，未实际删除。加 --apply 执行)`);
  }
  console.log('');

  console.log('按目录分布 (top 15):');
  Object.entries(byDir).sort((a, b) => b[1] - a[1]).slice(0, 15)
    .forEach(([k, v]) => console.log(`  ${v}个  ${k}`));
  console.log('\n══════════════════════════════════════════════════════════\n');
}

main();
