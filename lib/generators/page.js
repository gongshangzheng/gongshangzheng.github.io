/**
 * Page-shell assembly: load _base.html, expand <!-- INCLUDE x --> partials,
 * substitute <!-- INJECT key --> placeholders + Mustache variables.
 */

const fs = require('fs');
const path = require('path');
const { render, parseListField } = require('../parser');

function loadTemplate(templatesDir, name) {
  return fs.readFileSync(path.join(templatesDir, name), 'utf8');
}

function processIncludes(content, templatesDir) {
  return content.replace(/<!-- INCLUDE (\w+) -->/g, function (_, name) {
    return loadTemplate(templatesDir, '_' + name + '.html');
  });
}

function assemblePage(templatesDir, contentHtml, context) {
  var page = loadTemplate(templatesDir, '_base.html');
  page = processIncludes(page, templatesDir);
  var headerHtml = loadTemplate(templatesDir, '_header.html');
  page = page.replace('<!-- INJECT header -->', function () { return render(headerHtml, context); });
  page = page.replace('<!-- INJECT content -->', function () { return contentHtml; });
  return render(page, context);
}

function buildHero(fm) {
  var heroTitle = fm.hero_title || fm.title || '';
  var heroSub = fm.hero_sub || '';
  var heroTagline = fm.hero_tagline || '';
  if (!heroTitle) return '';
  return '<div class="hero"><div class="hero-inner"><h1>' + heroTitle + '</h1>' +
    (heroSub ? '<div class="sub">' + heroSub + '</div>' : '') +
    (heroTagline ? '<div class="tagline">' + heroTagline + '</div>' : '') +
    '</div></div>';
}

// Render an optional "论文信息" info-box from frontmatter paper_* fields.
// All fields are optional; the block is omitted entirely when none are present.
function buildPaperInfo(fm) {
  if (!fm) return '';
  var hasAny = fm.paper_title || fm.paper_authors || fm.paper_affiliation ||
    fm.paper_venue || fm.paper_doi || fm.paper_url || fm.paper_code;
  if (!hasAny) return '';

  function joinField(val, sep) {
    if (!val) return '';
    return String(val).trim().charAt(0) === '['
      ? parseListField(val).join(sep)
      : String(val);
  }

  var rows = [];
  if (fm.paper_title) {
    var titleHtml = String(fm.paper_title);
    if (fm.paper_url) {
      titleHtml = '<a href="' + fm.paper_url + '" target="_blank">' + titleHtml + '</a>';
    }
    rows.push('<li><strong>标题</strong>：' + titleHtml + '</li>');
  }
  if (fm.paper_authors) {
    rows.push('<li><strong>作者</strong>：' + joinField(fm.paper_authors, ', ') + '</li>');
  }
  if (fm.paper_affiliation) {
    rows.push('<li><strong>单位</strong>：' + joinField(fm.paper_affiliation, '；') + '</li>');
  }
  if (fm.paper_venue) {
    rows.push('<li><strong>发表</strong>：' + String(fm.paper_venue) + '</li>');
  }
  if (fm.paper_doi) {
    var doi = String(fm.paper_doi);
    var doiUrl = /^https?:/i.test(doi) ? doi : 'https://doi.org/' + doi;
    var doiText = doi.replace(/^https?:\/\/doi\.org\//i, '');
    rows.push('<li><strong>DOI</strong>：<a href="' + doiUrl + '" target="_blank">' + doiText + '</a></li>');
  }
  if (fm.paper_code) {
    var code = String(fm.paper_code);
    if (/^https?:/i.test(code)) {
      code = '<a href="' + code + '" target="_blank">' + code + '</a>';
    }
    rows.push('<li><strong>开源</strong>：' + code + '</li>');
  }
  return '<div class="info-box paper-info"><h3>论文信息</h3><ul>' + rows.join('') + '</ul></div>';
}

module.exports = {
  loadTemplate,
  processIncludes,
  assemblePage,
  buildHero,
  buildPaperInfo,
};
