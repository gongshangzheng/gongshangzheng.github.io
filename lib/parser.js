// Frontmatter parser + Mustache-like template engine

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { data: {}, content };

  const fm = {};
  const lines = m[1].split('\n');
  let i = 0;
  while (i < lines.length) {
    const ci = lines[i].indexOf(':');
    if (ci === -1) { i++; continue; }
    let key = lines[i].slice(0, ci).trim();
    if (key.startsWith('#')) key = key.slice(1); // strip leading # for comment keys
    let val = lines[i].slice(ci + 1).trim();
    // Strip surrounding quotes (both " and ')
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (val === '|') {
      const block = [];
      i++;
      while (i < lines.length && (lines[i].startsWith('  ') || lines[i] === '')) {
        block.push(lines[i].replace(/^  /, ''));
        i++;
      }
      val = block.join('\n').trim();
    } else {
      i++;
    }
    fm[key] = val;
  }
  return { data: fm, content: m[2] };
}

function parseListField(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (val.startsWith('[')) {
    return val.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean);
  }
  return val.split(',').map(s => s.trim()).filter(Boolean);
}

function render(template, data) {
  template = template.replace(/\{\{#([\w]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, block) => {
    const arr = data[key];
    if (!Array.isArray(arr)) return arr ? block : '';
    return arr.map(item => {
      const d = item.link !== undefined ? { name: item.name, url: item.link } : item;
      return render(block, d);
    }).join('');
  });
  return template.replace(/\{\{([\w]+)\}\}/g, (_, key) => data[key] !== undefined ? data[key] : _);
}

module.exports = { parseFrontmatter, parseListField, render };
