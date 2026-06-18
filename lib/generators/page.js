/**
 * Page-shell assembly: load _base.html, expand <!-- INCLUDE x --> partials,
 * substitute <!-- INJECT key --> placeholders + Mustache variables.
 */

const fs = require('fs');
const path = require('path');
const { render } = require('../parser');

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

module.exports = {
  loadTemplate,
  processIncludes,
  assemblePage,
  buildHero,
};
