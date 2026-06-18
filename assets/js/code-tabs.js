/**
 * Code Tabs — lightweight multi-language tab switcher.
 * Finds all `.code-tabs` containers and wires up click handlers.
 */
(function () {
  document.querySelectorAll('.code-tabs').forEach(function (tabs) {
    var btns = tabs.querySelectorAll('.code-tab-btn');
    var panels = tabs.querySelectorAll('.code-tab-content');

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-tab');

        // Deactivate all
        btns.forEach(function (b) { b.classList.remove('active'); });
        panels.forEach(function (p) { p.classList.remove('active'); });

        // Activate clicked
        btn.classList.add('active');
        var panel = tabs.querySelector('[data-panel="' + target + '"]');
        if (panel) panel.classList.add('active');
      });
    });
  });
})();
