#!/usr/bin/env node
/**
 * 清理视频：删除未引用视频，把已引用视频压缩为 AV1。
 *
 * 用法：
 *   node scripts/cleanup-videos.js              # dry-run
 *   node scripts/cleanup-videos.js --apply      # 真正执行
 *   node scripts/cleanup-videos.js --apply --crf 32 --preset 6
 *
 * 编码：libsvtav1 CRF 32 preset 6 + libopus 128k，仅当输出更小时替换。
 * 安全：默认 dry-run。--apply 前自动创建备份分支。
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const SCAN_SCRIPT = path.join(__dirname, 'find-unreferenced-media.js');
const VIDEO_RE = /\.(mp4|m4v|mov|avi|mkv|webm)$/i;

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getCodec(filePath) {
  try {
    const out = spawnSync('ffprobe', [
      '-v', 'error', '-select_streams', 'v:0',
      '-show_entries', 'stream=codec_name',
      '-of', 'default=nw=1:nk=1', filePath,
    ], { encoding: 'utf8' });
    return out.stdout.trim();
  } catch {
    return null;
  }
}

function checkFfmpeg() {
  try {
    spawnSync('ffmpeg', ['-version'], { stdio: 'pipe' });
    spawnSync('ffprobe', ['-version'], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function reencodeVideo(srcFile, crf, preset) {
  // keep .mp4 container for browser compatibility where possible
  const ext = path.extname(srcFile).toLowerCase();
  const outExt = ext === '.webm' ? '.mp4' : ext;
  const tmpFile = srcFile + '.av1.tmp' + outExt;
  try {
    spawnSync('ffmpeg', [
      '-i', srcFile,
      '-c:v', 'libsvtav1', '-preset', String(preset), '-crf', String(crf),
      '-c:a', 'libopus', '-b:a', '128k',
      '-y', tmpFile,
    ], { stdio: 'pipe', timeout: 1200000 });

    if (!fs.existsSync(tmpFile)) return { ok: false, reason: 'no output' };
    const newSize = fs.statSync(tmpFile).size;
    const origSize = fs.statSync(srcFile).size;
    if (newSize >= origSize) {
      fs.unlinkSync(tmpFile);
      return { ok: false, reason: 'larger or equal' };
    }
    // replace original: remove old, rename tmp to target name (keep original extension)
    const target = srcFile;
    fs.unlinkSync(srcFile);
    fs.renameSync(tmpFile, target);
    return { ok: true, origSize, newSize };
  } catch (e) {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    return { ok: false, reason: String(e.message || e).slice(0, 80) };
  }
}

function runScan() {
  const res = spawnSync('node', [SCAN_SCRIPT, '--json'], {
    encoding: 'utf8', cwd: ROOT, maxBuffer: 50 * 1024 * 1024,
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
  const crfIdx = args.indexOf('--crf');
  const crf = crfIdx !== -1 ? parseInt(args[crfIdx + 1], 10) : 32;
  const presetIdx = args.indexOf('--preset');
  const preset = presetIdx !== -1 ? parseInt(args[presetIdx + 1], 10) : 6;

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  视频清理');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  模式：${apply ? '执行 (--apply)' : '预览 (dry-run)'}`);
  console.log(`  编码：AV1 (libsvtav1) CRF ${crf} preset ${preset} + libopus 128k`);
  console.log('');

  const report = runScan();
  const unreferencedVideos = report.unreferenced.filter((x) => VIDEO_RE.test(x.file));
  const referencedVideos = report.referenced.filter((x) => VIDEO_RE.test(x.file) && x.size !== null);

  console.log(`  未引用视频：${unreferencedVideos.length} 个 / ${formatSize(unreferencedVideos.reduce((s, x) => s + x.size, 0))}`);
  console.log(`  已引用视频：${referencedVideos.length} 个 / ${formatSize(referencedVideos.reduce((s, x) => s + x.size, 0))}`);
  console.log('');

  if (apply) createBackupBranch();

  // 1. Delete unreferenced videos
  let deletedBytes = 0, deletedCount = 0;
  if (unreferencedVideos.length > 0) {
    console.log('──────────────────────────────────────────────────────────');
    console.log('  删除未引用视频');
    console.log('──────────────────────────────────────────────────────────');
    for (const item of unreferencedVideos) {
      const abs = path.join(ROOT, item.file);
      if (!fs.existsSync(abs)) continue;
      console.log(`  ${formatSize(item.size).padStart(8)}  ${item.file}`);
      if (apply) {
        fs.unlinkSync(abs);
        deletedBytes += item.size;
        deletedCount++;
      }
    }
    if (apply) console.log(`\n  ✓ 已删除 ${deletedCount} 个视频，释放 ${formatSize(deletedBytes)}\n`);
    else console.log(`\n  (dry-run，未实际删除)\n`);
  }

  // 2. Re-encode referenced videos
  let encodedCount = 0, encodedSaved = 0, skippedCount = 0;
  if (referencedVideos.length > 0) {
    console.log('──────────────────────────────────────────────────────────');
    console.log('  压缩已引用视频为 AV1');
    console.log('──────────────────────────────────────────────────────────');
    if (!checkFfmpeg()) {
      console.log('  ⚠ 未找到 ffmpeg/ffprobe，跳过压缩。请先安装 ffmpeg。\n');
    } else {
      for (const item of referencedVideos) {
        const abs = path.join(ROOT, item.file);
        if (!fs.existsSync(abs)) continue;
        const codec = getCodec(abs);
        const origSize = fs.statSync(abs).size;
        if (codec === 'av1' || codec === 'av1_cuvid') {
          console.log(`  ⏭  已是 AV1  ${formatSize(origSize).padStart(8)}  ${item.file}`);
          skippedCount++;
          continue;
        }
        if (apply) {
          const r = reencodeVideo(abs, crf, preset);
          if (r.ok) {
            encodedCount++;
            encodedSaved += (r.origSize - r.newSize);
            console.log(`  ✓ ${formatSize(r.origSize)} → ${formatSize(r.newSize)}  ${item.file}`);
          } else {
            skippedCount++;
            console.log(`  ⏭  跳过（${r.reason}）  ${item.file}`);
          }
        } else {
          console.log(`  ${formatSize(origSize).padStart(8)}  ${codec || '未知'}  ${item.file}`);
        }
      }
      if (apply) console.log(`\n  ✓ 已压缩 ${encodedCount} 个视频，节省 ${formatSize(encodedSaved)}\n`);
      else console.log(`\n  (dry-run，未实际压缩)\n`);
    }
  }

  console.log('══════════════════════════════════════════════════════════');
  if (apply) {
    console.log(`  完成：删除 ${deletedCount} 个视频 (${formatSize(deletedBytes)})，压缩 ${encodedCount} 个视频 (节省 ${formatSize(encodedSaved)})`);
  } else {
    console.log(`  dry-run 完成。加 --apply 执行实际清理。`);
  }
  console.log('══════════════════════════════════════════════════════════\n');
}

main();
