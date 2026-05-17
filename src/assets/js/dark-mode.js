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

// Dark mode toggle — Hugo blog style
(function() {
  var html = document.documentElement;
  var toggleBtn = document.getElementById('theme-toggle');
  var themeIcon = document.getElementById('theme-icon');

  function updateIcon() {
    var isDark = html.classList.contains('dark');
    if (themeIcon) {
      themeIcon.textContent = isDark ? '☀️' : '🌙';
    }
  }

  function toggleTheme() {
    html.classList.toggle('dark');
    updateIcon();
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
  }

  function loadTheme() {
    var saved = localStorage.getItem('theme');
    if (saved === 'light') {
      html.classList.remove('dark');
    } else if (saved === 'dark') {
      html.classList.add('dark');
    }
    updateIcon();
  }

  // Load theme immediately
  loadTheme();

  // Bind toggle button
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }

  // Auto-detect system preference on first visit
  if (!localStorage.getItem('theme')) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      html.classList.remove('dark');
      updateIcon();
    }
  }

  // Hamburger menu toggle
  var hamburger = document.getElementById('nav-hamburger');
  var navLinks = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      navLinks.classList.toggle('is-open');
    });
    // Close on outside click
    document.addEventListener('click', function(e) {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('is-open');
      }
    });
    // Close on link click
    navLinks.addEventListener('click', function(e) {
      if (e.target.tagName === 'A') navLinks.classList.remove('is-open');
    });
  }

  // Back-to-top button
  var backBtn = document.getElementById('back-to-top');
  if (backBtn) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 400) {
        backBtn.classList.add('is-visible');
      } else {
        backBtn.classList.remove('is-visible');
      }
    });
    backBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Fade-in animation
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(function(el) { observer.observe(el); });
})();
// Music toggle
(function() {
  var toggleBtn = document.getElementById('music-toggle');
  var bgm = document.getElementById('bgm');
  if (!toggleBtn || !bgm) return;

  function updateState() {
    toggleBtn.classList.toggle('playing', !bgm.paused);
  }

  toggleBtn.addEventListener('click', function() {
    if (bgm.paused) {
      bgm.play();
    } else {
      bgm.pause();
    }
  });

  bgm.addEventListener('play', updateState);
  bgm.addEventListener('pause', updateState);
  updateState();
})();

// TOC Sidebar Toggle & Scroll Tracking
(function() {
  var sidebar = document.getElementById('toc-sidebar');
  var toggleBtn = document.getElementById('toc-toggle-btn');
  var mainWrapper = document.querySelector('.main-wrapper');
  if (!sidebar || !toggleBtn) return;

  function setSidebarWidth(w) {
    sidebar.style.minWidth = w + 'px';
    sidebar.style.maxWidth = w + 'px';
    sidebar.style.width = w + 'px';
    toggleBtn.style.left = w + 'px';
    mainWrapper.style.paddingLeft = w + 'px';
  }
  function clearSidebarWidth() {
    sidebar.style.minWidth = '';
    sidebar.style.maxWidth = '';
    sidebar.style.width = '';
    toggleBtn.style.left = '';
    mainWrapper.style.paddingLeft = '';
  }

  // Toggle sidebar
  toggleBtn.addEventListener('click', function() {
    var isCollapsed = sidebar.classList.contains('toc-collapsed');
    if (isCollapsed) {
      // Expanding — restore saved width or default
      sidebar.classList.remove('toc-collapsed');
      sidebar.classList.add('toc-expanded');
      var savedWidth = localStorage.getItem('toc-width');
      var w = savedWidth ? parseInt(savedWidth) : 250;
      setSidebarWidth(w);
    } else {
      // Collapsing
      sidebar.classList.remove('toc-expanded');
      sidebar.classList.add('toc-collapsed');
      clearSidebarWidth();
    }
    localStorage.setItem('toc-collapsed', sidebar.classList.contains('toc-collapsed'));
  });

  // Restore state
  if (localStorage.getItem('toc-collapsed') === 'true') {
    sidebar.classList.remove('toc-expanded');
    sidebar.classList.add('toc-collapsed');
    clearSidebarWidth();
  } else {
    var savedWidth = localStorage.getItem('toc-width');
    setSidebarWidth(savedWidth ? parseInt(savedWidth) : 250);
  }

  // Resize handle
  var resizeHandle = document.querySelector('.toc-resize-handle');
  if (resizeHandle) {
    resizeHandle.addEventListener('mousedown', function(e) {
      e.preventDefault();
      if (sidebar.classList.contains('toc-collapsed')) return;
      var startX = e.clientX;
      var startWidth = sidebar.offsetWidth;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      function onMove(e) {
        var newWidth = startWidth + (e.clientX - startX);
        newWidth = Math.max(180, Math.min(600, newWidth));
        setSidebarWidth(newWidth);
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        localStorage.setItem('toc-width', sidebar.offsetWidth);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  // TOC item collapse toggle (event delegation on sidebar)
  sidebar.addEventListener('click', function(e) {
    var toggleEl = e.target.closest('.toc-toggle');
    if (!toggleEl) return;
    var li = toggleEl.parentElement;
    if (li && li.classList.contains('toc-parent')) {
      li.classList.toggle('toc-collapsed');
    }
    e.stopPropagation();
  });

  // Smooth scroll for TOC links
  document.querySelectorAll('#toc-nav a').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var targetId = this.getAttribute('href').slice(1);
      var target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile nav if open
        var navLinks = document.getElementById('nav-links');
        if (navLinks) navLinks.classList.remove('is-open');
      }
    });
  });

  // Scroll tracking: highlight current section
  var headings = document.querySelectorAll('.wrap h2[id], .wrap h3[id], .wrap h4[id], .wrap h5[id], .wrap h6[id], .main-content h2[id], .main-content h3[id], .main-content h4[id], .main-content h5[id], .main-content h6[id]');
  var tocLinks = document.querySelectorAll('#toc-nav a');
  if (headings.length === 0 || tocLinks.length === 0) return;

  var headingElements = Array.from(headings);

  function updateActiveToc() {
    var scrollPos = window.pageYOffset + 100;
    var current = null;

    for (var i = 0; i < headingElements.length; i++) {
      if (headingElements[i].offsetTop <= scrollPos) {
        current = headingElements[i];
      }
    }

    tocLinks.forEach(function(link) {
      link.classList.remove('active');
      var li = link.parentElement;
      if (li) li.classList.remove('active');
    });

    if (current) {
      var activeLink = document.querySelector('#toc-nav a[href="#' + current.id + '"]');
      if (activeLink) {
        activeLink.classList.add('active');
        var activeLi = activeLink.parentElement;
        if (activeLi) activeLi.classList.add('active');
        // Scroll active link into view in TOC
        activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }

  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        updateActiveToc();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initial highlight
  updateActiveToc();
})();

// Mobile TOC Drawer
(function() {
  var btn = document.getElementById('nav-toc-btn');
  var drawer = document.getElementById('mobile-toc-drawer');
  var overlay = document.getElementById('mobile-toc-overlay');
  var closeBtn = document.getElementById('mobile-toc-close');
  var mobileNav = document.getElementById('mobile-toc-nav');
  if (!btn || !drawer || !overlay || !mobileNav) return;

  // Populate mobile TOC from desktop TOC
  var desktopNav = document.getElementById('toc-nav');
  if (!desktopNav) { btn.style.display = 'none'; return; }

  // Clone links with level from data-level attribute
  var items = desktopNav.querySelectorAll('li');
  var html = '<ul>';
  items.forEach(function(li) {
    var a = li.querySelector('a');
    if (!a) return;
    var level = a.getAttribute('data-level') || '2';
    html += '<li class="toc-h' + level + '"><a href="' + a.getAttribute('href') + '">' + a.textContent + '</a></li>';
  });
  html += '</ul>';
  mobileNav.innerHTML = html;

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

  btn.addEventListener('click', openDrawer);
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

// Trigger Prism.js code highlighting
if (window.Prism) Prism.highlightAll();
