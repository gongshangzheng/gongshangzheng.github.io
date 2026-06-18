// TOC sidebar: collapse, resize handle, vertical split, category browser, scroll-spy.
// Extracted from dark-mode.js as part of the runtime/* split.

// TOC Sidebar Toggle & Scroll Tracking
(function() {
  var sidebar = document.getElementById('toc-sidebar');
  var toggleBtn = document.getElementById('toc-toggle-btn');
  var floatTocBtn = document.getElementById('float-toc-btn');
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

  function expandSidebar() {
    sidebar.classList.remove('toc-collapsed');
    sidebar.classList.add('toc-expanded');
    var savedWidth = localStorage.getItem('toc-width');
    var w = savedWidth ? parseInt(savedWidth) : 250;
    setSidebarWidth(w);
    localStorage.setItem('toc-collapsed', 'false');
  }

  function collapseSidebar() {
    sidebar.classList.remove('toc-expanded');
    sidebar.classList.add('toc-collapsed');
    clearSidebarWidth();
    localStorage.setItem('toc-collapsed', 'true');
  }

  // Toggle sidebar
  function toggleSidebar() {
    var isCollapsed = sidebar.classList.contains('toc-collapsed');
    if (isCollapsed) expandSidebar();
    else collapseSidebar();
  }

  toggleBtn.addEventListener('click', toggleSidebar);
  if (floatTocBtn) floatTocBtn.addEventListener('click', function(e) {
    // On mobile (<768px), let the Mobile TOC Drawer IIFE handle it
    if (window.innerWidth < 768) return;
    e.stopImmediatePropagation();
    toggleSidebar();
  });

  // Restore state. Keep DOM classes and localStorage in sync: width alone can make
  // the sidebar look open while it still has .toc-collapsed, which breaks drag logic.
  var storedCollapsed = localStorage.getItem('toc-collapsed');
  if (storedCollapsed === 'true') {
    collapseSidebar();
  } else if (storedCollapsed === 'false') {
    expandSidebar();
  } else if (sidebar.classList.contains('toc-collapsed')) {
    collapseSidebar();
  } else {
    expandSidebar();
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

  // Vertical split between article TOC and Categories
  var tocSection = sidebar.querySelector('.toc-main-section');
  var categorySection = sidebar.querySelector('.categories-section');
  var splitHandle = sidebar.querySelector('.toc-split-handle');
  function setTocSplitRatio(ratio) {
    if (!tocSection || !categorySection || !splitHandle) return;
    ratio = Math.max(0.18, Math.min(0.82, ratio));
    var percent = ratio * 100;
    tocSection.style.flex = '0 0 calc(' + percent + '% - 4px)';
    categorySection.style.flex = '0 0 calc(' + (100 - percent) + '% - 4px)';
  }
  if (tocSection && categorySection && splitHandle) {
    var savedRatio = parseFloat(localStorage.getItem('toc-category-split-ratio'));
    if (!isNaN(savedRatio)) setTocSplitRatio(savedRatio);

    splitHandle.addEventListener('mousedown', function(e) {
      e.preventDefault();
      if (sidebar.classList.contains('toc-collapsed')) return;
      var sidebarRect = sidebar.getBoundingClientRect();
      var headerlessTop = sidebarRect.top;
      var usableHeight = sidebar.clientHeight - splitHandle.offsetHeight;
      var minPaneHeight = 120;
      splitHandle.classList.add('is-dragging');
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';

      function onMove(ev) {
        var y = ev.clientY - headerlessTop;
        var minRatio = Math.min(0.45, minPaneHeight / Math.max(usableHeight, 1));
        var maxRatio = 1 - minRatio;
        var ratio = y / Math.max(usableHeight, 1);
        ratio = Math.max(minRatio, Math.min(maxRatio, ratio));
        setTocSplitRatio(ratio);
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        splitHandle.classList.remove('is-dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        var tocRect = tocSection.getBoundingClientRect();
        var catRect = categorySection.getBoundingClientRect();
        var total = tocRect.height + catRect.height;
        if (total > 0) localStorage.setItem('toc-category-split-ratio', tocRect.height / total);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      onMove(e);
    });
  }

  function escapeHtmlText(text) {
    return String(text || '').replace(/[&<>"']/g, function(ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  function findCategoryNode(nodes, path) {
    var currentNodes = nodes || [];
    var currentNode = null;
    for (var i = 0; i < path.length; i++) {
      currentNode = currentNodes.find(function(node) { return node.type === 'folder' && node.text === path[i]; });
      if (!currentNode) return null;
      currentNodes = currentNode.children || [];
    }
    return currentNode;
  }

  // Collect the folder slug for each level along a category path.
  function collectCategorySlugs(tree, path) {
    var slugs = [];
    var currentNodes = tree || [];
    for (var i = 0; i < path.length; i++) {
      var node = currentNodes.find(function(n) { return n.type === 'folder' && n.text === path[i]; });
      if (!node) return slugs;
      slugs.push(node.slug || '');
      currentNodes = node.children || [];
    }
    return slugs;
  }

  // Render the breadcrumb as links to the category / subcategory index pages.
  // path[0] -> category index, path[1] -> subcategory index.
  function renderBreadcrumb(tree, path) {
    if (!path.length) return 'Categories';
    var slugs = collectCategorySlugs(tree, path);
    var categorySlug = slugs[0];
    return path.map(function(name, index) {
      var href;
      if (index === 0) {
        href = './categories/' + categorySlug + '/index.html';
      } else if (index === 1) {
        href = './categories/' + categorySlug + '/' + slugs[1] + '/index.html';
      }
      if (!href || !categorySlug || (index === 1 && !slugs[1])) {
        return escapeHtmlText(name);
      }
      return '<a class="category-breadcrumb-link" href="' + escapeHtmlText(href) + '">' + escapeHtmlText(name) + '</a>';
    }).join('<span class="category-breadcrumb-sep"> / </span>');
  }

  function renderCategoryBrowserList(nodes, path) {
    var html = '<ul>';
    (nodes || []).forEach(function(node) {
      var childPath = node.type === 'folder' ? path.concat(node.text) : path;
      var hasChildren = node.children && node.children.length > 0;
      var itemClass = node.type === 'post' ? 'category-file' : 'category-folder';
      if (hasChildren) itemClass += ' toc-parent toc-collapsed';
      html += '<li class="category-item ' + itemClass + '" data-path="' + escapeHtmlText(JSON.stringify(childPath)) + '">';
      if (hasChildren) {
        html += '<button class="toc-toggle category-expand-toggle" aria-label="展开/折叠"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></button>';
      } else {
        html += '<span class="toc-dot"></span>';
      }
      if (node.type === 'post') {
        html += '<a class="category-file-link' + (node.active ? ' active' : '') + '" href="' + escapeHtmlText(node.href) + '">' + escapeHtmlText(node.text) + '</a>';
      } else {
        html += '<button class="category-folder-label" type="button">' + escapeHtmlText(node.text) + '</button>';
      }
      if (hasChildren) {
        html += '<ul class="toc-children">' + renderCategoryBrowserList(node.children || [], childPath).replace(/^<ul>|<\/ul>$/g, '') + '</ul>';
      }
      html += '</li>';
    });
    html += '</ul>';
    return html;
  }

  function initCategoryBrowser() {
    var nav = document.getElementById('category-nav');
    if (!nav || !nav.classList.contains('category-browser')) return;
    var list = nav.querySelector('.category-browser-list');
    var backBtn = nav.querySelector('.category-back');
    var breadcrumb = nav.querySelector('.category-breadcrumb');
    if (!list || !backBtn || !breadcrumb) return;

    var tree = [];
    var currentPath = [];
    try { tree = JSON.parse(nav.getAttribute('data-tree') || '[]'); } catch (e) { tree = []; }
    try { currentPath = JSON.parse(nav.getAttribute('data-initial-path') || '[]'); } catch (e) { currentPath = []; }

    function render() {
      var currentNode = findCategoryNode(tree, currentPath);
      var nodes = currentNode ? (currentNode.children || []) : tree;
      list.innerHTML = renderCategoryBrowserList(nodes, currentPath);
      breadcrumb.innerHTML = renderBreadcrumb(tree, currentPath);
      backBtn.disabled = currentPath.length === 0;
    }

    backBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (currentPath.length === 0) return;
      currentPath = currentPath.slice(0, -1);
      render();
    });

    nav.addEventListener('click', function(e) {
      var folderLabel = e.target.closest('.category-folder-label');
      if (!folderLabel || !nav.contains(folderLabel)) return;
      e.preventDefault();
      e.stopPropagation();
      var li = folderLabel.closest('.category-folder');
      if (!li) return;
      try { currentPath = JSON.parse(li.getAttribute('data-path') || '[]'); } catch (err) { currentPath = []; }
      render();
    });

    render();
  }
  initCategoryBrowser();

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
  var headings = document.querySelectorAll('.wrap h2[id], .wrap h3[id], .wrap h4[id], .wrap h5[id], .wrap h6[id], .wrap div.ch-title[id], .main-content h2[id], .main-content h3[id], .main-content h4[id], .main-content h5[id], .main-content h6[id]');
  var tocLinks = document.querySelectorAll('#toc-nav a');
  if (headings.length === 0 || tocLinks.length === 0) return;

  var headingElements = Array.from(headings);

  function updateActiveToc() {
    var scrollPos = window.pageYOffset + 80;
    var current = null;

    // Use getBoundingClientRect for absolute document position.
    // offsetTop is unreliable when a heading's offsetParent is a deeply-nested
    // container (.ch) rather than the nearest scrollable ancestor (.wrap).
    for (var i = 0; i < headingElements.length; i++) {
      var el = headingElements[i];
      var absTop = el.getBoundingClientRect().top + window.pageYOffset;
      if (absTop <= scrollPos) {
        current = el;
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
        // Expand parent if this link is inside a collapsed .toc-children
        var parentChildren = activeLi.closest('.toc-children');
        if (parentChildren) {
          var parentLi = parentChildren.parentElement;
          if (parentLi) parentLi.classList.remove('toc-collapsed');
        }
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
