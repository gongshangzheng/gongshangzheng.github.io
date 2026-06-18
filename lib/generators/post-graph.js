let postGraphCounter = 0;

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderPostGraph(graph, opts) {
  const options = opts || {};
  const id = options.id || 'post-graph-' + (++postGraphCounter);
  const height = Number(options.height || 560);
  const showLabels = options.labels !== 'false';
  const hideIsolated = options.hide_isolated === 'true';
  const title = options.title || '文章关系图';
  const graphData = graph || { nodes: [], edges: [] };
  const encodedGraph = escapeHtml(JSON.stringify(graphData));

  return '<section class="post-graph" id="' + id + '" data-post-graph data-graph=\'' + encodedGraph + '\' data-height="' + height + '" data-labels="' + String(showLabels) + '" data-hide-isolated="' + String(hideIsolated) + '">' +
    '<div class="post-graph-header">' +
      '<div><h3>' + escapeHtml(title) + '</h3><p>' + graphData.nodes.length + ' 篇文章 · ' + graphData.edges.length + ' 条连接</p></div>' +
      '<div class="post-graph-controls">' +
        '<button type="button" data-action="toggle-labels">标签</button>' +
        '<button type="button" data-action="toggle-isolated">孤立点</button>' +
        '<button type="button" data-action="reset">重置</button>' +
      '</div>' +
    '</div>' +
    '<svg class="post-graph-canvas" role="img" aria-label="' + escapeHtml(title) + '"></svg>' +
    '<div class="post-graph-tooltip" hidden></div>' +
  '</section>';
}

module.exports = { renderPostGraph };
