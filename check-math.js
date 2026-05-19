const fs = require('fs');
const content = fs.readFileSync('./public/gvcc-zero-shot-video-compression.html', 'utf8');

const forms = ['mjx-container', 'mjx-math', 'mjx-', 'aria-label', 'data-mjx'];
forms.forEach(function(form) {
  const re = new RegExp(form, 'g');
  const count = (content.match(re) || []).length;
  if (count > 0) console.log(form + ':', count);
});

const mathContent = content.match(/class="math-inline">[^<]{0,50}/g);
console.log('\nFirst 5 math-inline content:');
if (mathContent) mathContent.slice(0,5).forEach(function(m) { console.log(' ', m); });

console.log('\nTotal math-inline spans:', (content.match(/class="math-inline"/g) || []).length);
console.log('MathJax script present:', content.includes('MathJax'));

// Check body scripts
const bodyStart = content.indexOf('<body');
const bodyContent = content.substring(bodyStart);
const mathScripts = (bodyContent.match(/<script[^>]*>/g) || []).length;
console.log('\nScript tags in body:', mathScripts);

// Check mjx classes
const mjxClass = content.match(/class="[^"]*mjx[^"]*"/g);
console.log('mjx classes:', mjxClass);