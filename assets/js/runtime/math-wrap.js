// Auto-wrap MathJax display formulas so wide expressions can scroll.
// Extracted from dark-mode.js as part of the runtime/* split.

// Auto-wrap MathJax formula containers so wide formulas can scroll horizontally
(function() {
  function markEl(el) {
    if (el.parentElement && el.parentElement.classList.contains('math-wrap')) return;
    var wrap = document.createElement('div');
    wrap.className = 'math-wrap';
    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(el);
  }

  function wrapFormulas() {
    // Only wrap block-level MathJax output (mjx-block).
    // Inline math (mjx-inline) stays in text flow and doesn't need wrapping.
    // Also skip mjx-container elements whose content is just a short variable/citation key
    // (contains no math operators: no +, -, =, ^, _, frac, sum, int, greek, etc.)
    document.querySelectorAll('mjx-block').forEach(function(el) {
      if (el.parentElement && el.parentElement.classList.contains('math-wrap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'math-wrap';
      el.parentNode.insertBefore(wrap, el);
      wrap.appendChild(el);
    });
    // Also catch display math containers that may not have mjx-block class
    document.querySelectorAll('mjx-container[display="block"]').forEach(function(el) {
      if (el.parentElement && el.parentElement.classList.contains('math-wrap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'math-wrap';
      el.parentNode.insertBefore(wrap, el);
      wrap.appendChild(el);
    });
  }

  function tryWrap() {
    wrapFormulas();
    if (document.querySelectorAll('mjx-container:not(.math-wrap *)').length > 0) {
      setTimeout(tryWrap, 300);
    }
  }

  if (document.readyState === 'complete') {
    setTimeout(tryWrap, 800);
  } else {
    window.addEventListener('load', function() { setTimeout(tryWrap, 800); });
  }
})();
