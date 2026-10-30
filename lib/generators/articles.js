/**
 * Per-article page builder.
 *
 * Walks src/pages, runs each source file through the body pipeline
 * (shortcodes → fenced code → wrap-paragraphs → markdown tables → LaTeX →
 * wiki/arxiv/post replacements → TOC → meta → footer), then injects optional
 * CSS modules, shortcode deps, MathJax, PDF.js, slide state, xref resolver.
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const { parseFrontmatter, parseListField } = require('../parser');
const { writePublic, walkDir } = require('../utils');
const { processHeadings, buildTocSidebar } = require('../toc');
const { processBody: applyReplacements, processShortcodes } = require('../replace');
const { SHORTCODE_DEPS } = require('../config');

const { assemblePage, buildHero, buildPaperInfo } = require('./page');
const { renderSortableList, renderPostList } = require('./post-list');
const { renderPostGraph } = require('./post-graph');
const {
  transformLatex,
  transformFencedCodeBlocks,
  wrapBareParagraphs,
  transformMarkdownTables,
  transformTableCaptionScroll,
  extractFirstDiv,
} = require('./transform');
const { defaultTaxonomy, buildArticleMeta, buildArticleFooter } = require('./meta');
const { buildPdfJsScript, injectSlideStateRestore } = require('./scripts');
const { hasCodeBlock, hasMathMarkup } = require('../asset-detect');
const { enhanceImgTags } = require('../media-images');

function buildArticles(paths, allPosts, buildContext, recentCount, options) {
  const taxonomy = (options && options.taxonomy) || defaultTaxonomy;
  const opts = options || {};
  const pageFiles = Array.isArray(opts.onlyFiles) ? opts.onlyFiles.slice() : walkDir(paths.pages);
  const totalFiles = walkDir(paths.pages).length;
  let builtCount = 0;
  const xrefMisses = [];

  for (const file of pageFiles) {
    const basename = path.basename(file);
    if (!basename.endsWith('.md') && !basename.endsWith('.html')) continue;

    const raw = fs.readFileSync(file, 'utf8');
    const { data: fm, content: bodyContent } = parseFrontmatter(raw);
    const ext = path.extname(file);

    let bodyHtml = ext === '.md' ? marked.parse(bodyContent, { tables: true, gfm: true }) : bodyContent;

    // --- Standalone slide branch (frontmatter: slide: true) -------------
    if (fm.slide) {
      const sourcePath = path.relative(paths.root, file).replace(/\\/g, '/');
      const outSlug = (allPosts.find(p => p.sourcePath === sourcePath) || {}).slug || path.basename(file, ext);
      const outName = outSlug + '.html';

      let output = bodyHtml;
      const isFullDocument = /<!DOCTYPE\s*html/i.test(output) ||
        (/<html[\s>]/i.test(output) && /<\/html>\s*$/i.test(output.trim()));
      if (!isFullDocument) {
        output = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${fm.title || outSlug}</title>${fm.page_style ? '<style>' + fm.page_style + '</style>' : ''}</head><body>${output}</body></html>`;
      }

      const slideAssets = parseListField(fm.slide_assets);
      if (slideAssets.length > 0) {
        const assetsOut = path.join(paths.public, 'slides', outSlug + '-assets');
        fs.mkdirSync(assetsOut, { recursive: true });
        for (const assetRel of slideAssets) {
          const assetSrc = path.join(paths.pages, assetRel);
          if (fs.existsSync(assetSrc)) {
            fs.copyFileSync(assetSrc, path.join(assetsOut, path.basename(assetRel)));
          }
        }
      }

      output = injectSlideStateRestore(output);
      // Standalone slide decks skip the article template but still ship images.
      if (opts.imageDims) {
        output = enhanceImgTags(output, { dims: opts.imageDims });
      }
      writePublic(paths.public, outName, output);
      builtCount++;
      if (typeof opts.onBuilt === 'function') opts.onBuilt(file, outName);
      continue;
    }

    // --- Standard article body pipeline ---------------------------------
    // Shortcodes run BEFORE wrapBareParagraphs so JS inside {{< jsxgraph >}} etc.
    // isn't accidentally wrapped in <p>.
    bodyHtml = processShortcodes(bodyHtml, allPosts, renderSortableList, opts.postGraph, renderPostGraph);

    if (ext === '.html') {
      bodyHtml = transformFencedCodeBlocks(bodyHtml);
      bodyHtml = wrapBareParagraphs(bodyHtml);
    }

    // Tables before LaTeX so $...$ inside cells goes through transformLatex.
    bodyHtml = transformMarkdownTables(bodyHtml);
    bodyHtml = transformTableCaptionScroll(bodyHtml);
    bodyHtml = transformLatex(bodyHtml);

    const postMap = {};
    allPosts.forEach(function (p) { postMap[p.title] = p.slug; });
    const sourceLabel = path.basename(file);
    bodyHtml = applyReplacements(bodyHtml, {
      imgDir: 'media/images',
      baseUrl: buildContext().base_url,
      postMap: postMap,
      allPosts: allPosts,
      onXrefMiss(title, fallbackUrl) {
        xrefMisses.push(`${sourceLabel}: [[@${title}]] → ${fallbackUrl}`);
      },
    });

    // Normalize .ch class — ensure fade-in is appended exactly once.
    bodyHtml = bodyHtml.replace(/<div class="ch fade-in"/g, '<div class="ch"');
    bodyHtml = bodyHtml.replace(/<div class="ch"/g, '<div class="ch fade-in"');

    let tocSidebar = '';
    let tocToggle = '';
    const isIndex = basename === 'index.md' || basename === 'index.html';
    const isAbout = basename === 'about.md' || basename === 'about.html';
    const isArticle = !isIndex && !isAbout;

    if (isArticle) {
      const tocResult = processHeadings(bodyHtml);
      bodyHtml = tocResult.html;
      const currentSourcePath = path.relative(paths.root, file).replace(/\\/g, '/');
      const currentPost = allPosts.find(p => p.sourcePath === currentSourcePath) || null;
      const toc = buildTocSidebar(tocResult.headings, allPosts, currentPost, taxonomy, { treeSrc: opts.categoryTreeSrc });
      tocSidebar = toc.sidebar;
      tocToggle = toc.toggle;
    }

    const containerClass = isIndex ? 'main-content' : 'wrap';

    let contentHtml;
    if (isIndex) {
      contentHtml = `${buildHero(fm)}<div class="${containerClass}">${bodyHtml}</div>`;
      const recent = allPosts.slice(0, recentCount);
      contentHtml = contentHtml.replace('{{RECENT_POSTS}}', renderPostList(recent));
    } else if (isAbout) {
      contentHtml = `${buildHero(fm)}<div class="${containerClass}">${bodyHtml}</div>`;
    } else {
      const { html: statsHtml, body: bodyAfterStats } = extractFirstDiv(bodyHtml, 'stats');
      const hasSourceWrap = /^\s*<div class="wrap">/i.test(bodyAfterStats);

      if (hasSourceWrap) {
        const metaHtml = buildArticleMeta(fm, bodyAfterStats, taxonomy);
        const footerHtml = buildArticleFooter(fm, taxonomy);
        let bodyWithMeta = bodyAfterStats.replace(
          /<div class="wrap">/i,
          `<div class="wrap">${metaHtml}`
        );
        if (footerHtml) {
          const lastCloseDiv = bodyWithMeta.lastIndexOf('</div>');
          if (lastCloseDiv >= 0) {
            bodyWithMeta = bodyWithMeta.substring(0, lastCloseDiv) + footerHtml + bodyWithMeta.substring(lastCloseDiv);
          }
        }
        contentHtml = `${buildHero(fm)}${statsHtml}${bodyWithMeta}`;
      } else {
        contentHtml = `${buildHero(fm)}${statsHtml}<div class="${containerClass}">${buildArticleMeta(fm, bodyAfterStats, taxonomy)}${buildPaperInfo(fm)}${bodyAfterStats}${buildArticleFooter(fm, taxonomy)}</div>`;
      }
    }

    const context = buildContext({
      title: fm.title || buildContext().title,
      description: fm.description || buildContext().description,
      PAGE_STYLE: fm.page_style || '',
      audio_src: fm.audio_src || '',
    });

    let page = assemblePage(paths.templates, contentHtml, context);
    page = page.replace('<!-- INJECT toc_sidebar -->', tocSidebar);
    page = page.replace('<!-- INJECT toc_toggle -->', tocToggle);

    // Heavy third-party scripts are injected only where they are used.
    // Prism used to load on all 3000+ pages (2925 had no code block); MathJax
    // used to load on 658 pages, 171 of which had no math at all.
    const headExtras = [];
    if (hasCodeBlock(page)) {
      headExtras.push('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css">');
      headExtras.push('<script defer src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>');
      headExtras.push('<script defer src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>');
    }

    // MathJax — anchor on `</head>` followed by CRLF or LF (the .html source
    // files on Windows are CRLF, so a literal `\n` anchor misses; regression
    // from the parseFrontmatter CRLF fix in commit 4d47f5e2).
    if (fm.mathjax && hasMathMarkup(page)) {
      headExtras.push('<script>\nwindow.MathJax = {tex: {inlineMath: [[\'$\', \'$\'], [\'\\\\(\', \'\\\\)\']], displayMath: [[\'$$\', \'$$\'], [\'\\\\[\', \'\\\\]\']], packages: {\'[+]\': [\'ams\']}}, svg: {displayAlign: \'center\'}, options: {enableMenu: false}};\n</script>');
      headExtras.push('<script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>');
      headExtras.push('<script>\nwindow.addEventListener(\'load\', function() { var tries = 0; var timer = setInterval(function() { if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) { window.MathJax.startup.promise.then(function() { return window.MathJax.typesetPromise ? window.MathJax.typesetPromise() : Promise.resolve(); }).then(function() { clearInterval(timer); }).catch(function(e) { console.error(e); }); } tries++; if (tries > 100) { clearInterval(timer); } }, 100); });\n</script>');
    }

    if (headExtras.length) {
      const headEndMatch = page.match(/<\/head>\r?\n/);
      if (headEndMatch) {
        const headEndIdx = headEndMatch.index;
        page = page.slice(0, headEndIdx) + headExtras.join('\n') + '\n' + page.slice(headEndIdx);
      }
    }

    // Optional CSS modules listed in frontmatter (css_modules: [a, b])
    const cssModules = parseListField(fm.css_modules);
    if (cssModules.length > 0) {
      const themeCssTag = '<link rel="stylesheet" href="assets/css/hugo-theme.css">';
      const moduleLinks = cssModules.map(m => `<link rel="stylesheet" href="assets/css/modules/${m}.css">`).join('\n');
      page = page.replace(themeCssTag, themeCssTag + '\n' + moduleLinks);
    }

    // Shortcode dependency auto-injection (CSS to <head>, JS before </body>).
    const injectedIds = new Set();
    const localCssTags = [];
    const localJsTags = [];
    const cdnTags = [];
    for (const dep of SHORTCODE_DEPS) {
      const detectList = Array.isArray(dep.detect) ? dep.detect : [dep.detect];
      const detected = detectList.some(d => page.indexOf(d) >= 0);
      if (!detected) continue;
      if (dep.css) {
        for (const c of dep.css) {
          const tag = '<link rel="stylesheet" href="assets/' + c + '">';
          if (page.indexOf(tag) === -1) localCssTags.push(tag);
        }
      }
      if (dep.js) {
        for (const j of dep.js) {
          localJsTags.push('<script src="assets/' + j + '"></script>');
        }
      }
      if (dep.cdn) {
        for (const url of dep.cdn) {
          cdnTags.push('<script src="' + url + '"></script>');
        }
      }
      injectedIds.add(dep.id);
    }
    if (localCssTags.length > 0) {
      const themeCssTag = '<link rel="stylesheet" href="assets/css/hugo-theme.css">';
      page = page.replace(themeCssTag, themeCssTag + '\n' + localCssTags.join('\n'));
    }
    const allJsTags = cdnTags.concat(localJsTags);
    if (allJsTags.length > 0) {
      const bodyEndIdx = page.lastIndexOf('</body>');
      if (bodyEndIdx >= 0) {
        page = page.slice(0, bodyEndIdx) + allJsTags.join('\n') + '\n' + page.slice(bodyEndIdx);
      }
    }

    // Responsive images: intrinsic width/height (no CLS), 960/1600 srcset for
    // large figures, eager + high priority for the first image on the page.
    if (opts.imageDims) {
      page = enhanceImgTags(page, { dims: opts.imageDims });
    }

    page = page.replace('<!-- INJECT audio -->', fm.audio_src
      ? `<audio id="bgm" src="${fm.audio_src}" autoplay loop preload="auto"></audio>`
      : '');

    if (injectedIds.has('docpage-pdf')) {
      const docBodyEndIdx = page.lastIndexOf('</body>');
      if (docBodyEndIdx >= 0) {
        page = page.slice(0, docBodyEndIdx) + buildPdfJsScript() + '\n' + page.slice(docBodyEndIdx);
      }
    }

    const sourcePath = path.relative(paths.root, file).replace(/\\/g, '/');
    const outName = ((allPosts.find(p => p.sourcePath === sourcePath) || {}).slug || path.basename(file, ext)) + '.html';
    writePublic(paths.public, outName, page);
    builtCount++;
    if (typeof opts.onBuilt === 'function') opts.onBuilt(file, outName);
  }

  if (xrefMisses.length) {
    console.log(`⚠ xref: ${xrefMisses.length} 条按标题引用未匹配到文章，已回退为 slugify 链接：`);
    for (const miss of xrefMisses.slice(0, 20)) console.log(`    ${miss}`);
    if (xrefMisses.length > 20) console.log(`    … 其余 ${xrefMisses.length - 20} 条`);
  }

  return {
    built: builtCount,
    reused: Math.max(0, totalFiles - builtCount),
    total: totalFiles,
  };
}

module.exports = { buildArticles };
