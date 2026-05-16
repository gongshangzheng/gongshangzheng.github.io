// Frontmatter parser + Mustache-like template engine
// Supports YAML (---) and TOML (+++) delimiters
// TOML can be multi-line (own line) or single-line (+++ key = val +++)

function parseFrontmatter(content) {
  let m;

  // Single-line TOML: +++ key = val +++ key2 = val2 +++
  // Also handles empty frontmatter: +++ +++ (no content between delimiters)
  m = content.match(/^\+\+\+ ([\s\S]+?) \+\+\+($|\n)/);
  if (m) {
    const inner = m[1];
    const fm = {};
    const pairMatches = [...inner.matchAll(/([\w-]+)\s*=\s*("[^"]*"|'[^']*'|\S+)/g)];
    for (const match of pairMatches) {
      let key = match[1], val = match[2];
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      fm[key] = val;
    }
    const nl = content.indexOf('\n');
    return { data: fm, content: nl >= 0 ? content.substring(nl + 1) : '' };
  }

  // Multi-line TOML: +++ on own line
  m = content.match(/^\+\+\+\n([\s\S]*?)\n\+\+\+(\n|$)/);
  if (m) {
    const fm = {};
    const middle = m[1];
    const lines = middle.split('\n');
    for (const line of lines) {
      const eq = line.indexOf('=');
      if (eq === -1 || line.trim() === '') continue;
      let key = line.slice(0, eq).trim();
      if (key.startsWith('#')) continue;
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      fm[key] = val;
    }
    // Body starts after the closing +++ line (skip the newline too)
    const bodyIdx = content.indexOf('+++', content.indexOf('+++') + 3);
    const body = bodyIdx >= 0 ? content.substring(bodyIdx + 4) : '';
    return { data: fm, content: body };
  }

  // Empty multi-line TOML: +++ on adjacent lines (e.g. +++\n+++)
  m = content.match(/^\+\+\+\n\+\+\+\n([\s\S]*)$/);
  if (m) return { data: {}, content: m[1] };

  // YAML: ---
  m = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (m) return parseYamlBlock(m[1], m[2]);

  return { data: {}, content };
}

function parseTomlBlock(frontmatter, body) {
  const fm = {};
  const lines = frontmatter.split('\n');
  for (const line of lines) {
    const eq = line.indexOf('=');
    if (eq === -1 || line.trim() === '') continue;
    let key = line.slice(0, eq).trim();
    if (key.startsWith('#')) continue;
    let val = line.slice(eq + 1).trim();
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    fm[key] = val;
  }
  return { data: fm, content: body };
}

function parseYamlBlock(frontmatter, body) {
  const fm = {};
  const lines = frontmatter.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const ci = line.indexOf(':');
    if (ci === -1) { i++; continue; }
    let key = line.slice(0, ci).trim();
    if (key.startsWith('#')) key = key.slice(1);
    let val = line.slice(ci + 1).trim();
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
  return { data: fm, content: body };
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
