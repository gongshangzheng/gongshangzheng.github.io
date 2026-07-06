const fs = require('fs');
const path = require('path');

const GRAPH_DB_VERSION = 1;

function createEmptyPostGraphDb() {
  return {
    version: GRAPH_DB_VERSION,
    posts: {},
    edges: {},
  };
}

function loadPostGraphDb(cachePath) {
  if (!cachePath || !fs.existsSync(cachePath)) return createEmptyPostGraphDb();

  try {
    const parsed = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    if (!parsed || parsed.version !== GRAPH_DB_VERSION || !parsed.posts || !parsed.edges) {
      return createEmptyPostGraphDb();
    }
    return parsed;
  } catch (_) {
    return createEmptyPostGraphDb();
  }
}

function savePostGraphDb(cachePath, graphDb) {
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify(graphDb, null, 2), 'utf8');
}

function normalizeHrefToSlug(href) {
  const cleanHref = String(href || '')
    .trim()
    .replace(/^https?:\/\/gongshangzheng\.github\.io\//i, '')
    .replace(/^\.?\//, '')
    .replace(/^\.\.\//, '')
    .split('#')[0]
    .split('?')[0];

  const match = cleanHref.match(/([^/]+)\.html$/i);
  return match ? match[1] : '';
}

function buildPostLookup(posts) {
  const lookup = new Map();

  posts.forEach(function registerPost(post) {
    lookup.set(post.slug, post.slug);
    lookup.set(post.title, post.slug);
    (post.aliases || []).forEach(function registerAlias(alias) {
      lookup.set(alias, post.slug);
    });
  });

  return lookup;
}

function extractPostLinks(content, postLookup, currentSlug) {
  const targets = new Set();
  const source = String(content || '');

  let wikiMatch;
  const wikiRegex = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]*)?\]\]/g;
  while ((wikiMatch = wikiRegex.exec(source)) !== null) {
    const rawTarget = wikiMatch[1].trim();
    const targetSlug = postLookup.get(rawTarget);
    if (targetSlug && targetSlug !== currentSlug) targets.add(targetSlug);
  }

  let anchorMatch;
  const anchorRegex = /<a\b[^>]*\bhref=["']([^"']+\.html(?:#[^"']*)?)["'][^>]*>/gi;
  while ((anchorMatch = anchorRegex.exec(source)) !== null) {
    const normalizedSlug = normalizeHrefToSlug(anchorMatch[1]);
    const targetSlug = postLookup.get(normalizedSlug);
    if (targetSlug && targetSlug !== currentSlug) targets.add(targetSlug);
  }

  return Array.from(targets).sort();
}

function toGraphNode(slug, post, outgoing, incoming) {
  return {
    id: slug,
    title: post.title,
    url: post.url,
    created_at: post.created_at,
    updated_at: post.updated_at,
    tags: post.tags || [],
    categoryPath: post.categoryPath || [],
    degree: outgoing.length + incoming.length,
  };
}

function createEdgeKey(sourceSlug, targetSlug) {
  return sourceSlug + '->' + targetSlug;
}

function rebuildIncoming(graphDb) {
  Object.keys(graphDb.posts).forEach(function resetIncoming(slug) {
    graphDb.posts[slug].incoming = [];
  });

  Object.keys(graphDb.edges).forEach(function attachIncoming(edgeKey) {
    const edge = graphDb.edges[edgeKey];
    if (!graphDb.posts[edge.target]) return;
    graphDb.posts[edge.target].incoming.push(edge.source);
  });

  Object.keys(graphDb.posts).forEach(function sortIncoming(slug) {
    graphDb.posts[slug].incoming = Array.from(new Set(graphDb.posts[slug].incoming)).sort();
  });
}

function removeRelatedPostEdges(graphDb, slug) {
  Object.keys(graphDb.edges).forEach(function removeEdge(edgeKey) {
    const edge = graphDb.edges[edgeKey];
    if (edge.source === slug || edge.target === slug) {
      delete graphDb.edges[edgeKey];
    }
  });
}

function removeOutgoingPostEdges(graphDb, slug) {
  Object.keys(graphDb.edges).forEach(function removeEdge(edgeKey) {
    const edge = graphDb.edges[edgeKey];
    if (edge.source === slug) {
      delete graphDb.edges[edgeKey];
    }
  });
}

function updatePostGraphDb(existingDb, posts, options) {
  const opts = options || {};
  const force = !!opts.force;
  const sourceContents = opts.sourceContents || {};
  const sourceHashes = opts.sourceHashes || {};
  const postLookup = buildPostLookup(posts);
  const lookupHash = JSON.stringify(posts.map(function mapLookupInput(post) {
    return {
      slug: post.slug,
      title: post.title,
      aliases: post.aliases || [],
    };
  }));
  const nextDb = force ? createEmptyPostGraphDb() : (existingDb || createEmptyPostGraphDb());
  const currentSlugs = new Set(posts.map(function getSlug(post) { return post.slug; }));
  let updated = 0;
  let reused = 0;
  let removed = 0;

  Object.keys(nextDb.posts).forEach(function removeDeletedPost(slug) {
    if (!currentSlugs.has(slug)) {
      delete nextDb.posts[slug];
      removeRelatedPostEdges(nextDb, slug);
      removed++;
    }
  });

  posts.forEach(function upsertPost(post) {
    const previous = nextDb.posts[post.slug];
    const sourceHash = sourceHashes[post.sourcePath] || '';
    const metadata = {
      sourcePath: post.sourcePath,
      sourceHash,
      lookupHash,
      title: post.title,
      url: post.url,
      tags: post.tags || [],
      categoryPath: post.categoryPath || [],
      created_at: post.created_at || '',
      updated_at: post.updated_at || '',
      aliases: post.aliases || [],
    };

    const metadataHash = JSON.stringify(metadata);
    const previousMetadataHash = previous ? JSON.stringify({
      sourcePath: previous.sourcePath,
      sourceHash: previous.sourceHash,
      lookupHash: previous.lookupHash,
      title: previous.title,
      url: previous.url,
      tags: previous.tags || [],
      categoryPath: previous.categoryPath || [],
      created_at: previous.created_at || '',
      updated_at: previous.updated_at || '',
      aliases: previous.aliases || [],
    }) : '';

    if (previous && metadataHash === previousMetadataHash && !force) {
      reused++;
      return;
    }

    const outgoing = extractPostLinks(sourceContents[post.sourcePath] || '', postLookup, post.slug);
    removeOutgoingPostEdges(nextDb, post.slug);
    nextDb.posts[post.slug] = {
      ...metadata,
      outgoing,
      incoming: [],
    };

    outgoing.forEach(function addEdge(targetSlug) {
      if (!currentSlugs.has(targetSlug)) return;
      const edgeKey = createEdgeKey(post.slug, targetSlug);
      nextDb.edges[edgeKey] = {
        source: post.slug,
        target: targetSlug,
        type: 'link',
        weight: 1,
      };
    });

    updated++;
  });

  rebuildIncoming(nextDb);

  return {
    graphDb: nextDb,
    stats: {
      updated,
      reused,
      removed,
      total: posts.length,
      edges: Object.keys(nextDb.edges).length,
    },
  };
}

function exportPostGraphIndex(graphDb) {
  const nodes = Object.keys(graphDb.posts).sort().map(function mapNode(slug) {
    const post = graphDb.posts[slug];
    return toGraphNode(slug, post, post.outgoing || [], post.incoming || []);
  });

  const edges = Object.keys(graphDb.edges).sort().map(function mapEdge(edgeKey) {
    return graphDb.edges[edgeKey];
  });

  return {
    version: graphDb.version || GRAPH_DB_VERSION,
    nodes,
    edges,
  };
}

function filterGraphByScope(graph, scope, options) {
  const opts = options || {};
  const depth = Number(opts.depth || 0);
  const parts = String(scope || '').split('/').filter(Boolean);
  const kind = parts[0] || '';
  const value = parts[1] || '';

  function inScope(node) {
    if (!kind || !value) return true;
    if (kind === 'tags') return (node.tags || []).indexOf(value) !== -1;
    if (kind === 'categories') {
      // Path prefix match: "categories/AI/动作识别" matches nodes whose
      // categoryPath starts with ["AI", "动作识别"]
      const scopePath = parts.slice(1);
      const nodePath = node.categoryPath || [];
      if (nodePath.length < scopePath.length) return false;
      for (let i = 0; i < scopePath.length; i++) {
        if (nodePath[i] !== scopePath[i]) return false;
      }
      return true;
    }
    return true;
  }

  const nodeById = new Map((graph.nodes || []).map(function pairNode(node) {
    return [node.id, node];
  }));
  const scopedNodeIds = new Set((graph.nodes || []).filter(inScope).map(function getId(node) {
    return node.id;
  }));
  const includedNodeIds = new Set(scopedNodeIds);

  const filteredEdges = (graph.edges || []).filter(function keepEdge(edge) {
    const sourceInScope = scopedNodeIds.has(edge.source);
    const targetInScope = scopedNodeIds.has(edge.target);
    if (depth > 0 && (sourceInScope || targetInScope)) {
      includedNodeIds.add(edge.source);
      includedNodeIds.add(edge.target);
      return true;
    }
    return sourceInScope && targetInScope;
  });

  return {
    version: graph.version || GRAPH_DB_VERSION,
    nodes: Array.from(includedNodeIds).map(function getNode(slug) {
      return nodeById.get(slug);
    }).filter(Boolean),
    edges: filteredEdges,
  };
}

module.exports = {
  GRAPH_DB_VERSION,
  buildPostLookup,
  extractPostLinks,
  filterGraphByScope,
  loadPostGraphDb,
  savePostGraphDb,
  updatePostGraphDb,
  exportPostGraphIndex,
};
