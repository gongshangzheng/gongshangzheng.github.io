/**
 * Post-list renderers used by article body shortcodes, posts/index.html,
 * and category/tag/subcategory pages.
 *
 * - renderPostList: server-rendered static <ul>
 * - renderSortableList: client-side sortable + paginated list with inline script
 */

const { formatDateTime } = require('./meta');

const SORTABLE_LIST_CSS = `<style>
  .sortable-list { margin-bottom: 2rem; }
  .sortable-list .sort-controls {
    display: flex; align-items: center; gap: 0.5rem;
    margin-bottom: 1.5rem; flex-wrap: wrap;
  }
  .sortable-list .sort-controls .label { font-size: 0.85rem; color: var(--text-muted); }
  .sortable-list .sort-btn {
    background: none; border: 1px solid var(--border); border-radius: 4px;
    padding: 4px 10px; font-size: 0.8rem; color: var(--text-muted); cursor: pointer;
    transition: all 0.2s;
  }
  .sortable-list .sort-btn:hover { border-color: var(--accent); color: var(--accent); }
  .sortable-list .sort-btn.active { background: var(--accent); color: var(--bg-body); border-color: var(--accent); }
  .sortable-list .post-count { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem; }
  .sortable-list .pagination {
    display: flex; align-items: center; justify-content: center;
    gap: 0.5rem; margin-top: 2rem; flex-wrap: wrap;
  }
  .sortable-list .page-btn {
    background: none; border: 1px solid var(--border); border-radius: 4px;
    padding: 6px 12px; font-size: 0.85rem; color: var(--text-muted); cursor: pointer;
    transition: all 0.2s;
  }
  .sortable-list .page-btn:hover { border-color: var(--accent); color: var(--accent); }
  .sortable-list .page-btn.active { background: var(--accent); color: var(--bg-body); border-color: var(--accent); }
  .sortable-list .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .sortable-list .page-info { font-size: 0.8rem; color: var(--text-muted); margin: 0 0.5rem; }
</style>`;

let sortableListCounter = 0;

/**
 * Render a sortable + paginated post list with an inline runtime script.
 * @param {Array} posts - post objects {title, slug, created_at, updated_at}
 * @param {Object} opts
 * @param {string} [opts.linkPrefix='../'] - relative URL prefix
 * @param {string} [opts.id] - container element id (auto-generated if omitted)
 * @returns {string} HTML string (CSS + container + inline script)
 */
function renderSortableList(posts, opts) {
  var linkPrefix = (opts && opts.linkPrefix) || '../';
  var id = (opts && opts.id) || 'sortable-' + (++sortableListCounter);
  var hasSubId = posts.some(function (p) { return typeof p.sub_id === 'number'; });
  // Only default to series order (sub_id) when the caller explicitly asks for it
  // (i.e. subcategory pages). Other listings (all posts, tags, in-article shortcodes)
  // keep created_at desc as the default even if some posts carry sub_id.
  var seriesDefault = hasSubId && opts && opts.defaultSort === 'sub_id';
  var data = JSON.stringify(posts.map(function (p) {
    return {
      title: p.title,
      slug: p.slug,
      created_at: p.created_at,
      updated_at: p.updated_at,
      sub_id: typeof p.sub_id === 'number' ? p.sub_id : null,
    };
  }));
  var defaultField = seriesDefault ? 'sub_id' : 'created_at';
  var defaultDir = seriesDefault ? 'asc' : 'desc';
  // The series-order button is offered whenever any post has sub_id, so users can
  // switch to it manually; it is only pre-activated when seriesDefault is true.
  var seriesBtn = hasSubId
    ? '\n    <button class="sort-btn' + (seriesDefault ? ' active' : '') + '" data-field="sub_id" data-dir="asc" data-label="系列顺序">系列顺序 ↑</button>'
    : '';
  var createdActive = seriesDefault ? '' : ' active';
  return `${SORTABLE_LIST_CSS}<div class="sortable-list" id="${id}">
  <div class="sort-controls">
    <span class="label">排序：</span>${seriesBtn}
    <button class="sort-btn${createdActive}" data-field="created_at" data-dir="desc" data-label="创建时间">创建时间 ↓</button>
    <button class="sort-btn" data-field="updated_at" data-dir="desc" data-label="更新时间">更新时间 ↓</button>
    <button class="sort-btn" data-field="title" data-dir="asc" data-label="标题">标题 ↑</button>
  </div>
  <div class="post-count"></div>
  <div class="post-list-container"></div>
  <div class="pagination"></div>
</div>
<script>(function(){
  var container = document.getElementById('${id}');
  if (!container) return;
  var posts = ${data};
  var PAGE_SIZE = 20;
  var currentField = ${JSON.stringify(defaultField)};
  var currentDir = ${JSON.stringify(defaultDir)};
  var currentPage = 1;
  var prefix = ${JSON.stringify(linkPrefix)};
  function sortPosts(arr, field, dir) {
    var s = arr.slice();
    s.sort(function(a, b) {
      if (field === 'sub_id') {
        var na = typeof a.sub_id === 'number' ? a.sub_id : Infinity;
        var nb = typeof b.sub_id === 'number' ? b.sub_id : Infinity;
        if (na !== nb) return dir === 'asc' ? na - nb : nb - na;
        return (b.created_at || '').localeCompare(a.created_at || '');
      }
      var va = a[field], vb = b[field];
      if (va == null) va = ''; if (vb == null) vb = '';
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return (b.created_at || '').localeCompare(a.created_at || '');
    });
    return s;
  }
  function renderPage(sorted) {
    var total = sorted.length;
    var totalPages = Math.ceil(total / PAGE_SIZE);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    var start = (currentPage - 1) * PAGE_SIZE;
    var page = sorted.slice(start, start + PAGE_SIZE);
    container.querySelector('.post-count').textContent = total + ' 篇文章';
    var html = '<ul class="post-list">';
    page.forEach(function(p) {
      var d = (p.created_at || '').substring(0, 10);
      html += '<li><span class="date">' + d + '</span><a href="' + prefix + p.slug + '.html">' + p.title + '</a></li>';
    });
    html += '</ul>';
    container.querySelector('.post-list-container').innerHTML = html;
    var phtml = '<button class="page-btn" ' + (currentPage <= 1 ? 'disabled' : '') + ' data-page="' + (currentPage - 1) + '">← Prev</button>';
    phtml += '<span class="page-info">' + currentPage + ' / ' + totalPages + '</span>';
    phtml += '<button class="page-btn" ' + (currentPage >= totalPages ? 'disabled' : '') + ' data-page="' + (currentPage + 1) + '">Next →</button>';
    container.querySelector('.pagination').innerHTML = phtml;
    container.querySelectorAll('.page-btn[data-page]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        currentPage = parseInt(btn.dataset.page);
        renderPage(sortPosts(posts, currentField, currentDir));
        window.scrollTo(0, 0);
      });
    });
  }
  renderPage(sortPosts(posts, currentField, currentDir));
  container.querySelectorAll('.sort-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (currentField === btn.dataset.field) currentDir = currentDir === 'asc' ? 'desc' : 'asc';
      else { currentField = btn.dataset.field; currentDir = btn.dataset.dir; }
      currentPage = 1;
      container.querySelectorAll('.sort-btn').forEach(function(b) {
        b.classList.remove('active');
        b.textContent = b.dataset.label + (b.dataset.dir === 'asc' ? ' ↑' : ' ↓');
      });
      btn.classList.add('active');
      btn.textContent = btn.dataset.label + (currentDir === 'asc' ? ' ↑' : ' ↓');
      renderPage(sortPosts(posts, currentField, currentDir));
    });
  });
})();</script>`;
}

/**
 * Server-rendered static <ul> for a post list.
 * @param {Array} posts
 * @param {Object} [opts]
 * @param {string} [opts.sort_field='sub_id']
 * @param {string} [opts.sort_dir='asc']
 */
function renderPostList(posts, opts) {
  var field = (opts && opts.sort_field) || 'sub_id';
  var dir = (opts && opts.sort_dir) || 'asc';
  var sorted = posts.slice();
  sorted.sort(function (a, b) {
    var va = a[field];
    var vb = b[field];
    if (field === 'sub_id' && typeof va === 'number' && typeof vb === 'number') {
      return dir === 'asc' ? va - vb : vb - va;
    }
    if (va == null) va = '';
    if (vb == null) vb = '';
    if (va < vb) return dir === 'asc' ? -1 : 1;
    if (va > vb) return dir === 'asc' ? 1 : -1;
    return 0;
  });
  return '<ul class="post-list">\n' +
    sorted.map(function (p) {
      return '  <li><span class="date">' + formatDateTime(p.created_at) + '</span><a href="' + p.url + '">' + p.title + '</a></li>';
    }).join('\n') +
    '\n</ul>';
}

module.exports = {
  renderSortableList,
  renderPostList,
};
