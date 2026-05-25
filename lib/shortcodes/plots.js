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

function normalizeMathFn(expr) {
  return String(expr || '')
    .replace(/\bpi\b/g, 'PI')
    .replace(/\be\b/g, 'E')
    .replace(/\^/g, '**');
}

function buildPresetConfig(type, attrs) {
  type = String(type || '').toLowerCase();
  const preset = {
    title: attrs.title || '',
    height: parseNumber(attrs.height, 360),
    data: []
  };
  if (type === 'step' || type === 'unit-step' || type === 'u') {
    preset.title = preset.title || '单位阶跃信号 u(t)';
    preset.xAxis = { domain: parseRange(attrs.x || attrs.xdomain, [-3, 3]), label: attrs.xlabel || 't' };
    preset.yAxis = { domain: parseRange(attrs.y || attrs.ydomain, [-0.3, 1.3]), label: attrs.ylabel || 'u(t)' };
    preset.data = [{ fn: 'x < 0 ? 0 : 1', graphType: attrs.graphType || attrs.graphtype || 'polyline', sampler: 'builtIn', nSamples: parseNumber(attrs.samples, 512) }];
  } else if (type === 'sgn' || type === 'sign') {
    preset.title = preset.title || '符号函数 sgn(t)';
    preset.xAxis = { domain: parseRange(attrs.x || attrs.xdomain, [-3, 3]), label: attrs.xlabel || 't' };
    preset.yAxis = { domain: parseRange(attrs.y || attrs.ydomain, [-1.4, 1.4]), label: attrs.ylabel || 'sgn(t)' };
    preset.data = [{ fn: 'x < 0 ? -1 : 1', graphType: attrs.graphType || attrs.graphtype || 'polyline', sampler: 'builtIn', nSamples: parseNumber(attrs.samples, 512) }];
  } else if (type === 'impulse' || type === 'unit-impulse' || type === 'delta') {
    preset.title = preset.title || '单位冲激信号 δ(t)';
    preset.xAxis = { domain: parseRange(attrs.x || attrs.xdomain, [-3, 3]), label: attrs.xlabel || 't' };
    preset.yAxis = { domain: parseRange(attrs.y || attrs.ydomain, [-0.2, 1.4]), label: attrs.ylabel || 'δ(t)' };
    preset.data = [{ fn: '0', graphType: 'polyline', skipTip: true }];
    preset.impulses = [{ x: parseNumber(attrs.at, 0), height: parseNumber(attrs.heightValue || attrs.impulseHeight, 1), label: attrs.label || 'δ(t)' }];
  } else if (type === 'sinc') {
    preset.title = preset.title || '归一化抽样函数 sinc(t)';
    preset.xAxis = { domain: parseRange(attrs.x || attrs.xdomain, [-8, 8]), label: attrs.xlabel || 't' };
    preset.yAxis = { domain: parseRange(attrs.y || attrs.ydomain, [-0.35, 1.1]), label: attrs.ylabel || 'sinc(t)' };
    preset.data = [{ fn: 'sin(PI*x)/(PI*x)', graphType: attrs.graphType || attrs.graphtype || 'polyline', sampler: 'builtIn', nSamples: parseNumber(attrs.samples, 512) }];
  }
  return preset.data.length ? preset : null;
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

  const preset = buildPresetConfig(attrs.type || attrs.signal, attrs);
  if (preset) cfg = Object.assign({}, preset, cfg);

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
    out.data = [{ fn: normalizeMathFn(attrs.fn), graphType: attrs.graphType || attrs.graphtype || 'polyline', sampler: attrs.sampler || 'builtIn', nSamples: parseNumber(attrs.samples, undefined) }];
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

  // IMPORTANT: self-closing shortcodes must be matched FIRST.
  // Otherwise the open+close regex greedily pairs the first {{< functionplot ... >}}
  // with a distant {{< /functionplot >}}, swallowing everything in between.

  // 1. Self-closing: {{< functionplot ... >}} (no body)
  str = str.replace(/\{\{\<\s*functionplot\s*([^>]*)\>\}\}/g, function(match, attrs) {
    return renderFunctionPlot(parseShortcodeAttrs(attrs), '', match);
  });

  // 2. Open+close: {{< functionplot ... >}}body{{< /functionplot >}}
  str = str.replace(/\{\{\<\s*functionplot\s*([^>]*)\>\}\}([\s\S]*?)\{\{\<\s*\/functionplot\s*\>\}\}/g, function(match, attrs, body) {
    return renderFunctionPlot(parseShortcodeAttrs(attrs), body, match);
  });

  // 3. jsxgraph (always open+close)
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
