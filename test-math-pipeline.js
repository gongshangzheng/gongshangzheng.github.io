// Test if the script tags survive the processing pipeline
const { processBody, processShortcodes } = require('./lib/replace');

// Simulate what happens in generator.js
const bodyHtml = '<p>Test $x_1 \\sim p_1$ math</p>';

console.log('Before processing:', JSON.stringify(bodyHtml));

// Step 1: LaTeX replacement (simulate)
const bodyHtml2 = bodyHtml.replace(
  /\$([^\$\n]+?)\$/g,
  function(_, latex) {
    return '<span class="math-inline"><script type="math/tex">' + latex + '</script></span>';
  }
);
console.log('After LaTeX replacement:', JSON.stringify(bodyHtml2));

// Step 2: processShortcodes
const bodyHtml3 = processShortcodes(bodyHtml2);
console.log('After shortcodes:', JSON.stringify(bodyHtml3));

// Step 3: applyReplacements
const bodyHtml4 = processBody(bodyHtml3, { imgDir: 'img', baseUrl: '/' });
console.log('After replacements:', JSON.stringify(bodyHtml4));

// Check if script tags are preserved
console.log('\nScript tags preserved:', bodyHtml4.includes('<script'));
console.log('math/tex preserved:', bodyHtml4.includes('type="math/tex"'));