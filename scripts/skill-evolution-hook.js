#!/usr/bin/env node
'use strict';

/**
 * post-commit hook helper: site-architecture change → skill self-evolution reminder.
 *
 * Triggered by githooks/post-commit after every commit. It inspects the files
 * touched by the commit; if any belong to the site's own architecture (build
 * pipeline, lib modules, templates, CSS/JS runtime, scripts, tests, skills, …)
 * rather than to article content or media resources, it prints a structured
 * reminder mapping the changed areas to the skills that may need to be updated
 * (i.e. "self-evolved") to stay in sync with the architecture.
 *
 * Non-blocking: any error exits 0 so the commit (already created) is never
 * disturbed. Article-only and resource-only commits produce no output.
 *
 * Usage:
 *   node scripts/skill-evolution-hook.js [REF]   # REF defaults to HEAD
 *   node scripts/skill-evolution-hook.js --test <REF>  # force output even if non-interactive
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REF = process.argv.includes('--test')
  ? (process.argv[process.argv.indexOf('--test') + 1] || 'HEAD')
  : (process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'HEAD');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function git(args, cwd) {
  try {
    return execSync(`git ${args}`, { encoding: 'utf8', cwd: cwd || REPO_ROOT });
  } catch (_) {
    return '';
  }
}

const REPO_ROOT = (() => {
  try {
    return execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
  } catch (_) {
    process.exit(0);
  }
})();

// ---------------------------------------------------------------------------
// File classification
// ---------------------------------------------------------------------------

// Files that are NOT architecture even though they might live under tracked dirs.
const ARTICLE_OR_RESOURCE_PREFIXES = [
  'src/pages/',        // blog articles (HTML)
  'src/assets/media/', // article-attached media
  'media/',            // site media resources (images/videos/pdf)
  'raw/',              // article source materials
  'public/',           // build output
  'data/daily-papers/',// generated daily-paper data
  'data/lite-avatar/', // generated data
  '.qoder/',           // local-only repowiki
  '.aone_copilot/',    // local-only memories
];

// Exact architecture files (root-level / config).
const ARCH_EXACT = new Set([
  'build.js',
  'preview.js',
  'migrate-hugo.js',
  'config.json',
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'data/category-names.json', // taxonomy translation registry (config, not generated)
]);

// Directory prefixes whose contents are site architecture.
const ARCH_PREFIXES = [
  'lib/',
  'scripts/',
  'assets/js/',
  'assets/css/',
  'tests/',
  'docs/',
  'src/templates/',
  '.github/workflows/',
  '.agents/skills/',
  'githooks/',
];

// Generated / article-derived data files that must NOT trigger (they change
// with every article commit and would cause false positives).
const EXACT_EXCLUDE = new Set([
  'data/article-slugs.json',
]);

function isArticleOrResource(file) {
  if (EXACT_EXCLUDE.has(file)) return true;
  return ARTICLE_OR_RESOURCE_PREFIXES.some((p) => file.startsWith(p));
}

function isArchitecture(file) {
  if (isArticleOrResource(file)) return false;
  // Static site icons / favicon images are resources, not architecture logic.
  if (/^assets\/[^/]+\.(png|svg|ico|jpg|jpeg|webp)$/.test(file)) return false;
  if (ARCH_EXACT.has(file)) return true;
  return ARCH_PREFIXES.some((p) => file.startsWith(p));
}

// ---------------------------------------------------------------------------
// Skill mapping: architecture file → set of potentially affected skills
// ---------------------------------------------------------------------------

function skillsForFile(file) {
  const skills = new Set();
  const add = (...s) => s.forEach((x) => skills.add(x));

  if (/^lib\/(shortcodes\/|replace\.js|shortcode-deps\.js|parser\.js)/.test(file)) {
    add('blog-syntax', 'site-dev');
  } else if (/^lib\/(taxonomy\.js|article-slugs\.js)/.test(file)) {
    add('blog-categories', 'blog-aliases', 'site-dev');
  } else if (/^lib\/toc\.js$/.test(file)) {
    add('site-dev');
  } else if (/^lib\//.test(file)) {
    add('site-dev');
  } else if (/^assets\/js\/runtime\/search\.js$/.test(file)) {
    add('blog-search', 'site-dev');
  } else if (/^assets\/js\//.test(file)) {
    add('site-dev');
  } else if (/^assets\/css\//.test(file)) {
    add('site-design-language', 'site-dev');
  } else if (/^src\/templates\//.test(file)) {
    add('site-design-language', 'site-dev');
  } else if (file === 'data/category-names.json') {
    add('blog-categories');
  } else if (/^\.agents\/skills\//.test(file)) {
    const name = file.slice('.agents/skills/'.length).split('/')[0];
    if (name) skills.add(name);
  } else {
    // build.js, config.json, scripts/, tests/, docs/, .github/workflows/,
    // package.json, lockfiles, githooks/ …
    add('site-dev');
  }
  return skills;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const out = git(`diff-tree --no-commit-id --name-status -r ${REF}`);
  if (!out) process.exit(0);

  const entries = [];
  for (const line of out.split('\n')) {
    if (!line) continue;
    const parts = line.split('\t');
    if (parts.length < 2) continue; // skip commit header lines
    entries.push({ status: parts[0], file: parts.slice(1).join('\t') });
  }

  const arch = entries.filter((e) => isArchitecture(e.file));
  if (arch.length === 0) process.exit(0);

  // skill -> [files]
  const skillFiles = new Map();
  for (const e of arch) {
    for (const s of skillsForFile(e.file)) {
      if (!skillFiles.has(s)) skillFiles.set(s, []);
      skillFiles.get(s).push(e.file);
    }
  }

  const shortHash = git(`rev-parse --short ${REF}`).trim() || REF;

  // ---- build reminder message -------------------------------------------
  const W = 74;
  const bar = '='.repeat(W);
  const thin = '-'.repeat(W);
  const m = [];
  m.push(bar);
  m.push('[skill-evolution] 检测到网站架构文件变更 — 请评估相关 skill 是否需要自进化。');
  m.push('[skill-evolution] 即：把本次架构变更同步到受影响 skill 的 SKILL.md，消除偏差。');
  m.push(thin);
  m.push(`  commit : ${shortHash}`);
  m.push(`  架构文件变更 (${arch.length}):`);
  for (const e of arch.slice(0, 25)) {
    m.push(`    ${String(e.status).padEnd(2)} ${e.file}`);
  }
  if (arch.length > 25) m.push(`    … 及其他 ${arch.length - 25} 个`);
  m.push(`  可能受影响的 skill (${skillFiles.size}):`);
  for (const [skill, files] of skillFiles) {
    const shown = files.slice(0, 3).join(', ') + (files.length > 3 ? ' …' : '');
    m.push(`    - ${skill.padEnd(20)} (${shown})`);
  }
  m.push(thin);
  m.push('  建议: 逐一阅读受影响 skill 的 SKILL.md，确认是否与本次架构变更产生偏差；');
  m.push('        若有偏差，更新 SKILL.md 并提交，保持 skill 与站点架构一致。');

  // ---- persistent pending log (gitignored under .cache/) ----------------
  const logDir = path.join(REPO_ROOT, '.cache');
  const logFile = path.join(logDir, 'skill-evolution-pending.log');
  try {
    fs.mkdirSync(logDir, { recursive: true });
    const ts = new Date().toISOString();
    const rec = `[${ts}] ${shortHash} skills=[${[...skillFiles.keys()].join(',')}] files=[${arch
      .map((e) => e.file)
      .join(',')}]`;
    let prev = '';
    try {
      prev = fs.readFileSync(logFile, 'utf8');
    } catch (_) {}
    const lines = (prev + rec + '\n').split('\n').filter(Boolean);
    const trimmed = lines.slice(-100); // keep last 100 pending entries
    fs.writeFileSync(logFile, trimmed.join('\n') + '\n');
    m.push(`  待办已记录: .cache/skill-evolution-pending.log (保留最近 100 条)`);
  } catch (_) {
    // logging is best-effort; never block
  }

  m.push(bar);
  process.stderr.write(m.join('\n') + '\n');
}

main();
