#!/usr/bin/env node
/**
 * 清理 PDF：删除未引用 PDF，压缩已引用 PDF（Ghostscript /screen）。
 *
 * 用法：
 *   node scripts/cleanup-pdfs.js              # dry-run，只报告
 *   node scripts/cleanup-pdfs.js --apply      # 真正执行
 *   node scripts/cleanup-pdfs.js --apply --no-compress  # 只删除未引用，不压缩
 *
 * 安全：默认 dry-run。--apply 前会自动创建备份分支。
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const SCAN_SCRIPT = path.join(__dirname, 'find-unreferenced-media.js');

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function findGs() {
  const candidates = ['gs', 'gswin64c', 'gswin32c', '/opt/homebrew/bin/gs'];
  for (const c of candidates) {
    const r = spawnSync(c, ['--version'], { stdio: 'pipe', encoding: 'utf8' });
    if (r.status === 0 || (r.stdout && r.stdout.trim() && !r.error)) {
      return c;
    }
  }
  // Look in standard Windows install paths
  const winDirs = [
    'C:\\Program Files\\gs',
    'C:\\Program Files (x86)\\gs',
  ];
  for (const dir of winDirs) {
    if (fs.existsSync(dir)) {
      try {
        const versions = fs.readdirSync(dir).filter((n) => n.startsWith('gs'));
        for (const v of versions) {
          for (const bin of ['gswin64c.exe', 'gswin32c.exe', 'gswin64.exe']) {
            const p = path.join(dir, v, 'bin', bin);
            if (fs.existsSync(p)) return p;
          }
        }
      } catch { /* ignore */ }
    }
  }
  return null;
}

function getPdfPageCount(file, gsBin) {
  try {
    const out = spawnSync(gsBin, [
      '-sDEVICE=pdfwrite', '-dNOPAUSE', '-dBATCH', '-q', '-c',
      `"(${file}) (r) file runpdfbegin pdfpagecount = quit"`,
      '-f', file,
    ], { encoding: 'utf8' });
    const n = parseInt(out.stdout.trim(), 10);
    return isNaN(n) ? null : n;
  } catch {
    return null;
  }
}

function compressPdf(srcFile, gsBin) {
  const tmpFile = srcFile.replace(/\.pdf$/i, '.compressed.tmp.pdf');
  try {
    spawnSync(gsBin, [
      '-sDEVICE=pdfwrite', '-dNOPAUSE', '-dBATCH', '-q',
      '-dCompatibilityLevel=1.4',
      '-dPDFSETTINGS=/screen',
      '-dEmbedAllFonts=true', '-dSubsetFonts=true',
      `-sOutputFile=${tmpFile}`,
      srcFile,
    ], { stdio: 'pipe', timeout: 300000 });

    if (!fs.existsSync(tmpFile)) return { ok: false, reason: 'no output' };
    const newSize = fs.statSync(tmpFile).size;
    const origSize = fs.statSync(srcFile).size;
    if (newSize >= origSize) {
      fs.unlinkSync(tmpFile);
      return { ok: false, reason: 'larger or equal' };
    }
    // validate page count matches
    const origPages = getPdfPageCount(srcFile, gsBin);
    const newPages = getPdfPageCount(tmpFile, gsBin);
    if (origPages && newPages && origPages !== newPages) {
      fs.unlinkSync(tmpFile);
      return { ok: false, reason: `page count mismatch ${origPages} vs ${newPages}` };
    }
    fs.renameSync(tmpFile, srcFile);
    return { ok: true, origSize, newSize };
  } catch (e) {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    return { ok: false, reason: String(e.message || e).slice(0, 80) };
  }
}

function runScan() {
  const res = spawnSync('node', [SCAN_SCRIPT, '--json'], {
    encoding: 'utf8',
    cwd: ROOT,
    maxBuffer: 50 * 1024 * 1024,
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
  const noCompress = args.includes('--no-compress');

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  PDF 清理');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  模式：${apply ? '执行 (--apply)' : '预览 (dry-run)'}${noCompress ? ' · 不压缩' : ''}`);
  console.log('');

  const report = runScan();
  // Only delete PDFs with no textual mention (safe to delete).
  const unreferencedPdfs = report.safeToDelete.filter((x) => /\.pdf$/i.test(x.file));
  // Compress referenced PDFs AND textually-mentioned PDFs (both are "in use").
  const referencedPdfs = report.referenced
    .filter((x) => /\.pdf$/i.test(x.file) && x.size !== null);
  const mentionedPdfs = report.textuallyMentioned
    .filter((x) => /\.pdf$/i.test(x.file));
  const compressiblePdfs = [
    ...referencedPdfs,
    ...mentionedPdfs.filter((m) => !referencedPdfs.some((r) => r.file === m.file)),
  ];

  console.log(`  未引用 PDF（可删除）：${unreferencedPdfs.length} 个 / ${formatSize(unreferencedPdfs.reduce((s, x) => s + x.size, 0))}`);
  console.log(`  被文字提及 PDF（保留+压缩）：${mentionedPdfs.length} 个 / ${formatSize(mentionedPdfs.reduce((s, x) => s + x.size, 0))}`);
  console.log(`  已引用 PDF（压缩）：${referencedPdfs.length} 个 / ${formatSize(referencedPdfs.reduce((s, x) => s + x.size, 0))}`);
  console.log('');

  if (apply) createBackupBranch();

  // 1. Delete unreferenced PDFs
  let deletedBytes = 0;
  let deletedCount = 0;
  if (unreferencedPdfs.length > 0) {
    console.log('──────────────────────────────────────────────────────────');
    console.log('  删除未引用 PDF');
    console.log('──────────────────────────────────────────────────────────');
    for (const item of unreferencedPdfs) {
      const abs = path.join(ROOT, item.file);
      if (!fs.existsSync(abs)) continue;
      console.log(`  ${formatSize(item.size).padStart(8)}  ${item.file}`);
      if (apply) {
        fs.unlinkSync(abs);
        deletedBytes += item.size;
        deletedCount++;
      }
    }
    if (apply) {
      console.log(`\n  ✓ 已删除 ${deletedCount} 个 PDF，释放 ${formatSize(deletedBytes)}\n`);
    } else {
      console.log(`\n  (dry-run，未实际删除)\n`);
    }
  }

  // 2. Compress referenced + textually-mentioned PDFs
  let compressedCount = 0;
  let compressedSaved = 0;
  if (!noCompress && compressiblePdfs.length > 0) {
    const gsBin = findGs();
    console.log('──────────────────────────────────────────────────────────');
    console.log('  压缩已引用/被提及 PDF');
    console.log('──────────────────────────────────────────────────────────');
    if (!gsBin) {
      console.log('  ⚠ 未找到 Ghostscript (gs/gswin64c)，跳过压缩。');
      console.log('    安装 Ghostscript 后重试，或使用 --no-compress 仅删除未引用文件。\n');
    } else {
      console.log(`  Ghostscript：${gsBin}\n`);
      for (const item of compressiblePdfs) {
        const abs = path.join(ROOT, item.file);
        if (!fs.existsSync(abs)) continue;
        const before = fs.statSync(abs).size;
        if (apply) {
          const result = compressPdf(abs, gsBin);
          if (result.ok) {
            compressedCount++;
            compressedSaved += (result.origSize - result.newSize);
            console.log(`  ✓ ${formatSize(result.origSize)} → ${formatSize(result.newSize)}  ${item.file}`);
          } else {
            console.log(`  ⏭  跳过（${result.reason}）  ${item.file}`);
          }
        } else {
          console.log(`  ${formatSize(before).padStart(8)}  ${item.file}`);
        }
      }
      if (apply) {
        console.log(`\n  ✓ 已压缩 ${compressedCount} 个 PDF，节省 ${formatSize(compressedSaved)}\n`);
      } else {
        console.log(`\n  (dry-run，未实际压缩)\n`);
      }
    }
  }

  console.log('══════════════════════════════════════════════════════════');
  if (apply) {
    console.log(`  完成：删除 ${deletedCount} 个 PDF (${formatSize(deletedBytes)})，压缩 ${compressedCount} 个 PDF (节省 ${formatSize(compressedSaved)})`);
  } else {
    console.log(`  dry-run 完成。加 --apply 执行实际清理。`);
  }
  console.log('══════════════════════════════════════════════════════════\n');
}

main();
