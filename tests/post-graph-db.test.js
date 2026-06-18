const assert = require('assert');
const {
  buildPostLookup,
  extractPostLinks,
  exportPostGraphIndex,
  filterGraphByScope,
  updatePostGraphDb,
} = require('../lib/post-graph-db');

const posts = [
  {
    sourcePath: 'src/pages/a.html',
    slug: 'a',
    title: 'Alpha',
    url: './a.html',
    tags: ['AI'],
    categories: ['课程'],
    subcategory: '数学',
    aliases: ['Alpha Alias'],
    created_at: '2026-01-01',
    updated_at: '2026-01-02',
  },
  {
    sourcePath: 'src/pages/b.html',
    slug: 'b',
    title: 'Beta',
    url: './b.html',
    tags: ['AI', 'Graph'],
    categories: ['课程'],
    subcategory: '数学',
    aliases: [],
    created_at: '2026-01-03',
    updated_at: '2026-01-04',
  },
  {
    sourcePath: 'src/pages/c.html',
    slug: 'c',
    title: 'Gamma',
    url: './c.html',
    tags: ['Graph'],
    categories: ['编程'],
    subcategory: 'Tools',
    aliases: [],
    created_at: '2026-01-05',
    updated_at: '2026-01-06',
  },
];

const tests = {
  'extractPostLinks: wiki links by slug title and alias': () => {
    const lookup = buildPostLookup(posts);
    const links = extractPostLinks('[[b]] [[Gamma|文章]] [[Alpha Alias]]', lookup, 'a');
    assert.deepEqual(links, ['b', 'c']);
  },

  'extractPostLinks: html anchor links': () => {
    const lookup = buildPostLookup(posts);
    const links = extractPostLinks('<a href="./b.html#x">B</a><a href="../c.html">C</a>', lookup, 'a');
    assert.deepEqual(links, ['b', 'c']);
  },

  'updatePostGraphDb: updates changed outgoing and rebuilds incoming': () => {
    const first = updatePostGraphDb(null, posts, {
      sourceContents: {
        'src/pages/a.html': '[[b]]',
        'src/pages/b.html': '[[c]]',
        'src/pages/c.html': '',
      },
      sourceHashes: {
        'src/pages/a.html': '1',
        'src/pages/b.html': '1',
        'src/pages/c.html': '1',
      },
    });
    assert.equal(first.stats.updated, 3);
    assert.equal(first.graphDb.posts.b.incoming[0], 'a');

    const second = updatePostGraphDb(first.graphDb, posts, {
      sourceContents: {
        'src/pages/a.html': '[[c]]',
        'src/pages/b.html': '[[c]]',
        'src/pages/c.html': '',
      },
      sourceHashes: {
        'src/pages/a.html': '2',
        'src/pages/b.html': '1',
        'src/pages/c.html': '1',
      },
    });
    assert.equal(second.stats.updated, 1);
    assert.equal(second.graphDb.edges['a->b'], undefined);
    assert.ok(second.graphDb.edges['a->c']);
    assert.deepEqual(second.graphDb.posts.c.incoming, ['a', 'b']);
  },

  'filterGraphByScope: filters category and subcategory': () => {
    const graphDb = updatePostGraphDb(null, posts, {
      sourceContents: {
        'src/pages/a.html': '[[b]] [[c]]',
        'src/pages/b.html': '[[c]]',
        'src/pages/c.html': '',
      },
      sourceHashes: {
        'src/pages/a.html': '1',
        'src/pages/b.html': '1',
        'src/pages/c.html': '1',
      },
    }).graphDb;
    const graph = exportPostGraphIndex(graphDb);
    const filtered = filterGraphByScope(graph, 'categories/课程/数学');
    assert.deepEqual(filtered.nodes.map(node => node.id).sort(), ['a', 'b']);
    assert.deepEqual(filtered.edges.map(edge => edge.source + '->' + edge.target), ['a->b']);
  },
};

module.exports = { tests, name: 'post-graph-db' };
