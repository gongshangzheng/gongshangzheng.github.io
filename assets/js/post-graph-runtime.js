(function () {
  function parseGraph(container) {
    try {
      return JSON.parse(container.getAttribute('data-graph') || '{"nodes":[],"edges":[]}');
    } catch (error) {
      console.error('Invalid post graph data', error);
      return { nodes: [], edges: [] };
    }
  }

  function getVisibleGraph(graph, hideIsolated) {
    if (!hideIsolated) return graph;
    var connectedIds = new Set();
    graph.edges.forEach(function (edge) {
      connectedIds.add(edge.source);
      connectedIds.add(edge.target);
    });
    return {
      nodes: graph.nodes.filter(function (node) { return connectedIds.has(node.id); }),
      edges: graph.edges.slice(),
    };
  }

  function renderGraph(container) {
    var originalGraph = parseGraph(container);
    var showLabels = container.getAttribute('data-labels') !== 'false';
    var hideIsolated = container.getAttribute('data-hide-isolated') === 'true';
    var graph = getVisibleGraph(originalGraph, hideIsolated);
    var svg = container.querySelector('svg');
    var tooltip = container.querySelector('.post-graph-tooltip');
    var width = Math.max(container.clientWidth || 720, 320);
    var height = Number(container.getAttribute('data-height') || 560);
    var nodeById = new Map(graph.nodes.map(function (node) { return [node.id, node]; }));

    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.innerHTML = '';

    if (!graph.nodes.length) {
      var emptyText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      emptyText.setAttribute('x', width / 2);
      emptyText.setAttribute('y', height / 2);
      emptyText.setAttribute('text-anchor', 'middle');
      emptyText.setAttribute('class', 'post-graph-empty');
      emptyText.textContent = '暂无可展示的文章关系';
      svg.appendChild(emptyText);
      return;
    }

    var simulationNodes = graph.nodes.map(function (node, index) {
      var angle = (Math.PI * 2 * index) / Math.max(graph.nodes.length, 1);
      return Object.assign({}, node, {
        x: width / 2 + Math.cos(angle) * width * 0.25,
        y: height / 2 + Math.sin(angle) * height * 0.25,
        vx: 0,
        vy: 0,
      });
    });
    var simNodeById = new Map(simulationNodes.map(function (node) { return [node.id, node]; }));
    var simulationEdges = graph.edges
      .filter(function (edge) { return simNodeById.has(edge.source) && simNodeById.has(edge.target); })
      .map(function (edge) { return Object.assign({}, edge); });

    for (var tick = 0; tick < 180; tick++) {
      simulationNodes.forEach(function (sourceNode, sourceIndex) {
        for (var targetIndex = sourceIndex + 1; targetIndex < simulationNodes.length; targetIndex++) {
          var targetNode = simulationNodes[targetIndex];
          var dx = sourceNode.x - targetNode.x;
          var dy = sourceNode.y - targetNode.y;
          var distanceSq = Math.max(dx * dx + dy * dy, 16);
          var force = 900 / distanceSq;
          var distance = Math.sqrt(distanceSq);
          var forceX = (dx / distance) * force;
          var forceY = (dy / distance) * force;
          sourceNode.vx += forceX;
          sourceNode.vy += forceY;
          targetNode.vx -= forceX;
          targetNode.vy -= forceY;
        }
      });

      simulationEdges.forEach(function (edge) {
        var sourceNode = simNodeById.get(edge.source);
        var targetNode = simNodeById.get(edge.target);
        var dx = targetNode.x - sourceNode.x;
        var dy = targetNode.y - sourceNode.y;
        var distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        var desired = 130;
        var force = (distance - desired) * 0.012;
        var forceX = (dx / distance) * force;
        var forceY = (dy / distance) * force;
        sourceNode.vx += forceX;
        sourceNode.vy += forceY;
        targetNode.vx -= forceX;
        targetNode.vy -= forceY;
      });

      simulationNodes.forEach(function (node) {
        node.vx += (width / 2 - node.x) * 0.004;
        node.vy += (height / 2 - node.y) * 0.004;
        node.vx *= 0.82;
        node.vy *= 0.82;
        node.x = Math.min(width - 24, Math.max(24, node.x + node.vx));
        node.y = Math.min(height - 24, Math.max(24, node.y + node.vy));
      });
    }

    var edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    edgeGroup.setAttribute('class', 'post-graph-edges');
    svg.appendChild(edgeGroup);

    simulationEdges.forEach(function (edge) {
      var sourceNode = simNodeById.get(edge.source);
      var targetNode = simNodeById.get(edge.target);
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', sourceNode.x);
      line.setAttribute('y1', sourceNode.y);
      line.setAttribute('x2', targetNode.x);
      line.setAttribute('y2', targetNode.y);
      line.setAttribute('data-source', edge.source);
      line.setAttribute('data-target', edge.target);
      edgeGroup.appendChild(line);
    });

    var nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodeGroup.setAttribute('class', 'post-graph-nodes');
    svg.appendChild(nodeGroup);

    function setHighlight(activeId) {
      var neighborIds = new Set([activeId]);
      simulationEdges.forEach(function (edge) {
        if (edge.source === activeId) neighborIds.add(edge.target);
        if (edge.target === activeId) neighborIds.add(edge.source);
      });
      svg.querySelectorAll('[data-node-id]').forEach(function (nodeElement) {
        nodeElement.classList.toggle('is-dimmed', !neighborIds.has(nodeElement.getAttribute('data-node-id')));
      });
      svg.querySelectorAll('line').forEach(function (line) {
        var isActive = line.getAttribute('data-source') === activeId || line.getAttribute('data-target') === activeId;
        line.classList.toggle('is-active', isActive);
        line.classList.toggle('is-dimmed', !isActive);
      });
    }

    function clearHighlight() {
      svg.querySelectorAll('.is-dimmed,.is-active').forEach(function (element) {
        element.classList.remove('is-dimmed', 'is-active');
      });
      if (tooltip) tooltip.hidden = true;
    }

    simulationNodes.forEach(function (node) {
      var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('class', 'post-graph-node');
      group.setAttribute('data-node-id', node.id);
      group.setAttribute('transform', 'translate(' + node.x + ',' + node.y + ')');
      group.setAttribute('tabindex', '0');

      var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', String(Math.max(5, Math.min(14, 5 + (node.degree || 0)))));
      group.appendChild(circle);

      if (showLabels) {
        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '10');
        text.setAttribute('y', '4');
        text.textContent = node.title;
        group.appendChild(text);
      }

      group.addEventListener('mouseenter', function () {
        setHighlight(node.id);
        if (tooltip) {
          tooltip.hidden = false;
          tooltip.innerHTML = '<strong>' + node.title + '</strong><br>' +
            (node.subcategory || (node.categories || []).join(' / ') || '未分类') + '<br>' +
            '连接数：' + (node.degree || 0);
          tooltip.style.left = Math.min(node.x + 18, width - 180) + 'px';
          tooltip.style.top = Math.max(12, node.y - 12) + 'px';
        }
      });
      group.addEventListener('mouseleave', clearHighlight);
      group.addEventListener('click', function () {
        if (node.url) window.location.href = node.url.replace(/^\.\//, './');
      });
      nodeGroup.appendChild(group);
    });

    var labelButton = container.querySelector('[data-action="toggle-labels"]');
    var isolatedButton = container.querySelector('[data-action="toggle-isolated"]');
    var resetButton = container.querySelector('[data-action="reset"]');

    if (labelButton && !labelButton.dataset.bound) {
      labelButton.dataset.bound = 'true';
      labelButton.addEventListener('click', function () {
        container.setAttribute('data-labels', container.getAttribute('data-labels') === 'false' ? 'true' : 'false');
        renderGraph(container);
      });
    }
    if (isolatedButton && !isolatedButton.dataset.bound) {
      isolatedButton.dataset.bound = 'true';
      isolatedButton.addEventListener('click', function () {
        container.setAttribute('data-hide-isolated', container.getAttribute('data-hide-isolated') === 'true' ? 'false' : 'true');
        renderGraph(container);
      });
    }
    if (resetButton && !resetButton.dataset.bound) {
      resetButton.dataset.bound = 'true';
      resetButton.addEventListener('click', function () {
        container.setAttribute('data-labels', 'true');
        container.setAttribute('data-hide-isolated', 'false');
        renderGraph(container);
      });
    }
  }

  function initPostGraphs() {
    document.querySelectorAll('[data-post-graph]').forEach(renderGraph);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPostGraphs);
  } else {
    initPostGraphs();
  }
})();
