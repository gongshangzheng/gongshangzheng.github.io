const crypto = require('crypto');

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, '&#39;');
}

function parseShortcodeAttrs(attrs) {
  const out = {};
  if (!attrs) return out;
  const re = /([\w-]+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/g;
  let m;
  while ((m = re.exec(attrs)) !== null) {
    let val = m[2];
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[m[1]] = val;
  }
  return out;
}

function stableId(prefix, input) {
  return prefix + '-' + crypto.createHash('sha1').update(input).digest('hex').slice(0, 10);
}

function parseRange(value, fallback) {
  if (!value) return fallback;
  const parts = String(value).split(',').map(x => Number(x.trim()));
  return parts.length === 2 && parts.every(Number.isFinite) ? parts : fallback;
}

function parseNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeFunctionPlotConfig(attrs, body) {
  let cfg = {};
  const raw = String(body || '').trim();
  if (raw) {
    try {
      cfg = JSON.parse(raw);
    } catch (err) {
      cfg = { data: [{ fn: raw }] };
    }
  }

  if (Array.isArray(cfg)) cfg = { data: cfg };
  if (!cfg || typeof cfg !== 'object') cfg = {};

  const xDomain = parseRange(attrs.x || attrs.xdomain, null);
  const yDomain = parseRange(attrs.y || attrs.ydomain, null);

  const out = Object.assign({}, cfg);
  out.title = attrs.title || cfg.title || '';
  out.width = parseNumber(attrs.width, cfg.width || null);
  out.height = parseNumber(attrs.height, cfg.height || 360);
  out.xAxis = Object.assign({}, cfg.xAxis || {});
  out.yAxis = Object.assign({}, cfg.yAxis || {});

  if (xDomain) out.xAxis.domain = xDomain;
  if (yDomain) out.yAxis.domain = yDomain;
  if (attrs.xlabel) out.xAxis.label = attrs.xlabel;
  if (attrs.ylabel) out.yAxis.label = attrs.ylabel;
  if (attrs.grid) out.grid = attrs.grid !== 'false';

  if (attrs.fn) {
    out.data = [{ fn: attrs.fn, graphType: attrs.graphType || attrs.graphtype || 'polyline' }];
  } else if (!Array.isArray(out.data)) {
    out.data = [];
  }

  if (attrs.derivative === 'true') out.derivative = true;
  return out;
}

function renderFunctionPlot(attrs, body, match) {
  const cfg = normalizeFunctionPlotConfig(attrs, body);
  const id = attrs.id || stableId('functionplot', match);
  const title = cfg.title || attrs.title || '函数图像';
  return [
    '<figure class="functionplot-card math-plot" data-functionplot data-functionplot-config=\'' + escapeAttr(JSON.stringify(cfg)) + '\'>',
    '  <div class="math-plot-head"><strong>' + escapeHtml(title) + '</strong><span>function-plot</span></div>',
    '  <div id="' + escapeAttr(id) + '" class="functionplot-target" style="min-height:' + escapeAttr(String(cfg.height || 360)) + 'px"></div>',
    '  <figcaption>' + escapeHtml(title) + '</figcaption>',
    '</figure>'
  ].join('\n');
}

function renderJsxGraph(attrs, body, match) {
  const id = attrs.id || stableId('jsxgraph', match);
  const title = attrs.title || '交互式数学演示';
  const height = parseNumber(attrs.height, 420);
  const cfg = {
    id,
    title,
    height,
    code: String(body || '').trim()
  };
  return [
    '<figure class="jsxgraph-card math-plot" data-jsxgraph data-jsxgraph-config=\'' + escapeAttr(JSON.stringify(cfg)) + '\'>',
    '  <div class="math-plot-head"><strong>' + escapeHtml(title) + '</strong><span>JSXGraph</span></div>',
    '  <div id="' + escapeAttr(id) + '" class="jxgbox jsxgraph-target" style="height:' + escapeAttr(String(height)) + 'px"></div>',
    '  <figcaption>' + escapeHtml(title) + '</figcaption>',
    '</figure>'
  ].join('\n');
}

function processPlotShortcodes(html) {
  let str = html;

  str = str.replace(/\{\{\<\s*functionplot\s*([^>]*)\>\}\}([\s\S]*?)\{\{\<\s*\/functionplot\s*\>\}\}/g, function(match, attrs, body) {
    return renderFunctionPlot(parseShortcodeAttrs(attrs), body, match);
  });

  str = str.replace(/\{\{\<\s*functionplot\s*([^>]*)\>\}\}/g, function(match, attrs) {
    return renderFunctionPlot(parseShortcodeAttrs(attrs), '', match);
  });

  str = str.replace(/\{\{\<\s*jsxgraph\s*([^>]*)\>\}\}([\s\S]*?)\{\{\<\s*\/jsxgraph\s*\>\}\}/g, function(match, attrs, body) {
    return renderJsxGraph(parseShortcodeAttrs(attrs), body, match);
  });

  return str;
}

module.exports = {
  processPlotShortcodes,
  parseShortcodeAttrs,
  normalizeFunctionPlotConfig,
};
