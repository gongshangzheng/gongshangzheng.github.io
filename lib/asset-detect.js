/**
 * Shared content detectors used to decide which heavy third-party scripts a page
 * actually needs. Both the build (lib/generators/articles.js) and the delivery
 * budget check (scripts/check-perf-budget.js) use these, so a page can never be
 * shipped with a script the checker considers unnecessary.
 */

function stripHeadAndScripts(html) {
  return String(html)
    .replace(/<head>[\s\S]*?<\/head>/i, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
}

/** True when the page has at least one syntax-highlighted code block. */
function hasCodeBlock(html) {
  return /<pre[^>]*>\s*<code[^>]*(?:class="[^"]*language-|language-)/i.test(String(html));
}

/**
 * True when the page body contains math markup the MathJax pass would typeset.
 * Covers $$…$$, $…$, \(…\) and \[…\].
 */
function hasMathMarkup(html) {
  const body = stripHeadAndScripts(html);
  if (/\$\$[\s\S]{1,4000}?\$\$/.test(body)) return true;
  if (/\\\([\s\S]{1,2000}?\\\)/.test(body)) return true;
  if (/\\\[[\s\S]{1,4000}?\\\]/.test(body)) return true;
  return /\$[^$\s][^$\n]{0,300}?\$/.test(body);
}

module.exports = { hasCodeBlock, hasMathMarkup, stripHeadAndScripts };
