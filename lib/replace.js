/**
 * Text Replace / Shortcode Processor
 * Translates Hugo replace.html logic to JavaScript for static site generation
 */

const path = require('path');
const { processPlotShortcodes } = require('./shortcodes/plots');

function slugify(text) {
  return text
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60) || 'section';
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findAll(regex, str) {
  const results = [];
  let match;
  const flags = regex.flags.includes('g') ? regex.flags : regex.flags + 'g';
  const r = new RegExp(regex.source, flags);
  while ((match = r.exec(str)) !== null) {
    results.push(match);
  }
  return results;
}

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseShortcodeAttrs(attrs) {
  const out = {};
  if (!attrs) return out;
  const re = /([\w-]+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/g;
  let m;
  while ((m = re.exec(attrs)) !== null) {
    let val = m[2];
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[m[1]] = val;
  }
  return out;
}

function mediaUrl(src) {
  src = String(src || '').trim();
  if (/^(https?:)?\/\//i.test(src) || src.startsWith('/') || src.startsWith('./') || src.startsWith('../')) return src;
  return './media/' + src.replace(/^\.?\/?media\//, '');
}

function parsePageList(spec) {
  const pages = [];
  String(spec || '').split(',').forEach(part => {
    part = part.trim();
    if (!part) return;
    const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      const a = Number(m[1]), b = Number(m[2]);
      const step = a <= b ? 1 : -1;
      for (let x = a; step > 0 ? x <= b : x >= b; x += step) pages.push(x);
    } else if (/^\d+$/.test(part)) {
      pages.push(Number(part));
    }
  });
  return pages;
}

function renderDocRef(src, page, title, type) {
  const url = mediaUrl(src);
  const safeTitle = escapeHtml(title || src);
  const safeSrc = escapeHtml(src);
  const safeType = escapeHtml((type || (String(src).match(/\.pptx?$/i) ? 'PPT' : 'PDF')).toUpperCase());
  const pageLabel = page ? (safeType === 'PPT' ? 'slide ' + page : 'p.' + page) : '';
  const href = safeType === 'PDF' && page ? url + '#page=' + page : url;
  return '<div class="doc-ref docref"><div class="doc-ref-head"><span class="doc-ref-type">' + safeType + '</span><strong>' + safeTitle + '</strong>' + (pageLabel ? '<span class="doc-ref-page">' + pageLabel + '</span>' : '') + '</div><p class="doc-ref-source">' + safeSrc + (pageLabel ? ' · ' + pageLabel : '') + '</p><p class="caption"><a href="' + href + '" target="_blank" rel="noopener">打开原文</a></p></div>';
}

function renderDocPageCanvas(src, page, title) {
  const url = mediaUrl(src);
  const safeTitle = escapeHtml(title || (src + (page ? ' p.' + page : '')));
  page = page || '1';
  return '<div class="doc-page-stage" data-docpage-pdf="' + escapeHtml(url) + '" data-docpage-page="' + page + '"><canvas aria-label="' + safeTitle + '"></canvas><div class="doc-page-loading">正在渲染 PDF 第 ' + page + ' 页…</div></div>';
}

function renderDocPage(src, page, title, mode) {
  const url = mediaUrl(src);
  const safeTitle = escapeHtml(title || (src + (page ? ' p.' + page : '')));
  const ext = String(src).split('?')[0].split('#')[0].toLowerCase();
  page = page || '1';
  mode = (mode || 'canvas').toLowerCase();

  if (/\.pptx?$/.test(ext)) {
    return renderDocRef(src, page, title || src, 'PPT');
  }

  if (mode === 'ref') return renderDocRef(src, page, title || src, 'PDF');

  if (mode === 'iframe' || mode === 'embed') {
    const pageUrl = url + '#page=' + page;
    return '<figure class="doc-page doc-page-iframe"><div class="doc-page-head"><span>PDF</span><strong>' + safeTitle + '</strong><em>p.' + page + '</em></div><iframe src="' + pageUrl + '" loading="lazy" width="100%" height="620" frameborder="0"></iframe><figcaption><a href="' + pageUrl + '" target="_blank" rel="noopener">打开 PDF 第 ' + page + ' 页</a></figcaption></figure>';
  }

  return '<figure class="doc-page doc-page-canvas" data-docpage-pdf="' + escapeHtml(url) + '" data-docpage-page="' + page + '"><div class="doc-page-head"><span>PDF</span><strong>' + safeTitle + '</strong><em>p.' + page + '</em></div><div class="doc-page-stage"><canvas aria-label="' + safeTitle + '"></canvas><div class="doc-page-loading">正在渲染 PDF 第 ' + page + ' 页…</div></div><figcaption>' + safeTitle + '（PDF 第 ' + page + ' 页） · <a href="' + url + '#page=' + page + '" target="_blank" rel="noopener">打开原文</a></figcaption></figure>';
}

function processBody(bodyHtml, opts) {
  const imgDir = opts && opts.imgDir ? opts.imgDir : 'img';
  const baseUrl = opts && opts.baseUrl ? opts.baseUrl : '/';
  const postMap = opts && opts.postMap ? opts.postMap : null;

  let str = bodyHtml;

  // Save code blocks as placeholders
  const codeBlocks = [];
  str = str.replace(/<pre[\s\S]*?<\/pre>/gi, (match) => {
    const placeholder = '__CODEBLOCK_' + codeBlocks.length + '__';
    codeBlocks.push(match);
    return placeholder;
  });

  // Heading anchor links
  str = str.replace(/<(h[1-6])\s+id="([^"]+)"([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, id, attrs, content) => {
    const anchorSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="anchor-icon"><path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"></path><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
    return '<' + tag + ' id="' + id + '"' + attrs + '><a href="#' + id + '" class="anchor" aria-hidden="true">' + anchorSvg + '</a>' + content + '</' + tag + '>';
  });

  // Hide unwanted elements
  str = str.replace(/\[\[D-([^\]]+)\]\]/g, '');
  str = str.replace(/\[\[方法\]\]/g, '');

  // Mark/highlight: ==text== → <mark>text</mark>
  str = str.replace(/==([^=]+)==/g, '<mark>$1</mark>');

  // Markdown bold: **text** → <strong>text</strong> (avoid matching inside HTML tags or existing <strong>)
  str = str.replace(/\*\*(?![<\s])([^*]+?)(?![<\s])\*\*/g, '<strong>$1</strong>');

  // Markdown italic: *text* → <em>text</em> (only single asterisks, not double)
  str = str.replace(/(?<!\*)\*(?![*\s])([^*]+?)(?![*\s])\*(?!\*)/g, '<em>$1</em>');

  // Wiki image: ![[img | width # caption]] — fix greedy capture so width/caption are parsed correctly
  str = str.replace(/!\[\[\s*([^\s|\[\]#]+)(?:\s*\|\s*(\d+))?(?:\s*#\s*([^\]\s]*))?\s*\]\]/g, (match, src, width, caption) => {
    const widthAttr = width ? 'width="' + width + '"' : '';
    const captionHtml = caption ? '<p class="caption">' + caption + '</p>' : '';
    return '<div class="image"><img loading="lazy" src="' + imgDir + '/' + src + '" alt="' + src + '" ' + widthAttr + ' />' + captionHtml + '</div>';
  });

  // Wikipedia links: [[wiki.en Albert Einstein | alias]]
  const wikiLinks = findAll(/\[\[\s*wiki\.?(\S+)?\s+([^\|\]]+)(?:\s*\|\s*([^\]]+))?\]\]/gi, str);
  for (const match of wikiLinks) {
    const country = match[1] || 'en';
    const text = match[2].trim();
    const display = (match[3] || text).trim();
    const url = 'https://' + country + '.wikipedia.org/wiki/' + encodeURIComponent(text);
    // Greedy extraction: find the whole [[...]] block directly from str (avoids regex escaping issues)
    const openIdx = str.indexOf('[[wiki');
    const closeIdx = str.indexOf(']]', openIdx + 5);
    if (openIdx >= 0 && closeIdx >= 0) {
      str = str.substring(0, openIdx) + '<a href="' + url + '" class="search-wiki" target="_blank" rel="noopener">' + display + '</a>' + str.substring(closeIdx + 2);
    }
  }

  // ArXiv links: [[arxiv 2301.00001 abs | alias]]
  const arxivRe = /\[\[\s*arxiv\s*(\d+\.\d+)\s*(abs|pdf)?\s*(?:-([^\]|]+))?(?:\|([^\]]+))?\]\]/gi;
  let arxivMatch;
  while ((arxivMatch = arxivRe.exec(str)) !== null) {
    const id = arxivMatch[1];
    const subpage = arxivMatch[2] || 'abs';
    const suffix = (arxivMatch[3] || '').trim();
    const display = (arxivMatch[4] || id).trim();
    const url = 'https://arxiv.org/' + subpage + '/' + id + (suffix ? '-' + suffix : '');
    str = str.replace(arxivMatch[0], '<a href="' + url + '" class="search-arxiv" target="_blank" rel="noopener">' + display + '</a>');
  }

  // GitHub links: [[github user/repo | alias]]
  const githubRe = /\[\[\s*github\s+([^\|\]]+)(?:\s*\|\s*([^\]]+))?\]\]/gi;
  let githubMatch;
  while ((githubMatch = githubRe.exec(str)) !== null) {
    const text = githubMatch[1].trim();
    const display = (githubMatch[2] || text).trim();
    const url = 'https://github.com/' + text;
    str = str.replace(githubMatch[0], '<a href="' + url + '" class="search-github" target="_blank" rel="noopener">' + display + '</a>');
  }

  // Google links: [[google query | alias]]
  const googleRe = /\[\[\s*google\s+([^\|\]]+)(?:\s*\|\s*([^\]]+))?\]\]/gi;
  let googleMatch;
  while ((googleMatch = googleRe.exec(str)) !== null) {
    const text = googleMatch[1].trim();
    const display = (googleMatch[2] || text).trim();
    const url = 'https://www.google.com/search?q=' + encodeURIComponent(text);
    str = str.replace(googleMatch[0], '<a href="' + url + '" class="search-google" target="_blank" rel="noopener">' + display + '</a>');
  }

  // Internal article cross-refs: [[@Title Text | alias]]
  // SSR fallback: slugify title (keep CJK, convert spaces to -)
  // Client-side resolveXrefs() will override with correct URL from window.__POST_MAP__
  str = str.replace(/\[\[@([^\]|]+?)(?:\s*\|\s*([^\]]+?))?\]\]/g, function(_, title, alias) {
    var displayText = (alias || title).trim();
    var t = title.trim();
    var slug = postMap && postMap[t];
    // Fallback: prefix match — find a post whose title starts with the ref text
    if (!slug && postMap) {
      var keys = Object.keys(postMap);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].indexOf(t) === 0 || t.indexOf(keys[i]) === 0) {
          slug = postMap[keys[i]];
          break;
        }
      }
    }
    var url;
    if (slug) {
      url = './' + slug + '.html';
    } else {
      var slugified = t.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0');
      }).replace(/-+/g, '-').replace(/^-|-$/g, '') || 'index';
      url = './' + slugified + '.html';
    }
    return '<a href="' + url + '" class="xref" data-xref-title="' + t + '">' + displayText + '</a>';
  });
  // Internal links: [[path#anchor | alias]] -- only match if not starting with @ (handled above)
  const internalRe = /\[\[((?!@)[^\]|]+)?(?:\s*#\s*([^\]|]+))?(?:\|\s*([^\]]+))?\]\]/g;
  let internalMatch;
  while ((internalMatch = internalRe.exec(str)) !== null) {
    const text = (internalMatch[1] || '').trim();
    const heading = (internalMatch[2] || '').trim();
    const display = (internalMatch[3] || '').trim() || (text ? text : (heading ? '#' + heading : ''));
    const headingSlug = heading ? slugify(heading) : '';
    const textSlug = text.toLowerCase().replace(/\s+$/, '');
    const url = (!text && heading ? '#' + headingSlug : (textSlug + (headingSlug ? '#' + headingSlug : '')));
    const displayText = display;
    const escapedText = escapeRegex(text);
    const escapedHeading = escapeRegex(heading);
    const escapedDisplay = escapeRegex(display);
    const iRegex = new RegExp('\\[\\[\\s*' + escapedText + '(?:\\s*#\\s*' + escapedHeading + ')?(?:\\s*\\|\\s*' + escapedDisplay + ')?\\s*\\]\\]', 'g');
    str = str.replace(iRegex, '<a href="' + url + '" class="jump-internal">' + displayText + '</a>');
  }


  // Term definition: Term :: Definition (dl/dt/dd in li or standalone)
  // Important: definition content may already contain inline HTML generated earlier,
  // e.g. MathJax wrappers like <span class="math-inline">...</span>. Therefore we
  // must not use [^<]* for the definition side, or the term parser will fail.
  str = str.replace(/<li>([\s\S]*?)<strong>([^<]+)<\/strong>([\s\S]*?)\s::\s([\s\S]*?)<\/li>/gi,
    function(_, pre, term, post, def) {
      return '<dl class="term-list"><li class="term"><dt>' + pre + '<strong>' + term + '</strong>' + post + '</dt><dd>' + def + '</dd></li></dl>';
    }
  );
  str = str.replace(/<p>([\s\S]*?)<strong>([^<]+)<\/strong>([\s\S]*?)\s::\s([\s\S]*?)<\/p>/gi,
    function(_, pre, term, post, def) {
      return '<dl class="term-list"><p class="term"><dt>' + pre + '<strong>' + term + '</strong>' + post + '</dt><dd>' + def + '</dd></p></dl>';
    }
  );
  str = str.replace(/<li>([\s\S]*?)<em>([^<]+)<\/em>([\s\S]*?)\s::\s([\s\S]*?)<\/li>/gi,
    function(_, pre, term, post, def) {
      return '<dl class="term-list"><li class="term"><dt>' + pre + '<em>' + term + '</em>' + post + '</dt><dd>' + def + '</dd></li></dl>';
    }
  );
  str = str.replace(/<p>([\s\S]*?)<em>([^<]+)<\/em>([\s\S]*?)\s::\s([\s\S]*?)<\/p>/gi,
    function(_, pre, term, post, def) {
      return '<dl class="term-list"><p class="term"><dt>' + pre + '<em>' + term + '</em>' + post + '</dt><dd>' + def + '</dd></p></dl>';
    }
  );
  str = str.replace(/<li>([\s\S]*?)\s::\s([\s\S]*?)<\/li>/gi,
    function(_, term, def) {
      return '<dl class="term-list"><li class="term"><dt>' + term + '</dt><dd>' + def + '</dd></li></dl>';
    }
  );
  str = str.replace(/<p>([\s\S]*?)\s::\s([\s\S]*?)<\/p>/gi,
    function(_, term, def) {
      return '<dl class="term-list"><p class="term"><dt>' + term + '</dt><dd>' + def + '</dd></p></dl>';
    }
  );



  str = str.replace(/(<li>[^<]+<\/li>)(?=\s*<li>)/g, '$1');



  // Bullet: · Item → <li>
  // Only treat middle dot as a bullet marker at a line/block start.
  // Inline text such as "Bilibili · Z 变换" must remain unchanged.
  str = str.replace(/(<p>)\s*·\s+([^\n<]+?)(?=\s*<br\s*\/>|\s*<\/p>|$)/g, '<li>$2</li>');
  str = str.replace(/(<br\s*\/?>|^|\n)\s*·\s+([^\n<]+?)(?=\s*<br\s*\/>|\s*<\/p>|\s*<\/li>|$)/gm, function(match, prefix, item) {
    return prefix + '<li>' + item + '</li>';
  });
  // Wrap consecutive bare <li> in <ul>
  function wrapBareLi(s) {
    s = s.replace(/(<li>[^<]+<\/li>)(?=\s*<li>)/g, function(m){ return '<ul>' + m; });
    s = s.replace(/(<li>[^<]+<\/li>)(?!\s*<li>)(?=\s*<\/p>)/g, function(m){ return m + '</ul>'; });
    s = s.replace(/(<li>[^<]+<\/li>)(?=\s*<p>)/g, function(m){ return m + '</ul>'; });
    return s;
  }
  // Enumeration: ① ② ③... → <li>
  str = str.replace(/①\s+([^\n<]+)/g, '<li>$1</li>');
  str = str.replace(/②\s+([^\n<]+)/g, '<li>$1</li>');
  str = str.replace(/③\s+([^\n<]+)/g, '<li>$1</li>');
  str = str.replace(/④\s+([^\n<]+)/g, '<li>$1</li>');
  str = str.replace(/⑤\s+([^\n<]+)/g, '<li>$1</li>');
  str = str.replace(/⑥\s+([^\n<]+)/g, '<li>$1</li>');
  str = str.replace(/⑦\s+([^\n<]+)/g, '<li>$1</li>');
  str = str.replace(/⑧\s+([^\n<]+)/g, '<li>$1</li>');
  str = str.replace(/⑨\s+([^\n<]+)/g, '<li>$1</li>');
  str = str.replace(/⑩\s+([^\n<]+)/g, '<li>$1</li>');
  // (1) / (1.) / (1。） enumeration → <li>
  // Only match at line/block start to avoid false positives on (year) in prose.
  str = str.replace(/(?:^|<p>\s*)\((\d+)[.)\）]\.?\)?\s+([^\n<]+)/gm, '<li>$1. $2</li>');
  // Legacy patterns kept for backward compat, but with fixed $1 and stricter context
  str = str.replace(/(?:^|<p>\s*)\((\d+)\)\s+([^\n<]+)/gm, '<li>$1. $2</li>');


  // Restore code blocks
  codeBlocks.forEach(function(block, i) {
    str = str.replace('__CODEBLOCK_' + i + '__', block);
  });

  return str;
}

function processShortcodes(bodyHtml) {
  let str = bodyHtml;

  // bg shortcode: {{< bg yellow >}}text{{< /bg >}}
  var bgColors = {
    yellow: 'background:#ffeb92fd',
    red: 'background:#fa9494',
    blue: 'background:#9ccaff',
    green: 'background:#acffea',
    purple: 'background:#eeb4ff',
  };
  Object.keys(bgColors).forEach(function(color) {
    var style = bgColors[color];
    var regex = new RegExp('\\{\\{\\<\\s*bg\\s+' + color + '\\s*>\\}\\}([\\s\\S]*?)\\{\\{\\<\\s*/bg\\s*>\\}\\}', 'g');
    str = str.replace(regex, '<mark style="' + style + '">$1</mark>');
  });

  // details shortcode — strip <p>/</p> that markdown adds around inline shortcodes
  str = str.replace(/\{\{\<\s*details\s+([^>]+)\s*>\}\}([\s\S]*?)\{\{\<\s*\/details\s*>\}\}/g, function(match, attrs, content) {
    var openAttr = /openByDefault\s*=\s*true/i.test(attrs) ? ' open' : '';
    var summaryMatch = attrs.match(/summary\s*=\s*"?([^"\s>]+)"?/i);
    var summary = summaryMatch ? summaryMatch[1] : '';
    // Remove surrounding <p>/</p> that markdown wraps around shortcodes in block context
    content = content.replace(/^<\/p>\s*/, '').replace(/\s*<p>$/, '');
    return '<details' + openAttr + '><summary>' + summary + '</summary>' + content + '</details>';
  });

  // bilibili shortcode
  str = str.replace(/\{\{\<\s*bilibili\s+(\S+)(?:\s+p=(\d+))?\s*>\}\}/g, function(match, bvid, page) {
    var p = page || 1;
    return '<div class="bilibili-embed"><iframe src="https://player.bilibili.com/player.html?bvid=' + bvid + '&page=' + p + '&high_quality=1&danmaku=0" scrolling="no" frameborder="0" allowfullscreen="true"></iframe></div>';
  });

  // youtube shortcode
  str = str.replace(/\{\{\<\s*youtube\s+(\S+)(?:\s+"([^"]*)")?\s*>\}\}/g, function(match, videoid, caption) {
    var captionHtml = caption ? '<p class="caption">' + caption + '</p>' : '';
    return '<div class="youtube-embed"><lite-youtube videoid="' + videoid + '"></lite-youtube>' + captionHtml + '</div>';
  });

  // video shortcode
  str = str.replace(/\{\{\<\s*video\s+"([^"]+)"\s*>\}\}/g, function(match, src) {
    return '<video controls style="display:block;max-width:80%;height:auto;margin:1em auto;border-radius:15px;"><source src="' + src + '" type="video/mp4"><a href="' + src + '">Download video</a></video>';
  });

  // document reference card: {{< docref "course/lecture.pdf" page=12 title="说明" >}}
  str = str.replace(/\{\{\<\s*docref\s+"([^"]+)"([^>]*)\s*\>\}\}/g, function(match, src, attrs) {
    var a = parseShortcodeAttrs(attrs);
    return renderDocRef(src, a.page || '', a.title || src, a.type || '');
  });

  // immersive document page: {{< docpage "course/lecture.pdf" page=12 title="说明" mode="canvas" >}}
  // PDF defaults to PDF.js canvas rendering. PPT/PPTX falls back to a reference card.
  str = str.replace(/\{\{\<\s*docpage\s+"([^"]+)"([^>]*)\s*\>\}\}/g, function(match, src, attrs) {
    var a = parseShortcodeAttrs(attrs);
    return renderDocPage(src, a.page || '1', a.title || src, a.mode || 'canvas');
  });

  // multiple document pages: {{< docpages "course/lecture.pdf" pages="21,25,35-37" title="卷积推导" >}}
  str = str.replace(/\{\{\<\s*docpages\s+"([^"]+)"([^>]*)\s*\>\}\}/g, function(match, src, attrs) {
    var a = parseShortcodeAttrs(attrs);
    var pages = parsePageList(a.pages || a.page || '1');
    var mode = a.mode || 'canvas';
    var title = a.title || src;
    var safeTitle = escapeHtml(title || src);
    var url = mediaUrl(src);
    var pagesRange = pages.length > 1 ? 'p.' + pages[0] + '–' + pages[pages.length - 1] : 'p.' + pages[0];
    return '<figure class="doc-page doc-page-canvas doc-pages">' +
      '<div class="doc-page-head"><span>PDF</span><strong>' + safeTitle + ' · ' + pagesRange + '</strong><em>' + pagesRange + '</em></div>' +
      pages.map(function(page) {
        return renderDocPageCanvas(src, String(page), title + ' · p.' + page);
      }).join('\n') +
      '<figcaption>' + safeTitle + '（PDF ' + pagesRange + '） · <a href="' + url + '#page=' + pages[0] + '" target="_blank" rel="noopener">打开原文</a></figcaption></figure>';
  });

  // Backward-compatible local PDF page shortcode. Keeps old iframe behavior.
  str = str.replace(/\{\{\<\s*pdf\s+"([^"]+)"([^>]*)\s*\>\}\}/g, function(match, src, attrs) {
    var a = parseShortcodeAttrs(attrs);
    return renderDocPage(src, a.page || '1', a.title || src, 'iframe');
  });

  // Backward-compatible local PPT/PPTX page reference shortcode.
  str = str.replace(/\{\{\<\s*ppt\s+"([^"]+\.(?:pptx?|PPTX?))"([^>]*)\s*\>\}\}/g, function(match, src, attrs) {
    var a = parseShortcodeAttrs(attrs);
    return renderDocRef(src, a.page || '1', a.title || src, 'PPT');
  });

  // google slides / legacy ppt embed shortcode
  str = str.replace(/\{\{\<\s*(ppt|googleslides)\s+"([^"]+)"\s*>\}\}/g, function(match, name, src) {
    return '<div class="googleslides-embed"><iframe src="' + src + '" width="100%" height="500" frameborder="0" allowfullscreen></iframe></div>';
  });

  // mermaid shortcode: {{< mermaid >}}graph TD...{{< /mermaid >}}
  // Converts to <pre class="mermaid"> block for runtime rendering by Mermaid.js
  str = str.replace(/\{\{<\s*mermaid\s*>\}\}([\s\S]*?)\{\{<\s*\/mermaid\s*>\}\}/g, function(match, code) {
    // Trim leading/trailing whitespace and normalize indentation
    var trimmed = code.replace(/^\n/, '').replace(/\n$/, '');
    // Find minimum indentation (common leading whitespace) and strip it
    var lines = trimmed.split('\n');
    var minIndent = Infinity;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      var indent = lines[i].match(/^(\s*)/)[1].length;
      if (indent < minIndent) minIndent = indent;
    }
    if (minIndent === Infinity) minIndent = 0;
    var dedented = lines.map(function(line) {
      return line.substring(minIndent);
    }).join('\n');
    return '<div class="mermaid-wrap"><pre class="mermaid">' + dedented + '</pre></div>';
  });

  // Plot shortcodes live in a separate module. replace.js only dispatches them.
  str = processPlotShortcodes(str);

  return str;
}

module.exports = {
  processBody,
  processShortcodes,
};