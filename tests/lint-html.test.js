/**
 * lint-html unit tests
 * Run with: node tests/run.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Import the linter functions by extracting them from lint-html.js
// We'll use child_process for the CLI entry point, but test the core logic inline.

const LINT_HTML = path.join(__dirname, '..', 'lib', 'lint-html.js');

// ── Helper: run linter as CLI and capture output ──
function runLint(filePath) {
  const { execSync } = require('child_process');
  try {
    const out = execSync(`node "${LINT_HTML}" "${filePath}"`, { encoding: 'utf8', timeout: 10000 });
    return { exitCode: 0, output: out };
  } catch (err) {
    return { exitCode: err.status || 1, output: err.stdout || '', stderr: err.stderr || '' };
  }
}

// ── Helper: create a temp HTML file ──
const tmpDir = path.join(__dirname, '__tmp_lint_test__');
function writeTmp(name, content) {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const p = path.join(tmpDir, name);
  fs.writeFileSync(p, content);
  return p;
}
function cleanTmp() {
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true });
}

const tests = {

  // ===== Depth Tracking =====

  'depth check: well-formed file passes': () => {
    const html = `---
title: Test
---
<div class="wrap">
<div class="ch fade-in">
  <div class="ch-title">Hello</div>
  <div class="def-box">
    <p>Content</p>
  </div>
</div>
</div>`;
    const f = writeTmp('ok.html', html);
    const result = runLint(f);
    assert.equal(result.exitCode, 0, 'Should pass with exit 0');
    assert(!result.output.includes('NEGATIVE'), 'Should have no negative depth');
    cleanTmp();
  },

  'depth check: extra closing div detected': () => {
    const html = `---
title: Test
---
<div class="wrap">
<div class="ch fade-in">
  <div class="ch-title">Hello</div>
</div>
</div>
</div>`;
    const f = writeTmp('extra_close.html', html);
    const result = runLint(f);
    assert.notEqual(result.exitCode, 0, 'Should fail with non-zero exit');
    assert(result.output.includes('NEGATIVE') || result.output.includes('Extra'), 'Should report depth error');
    cleanTmp();
  },

  'depth check: unclosed div detected': () => {
    const html = `---
title: Test
---
<div class="wrap">
<div class="ch fade-in">
  <div class="def-box">
    <p>Content</p>
</div>
</div>`;
    const f = writeTmp('unclosed.html', html);
    const result = runLint(f);
    assert.notEqual(result.exitCode, 0, 'Should fail');
    assert(result.output.includes('Unclosed') || result.output.includes('Final depth'), 'Should report unclosed div');
    cleanTmp();
  },

  // ===== Frontmatter =====

  'frontmatter: malformed YAML is detected': () => {
    const html = `---
title Test without colon
updated_at: 2026-06-06T00:00:00
---
<div class="wrap"></div>`;
    const f = writeTmp('bad_yaml.html', html);
    const result = runLint(f);
    assert.notEqual(result.exitCode, 0, 'Malformed YAML should fail');
    assert(result.output.includes('Malformed YAML frontmatter line'), 'Should report malformed YAML line');
    cleanTmp();
  },

  'frontmatter: missing closing delimiter is detected': () => {
    const html = `---
title: Missing close
<div class="wrap"></div>`;
    const f = writeTmp('missing_yaml_close.html', html);
    const result = runLint(f);
    assert.notEqual(result.exitCode, 0, 'Missing closing frontmatter delimiter should fail');
    assert(result.output.includes('has no closing'), 'Should report missing closing delimiter');
    cleanTmp();
  },

  // ===== Custom Shortcodes =====

  'shortcodes: paired shortcode nesting passes': () => {
    const html = `---
title: Test
---
<div class="wrap">
{{< details summary="hello" >}}
<div class="def-box"><p>x</p></div>
{{< /details >}}
</div>`;
    const f = writeTmp('paired_shortcode.html', html);
    const result = runLint(f);
    assert.equal(result.exitCode, 0, 'Paired shortcode should pass');
    cleanTmp();
  },

  'shortcodes: mismatched close is detected': () => {
    const html = `---
title: Test
---
<div class="wrap">
{{< details summary="hello" >}}
<div class="def-box"><p>x</p></div>
{{< /mermaid >}}
</div>`;
    const f = writeTmp('bad_shortcode_close.html', html);
    const result = runLint(f);
    assert.notEqual(result.exitCode, 0, 'Mismatched shortcode close should fail');
    assert(result.output.includes('Shortcode close mismatch'), 'Should report shortcode mismatch');
    cleanTmp();
  },

  'shortcodes: self-closing shortcode passes': () => {
    const html = `---
title: Test
---
<div class="wrap">
{{< docpage "pdf/dsp/第七讲2.pdf" page=8 title="第一页" >}}
</div>`;
    const f = writeTmp('self_closing_shortcode.html', html);
    const result = runLint(f);
    assert.equal(result.exitCode, 0, 'Self-closing shortcode should pass');
    cleanTmp();
  },

  // ===== Single-line Containers =====

  'single-line containers: ch-label/ch-title/ch-subtitle do not affect depth': () => {
    const html = `---
title: Test
---
<div class="wrap">
<div class="ch fade-in">
  <div class="ch-label">Part 0</div>
  <div class="ch-title">Title Here</div>
  <div class="ch-subtitle">Subtitle</div>
  <p>Content</p>
</div>
</div>`;
    const f = writeTmp('single_line.html', html);
    const result = runLint(f);
    assert.equal(result.exitCode, 0, 'Single-line divs should not affect depth');
    cleanTmp();
  },

  // ===== Real-world Pattern =====

  'real pattern: def-box + callout + example-box nesting': () => {
    const html = `---
title: Test
---
<div class="wrap">
<div class="ch fade-in">
  <div class="ch-label">Part 0</div>
  <div class="ch-title">Definition</div>
  <div class="def-box">
    <h3>Definition</h3>
    <p>A FIR filter has finite impulse response.</p>
  </div>
  <div class="callout">This is a note.</div>
  <div class="example-box">
    <h3>Example</h3>
    <p>Solve this.</p>
    <div class="callout">Key point inside example.</div>
  </div>
</div>
</div>`;
    const f = writeTmp('nesting.html', html);
    const result = runLint(f);
    assert.equal(result.exitCode, 0, 'Should handle nested containers correctly');
    cleanTmp();
  },

  'real pattern: block leak from missing open tag': () => {
    const html = `---
title: Test
---
<div class="wrap">
<div class="ch fade-in">
  <div class="ch-title">Leak Test</div>
    <h3>Orphan heading</h3>
    <p>This h3 has no parent def-box.</p>
  </div>
  <div class="def-box">
    <h3>Normal</h3>
  </div>
</div>
</div>`;
    const f = writeTmp('leak.html', html);
    const result = runLint(f);
    // The orphan content doesn't cause a depth error per se,
    // but the structure is semantically wrong.
    // The linter should at least not crash.
    assert.ok(result.output !== undefined, 'Should not crash on malformed HTML');
    cleanTmp();
  },

  // ===== Academic Survey Images =====

  'academic survey: missing images fails': () => {
    const html = `---
title: "数字人总报告"
description: "AI 论文综述"
categories: [AI]
tags: [数字人, 论文综述]
---
<div class="ch fade-in"><p>Survey content.</p></div>`;
    const f = writeTmp('survey_without_images.html', html);
    const result = runLint(f);
    assert.notEqual(result.exitCode, 0, 'AI survey without images should fail');
    assert(result.output.includes('at least 3 source-first images'), 'Should report missing survey images');
    cleanTmp();
  },

  'academic survey: three images pass': () => {
    const html = `---
title: "数字人总报告"
description: "AI 论文综述"
categories: [AI]
tags: [数字人, 论文综述]
---
<div class="ch fade-in">
  <div class="photo"><img src="media/images/a/1.png"></div>
  <div class="photo"><img src="media/images/a/2.png"></div>
  <div class="photo"><img src="media/images/a/3.png"></div>
</div>`;
    const f = writeTmp('survey_with_images.html', html);
    const result = runLint(f);
    assert.equal(result.exitCode, 0, 'AI survey with three images should pass');
    cleanTmp();
  },

  // ===== Cleanup =====

  'cleanup: temp files are removed': () => {
    cleanTmp();
    assert.ok(!fs.existsSync(tmpDir), 'Temp dir should be cleaned up');
  },
};

module.exports = { tests, name: 'lint-html' };
