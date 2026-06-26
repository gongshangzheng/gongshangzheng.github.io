#!/usr/bin/env node
/**
 * 手动转换 media/videos/ 中的视频为 AV1 格式
 *
 * 用法：
 *   node scripts/convert-videos-to-av1.js
 *
 * 功能：
 *   - 扫描 media/videos/ 下所有 .mp4/.mov/.avi/.mkv 文件
 *   - 用 ffprobe 检查编码，跳过已是 AV1 的文件
 *   - 用 ffmpeg (libsvtav1) 转换为 AV1，原地替换
 *   - 只有压缩后更小才替换，否则保留原文件
 *
 * 参数：
 *   --dry-run    只扫描，不实际转换
 *   --crf <n>    自定义 CRF 值（默认 32）
 *   --preset <n> 自定义 preset（默认 6）
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 解析参数
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const CRF = (() => {
  const idx = args.indexOf('--crf');
  return idx !== -1 ? parseInt(args[idx + 1], 10) : 32;
})();
const PRESET = (() => {
  const idx = args.indexOf('--preset');
  return idx !== -1 ? parseInt(args[idx + 1], 10) : 6;
})();

const VIDEOS_DIR = path.join(__dirname, '..', 'media', 'videos');
const CONVERTIBLE = /\.(mp4|mov|avi|mkv)$/i;

function walkFiles(dir, filter) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(fullPath, filter));
    } else if (entry.isFile() && (!filter || filter(fullPath))) {
      results.push(fullPath);
    }
  }
  return results;
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getCodec(filePath) {
  try {
    return execSync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=nw=1:nk=1 "${filePath}"`,
      { stdio: 'pipe' }
    ).toString().trim();
  } catch {
    return null;
  }
}

// 检查 ffmpeg/ffprobe 是否可用
try {
  execSync('which ffmpeg', { stdio: 'pipe' });
  execSync('which ffprobe', { stdio: 'pipe' });
} catch {
  console.error('❌ 未找到 ffmpeg/ffprobe，请先安装：brew install ffmpeg');
  process.exit(1);
}

if (!fs.existsSync(VIDEOS_DIR)) {
  console.log('📂 未找到 media/videos/ 目录');
  process.exit(0);
}

const files = walkFiles(VIDEOS_DIR, (f) => CONVERTIBLE.test(f));

if (files.length === 0) {
  console.log('📂 未找到可转换的视频文件');
  process.exit(0);
}

console.log(`\n🎬 视频转换工具 (AV1)`);
console.log(`   目录：${path.relative(process.cwd(), VIDEOS_DIR)}`);
console.log(`   文件数：${files.length}`);
console.log(`   参数：CRF ${CRF}, preset ${PRESET}`);
if (DRY_RUN) console.log('   ⚠️  DRY RUN 模式，不会实际转换\n');
console.log('');

const stats = { converted: 0, skipped: 0, failed: 0, totalSaved: 0 };

for (const file of files) {
  const relPath = path.relative(VIDEOS_DIR, file);
  const origSize = fs.statSync(file).size;

  // 检查编码
  const codec = getCodec(file);
  if (codec === 'av1') {
    console.log(`  ⏭️  ${relPath} (已是 AV1, ${formatSize(origSize)})`);
    stats.skipped++;
    continue;
  }

  console.log(`  🔄 ${relPath} (${codec || '未知'}, ${formatSize(origSize)})`);

  if (DRY_RUN) continue;

  const tmpFile = file + '.av1.tmp.mp4';

  try {
    execSync(
      `ffmpeg -i "${file}" -c:v libsvtav1 -preset ${PRESET} -crf ${CRF} -c:a libopus -b:a 128k -y "${tmpFile}"`,
      { stdio: 'pipe', timeout: 600000 }
    );

    if (fs.existsSync(tmpFile)) {
      const newSize = fs.statSync(tmpFile).size;

      if (newSize < origSize) {
        fs.renameSync(tmpFile, file);
        const saved = origSize - newSize;
        stats.totalSaved += saved;
        console.log(`     ✅ ${formatSize(origSize)} → ${formatSize(newSize)} (节省 ${formatSize(saved)})`);
        stats.converted++;
      } else {
        fs.unlinkSync(tmpFile);
        console.log(`     ⏭️  压缩后更大，跳过`);
        stats.skipped++;
      }
    }
  } catch (e) {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    console.log(`     ❌ 转换失败`);
    stats.failed++;
  }
}

console.log('\n' + '═'.repeat(60));
console.log(`✅ 完成：${stats.converted} 转换, ${stats.skipped} 跳过, ${stats.failed} 失败`);
if (stats.totalSaved > 0) {
  console.log(`💾 总共节省：${formatSize(stats.totalSaved)}`);
}
console.log('');
