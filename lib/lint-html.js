#!/usr/bin/env node
/**
 * Source-aware linter for blog page files.
 *
 * Validates three syntax layers together:
 *  1) YAML/TOML frontmatter
 *  2) HTML container structure (currently focuses on <div> nesting)
 *  3) project custom shortcode syntax: {{< ... >}} / {{< /... >}}
 *
 * Usage:
 *   node lib/lint-html.js src/pages/dsp-fir-filter-design.html
 *   node lib/lint-html.js src/pages/*.html
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { parseFrontmatter, parseListField } = require('./parser');

const PAIRED_SHORTCODES = new Set([
  'details', 'mermaid', 'jsxgraph', 'bg', 'functionplot'
]);

const SELF_CLOSING_SHORTCODES = new Set([
  'docpage', 'docpages', 'docref', 'bilibili', 'pdf'
]);

function expandPatterns(patterns) {
  const out = [];
  for (const pattern of patterns) {
    if (pattern.includes('*')) {
      try {
        const expanded = execSync(`ls ${pattern} 2>/dev/null`, { encoding: 'utf8' })
          .trim()
          .split('\n')
          .filter(Boolean);
        out.push(...expanded);
      } catch {
        out.push(pattern);
      }
    } else {
      out.push(pattern);
    }
  }
  return out;
}

function detectFrontmatter(raw) {
  if (raw.startsWith('---\n')) {
    const end = raw.indexOf('\n---\n', 4);
    if (end === -1) {
      return { type: 'yaml', ok: false, error: 'YAML frontmatter starts with --- but has no closing ---', body: raw, frontmatterLines: 0 };
    }
    const block = raw.slice(4, end);
    const body = raw.slice(end + 5);
    return { type: 'yaml', ok: true, block, body, frontmatterLines: raw.slice(0, end + 5).split('\n').length - 1 };
  }

  if (raw.startsWith('+++\n')) {
    const end = raw.indexOf('\n+++\n', 4);
    if (end === -1) {
      return { type: 'toml', ok: false, error: 'TOML frontmatter starts with +++ but has no closing +++', body: raw, frontmatterLines: 0 };
    }
    const block = raw.slice(4, end);
    const body = raw.slice(end + 5);
    return { type: 'toml', ok: true, block, body, frontmatterLines: raw.slice(0, end + 5).split('\n').length - 1 };
  }

  if (raw.startsWith('+++ ')) {
    const nl = raw.indexOf('\n');
    const firstLine = nl === -1 ? raw : raw.slice(0, nl);
    if (!/ \+\+\+$/.test(firstLine)) {
      return { type: 'toml-inline', ok: false, error: 'Inline TOML frontmatter starts with +++ but has no closing +++ on the same line', body: raw, frontmatterLines: 0 };
    }
    return { type: 'toml-inline', ok: true, block: firstLine, body: nl === -1 ? '' : raw.slice(nl + 1), frontmatterLines: 1 };
  }

  return { type: null, ok: true, block: '', body: raw, frontmatterLines: 0 };
}

function validateYamlBlock(block, lineOffset) {
  const errors = [];
  const lines = block.split('\n');
  let inLiteral = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trim = line.trim();
    if (!trim || trim.startsWith('#')) continue;

    if (inLiteral) {
      if (/^\S/.test(line)) inLiteral = false;
      else continue;
    }

    if (!inLiteral) {
      const colon = line.indexOf(':');
      if (colon === -1) {
        errors.push({ line: lineOffset + i + 1, msg: 'Malformed YAML frontmatter line: missing colon', context: line.trim() });
        continue;
      }
      const value = line.slice(colon + 1).trim();
      if (value === '|') inLiteral = true;
    }
  }

  return errors;
}

function validateFrontmatter(raw) {
  const fm = detectFrontmatter(raw);
  const errors = [];
  if (!fm.ok) {
    errors.push({ line: 1, msg: fm.error });
    return { body: raw, frontmatterLines: 0, errors };
  }

  if (fm.type === 'yaml') {
    errors.push(...validateYamlBlock(fm.block, 1));
  }

  try {
    parseFrontmatter(raw);
  } catch (err) {
    errors.push({ line: 1, msg: `Frontmatter parser error: ${err.message}` });
  }

  return { body: fm.body, frontmatterLines: fm.frontmatterLines, errors };
}

function tokenizeLine(line) {
  const tokens = [];

  const divRe = /<div\b[^>]*>|<\/div>/g;
  let m;
  while ((m = divRe.exec(line)) !== null) {
    const raw = m[0];
    const isClose = raw.startsWith('</div');
    const clsMatch = raw.match(/class="([^"]+)"/);
    tokens.push({ type: isClose ? 'div-close' : 'div-open', pos: m.index, raw, cls: clsMatch ? clsMatch[1] : '' });
  }

  const shortcodeRe = /\{\{<\s*(\/?)\s*([a-zA-Z0-9_-]+)([^>]*)>\}\}/g;
  while ((m = shortcodeRe.exec(line)) !== null) {
    const closing = !!m[1];
    tokens.push({
      type: closing ? 'shortcode-close' : 'shortcode-open',
      pos: m.index,
      name: m[2],
      raw: m[0],
    });
  }

  tokens.sort((a, b) => a.pos - b.pos);
  return tokens;
}

function lintBody(body, frontmatterLines) {
  const errors = [];
  const warnings = [];
  const stack = [];
  const lines = body.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const lineNo = frontmatterLines + i + 1;
    const line = lines[i];
    const tokens = tokenizeLine(line);

    for (const token of tokens) {
      if (token.type === 'div-open') {
        stack.push({ kind: 'div', cls: token.cls, line: lineNo, raw: token.raw });
      } else if (token.type === 'div-close') {
        const top = stack[stack.length - 1];
        if (!top || top.kind !== 'div') {
          errors.push({ line: lineNo, msg: 'Extra </div> with no matching open <div>', context: line.trim() });
        } else {
          stack.pop();
        }
      } else if (token.type === 'shortcode-open') {
        if (PAIRED_SHORTCODES.has(token.name)) {
          stack.push({ kind: 'shortcode', name: token.name, line: lineNo, raw: token.raw });
        } else if (!SELF_CLOSING_SHORTCODES.has(token.name)) {
          warnings.push({ line: lineNo, msg: `Unknown shortcode '${token.name}' treated as self-closing`, context: token.raw });
        }
      } else if (token.type === 'shortcode-close') {
        const top = stack[stack.length - 1];
        if (!top || top.kind !== 'shortcode' || top.name !== token.name) {
          errors.push({ line: lineNo, msg: `Shortcode close mismatch: {{< /${token.name} >}}`, context: line.trim() });
        } else {
          stack.pop();
        }
      }
    }
  }

  for (const unclosed of stack.reverse()) {
    if (unclosed.kind === 'div') {
      errors.push({ line: unclosed.line, msg: `Unclosed <div${unclosed.cls ? ` class="${unclosed.cls}"` : ''}>`, context: unclosed.raw });
    } else if (unclosed.kind === 'shortcode') {
      errors.push({ line: unclosed.line, msg: `Unclosed shortcode {{< ${unclosed.name} >}}`, context: unclosed.raw });
    }
  }

  return { errors, warnings };
}

function isAcademicSurvey(frontmatterData) {
  const categories = parseListField(frontmatterData.categories).join(' ');
  const tags = parseListField(frontmatterData.tags).join(' ');
  const title = frontmatterData.title || '';
  const description = frontmatterData.description || '';
  const surveySignal = `${title} ${description} ${tags}`;

  return categories.includes('AI') && /(综述|Survey|survey|调研|总报告|论文综述)/.test(surveySignal);
}

function lintAcademicSurveyImages(raw) {
  const errors = [];
  let parsed;
  try {
    parsed = parseFrontmatter(raw);
  } catch {
    return errors;
  }

  if (!isAcademicSurvey(parsed.data || {})) {
    return errors;
  }

  const imageCount = (parsed.content.match(/<img\b/g) || []).length;
  if (imageCount < 3) {
    errors.push({
      line: 1,
      msg: `Academic survey pages must include at least 3 source-first images; found ${imageCount}`,
      context: 'Add paper/project figures under media/images/<slug>/ and reference them with <img>.',
    });
  }

  return errors;
}

function lintFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const fm = validateFrontmatter(raw);
  const body = lintBody(fm.body, fm.frontmatterLines);
  const academicSurveyImages = lintAcademicSurveyImages(raw);
  return {
    errors: [...fm.errors, ...body.errors, ...academicSurveyImages],
    warnings: body.warnings,
  };
}

function printReport(filePath, result) {
  const rel = path.relative(process.cwd(), filePath);
  const hasIssues = result.errors.length || result.warnings.length;
  if (!hasIssues) return false;

  console.log(`\n🔍 ${rel}`);
  console.log('─'.repeat(60));

  if (result.errors.length) {
    console.log('\n  ❌ Errors:');
    for (const err of result.errors) {
      console.log(`    L${err.line}: ${err.msg}`);
      if (err.context) console.log(`         ${err.context}`);
    }
  }

  if (result.warnings.length) {
    console.log('\n  ⚠ Warnings:');
    for (const warn of result.warnings) {
      console.log(`    L${warn.line}: ${warn.msg}`);
      if (warn.context) console.log(`         ${warn.context}`);
    }
  }

  return true;
}

function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.log('Usage: node lib/lint-html.js <file.html|glob>');
    process.exit(1);
  }

  const files = expandPatterns(args);
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const filePath of files) {
    if (!fs.existsSync(filePath)) {
      console.log(`SKIP: ${filePath} not found`);
      continue;
    }
    const result = lintFile(filePath);
    printReport(filePath, result);
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
  }

  console.log('\n' + '═'.repeat(60));
  if (totalErrors === 0 && totalWarnings === 0) {
    console.log('✅ All files passed source syntax checks.');
    return;
  }
  console.log(`Found ${totalErrors} errors, ${totalWarnings} warnings.`);
  process.exit(totalErrors > 0 ? 1 : 0);
}

if (require.main === module) main();

module.exports = {
  detectFrontmatter,
  validateYamlBlock,
  validateFrontmatter,
  tokenizeLine,
  lintBody,
  lintFile,
};
