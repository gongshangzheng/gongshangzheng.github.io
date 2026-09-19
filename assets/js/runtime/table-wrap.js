// Auto-wrap <table> in scrollable containers.
// Extracted from dark-mode.js as part of the runtime/* split.

// Auto-wrap tables in scrollable containers
(function() {
  document.querySelectorAll('.wrap table, .main-content table').forEach(function(tbl) {
    if (tbl.closest('.table-wrap')) return;

    var wrap = document.createElement('div');
    var scroll = document.createElement('div');
    wrap.className = 'table-wrap';
    scroll.className = 'table-scroll';

    tbl.parentNode.insertBefore(wrap, tbl);
    wrap.appendChild(scroll);
    scroll.appendChild(tbl);
  });
})();
