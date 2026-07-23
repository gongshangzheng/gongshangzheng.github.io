#!/usr/bin/env node
/**
 * Source-aware linter for blog page files.
 *
 * Validates four syntax layers:
 *  1) YAML/TOML frontmatter
 *  2) HTML tag structure: all block-level tags (<div>, <p>, <ul>, <ol>,
 *     <table>, <figure>, <pre>, <blockquote>, <section>, <h1>-<h6>)
 *     must be properly opened and closed with matching tag types.
 *  3) Project custom shortcode syntax: {{< ... >}} / {{< /... >}}
 *  4) Structural integrity: <div class="wrap"> must not close prematurely.
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

// Block-level HTML tags that must be properly opened AND closed.
// Only tags that commonly appear on single lines and are prone to
// mismatched closing (e.g., <div> closed with </p>).
// Void elements (img, br, hr, etc.) and table-cell tags are excluded
// because they legitimately span multiple lines.
const BLOCK_TAGS = new Set([
  'div', 'p', 'ul', 'ol',
  'figure', 'figcaption', 'blockquote',
  'section', 'article', 'header', 'footer', 'nav', 'aside', 'main',
  'details', 'summary',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
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

/**
 * Tokenize a line into HTML tag tokens.
 * Math expressions inside $...$ and $$...$$ are stripped before tag detection
 * to prevent false positives from < symbols in math formulas.
 */
function tokenizeLine(line) {
  const tokens = [];

  // Strip inline math ($...$) and display math ($$...$$) to avoid false tag matches
  let cleanLine = line;
  // Remove display math first ($$...$$)
  cleanLine = cleanLine.replace(/\$\$[^$]*\$\$/g, ' ');
  // Remove inline math ($...$) - non-greedy
  cleanLine = cleanLine.replace(/\$[^$]*\$/g, ' ');
  // Remove LaTeX bracket math \[...\] and \(...\) - non-greedy
  cleanLine = cleanLine.replace(/\\\[.*?\\\]/g, ' ');
  cleanLine = cleanLine.replace(/\\\(.*?\\\)/g, ' ');

  // Match all opening tags: <tag ...>, closing tags: </tag>
  // Skip void elements
  const voidElements = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'track', 'area', 'base', 'col', 'embed', 'param', 'wbr', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'use', 'g', 'defs', 'stop', 'text', 'tspan']);

  const tagRe = /<(\/?)(\w+)([^>]*?)>/g;
  let m;
  while ((m = tagRe.exec(cleanLine)) !== null) {
    const [full, slash, tag, attrs] = m;
    const lowerTag = tag.toLowerCase();

    // Skip void elements and non-block tags
    if (voidElements.has(lowerTag)) continue;
    if (!BLOCK_TAGS.has(lowerTag)) continue;
    // Skip self-closing tags like <br/>
    if (attrs.endsWith('/')) continue;

    const isClose = slash === '/';
    const clsMatch = attrs.match(/class="([^"]+)"/);

    tokens.push({
      type: isClose ? 'close' : 'open',
      tag: lowerTag,
      cls: clsMatch ? clsMatch[1] : '',
      pos: m.index,
      raw: full,
    });
  }

  // Also handle shortcodes (on original line, not cleaned)
  const shortcodeRe = /\{\{<\s*(\/?)\s*([a-zA-Z0-9_-]+)([^>]*)>\}\}/g;
  while ((m = shortcodeRe.exec(line)) !== null) {
    const closing = !!m[1];
    tokens.push({
      type: closing ? 'shortcode-close' : 'shortcode-open',
      tag: 'shortcode',
      name: m[2],
      pos: m.index,
      raw: m[0],
    });
  }

  tokens.sort((a, b) => a.pos - b.pos);
  return tokens;
}

function lintBody(body, frontmatterLines) {
  const errors = [];
  const warnings = [];
  const stack = []; // Stack of open tags: { tag, cls, line, raw }
  const lines = body.split('\n');
  let wrapCloseLine = 0;
  let inPreBlock = false;
  let inComment = false;

  for (let i = 0; i < lines.length; i++) {
    const lineNo = frontmatterLines + i + 1;
    const line = lines[i];

    // Track <pre> blocks — skip tag checking inside code blocks
    if (line.includes('<pre') && !line.includes('</pre>')) {
      inPreBlock = true;
    }

    let workingLine = line;
    if (inPreBlock) {
      // Only check for </pre> to exit
      if (line.includes('</pre>')) {
        inPreBlock = false;
      }
      continue; // Skip tag checking inside <pre>
    }

    // Strip HTML comments (<!-- ... -->) — commented markup never renders,
    // so tags/shortcodes inside comments must not be checked.
    if (inComment) {
      const end = workingLine.indexOf('-->');
      if (end === -1) continue; // whole line still inside comment
      workingLine = workingLine.slice(end + 3);
      inComment = false;
    }
    while (true) {
      const start = workingLine.indexOf('<!--');
      if (start === -1) break;
      const end = workingLine.indexOf('-->', start + 4);
      if (end === -1) {
        workingLine = workingLine.slice(0, start);
        inComment = true;
        break;
      }
      workingLine = workingLine.slice(0, start) + ' ' + workingLine.slice(end + 3);
    }

    const tokens = tokenizeLine(workingLine);

    for (const token of tokens) {
      // Handle shortcode tokens separately
      if (token.type === 'shortcode-open') {
        if (PAIRED_SHORTCODES.has(token.name)) {
          stack.push({ kind: 'shortcode', tag: 'shortcode', name: token.name, line: lineNo, raw: token.raw });
        } else if (!SELF_CLOSING_SHORTCODES.has(token.name)) {
          warnings.push({ line: lineNo, msg: `Unknown shortcode '${token.name}' treated as self-closing`, context: token.raw });
        }
        continue;
      }

      if (token.type === 'shortcode-close') {
        const top = stack[stack.length - 1];
        if (!top || top.kind !== 'shortcode' || top.name !== token.name) {
          errors.push({ line: lineNo, msg: `Shortcode close mismatch: {{< /${token.name} >}}`, context: line.trim() });
        } else {
          stack.pop();
        }
        continue;
      }

      // Handle HTML tag tokens
      if (token.type === 'open') {
        stack.push({ kind: 'tag', tag: token.tag, cls: token.cls, line: lineNo, raw: token.raw });
      } else if (token.type === 'close') {
        const top = stack[stack.length - 1];

        if (!top) {
          // Nothing on stack — extra closing tag
          errors.push({
            line: lineNo,
            msg: `Extra </${token.tag}> with no matching open tag`,
            context: line.trim(),
          });
        } else if (top.kind === 'shortcode') {
          // Closing an HTML tag but top of stack is a shortcode
          errors.push({
            line: lineNo,
            msg: `Tag mismatch: </${token.tag}> found but expected {{< /${top.name} >}} (opened at L${top.line})`,
            context: line.trim(),
          });
        } else if (top.tag !== token.tag) {
          // Tag type mismatch: e.g., <div> opened but </p> found
          errors.push({
            line: lineNo,
            msg: `Tag mismatch: </${token.tag}> found but expected </${top.tag}> (opened at L${top.line}${top.cls ? ` class="${top.cls}"` : ''})`,
            context: line.trim(),
          });
        } else {
          // Correct match
          if (top.tag === 'div' && top.cls === 'wrap' && !wrapCloseLine) {
            wrapCloseLine = lineNo;
          }
          stack.pop();
        }
      }
    }
  }

  // Report unclosed tags remaining on stack
  for (const unclosed of stack) {
    if (unclosed.kind === 'tag') {
      errors.push({
        line: unclosed.line,
        msg: `Unclosed <${unclosed.tag}${unclosed.cls ? ` class="${unclosed.cls}"` : ''}>`,
        context: unclosed.raw,
      });
    } else if (unclosed.kind === 'shortcode') {
      errors.push({
        line: unclosed.line,
        msg: `Unclosed shortcode {{< ${unclosed.name} >}}`,
        context: unclosed.raw,
      });
    }
  }

  // Structural check: detect if <div class="wrap"> was closed prematurely
  if (wrapCloseLine > 0 && wrapCloseLine < frontmatterLines + lines.length) {
    const linesAfterWrap = lines.slice(wrapCloseLine - frontmatterLines);
    const hasContentAfterWrap = linesAfterWrap.some(l => l.trim() && !l.includes('</div>'));
    if (hasContentAfterWrap || (stack.length > 0 && stack.some(s => s.kind === 'tag' && s.cls !== 'wrap'))) {
      errors.push({
        line: wrapCloseLine,
        msg: `<div class="wrap"> closed prematurely on this line; content after it falls outside the article container.`,
        context: `A missing <div> likely caused this </div> to close the wrong parent. Check Part boundaries.`,
      });
    }
  }

  return { errors, warnings };
}

function isAcademicSurvey(frontmatterData) {
  const categories = parseListField(frontmatterData.categories).join(' ');
  const aliases = parseListField(frontmatterData.aliases).join(' ');
  const tags = parseListField(frontmatterData.tags).join(' ');
  const title = frontmatterData.title || '';
  const description = frontmatterData.description || '';
  const surveySignal = `${title} ${description} ${tags}`;

  const isAI = categories.includes('AI') || /categories\/AI\//.test(aliases);
  return isAI && /(综述|Survey|survey|调研|总报告|论文综述)/.test(surveySignal);
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

/**
 * Check image HTML format: must use <div class="photo"> + <div class="cap">,
 * images must be WebP, no hotlink, no leading slash.
 */
function lintImageFormat(body, lineOffset) {
  const errors = [];
  const warnings = [];
  const lines = body.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const lineNo = lineOffset + i + 1;
    const line = lines[i];

    // <figure> tag — should use <div class="photo">
    if (/<figure\b/i.test(line)) {
      errors.push({
        line: lineNo,
        msg: 'Use <div class="photo"> instead of <figure>',
        context: line.trim(),
      });
    }

    // <figcaption> tag — should use <div class="cap">
    if (/<figcaption\b/i.test(line)) {
      errors.push({
        line: lineNo,
        msg: 'Use <div class="cap"> instead of <figcaption>',
        context: line.trim(),
      });
    }

    // Non-WebP image formats
    const imgSrcMatch = line.match(/<img\s+[^>]*src="([^"]+)"/i);
    if (imgSrcMatch) {
      const src = imgSrcMatch[1];

      // Hotlink detection
      if (/^https?:\/\//i.test(src)) {
        errors.push({
          line: lineNo,
          msg: `Hotlink not allowed: ${src}`,
          context: 'Download image to media/images/ and reference locally.',
        });
      }

      // Non-WebP format
      if (/\.(png|jpe?g|gif|bmp|tiff?)$/i.test(src)) {
        errors.push({
          line: lineNo,
          msg: `Image must be WebP format: ${src}`,
          context: 'Convert with: cwebp -q 80 input.png -o output.webp',
        });
      }

      // Leading slash in path
      if (src.startsWith('/media/')) {
        warnings.push({
          line: lineNo,
          msg: `Image path should not start with '/': ${src}`,
          context: 'Use media/images/... without leading slash.',
        });
      }
    }
  }

  return { errors, warnings };
}

/**
 * Validate frontmatter fields: check for deprecated fields,
 * missing required fields, and tag count limits.
 */
function lintFrontmatterFields(raw) {
  const errors = [];
  const warnings = [];

  let parsed;
  try {
    parsed = parseFrontmatter(raw);
  } catch {
    return { errors, warnings };
  }
  const fm = parsed.data || {};

  // Deprecated fields
  const deprecated = ['categories', 'subcategory', 'subsubcategory', 'hub'];
  for (const field of deprecated) {
    if (fm[field] !== undefined) {
      errors.push({
        line: 1,
        msg: `Deprecated frontmatter field '${field}' — use aliases with categories/ path instead`,
      });
    }
  }

  // Required: title
  if (!fm.title) {
    errors.push({
      line: 1,
      msg: 'Missing required frontmatter field: title',
    });
  }

  // Tags count (max 5)
  const tags = parseListField(fm.tags);
  if (tags.length > 5) {
    warnings.push({
      line: 1,
      msg: `Tags count ${tags.length} exceeds max 5: [${tags.join(', ')}]`,
    });
  }

  // Aliases should contain categories/ path
  const aliases = parseListField(fm.aliases);
  const hasCategoryPath = aliases.some(a => a.startsWith('categories/'));
  if (!hasCategoryPath && aliases.length > 0) {
    warnings.push({
      line: 1,
      msg: 'No categories/ path found in aliases',
      context: 'Add aliases: ["categories/AI/..."] for taxonomy classification.',
    });
  }

  return { errors, warnings };
}

function lintFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const fm = validateFrontmatter(raw);
  const body = lintBody(fm.body, fm.frontmatterLines);
  const academicSurveyImages = lintAcademicSurveyImages(raw);
  const imageFormat = lintImageFormat(fm.body, fm.frontmatterLines);
  const fmFields = lintFrontmatterFields(raw);

  return {
    errors: [...fm.errors, ...body.errors, ...academicSurveyImages, ...imageFormat.errors, ...fmFields.errors],
    warnings: [...body.warnings, ...imageFormat.warnings, ...fmFields.warnings],
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
  lintImageFormat,
  lintFrontmatterFields,
  lintFile,
};
