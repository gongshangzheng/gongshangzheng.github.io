(function(){
  var D3_URL = 'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js';
  var FUNCTION_PLOT_URL = 'https://cdn.jsdelivr.net/npm/function-plot@1.25.3/dist/function-plot.js';

  function loadScript(src) {
    if (document.querySelector('script[data-plot-lib="' + src + '"]')) {
      return new Promise(function(resolve, reject) {
        var existing = document.querySelector('script[data-plot-lib="' + src + '"]');
        if (existing.getAttribute('data-loaded') === 'true') return resolve();
        existing.addEventListener('load', function(){ resolve(); }, { once: true });
        existing.addEventListener('error', reject, { once: true });
      });
    }
    return new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.setAttribute('data-plot-lib', src);
      s.onload = function(){ s.setAttribute('data-loaded', 'true'); resolve(); };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function ensureFunctionPlot() {
    if (window.functionPlot) return Promise.resolve(window.functionPlot);
    return loadScript(D3_URL).then(function(){ return loadScript(FUNCTION_PLOT_URL); }).then(function(){
      if (!window.functionPlot) throw new Error('function-plot failed to load');
      return window.functionPlot;
    });
  }

  function parseConfig(el) {
    try { return JSON.parse(el.getAttribute('data-functionplot-config') || '{}'); }
    catch (err) { return {}; }
  }

  function addImpulseOverlay(target, plot, impulses) {
    if (!impulses || !impulses.length || !window.d3) return;
    var svg = window.d3.select(target).select('svg');
    if (svg.empty() || !plot || !plot.meta || !plot.meta.xScale || !plot.meta.yScale) return;
    var xScale = plot.meta.xScale;
    var yScale = plot.meta.yScale;
    var layer = svg.append('g').attr('class', 'functionplot-impulses');
    impulses.forEach(function(item){
      var x = Number(item.x || 0);
      var h = Number(item.height || 1);
      var x1 = xScale(x);
      var y0 = yScale(0);
      var y1 = yScale(h);
      layer.append('line').attr('x1', x1).attr('x2', x1).attr('y1', y0).attr('y2', y1).attr('class', 'functionplot-impulse-line');
      layer.append('path').attr('d', 'M ' + (x1 - 5) + ' ' + (y1 + 8) + ' L ' + x1 + ' ' + y1 + ' L ' + (x1 + 5) + ' ' + (y1 + 8)).attr('class', 'functionplot-impulse-head');
      if (item.label) layer.append('text').attr('x', x1 + 8).attr('y', y1 - 8).attr('class', 'functionplot-impulse-label').text(item.label);
    });
  }

  function renderOne(el, functionPlot) {
    var target = el.querySelector('.functionplot-target');
    if (!target) return;
    var cfg = parseConfig(el);
    var impulses = Array.isArray(cfg.impulses) ? cfg.impulses : [];
    delete cfg.title;
    delete cfg.impulses;
    cfg.target = '#' + target.id;
    cfg.width = cfg.width || Math.min(760, Math.max(320, target.clientWidth || el.clientWidth || 640));
    cfg.height = cfg.height || 360;
    if (!cfg.grid) cfg.grid = true;
    if (!cfg.data || !cfg.data.length) return;
    try {
      target.innerHTML = '';
      var plot = functionPlot(cfg);
      addImpulseOverlay(target, plot, impulses);
      el.classList.add('is-rendered');
    } catch (err) {
      el.classList.add('has-error');
      target.innerHTML = '<div class="math-plot-error">函数图渲染失败：' + String(err.message || err) + '</div>';
      console.error(err);
    }
  }

  function boot() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-functionplot]'));
    if (!nodes.length) return;
    ensureFunctionPlot().then(function(functionPlot){ nodes.forEach(function(el){ renderOne(el, functionPlot); }); }).catch(function(err){
      console.error(err);
      nodes.forEach(function(el){
        var target = el.querySelector('.functionplot-target');
        if (target) target.innerHTML = '<div class="math-plot-error">function-plot 加载失败</div>';
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
