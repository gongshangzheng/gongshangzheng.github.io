// Responsive nav-brand sizing (collapses subtitle / TSZ mark on narrow viewports).
// Extracted from dark-mode.js as part of the runtime/* split.

// Responsive nav-brand sizing
(function() {
  var brand = document.getElementById('nav-brand');
  var brandSub = document.getElementById('brand-sub');
  var navInner = document.querySelector('.nav-inner');
  if (!brand || !brandSub || !navInner) return;

  function adjustBrand() {
    var navWidth = navInner.offsetWidth;
    // Calculate right-side buttons width
    var rightBtns = navInner.querySelector('.nav-right-btns');
    var rightWidth = rightBtns ? rightBtns.scrollWidth : 0;
    // Nav-links visible width (on desktop)
    var navLinks = document.getElementById('nav-links');
    var linksWidth = 0;
    if (navLinks && getComputedStyle(navLinks).display !== 'none') {
      linksWidth = navLinks.scrollWidth;
    }
    // Available space for brand = total - links - right buttons - gaps
    var gapSize = parseFloat(getComputedStyle(navInner).gap) || 0;
    var paddingH = parseFloat(getComputedStyle(navInner).paddingLeft) * 2 || 0;
    var available = navWidth - linksWidth - rightWidth - gapSize * 2 - paddingH;
    // Brand mark (TSZ) needs ~50px, brand-sub needs ~150px
    if (available < 50) {
      brand.style.display = 'none';
    } else if (available < 130) {
      brand.style.display = '';
      brandSub.style.display = 'none';
    } else {
      brand.style.display = '';
      brandSub.style.display = '';
    }
  }

  adjustBrand();
  window.addEventListener('resize', adjustBrand);
})();
