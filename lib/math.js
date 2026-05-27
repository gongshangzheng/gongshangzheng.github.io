/**
 * Math / LaTeX preprocessing for blog pages.
 *
 * Important invariant:
 * - Math delimiters in normal text are wrapped for MathJax.
 * - Math-like text inside raw HTML tags/attributes must be ignored.
 *
 * Example:
 *   <img alt="mapping $z=e^{sT}$">
 * must stay a valid <img> tag. If inline math is processed inside the
 * alt attribute, it injects a <span> inside the attribute and breaks HTML.
 */

function protectHtmlTags(html, callback) {
  const tags = [];
  const protectedHtml = String(html || '').replace(/<[^<>]*>/g, (tag) => {
    const token = `@@HTML_TAG_${tags.length}@@`;
    tags.push(tag);
    return token;
  });
  const processed = callback(protectedHtml);
  return processed.replace(/@@HTML_TAG_(\d+)@@/g, (_, i) => tags[Number(i)] || '');
}

function escapeMathText(latex) {
  return String(latex || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function transformLatex(bodyHtml) {
  const displayMath = [];
  const storeDisplay = (latex) => {
    const clean = latex.replace(/^\$+|\$+$/g, '').replace(/\$([^$]*)\$/g, '$1').trim();
    const token = `@@MATH_DISPLAY_${displayMath.length}@@`;
    // Escape < and > inside display math so the HTML parser doesn't treat
    // things like n<n_0 as tag openings. DOM text nodes decode &lt; back to <
    // so MathJax receives the original LaTeX unchanged.
    displayMath.push(`<div class="math-block">$$${escapeMathText(clean)}$$</div>`);
    return token;
  };

  let html = String(bodyHtml || '');

  // Protect display math first so the later inline-$ pass cannot consume
  // the two dollar signs of $$...$$ as a broken inline pair.
  html = html.replace(/\${2,}([\s\S]+?)\${2,}/g, (_, latex) => storeDisplay(latex));
  html = html.replace(/\\\[([\s\S]+?)\\\]/g, (_, latex) => storeDisplay(latex));

  // Inline math and citations must not be transformed inside HTML tags or
  // attributes. Protect tags while processing text nodes.
  html = protectHtmlTags(html, (text) => {
    // $@key$ citations: require @ inside, then math processes everything else.
    text = text.replace(/\$@([^$]+)\$/g, (_, key) => `<cite>@${key}</cite>`);

    // Inline math — keep delimiters so MathJax v3 can find them in the DOM.
    text = text.replace(/\$([^$\n]+?)\$/g, (_, latex) =>
      `<span class="math-inline">$${escapeMathText(latex)}$</span>`
    );
    text = text.replace(/\\\((.*?)\\\)/g, (_, latex) => `<span class="math-inline">\\(${latex}\\)</span>`);
    return text;
  });

  // Restore display math tokens. If a token sits inside a <p> tag (e.g.
  // <p style="text-align:center">@@MATH_DISPLAY_0@@</p>), the <div> would
  // break HTML spec (block inside <p>). So absorb the wrapping <p> too.
  html = html.replace(/<p([^>]*)>\s*@@MATH_DISPLAY_(\d+)@@\s*<\/p>/g, (_, attrs, i) => {
    const block = displayMath[Number(i)] || '';
    // Preserve text-align from the <p> if present
    const alignMatch = attrs.match(/text-align\s*:\s*([^;"]+)/);
    if (alignMatch) {
      return block.replace('class="math-block"', `class="math-block" style="text-align:${alignMatch[1]}"`);
    }
    return block;
  });
  html = html.replace(/@@MATH_DISPLAY_(\d+)@@/g, (_, i) => displayMath[Number(i)] || '');
  return html;
}

module.exports = {
  transformLatex,
  protectHtmlTags,
};
