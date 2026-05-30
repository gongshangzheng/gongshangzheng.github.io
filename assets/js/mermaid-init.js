/* Mermaid init — dual-render approach.
   Use mermaid.render() per diagram to control theme. */

(function () {
  var VARS = {
    light: { primaryColor: '#f0ece6', primaryTextColor: '#2c2418',
             primaryBorderColor: '#d4ccc0', lineColor: '#8b7355',
             secondaryColor: '#e8ddd0', tertiaryColor: '#f5e6c0',
             fontFamily: 'system-ui, sans-serif' },
    dark:  { primaryColor: '#2e2820', primaryTextColor: '#d8cfc2',
             primaryBorderColor: '#3d362c', lineColor: '#8b7355',
             secondaryColor: '#352e25', tertiaryColor: '#3d3020',
             fontFamily: 'system-ui, sans-serif' }
  };

  function cleanSvg(svg) {
    svg.querySelectorAll('g.label, rect.label-container').forEach(function (el) {
      el.removeAttribute('style');
    });
    svg.querySelectorAll('foreignObject div').forEach(function (d) {
      var s = d.getAttribute('style');
      if (!s || s.indexOf('!important') === -1) return;
      s = s.replace(/color:\s*rgb\([^)]+\)\s*!important;?/g, '');
      s = s.replace(/background:\s*[^;]+!important;?/g, '');
      s = s.replace(/;\s*;/g, ';').replace(/^\s*;|;\s*$/g, '').trim();
      if (s) d.setAttribute('style', s);
      else d.removeAttribute('style');
    });
  }

  async function initMermaid() {
    var pres = document.querySelectorAll('pre.mermaid');
    if (!pres.length) return;

    mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });

    /* Save sources */
    var sources = [];
    pres.forEach(function (pre) { sources.push(pre.textContent); });

    /* Render light + dark for each diagram */
    for (var i = 0; i < pres.length; i++) {
      var src = sources[i];
      if (!src.trim()) continue;

      /* Light */
      mermaid.initialize({ startOnLoad: false, securityLevel: 'loose',
        theme: 'base', themeVariables: VARS.light });
      var c1 = document.createElement('div');
      c1.style.cssText = 'position:absolute;left:-9999px';
      document.body.appendChild(c1);
      var r1 = await mermaid.render('mml-' + i, src, c1);
      document.body.removeChild(c1);
      var lightSvg = document.createElement('div');
      lightSvg.innerHTML = r1.svg;
      cleanSvg(lightSvg.firstElementChild);

      /* Dark */
      mermaid.initialize({ startOnLoad: false, securityLevel: 'loose',
        theme: 'base', themeVariables: VARS.dark });
      var c2 = document.createElement('div');
      c2.style.cssText = 'position:absolute;left:-9999px';
      document.body.appendChild(c2);
      var r2 = await mermaid.render('mmd-' + i, src, c2);
      document.body.removeChild(c2);
      var darkSvg = document.createElement('div');
      darkSvg.innerHTML = r2.svg;
      cleanSvg(darkSvg.firstElementChild);

      /* Build dual container */
      var wrap = document.createElement('div');
      wrap.className = 'mermaid-dual';

      var lightDiv = document.createElement('div');
      lightDiv.className = 'mermaid-d';
      lightDiv.appendChild(lightSvg.firstElementChild);

      var darkDiv = document.createElement('div');
      darkDiv.className = 'mermaid-d mermaid-d--dark';
      darkDiv.appendChild(darkSvg.firstElementChild);

      wrap.appendChild(lightDiv);
      wrap.appendChild(darkDiv);
      pres[i].replaceWith(wrap);
    }
  }

  initMermaid();
})();
