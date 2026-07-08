#!/usr/bin/env node
/**
 * capture.js — 新建博客文章
 * 位置: ~/gongshangzheng.github.io/.agents/skills/html-blog/capture.js
 * 用法: node capture.js <slug> [--hub] [--course] [--algorithm] [--notify]
 *
 * 行为:
 *   1. 读取 ~/gongshangzheng.github.io/.agents/skills/html-blog/templates/ 下的标准模板
 *   2. 生成 frontmatter（created_at / updated_at 均为当前时间，精确到秒）
 *   3. 将 frontmatter + 正文写入 ~/gongshangzheng.github.io/src/pages/<slug>.html
 *
 * 参数:
 *   --hub       使用中枢页模板
 *   --course    使用课程笔记正文骨架，并预填课程类 frontmatter
 *   --algorithm 使用算法题解模板，预填编程/算法分类和 mathjax
 *   --notify    在 frontmatter 中写入 notify: true，由 html-blog 发布时发送邮件通知
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILL_DIR = __dirname;
const BLOG_ROOT = path.join(os.homedir(), 'gongshangzheng.github.io');
const TEMPLATES_DIR = path.join(SKILL_DIR, 'templates');
const PAGES_DIR = path.join(BLOG_ROOT, 'src/pages');

// 工具函数：格式化时间为 YYYY-MM-DDTHH:mm:ss
function fmtTimestamp(d) {
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('用法: node capture.js <slug> [options]');
    console.error('  <slug>      文章 slug（英文，无空格）');
    console.error('  --template  仅输出模板内容到 stdout，不写文件');
    console.error('  --hub       使用中枢页模板（hub-template.html）');
    console.error('  --course    使用课程笔记骨架（course-note-section-template.html）');
    console.error('  --algorithm 使用算法题解模板（algorithm-template.html）');
    console.error('  --notify    发布后发送邮件通知（在 frontmatter 中写入 notify: true）');
    process.exit(1);
  }

  const slug = args[0];
  const writeFile = !args.includes('--template');

  // 验证 slug 格式
  if (!/^[a-z0-9-]+$/.test(slug)) {
    console.error(`错误: slug 必须为小写字母、数字、连字符组合: ${slug}`);
    process.exit(1);
  }

  // 验证博客仓库存在
  if (!fs.existsSync(BLOG_ROOT)) {
    console.error(`错误: 博客仓库不存在: ${BLOG_ROOT}`);
    process.exit(1);
  }

  // 选择模板
  const isHub = args.includes('--hub');
  const isCourse = args.includes('--course');
  const isAlgo = args.includes('--algorithm');

  const modeCount = [isHub, isCourse, isAlgo].filter(Boolean).length;
  if (modeCount > 1) {
    console.error('错误: --hub / --course / --algorithm 不能同时使用');
    process.exit(1);
  }

  const templateName = isHub
    ? 'hub-template.html'
    : isCourse
      ? 'course-note-section-template.html'
      : isAlgo
        ? 'algorithm-template.html'
        : 'article-template.html';
  const templatePath = path.join(TEMPLATES_DIR, templateName);

  // 验证模板存在
  if (!fs.existsSync(templatePath)) {
    console.error(`错误: 模板文件不存在: ${templatePath}`);
    process.exit(1);
  }

  // 读取模板
  const template = fs.readFileSync(templatePath, 'utf8');

  if (!writeFile) {
    process.stdout.write(template);
    return;
  }

  // 生成时间戳（精确到秒）
  const now = new Date();
  const ts = fmtTimestamp(now);

  // 检查通知标记
  const notify = args.includes('--notify');

  // 构造 frontmatter（由 agent 后续补充 title / description / categories 等字段）
  const fmLines = [
    '---',
    `title: "${slug}"`,
    `description: ""`,
    `date: ${ts}`,
    `created_at: ${ts}`,
    `updated_at: ${ts}`,
    `tags: []`,
    `categories: ${isCourse ? '["课程"]' : isAlgo ? '["编程"]' : '[]'}`,
    `papers: []`,
    `repos: []`,
  ];

  if (isCourse) {
    fmLines.push('subcategory: ""');
    fmLines.push('mathjax: true');
    fmLines.push(`hero_title: "${slug}"`);
    fmLines.push('hero_sub: "课程笔记"');
    fmLines.push('hero_tagline: ""');
  }
  if (isAlgo) {
    fmLines.push('subcategory: "算法"');
    fmLines.push('mathjax: true');
    fmLines.push(`hero_title: "${slug}"`);
    fmLines.push('hero_sub: "来源平台 · 题号"');
    fmLines.push('hero_tagline: ""');
  }
  if (notify) {
    fmLines.push('notify: true');
  }
  fmLines.push('---', '');
  const frontmatter = fmLines.join('\n');

  // 提取模板正文。article/hub 模板带 frontmatter；course 模板是纯正文骨架。
  const marker = '---';
  const firstDash = template.indexOf(marker);
  const secondDash = firstDash === -1 ? -1 : template.indexOf(marker, firstDash + marker.length);

  const bodyContent = (firstDash !== -1 && secondDash !== -1)
    ? template.slice(secondDash + marker.length).trim()
    : template.trim();

  // 完整文件内容
  const fileContent = frontmatter + bodyContent + '\n';

  // 确保目标目录存在
  if (!fs.existsSync(PAGES_DIR)) {
    fs.mkdirSync(PAGES_DIR, { recursive: true });
  }

  const outPath = path.join(PAGES_DIR, `${slug}.html`);

  if (fs.existsSync(outPath)) {
    console.error(`错误: 文件已存在: ${outPath}`);
    console.error('  请先删除或使用其他 slug');
    process.exit(1);
  }

  fs.writeFileSync(outPath, fileContent, 'utf8');

  const relPath = path.relative(BLOG_ROOT, outPath);
  console.log(`✅ 创建: ${relPath}`);
  console.log(`   模板: ${templateName}`);
  console.log(`   created_at: ${ts}`);
  console.log(`   updated_at: ${ts}`);
  console.log(`\n下一步: 编辑 ${relPath}，补充 title / description / categories 等字段`);
}

main();