/**
 * Parser unit tests
 * Run with: node tests/run.js
 */

const assert = require('assert');
const { parseFrontmatter, parseListField, render } = require('../lib/parser');

const tests = {

  // ===== parseFrontmatter =====

  'parseFrontmatter: YAML basic': () => {
    const raw = `---\ntitle: Hello World\ndate: 2025-01-01\n---\n\nBody content here.`;
    const { data, content } = parseFrontmatter(raw);
    assert.equal(data.title, 'Hello World');
    assert.equal(data.date, '2025-01-01');
    assert.equal(content.trim(), 'Body content here.');
  },

  'parseFrontmatter: YAML with quotes stripped': () => {
    const raw = `---\ntitle: \"Hello World\"\nauthor: 'John Doe'\n---\n\nBody.`;
    const { data } = parseFrontmatter(raw);
    assert.equal(data.title, 'Hello World');
    assert.equal(data.author, 'John Doe');
  },

  'parseFrontmatter: YAML with array-like values (not parsed)': () => {
    const raw = `---\ntags: [AI, History]\ncategories: [AI]\n---\n\nBody.`;
    const { data } = parseFrontmatter(raw);
    assert.equal(data.tags, '[AI, History]');
    assert.equal(data.categories, '[AI]');
  },

  'parseFrontmatter: YAML with page_style block': () => {
    const raw = `---\ntitle: Test\npage_style: |\n  .hero { height: 55vh; }\n  .wrap { max-width: 800px; }\n---\n\nBody.`;
    const { data } = parseFrontmatter(raw);
    assert(data.page_style.includes('.hero'));
    assert(data.page_style.includes('55vh'));
  },

  'parseFrontmatter: YAML with comment keys stripped': () => {
    const raw = `---\ntitle: Test\n# comment: ignored\ndate: 2025-01-01\n---\n\nBody.`;
    const { data } = parseFrontmatter(raw);
    assert.equal(data.title, 'Test');
    assert.equal(data.date, '2025-01-01');
    assert(!('comment' in data));
  },

  'parseFrontmatter: TOML single-line basic': () => {
    const raw = `+++ title = \"Test Post\" date = 2025-01-01 tags = [AI, History] +++\n\nBody here.`;
    const { data, content } = parseFrontmatter(raw);
    assert.equal(data.title, 'Test Post');
    assert.equal(data.date, '2025-01-01');
    assert.equal(content.trim(), 'Body here.');
  },

  'parseFrontmatter: TOML single-line full example': () => {
    const raw = `+++ title = \"Error-Handling\" author = [\"xinyu\"] date = 2025-01-21T16:50:49+01:00 tags = [\"C\", \"lisp\"] categories = [\"technology\", \"buildYourOwnLisp\"] draft = false toc = true mathjax = false +++\n\nSome body.`;
    const { data } = parseFrontmatter(raw);
    assert.equal(data.title, 'Error-Handling');
    assert.equal(data.author, '["xinyu"]');
    assert.equal(data.date, '2025-01-21T16:50:49+01:00');
    assert.equal(data.tags, '["C", "lisp"]');
    assert.equal(data.draft, 'false');
    assert.equal(data.toc, 'true');
    assert.equal(data.mathjax, 'false');
  },

  'parseFrontmatter: TOML multi-line basic': () => {
    const raw = `+++\ntitle = \"Test\"\ndate = 2025-01-01\n+++\n\nBody.`;
    const { data, content } = parseFrontmatter(raw);
    assert.equal(data.title, 'Test');
    assert.equal(content.trim(), 'Body.');
  },

  'parseFrontmatter: TOML multi-line with quotes': () => {
    const raw = `+++\ntitle = \"Hello World\"\nauthor = 'John'\n+++\n\nBody.`;
    const { data } = parseFrontmatter(raw);
    assert.equal(data.title, 'Hello World');
    assert.equal(data.author, 'John');
  },

  'parseFrontmatter: no frontmatter returns empty data': () => {
    const raw = `Just some plain text with no frontmatter.`;
    const { data, content } = parseFrontmatter(raw);
    assert.deepEqual(data, {});
    assert.equal(content, raw);
  },

  'parseFrontmatter: empty frontmatter': () => {
    const raw = `+++\n+++\n\nBody.`;
    const { data, content } = parseFrontmatter(raw);
    assert.deepEqual(data, {});
    assert.equal(content.trim(), 'Body.');
  },

  // ===== parseListField =====

  'parseListField: YAML array string': () => {
    assert.deepEqual(parseListField('[AI, History, Tech]'), ['AI', 'History', 'Tech']);
  },

  'parseListField: comma-separated string': () => {
    assert.deepEqual(parseListField('AI, History, Tech'), ['AI', 'History', 'Tech']);
  },

  'parseListField: already array': () => {
    assert.deepEqual(parseListField(['AI', 'History']), ['AI', 'History']);
  },

  'parseListField: empty/null/undefined': () => {
    assert.deepEqual(parseListField(''), []);
    assert.deepEqual(parseListField(null), []);
    assert.deepEqual(parseListField(undefined), []);
  },

  'parseListField: with quotes in YAML array': () => {
    assert.deepEqual(parseListField('["C", "lisp"]'), ['C', 'lisp']);
    assert.deepEqual(parseListField('[C, lisp]'), ['C', 'lisp']);
  },

  // ===== render =====

  'render: simple variable substitution': () => {
    const tmpl = `<h1>{{title}}</h1><p>{{author}}</p>`;
    const out = render(tmpl, { title: 'Hello', author: 'World' });
    assert.equal(out, '<h1>Hello</h1><p>World</p>');
  },

  'render: array iteration (nav links)': () => {
    const tmpl = `<ul>{{#nav}}<li><a href="{{url}}">{{name}}</a></li>{{/nav}}</ul>`;
    const out = render(tmpl, {
      nav: [{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }]
    });
    assert(out.includes('<a href="/">Home</a>'));
    assert(out.includes('<a href="/about">About</a>'));
  },

  'render: missing variable stays as placeholder': () => {
    const tmpl = `<span>{{missing}}</span>`;
    const out = render(tmpl, {});
    assert.equal(out, '<span>{{missing}}</span>');
  },

  'render: nested variable in array item': () => {
    const tmpl = `{{#items}}{{title}} {{/items}}`;
    const out = render(tmpl, { items: [{ title: 'A' }, { title: 'B' }] });
    assert.equal(out, 'A B');
  },

  'render: preserves unknown template syntax': () => {
    const tmpl = `{{unknown}} and {{#tags}}{{/tags}}`;
    const out = render(tmpl, {});
    assert.equal(out, `{{unknown}} and {{#tags}}{{/tags}}`);
  },
};

module.exports = { tests, name: 'parser' };