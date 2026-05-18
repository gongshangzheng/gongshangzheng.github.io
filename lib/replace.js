/**
 * Text Replace / Shortcode Processor
 * Translates Hugo replace.html logic to JavaScript for static site generation
 */

const path = require('path');

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

function processBody(bodyHtml, opts) {
  const imgDir = opts && opts.imgDir ? opts.imgDir : 'img';
  const baseUrl = opts && opts.baseUrl ? opts.baseUrl : '/';

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
  str = str.replace(/\[\[@([^\]|]+?)(?:\s*\|\s*([^\]]+?))?\]\]/g, function(_, title, alias) {
    var displayText = (alias || title).trim();
    var slugified = title.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    var url = './' + slugified + '.html';
    return '<a href="' + url + '" class="xref" data-xref-title="' + title.trim() + '">' + displayText + '</a>';
  });
  const internalRe = /\[\[\s*([^\]\|#]+)?\s*(?:#\s*([^\]|]+))?(?:\|\s*([^\]]+))?\]\]/g;
  let internalMatch;
  while ((internalMatch = internalRe.exec(str)) !== null) {
    const text = (internalMatch[1] || '').trim();
    const heading = (internalMatch[2] || '').trim();
    const display = (internalMatch[3] || '').trim() || (text ? text : (heading ? '#' + heading : ''));
    const headingSlug = slugify(heading);
    const textSlug = text.toLowerCase().replace(/\s+$/, '');
    const url = (!text && heading ? '#' + headingSlug : (textSlug + (headingSlug ? '#' + headingSlug : '')));
    const displayText = display;
    const escapedText = escapeRegex(text);
    const escapedHeading = escapeRegex(heading);
    const escapedDisplay = escapeRegex(display);
    const iRegex = new RegExp('\\[\\[\\s*' + escapedText + '(?:\\s*#\\s*' + escapedHeading + ')?(?:\\|\\s*' + escapedDisplay + ')?\\s*\\]\\]', 'g');
    str = str.replace(iRegex, '<a href="' + url + '" class="jump-internal">' + displayText + '</a>');
  }


  // Term definition: Term :: Definition (dl/dt/dd in li or standalone)
  str = str.replace(/<li>([^<]*?)<strong>([^<]+)<\/strong>([^<]*?)::([^<]*)<\/li>/gi,
    function(_, pre, term, post, def) {
      return '<dl class="term-list"><li class="term"><dt>' + pre + '<strong>' + term + '</strong>' + post + '</dt><dd>' + def + '</dd></li></dl>';
    }
  );
  str = str.replace(/<p>([^<]*?)<strong>([^<]+)<\/strong>([^<]*?)::([^<]*)<\/p>/gi,
    function(_, pre, term, post, def) {
      return '<dl class="term-list"><p class="term"><dt>' + pre + '<strong>' + term + '</strong>' + post + '</dt><dd>' + def + '</dd></p></dl>';
    }
  );
  str = str.replace(/<li>([^<]*?)<em>([^<]+)<\/em>([^<]*?)::([^<]*)<\/li>/gi,
    function(_, pre, term, post, def) {
      return '<dl class="term-list"><li class="term"><dt>' + pre + '<em>' + term + '</em>' + post + '</dt><dd>' + def + '</dd></li></dl>';
    }
  );
  str = str.replace(/<p>([^<]*?)<em>([^<]+)<\/em>([^<]*?)::([^<]*)<\/p>/gi,
    function(_, pre, term, post, def) {
      return '<dl class="term-list"><p class="term"><dt>' + pre + '<em>' + term + '</em>' + post + '</dt><dd>' + def + '</dd></p></dl>';
    }
  );
  str = str.replace(/<li>([^<]*)::([^<]*)<\/li>/gi,
    function(_, term, def) {
      return '<dl class="term-list"><li class="term"><dt>' + term + '</dt><dd>' + def + '</dd></li></dl>';
    }
  );
  str = str.replace(/<p>([^<]*)::([^<]*)<\/p>/gi,
    function(_, term, def) {
      return '<dl class="term-list"><p class="term"><dt>' + term + '</dt><dd>' + def + '</dd></p></dl>';
    }
  );



  str = str.replace(/(<li>[^<]+<\/li>)(?=\s*<li>)/g, '$1');



  // Bullet: · Item → <li>
  str = str.replace(/(<p>)\s*·\s+/g, '$1');
  str = str.replace(/(<\/p>)\s*·\s+/g, '$1');
  str = str.replace(/·\s+([^\n]+?)(?=\s*<br\s*\/>|\s*<\/p>|\s*<\/li>|$)/g, '<li>$1</li>');
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
  str = str.replace(/\(\d+\)\s+([^\n<]+)/g, '<li>$2</li>');
  str = str.replace(/\(\d+\.\)\s+([^\n<]+)/g, '<li>$2</li>');
  str = str.replace(/\(\d+\.\）\s+([^\n<]+)/g, '<li>$2</li>');
  str = str.replace(/\(\d+\）\s+([^\n<]+)/g, '<li>$2</li>');


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

  // ppt shortcode
  str = str.replace(/\{\{\<\s*(ppt|googleslides)\s+"([^"]+)"\s*>\}\}/g, function(match, name, src) {
    return '<div class="googleslides-embed"><iframe src="' + src + '" width="100%" height="500" frameborder="0" allowfullscreen></iframe></div>';
  });

  return str;
}

module.exports = {
  processBody,
  processShortcodes,
};