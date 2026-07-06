/**
 * Static feed/index outputs: search-index.json, post-index.json, feed.xml.
 */

const { writePublic } = require('../utils');

function buildSearch(paths, allPosts) {
  var index = allPosts.map(function (p) {
    return {
      title: p.title,
      description: p.description,
      created_at: p.created_at,
      tags: p.tags,
      categories: p.categories,
      subcategory: p.subcategory || '',
      sub_id: typeof p.sub_id === 'number' ? p.sub_id : null,
      aliases: p.aliases || [],
      url: p.url.replace('./', ''),
    };
  });
  writePublic(paths.public, 'search-index.json', JSON.stringify(index, null, 2));
  return index.length;
}

function djb2Hash(str) {
  var hash = 5381;
  for (var i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & 0x7FFFFFFF;
  }
  return hash;
}

function buildIndex(paths, allPosts) {
  var sorted = allPosts.slice();
  sorted.sort(function (a, b) {
    var ia = typeof a.sub_id === 'number' ? a.sub_id : Infinity;
    var ib = typeof b.sub_id === 'number' ? b.sub_id : Infinity;
    if (ia !== ib) return ia - ib;
    var ta = a.created_at || '';
    var tb = b.created_at || '';
    return tb.localeCompare(ta);
  });

  var postIndex = sorted.map(function (p) {
    return {
      id: djb2Hash(p.slug),
      title: p.title,
      slug: p.slug,
      sub_id: p.sub_id,
      pin: p.pin === true,
      created_at: p.created_at,
      updated_at: p.updated_at,
    };
  });
  writePublic(paths.public, 'post-index.json', JSON.stringify(postIndex, null, 2));
  return postIndex.length;
}

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(dateStr) {
  if (!dateStr) return new Date().toUTCString();
  try {
    return new Date(dateStr).toUTCString();
  } catch (e) {
    return new Date().toUTCString();
  }
}

function buildRss(paths, allPosts, buildContext) {
  var ctx = buildContext();
  var siteUrl = ctx.url;
  var siteTitle = ctx.site_title;
  var siteDesc = ctx.description;
  var author = ctx.author;

  var maxItems = 25;
  var posts = allPosts.slice(0, maxItems);

  var items = posts.map(function (p) {
    var link = siteUrl + '/' + p.slug + '.html';
    var pubDate = toRfc822(p.created_at);
    var categories = p.tags.map(function (t) {
      return '    <category>' + escapeXml(t) + '</category>';
    }).join('\n');
    var desc = p.description
      ? '    <description>' + escapeXml(p.description) + '</description>'
      : '';

    return '  <item>\n' +
      '    <title>' + escapeXml(p.title) + '</title>\n' +
      '    <link>' + escapeXml(link) + '</link>\n' +
      '    <guid isPermaLink="true">' + escapeXml(link) + '</guid>\n' +
      (desc ? desc + '\n' : '') +
      '    <pubDate>' + pubDate + '</pubDate>\n' +
      '    <author>' + escapeXml(author) + '</author>\n' +
      categories + '\n' +
      '  </item>';
  }).join('\n');

  var lastBuildDate = new Date().toUTCString();

  var rss = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n' +
    '  <channel>\n' +
    '    <title>' + escapeXml(siteTitle) + '</title>\n' +
    '    <link>' + escapeXml(siteUrl) + '</link>\n' +
    '    <description>' + escapeXml(siteDesc) + '</description>\n' +
    '    <language>zh-CN</language>\n' +
    '    <managingEditor>' + escapeXml(author) + '</managingEditor>\n' +
    '    <webMaster>' + escapeXml(author) + '</webMaster>\n' +
    '    <lastBuildDate>' + lastBuildDate + '</lastBuildDate>\n' +
    '    <generator>gongshangzheng.github.io</generator>\n' +
    '    <atom:link href="' + escapeXml(siteUrl + '/feed.xml') + '" rel="self" type="application/rss+xml"/>\n' +
    items + '\n' +
    '  </channel>\n' +
    '</rss>';

  writePublic(paths.public, 'feed.xml', rss);
  return posts.length;
}

module.exports = {
  buildSearch,
  buildIndex,
  buildRss,
};
