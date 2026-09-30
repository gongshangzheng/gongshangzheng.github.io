/**
 * Code Tabs — lightweight multi-language tab switcher.
 * Finds all `.code-tabs` containers and wires up click handlers.
 *
 * Supports optional `collapsible` class:
 *   - Without collapsible: standard tabs (always one active panel)
 *   - With collapsible: clicking the active tab again collapses it (no panel shown)
 *     This is used for example-tabs where content is long and should be
 *     collapsed by default until the user explicitly expands it.
 */
(function () {
  document.querySelectorAll('.code-tabs').forEach(function (tabs) {
    var btns = tabs.querySelectorAll('.code-tab-btn');
    var panels = tabs.querySelectorAll('.code-tab-content');
    var isCollapsible = tabs.classList.contains('collapsible');

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-tab');
        var isActive = btn.classList.contains('active');

        // Deactivate all
        btns.forEach(function (b) { b.classList.remove('active'); });
        panels.forEach(function (p) { p.classList.remove('active'); });

        if (isCollapsible && isActive) {
          // Collapse: clicking the active tab closes it
          return;
        }

        // Activate clicked
        btn.classList.add('active');
        var panel = tabs.querySelector('[data-panel="' + target + '"]');
        if (panel) panel.classList.add('active');
      });
    });
  });
})();
