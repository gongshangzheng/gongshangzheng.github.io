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

function isImpulseType(attrs) {
  var type = String(attrs.type || attrs.signal || '').toLowerCase();
  return type === 'impulse' || type === 'unit-impulse' || type === 'delta';
}

function renderImpulseSvg(attrs, match) {
  var title = attrs.title || '单位冲激信号';
  var label = attrs.label || 'δ(t)';
  var xlabel = attrs.xlabel || 't';
  var at = parseNumber(attrs.at, 0);
  var h = parseNumber(attrs.heightValue || attrs.impulseHeight, 1);
  var id = attrs.id || stableId('impulse', match);

  var xRange = parseRange(attrs.x, [-3, 3]);
  var yRange = parseRange(attrs.y, [-0.2, Math.max(1.4, h + 0.3)]);

  var W = 640, H = 300;
  var mx = 45, my = 25;
  var pw = W - 2 * mx;
  var ph = H - 2 * my;

  function sx(v) { return mx + (v - xRange[0]) / (xRange[1] - xRange[0]) * pw; }
  function sy(v) { return my + ph - (v - yRange[0]) / (yRange[1] - yRange[0]) * ph; }

  var ox = sx(0), oy = sy(0);
  var ix = sx(at), iy = sy(h);

  var lines = [];
  lines.push('<figure class="functionplot-card math-plot" data-functionplot>');
  lines.push('  <div class="math-plot-head"><strong>' + escapeHtml(title) + '</strong><span>信号图</span></div>');
  lines.push('  <div id="' + escapeAttr(id) + '" class="impulse-svg-wrap" style="min-height:' + H + 'px">');
  lines.push('    <svg viewBox="0 0 ' + W + ' ' + H + '" class="impulse-svg" preserveAspectRatio="xMidYMid meet">');

  // x-axis
  lines.push('      <line x1="' + mx + '" y1="' + oy + '" x2="' + (W - mx) + '" y2="' + oy + '" class="imp-axis"/>');
  lines.push('      <polygon points="' + (W - mx - 7) + ' ' + (oy - 3.5) + ' ' + (W - mx) + ' ' + oy + ' ' + (W - mx - 7) + ' ' + (oy + 3.5) + '" class="imp-axis-head"/>');

  // y-axis stub
  lines.push('      <line x1="' + ox + '" y1="' + oy + '" x2="' + ox + '" y2="' + my + '" class="imp-axis"/>');

  // tick at y=1
  if (h === 1) {
    var y1 = sy(1);
    lines.push('      <line x1="' + (ox - 4) + '" y1="' + y1 + '" x2="' + (ox + 4) + '" y2="' + y1 + '" class="imp-tick"/>');
    lines.push('      <text x="' + (ox - 10) + '" y="' + (y1 + 4.5) + '" class="imp-tick-label" text-anchor="end">1</text>');
  }

  // tick at x=0
  lines.push('      <text x="' + ox + '" y="' + (oy + 16) + '" class="imp-tick-label" text-anchor="middle">' + (at === 0 ? '0' : at) + '</text>');

  // impulse shaft
  lines.push('      <line x1="' + ix + '" y1="' + oy + '" x2="' + ix + '" y2="' + (iy + 2) + '" class="imp-shaft"/>');

  // arrowhead
  lines.push('      <polygon points="' + (ix - 5) + ' ' + (iy + 9) + ' ' + ix + ' ' + iy + ' ' + (ix + 5) + ' ' + (iy + 9) + '" class="imp-arrow"/>');

  // hollow dot at base
  lines.push('      <circle cx="' + ix + '" cy="' + oy + '" r="3" class="imp-base-dot"/>');

  // label
  lines.push('      <text x="' + (ix + 10) + '" y="' + (iy + 4) + '" class="imp-label">' + escapeHtml(label) + '</text>');

  // axis label
  lines.push('      <text x="' + (W - mx + 6) + '" y="' + (oy + 4.5) + '" class="imp-axis-label">' + escapeHtml(xlabel) + '</text>');

  lines.push('    </svg>');
  lines.push('  </div>');
  lines.push('  <figcaption>' + escapeHtml(title) + '</figcaption>');
  lines.push('</figure>');

  return lines.join('\n');
}

function processPlotShortcodes(html) {
  let str = html;

  // 1. Open+close: body must not contain another {{< functionplot to prevent
  //    a self-closing tag from being paired with a distant close tag.
  str = str.replace(/\{\{<\s*functionplot\s*([^>]*)>\}\}((?:(?!\{\{<\s*\/?functionplot)[\s\S])*?)\{\{<\s*\/functionplot\s*>\}\}/g, function(match, attrsStr, body) {
    var a = parseShortcodeAttrs(attrsStr);
    if (isImpulseType(a)) return renderImpulseSvg(a, match);
    return renderFunctionPlot(a, body, match);
  });

  // 2. Self-closing: remaining {{< functionplot ... >}} (no body / no close tag)
  str = str.replace(/\{\{<\s*functionplot\s*([^>]*)>\}\}/g, function(match, attrsStr) {
    var a = parseShortcodeAttrs(attrsStr);
    if (isImpulseType(a)) return renderImpulseSvg(a, match);
    return renderFunctionPlot(a, '', match);
  });

  // 3. jsxgraph (always open+close)
  str = str.replace(/\{\{<\s*jsxgraph\s*([^>]*)>\}\}([\s\S]*?)\{\{<\s*\/jsxgraph\s*>\}\}/g, function(match, attrs, body) {
    return renderJsxGraph(parseShortcodeAttrs(attrs), body, match);
  });

  return str;
}

module.exports = {
  processPlotShortcodes,
  parseShortcodeAttrs,
  normalizeFunctionPlotConfig,
};
