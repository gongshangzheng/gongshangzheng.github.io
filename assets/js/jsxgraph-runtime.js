(function(){
  var JSXGRAPH_CSS_URL = 'https://cdn.jsdelivr.net/npm/jsxgraph@1.9.2/distrib/jsxgraph.css';
  var JSXGRAPH_JS_URL = 'https://cdn.jsdelivr.net/npm/jsxgraph@1.9.2/distrib/jsxgraphcore.js';

  function loadCss(href) {
    if (document.querySelector('link[data-plot-lib="' + href + '"]')) return Promise.resolve();
    return new Promise(function(resolve, reject) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href;
      l.setAttribute('data-plot-lib', href);
      l.onload = resolve;
      l.onerror = reject;
      document.head.appendChild(l);
    });
  }

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

  function ensureJsxGraph() {
    if (window.JXG) return Promise.resolve(window.JXG);
    return loadCss(JSXGRAPH_CSS_URL).then(function(){ return loadScript(JSXGRAPH_JS_URL); }).then(function(){
      if (!window.JXG) throw new Error('JSXGraph failed to load');
      return window.JXG;
    });
  }

  function parseConfig(el) {
    try { return JSON.parse(el.getAttribute('data-jsxgraph-config') || '{}'); }
    catch (err) { return {}; }
  }

  function renderOne(el, JXG) {
    var target = el.querySelector('.jsxgraph-target');
    if (!target) return;
    var cfg = parseConfig(el);
    var code = cfg.code || '';
    if (!code) return;
    try {
      var runner = new Function('el', 'JXG', 'figure', code + '\n//# sourceURL=jsxgraph-shortcode-' + (cfg.id || target.id) + '.js');
      runner(target, JXG, el);
      el.classList.add('is-rendered');
    } catch (err) {
      el.classList.add('has-error');
      target.innerHTML = '<div class="math-plot-error">JSXGraph 渲染失败：' + String(err.message || err) + '</div>';
      console.error(err);
    }
  }

  function boot() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-jsxgraph]'));
    if (!nodes.length) return;
    ensureJsxGraph().then(function(JXG){ nodes.forEach(function(el){ renderOne(el, JXG); }); }).catch(function(err){
      console.error(err);
      nodes.forEach(function(el){
        var target = el.querySelector('.jsxgraph-target');
        if (target) target.innerHTML = '<div class="math-plot-error">JSXGraph 加载失败</div>';
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
