#!/usr/bin/env node
/**
 * 媒体清理编排脚本：扫描 → PDF 清理 → 视频清理 → 综合报告。
 *
 * 用法：
 *   node scripts/run-cleanup.js                # 全部 dry-run
 *   node scripts/run-cleanup.js --apply        # 全部执行
 *   node scripts/run-cleanup.js --apply --pdfs-only
 *   node scripts/run-cleanup.js --apply --videos-only
 *
 * 子脚本支持的所有参数会透传：--crf --preset --no-compress 等。
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const SCRIPTS_DIR = __dirname;

function run(script, args) {
  const file = path.join(SCRIPTS_DIR, script);
  console.log(`\n▸ node ${script} ${args.join(' ')}\n`);
  const res = spawnSync('node', [file, ...args], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  return res.status;
}

function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const pdfsOnly = args.includes('--pdfs-only');
  const videosOnly = args.includes('--videos-only');
  // forward extra flags (drop our own orchestrator flags)
  const passThrough = args.filter((a) =>
    !['--apply', '--pdfs-only', '--videos-only'].includes(a)
  );

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║          媒体清理编排 (run-cleanup)                        ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`  模式：${apply ? '执行 (--apply)' : '预览 (dry-run)'}`);
  if (pdfsOnly) console.log('  范围：仅 PDF');
  if (videosOnly) console.log('  范围：仅视频');
  console.log('');

  // 1. scan
  run('find-unreferenced-media.js', []);

  // 2. pdf cleanup
  if (!videosOnly) {
    run('cleanup-pdfs.js', [...passThrough, ...(apply ? ['--apply'] : [])]);
  }

  // 3. video cleanup
  if (!pdfsOnly) {
    run('cleanup-videos.js', [...passThrough, ...(apply ? ['--apply'] : [])]);
  }

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  if (apply) {
    console.log('║  清理已执行。建议接下来：                                ║');
    console.log('║   1. npm test && npm run build  验证构建                ║');
    console.log('║   2. git add -A && git commit                            ║');
    console.log('║   3. 用 git filter-repo 清理历史（见 SKILL.md）          ║');
  } else {
    console.log('║  dry-run 完成。检查输出后加 --apply 执行。               ║');
  }
  console.log('╚══════════════════════════════════════════════════════════╝\n');
}

main();
