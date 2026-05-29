#!/usr/bin/env node
/**
 * Test runner — auto-discovers and runs all tests/*.test.js
 * Usage: node tests/run.js
 *        node tests/run.js --watch  (rerun on file change)
 *        node tests/run.js --docs   (generate docs/ from test output)
 */

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// ANSI colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

let docsOutput = [];
let testCount = 0;
let passCount = 0;
let failCount = 0;

// Parse args
const args = process.argv.slice(2);
const WATCH = args.includes('--watch');
const DOCS_MODE = args.includes('--docs');
const QUIET = args.includes('--quiet');

function log(msg, color = null) {
  if (DOCS_MODE && !QUIET) {
    docsOutput.push(msg);
  } else if (!QUIET) {
    console.log(color ? color + msg + RESET : msg);
  }
}

function section(name) {
  log(`\n${BOLD}━━ ${name} ━━${RESET}`);
}

function pass(name) {
  testCount++;
  passCount++;
  log(`  ${GREEN}✓${RESET} ${name}`);
}

function fail(name, err) {
  testCount++;
  failCount++;
  const short = err.message.split('\n')[0];
  log(`  ${RED}✗${RESET} ${name}`);
  log(`    ${RED}${short}${RESET}`);
}

function warn(name, msg) {
  log(`  ${YELLOW}⚠${RESET} ${name}: ${msg}`);
}

// Discover and load test files
const testFiles = fs.readdirSync(__dirname)
  .filter(f => f.endsWith('.test.js'))
  .sort();

function loadTestModule(file) {
  return require(path.join(__dirname, file));
}

if (testFiles.length === 0) {
  log(`${YELLOW}No test files found in tests/${RESET}`);
  process.exit(0);
}

// Run tests
section('Test Suite');
log(`${DIM}Discovered: ${testFiles.join(', ')}${RESET}\n`);

const startTime = Date.now();

for (const file of testFiles) {
  const mod = loadTestModule(file);
  const { tests = {}, name = file } = mod;
  log(`${BOLD}[${name}]${RESET} ${Object.keys(tests).length} tests`);

  for (const [testName, fn] of Object.entries(tests)) {
    try {
      fn();
      pass(testName);
    } catch (err) {
      fail(testName, err);
    }
  }
}

// Summary
const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
log(`\n${'─'.repeat(40)}`);
log(`${BOLD}Results:${RESET} ${testCount} total, ${GREEN}${passCount} passed${RESET}, ${failCount > 0 ? RED : GREEN}${failCount} failed${RESET} (${elapsed}s)`);

// Write docs output if requested
if (DOCS_MODE) {
  const docsDir = path.join(ROOT, 'docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  const docContent = `# Test Suite Results\n\n**Generated:** ${new Date().toISOString()}\n**Total:** ${testCount} tests | **Passed:** ${passCount} | **Failed:** ${failCount}\n\n---\n\n${docsOutput.join('\n')}\n`;

  fs.writeFileSync(path.join(docsDir, 'test-results.md'), docContent);
  log(`\n${GREEN}✓ Docs written to docs/test-results.md${RESET}`);
}

// Auto-generate docs from test names
const docsDir = path.join(ROOT, 'docs');
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

// Write test coverage manifest
const coverage = testFiles.map(f => {
  const mod = loadTestModule(f);
  const { tests = {}, name = f } = mod;
  return { file: f, name, count: Object.keys(tests).length };
});

const manifest = `# Test Coverage\n\n| Module | Tests |\n|--------|-------|\n${coverage.map(c => `| ${c.name} | ${c.count} |`).join('\n')}\n\n**Total:** ${coverage.reduce((a, c) => a + c.count, 0)} tests across ${coverage.length} modules.\n`;
fs.writeFileSync(path.join(docsDir, 'coverage.md'), manifest);

// Write docs for each module
const { parseFrontmatter } = require('../lib/parser');
const { processHeadings, buildTocSidebar } = require('../lib/toc');
const { processBody: applyReplacements, processShortcodes } = require('../lib/replace');

// docs/ARCHITECTURE.md
const archMd = `# Architecture\n\n## File Structure\n\n\`\`\`\ngongshangzheng.github.io/\n├── build.js              # Orchestrator: clean → copy → collect → build\n├── config.json           # Site meta, nav, base_url, recent count\n├── lib/\n│   ├── config.js       # CONFIG, RECENT_COUNT, PATHS (all paths relative to __dirname)\n│   ├── parser.js       # parseFrontmatter (YAML/TOML), parseListField, render (Mustache-like)\n│   ├── utils.js        # copyDir, writePublic\n│   ├── generator.js    # buildArticles, buildPostsPage, buildTaxonomyPages, buildSearch\n│   ├── toc.js          # processHeadings, buildTocHtml, buildTocSidebar\n│   └── replace.js      # processBody (wiki/arxiv/github links), processShortcodes\n├── src/\n│   ├── templates/\n│   │   ├── _base.html  # Base HTML: <base href>, Tailwind CDN, Prism.js, fonts, hugo-theme.css\n│   │   ├── _header.html\n│   │   └── _footer.html\n│   ├── assets/         # Static assets (copied verbatim to public/assets/)\n│   │   ├── css/\n│   │   └── js/dark-mode.js\n│   └── pages/          # Source files: .html (pre-rendered) and .md (markdown)\n└── public/             # Build output\n\`\`\`\n\n## Build Pipeline\n\n1. **Clean** — rm -rf public/, mkdir public/\n2. **Copy assets** — copyDir(src/assets, public/assets)\n3. **Collect posts** — scan src/pages, parse frontmatter, sort by date\n4. **Build pages**\n   - \`buildArticles()\` — each file → HTML page\n   - \`buildPostsPage()\` — all posts listing\n   - \`buildTaxonomyPages()\` — tags/ and categories/\n   - \`buildSearch()\` — search-index.json + search.html\n\n## Source File Types\n\n| Type | Extension | Processing |\n|------|-----------|------------|\n| Pre-rendered HTML | \`.html\` | Passthrough (no marked.parse) |\n| Markdown | \`.md\` | marked.parse → shortcodes → replacements |\n\n## Frontmatter Formats\n\n\`\`\`yaml\n---\ntitle: \"Hello World\"\ndate: 2025-01-01\ntags: [AI, History]\nmathjax: true\n---\n\`\`\`\n\n\`\`\`toml\n+++ title = \"Hello World\" date = 2025-01-01 tags = [AI, History] +++\n\`\`\`\n\nBoth YAML (---) and TOML (+++) are supported.\n\n## Template Syntax\n\n- \`{{variable}}\` — Mustache-style substitution\n- \`{{#array}}...{{/array}}\` — Array iteration\n- \`<!-- INJECT key -->\` — Build-time injection point\n- \`<!-- INCLUDE partial -->\` — Template partial include\n\n## Known Fixes (Regression Tests)\n\n| Bug | Root Cause | Fix |\n|-----|-----------|-----|\n| Page duplicated 3× on mathjax pages | \`replace('</head>', injectStr)\` matched \`</head>\` inside injectStr | Use \`</head>\\n\` as anchor |\n| Stat pages have 2× wrap div | \`extractFirstDiv\` left wrap in bodyAfterStats; buildArticles added another | Detect \`startsWithWrap\` and reuse existing wrap |\n`;
fs.writeFileSync(path.join(docsDir, 'ARCHITECTURE.md'), archMd);

// docs/FRONTMATTER.md
const frontMd = `# Frontmatter Reference\n\n## Supported Formats\n\n### YAML (---)\n\n\`\`\`yaml\n---\ntitle: \"Article Title\"\ndescription: \"SEO description\"\ndate: 2025-01-21\ntags: [AI, History]\ncategories: [Research]\ndraft: false\ntoc: true\nmathjax: true\npage_style: |\n  .hero { height: 55vh; }\nhero_title: \"Custom Hero\"\nhero_sub: \"Subtitle here\"\nhero_tagline: \"Additional context\"\naudio_src: \"./audio/bgm.mp3\"\n---\n\nContent body...\n\`\`\`\n\n### TOML (+++)\n\nSingle-line (all on one line):\n\n\`\`\`\n+++ title = \"Article Title\" date = 2025-01-01 tags = [AI, History] +++\n\`\`\`\n\nMulti-line (each key on own line):\n\n\`\`\`toml\n+++\ntitle = \"Article Title\"\ndate = 2025-01-01\ntags = [AI, History]\n+++\n\`\`\`\n\n## Fields\n\n| Field | Type | Description |\n|-------|------|-------------|\n| \`title\` | string | Page title |\n| \`description\` | string | Meta description for SEO |\n| \`date\` | string | Publication date (YYYY-MM-DD) |\n| \`tags\` | string (array-like) | Comma-separated or \`[a, b, c]\` format |\n| \`categories\` | string (array-like) | Same as tags |\n| \`draft\` | string (\`true\`/\`false\`) | Exclude from build (YAML only) |\n| \`toc\` | string (\`true\`/\`false\`) | Show table of contents |\n| \`mathjax\` | string (\`true\`/\`false\`) | Inject MathJax CDN |\n| \`page_style\` | string | Inline CSS for hero height etc. |\n| \`hero_title\` | string | Override title in hero section |\n| \`hero_sub\` | string | Hero subtitle |\n| \`hero_tagline\` | string | Hero tagline |\n| \`audio_src\` | string | Background music URL |\n\n## Arrays (tags, categories)\n\nTags and categories are stored as raw strings and parsed at render time via \`parseListField()\`:\n\n\`\`\`js\n// YAML: tags: [AI, History, Tech]  → parseListField → ['AI', 'History', 'Tech']\n// TOML: tags = [AI, History]       → parseListField → ['AI', 'History']\n// Raw:  tags: AI, History, Tech    → parseListField → ['AI', 'History', 'Tech']\n\`\`\`\n`;
fs.writeFileSync(path.join(docsDir, 'FRONTMATTER.md'), frontMd);

// docs/TESTING.md
const testMd = `# Testing Guide\n\n## Running Tests\n\n\`\`\`bash\nnode tests/run.js\n\`\`\`\n\n## Options\n\n\`\`\`bash\nnode tests/run.js --docs   # Generate docs/test-results.md\nnode tests/run.js --watch  # Rerun on file change (requires chokidar or fs.watch)\n\`\`\`\n\n## Writing Tests\n\nAdd a new test file at \`tests/<module>.test.js\`:\n\n\`\`\`js\nconst assert = require('assert');\nconst { myFunc } = require('../lib/mymodule');\n\nconst tests = {\n  'myFunc: basic case': () => {\n    assert.equal(myFunc('input'), 'expected');\n  },\n  'myFunc: edge case': () => {\n    assert.throws(() => myFunc(null), TypeError);\n  },\n};\n\nmodule.exports = { tests, name: 'mymodule' };\n\`\`\`\n\n## Test Categories\n\n| File | Tests |\n|------|-------|\n${coverage.map(c => `| ${c.name} | ${c.count} |`).join('\n')}\n\n## Coverage\n\n**Total:** ${coverage.reduce((a, c) => a + c.count, 0)} tests across ${coverage.length} modules.\n\nSee \`docs/coverage.md\` for per-module breakdown.\n`;
fs.writeFileSync(path.join(docsDir, 'TESTING.md'), testMd);

// docs/TESTRESULTS.md (regenerated each run)
const resultsMd = `# Test Results\n\n**Run:** ${new Date().toISOString()}\n\n## Summary\n\n| Metric | Value |\n|--------|-------|\n| Total | ${testCount} |\n| Passed | ${passCount} |\n| Failed | ${failCount} |\n| Duration | ${elapsed}s |\n\n## Per-Module Results\n\n`;
fs.writeFileSync(path.join(docsDir, 'TESTRESULTS.md'), resultsMd);

// Exit code
if (failCount > 0) {
  log(`\n${RED}${BOLD}FAIL — ${failCount} test(s) failed${RESET}\n`);
  process.exit(1);
} else {
  log(`\n${GREEN}${BOLD}ALL PASS — ${passCount} tests${RESET}\n`);
  process.exit(0);
}