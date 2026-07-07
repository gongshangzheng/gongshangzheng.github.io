// Search dropdown panel (Ctrl/Cmd+K) backed by search-index.json.
// Extracted from dark-mode.js as part of the runtime/* split.

// Search dropdown — inline search for all pages
(function() {
  var toggleBtn = document.getElementById('search-toggle');
  var dropdown = document.getElementById('search-dropdown');
  var overlay = document.getElementById('search-overlay');
  var input = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  if (!toggleBtn || !dropdown || !overlay || !input || !results) return;

  var index = null;
  var indexLoading = false;
  var activeIdx = -1;
  var resultItems = [];

  function runSearch() {
    var q = input.value.trim().toLowerCase();
    if (!q) {
      results.innerHTML = '<div class="search-hint">输入关键词搜索文章</div>';
      resultItems = [];
      activeIdx = -1;
      return;
    }
    if (!index) {
      results.innerHTML = '<div class="search-hint">加载索引中…</div>';
      resultItems = [];
      activeIdx = -1;
      return;
    }
    var keywords = q.split(/\s+/);
    var matched = index.filter(function(post) {
      var text = (post.title + ' ' + post.description + ' ' + (post.tags || []).join(' ') + ' ' + (post.categoryPath || []).join(' ') + ' ' + (post.subcategory || '') + ' ' + (post.aliases || []).join(' ')).toLowerCase();
      return keywords.every(function(kw) { return text.indexOf(kw) >= 0; });
    });
    renderResults(matched);
  }

  function loadIndex() {
    if (index || indexLoading) return;
    indexLoading = true;
    fetch('/search-index.json').then(function(r) { return r.json(); }).then(function(data) {
      index = data;
      indexLoading = false;
      runSearch();
    }).catch(function() {
      indexLoading = false;
      results.innerHTML = '<div class="search-hint">索引加载失败，请刷新重试</div>';
    });
  }

  function fmtDate(val) {
    if (!val) return '';
    return val.substring(0, 10).replace(/-/g, '/');
  }

  function openSearch() {
    dropdown.classList.add('is-open');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    input.focus();
    if (!index && !indexLoading) loadIndex();
  }

  function closeSearch() {
    dropdown.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    input.value = '';
    activeIdx = -1;
    resultItems = [];
    results.innerHTML = '<div class="search-hint">输入关键词搜索文章</div>';
  }

  function renderResults(matched) {
    if (matched.length === 0) {
      results.innerHTML = '<div class="search-hint">没有找到匹配的文章</div>';
      resultItems = [];
      activeIdx = -1;
      return;
    }
    var html = '<div class="search-meta">' + matched.length + ' result' + (matched.length > 1 ? 's' : '') + '</div>';
    matched.forEach(function(p, i) {
      html += '<a class="search-result-item" href="./' + p.url + '" data-idx="' + i + '">';
      html += '<span class="result-date">' + fmtDate(p.created_at || p.date) + '</span>';
      html += '<span class="result-title">' + p.title + '</span>';
      html += '</a>';
    });
    results.innerHTML = html;
    resultItems = results.querySelectorAll('.search-result-item');
    activeIdx = -1;
  }

  function setActive(idx) {
    if (resultItems.length === 0) return;
    resultItems.forEach(function(el) { el.classList.remove('is-active'); });
    if (idx < 0) idx = resultItems.length - 1;
    if (idx >= resultItems.length) idx = 0;
    activeIdx = idx;
    resultItems[idx].classList.add('is-active');
    resultItems[idx].scrollIntoView({ block: 'nearest' });
  }

  toggleBtn.addEventListener('click', function() {
    if (dropdown.classList.contains('is-open')) {
      closeSearch();
    } else {
      openSearch();
    }
  });

  overlay.addEventListener('click', closeSearch);

  input.addEventListener('input', runSearch);

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeSearch();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(activeIdx + 1);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(activeIdx - 1);
      return;
    }
    if (e.key === 'Enter' && activeIdx >= 0 && resultItems[activeIdx]) {
      e.preventDefault();
      resultItems[activeIdx].click();
    }
  });

  // Global keyboard shortcut: Ctrl/Cmd + K to open search
  document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (dropdown.classList.contains('is-open')) {
        closeSearch();
      } else {
        openSearch();
      }
    }
  });

  // Close on result click
  results.addEventListener('click', function(e) {
    var item = e.target.closest('.search-result-item');
    if (item) closeSearch();
  });
})();
