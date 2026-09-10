// Mobile TOC drawer populated from desktop #toc-nav.
// Extracted from dark-mode.js as part of the runtime/* split.

// Mobile TOC Drawer — uses #float-toc-btn
(function() {
  var btn = document.getElementById('float-toc-btn');
  var drawer = document.getElementById('mobile-toc-drawer');
  var overlay = document.getElementById('mobile-toc-overlay');
  var closeBtn = document.getElementById('mobile-toc-close');
  var mobileNav = document.getElementById('mobile-toc-nav');
  if (!btn || !drawer || !overlay || !mobileNav) return;

  // Populate mobile TOC from desktop TOC
  var desktopNav = document.getElementById('toc-nav');
  if (!desktopNav) { btn.style.display = 'none'; return; }

  // Preserve desktop TOC inline markup, including MathJax-rendered inline formulas
  var items = desktopNav.querySelectorAll('li');
  var list = document.createElement('ul');
  items.forEach(function(li) {
    var a = li.querySelector(':scope > a');
    if (!a) return;
    var level = a.getAttribute('data-level') || '2';
    var item = document.createElement('li');
    item.className = 'toc-h' + level;

    var link = document.createElement('a');
    link.setAttribute('href', a.getAttribute('href'));
    link.innerHTML = a.innerHTML;

    item.appendChild(link);
    list.appendChild(item);
  });
  mobileNav.innerHTML = '';
  mobileNav.appendChild(list);

  function openDrawer() {
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', function(e) {
    // Only open mobile drawer on small screens; desktop uses sidebar toggle
    if (window.innerWidth >= 768) return;
    openDrawer();
  });
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  // Close on link click & smooth scroll
  mobileNav.addEventListener('click', function(e) {
    if (e.target.tagName === 'A') {
      e.preventDefault();
      closeDrawer();
      var target = document.getElementById(e.target.getAttribute('href').slice(1));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();

