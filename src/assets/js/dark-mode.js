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
// TOC Sidebar Toggle & Scroll Tracking
(function() {
  var sidebar = document.getElementById('toc-sidebar');
  var toggleBtn = document.getElementById('toc-toggle-btn');
  if (!sidebar || !toggleBtn) return;

  // Toggle sidebar
  toggleBtn.addEventListener('click', function() {
    sidebar.classList.toggle('toc-expanded');
    sidebar.classList.toggle('toc-collapsed');
    localStorage.setItem('toc-collapsed', sidebar.classList.contains('toc-collapsed'));
  });

  // Restore state
  if (localStorage.getItem('toc-collapsed') === 'true') {
    sidebar.classList.remove('toc-expanded');
    sidebar.classList.add('toc-collapsed');
  }

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
  var headings = document.querySelectorAll('.wrap [id], .main-content [id]');
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
    });

    if (current) {
      var activeLink = document.querySelector('#toc-nav a[href="#' + current.id + '"]');
      if (activeLink) {
        activeLink.classList.add('active');
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
