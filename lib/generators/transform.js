/**
 * Body-text transforms used by buildArticles.
 *
 * Functions here only manipulate HTML/Markdown strings and have no I/O.
 * They are ordered to match their typical usage in the article pipeline.
 */

const { transformLatex } = require('../math');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Replace <music-player> custom elements with a plain <audio> block.
 * Runs on body HTML before the rest of the pipeline.
 */
function processBody(bodyHtml) {
  return bodyHtml.replace(
    /<music-player\s+title="([^"]+)"\s+src="([^"]+)"><\/music-player>/g,
    '<div class="music-player"><div class="music-player-title">$1</div><audio controls src="$2">Your browser does not support audio.</audio></div>'
  );
}

/**
 * Markdown fenced code blocks (```lang … ```) → explicit <pre><code> HTML.
 * Used for .html source files where marked.parse is not invoked.
 */
function transformFencedCodeBlocks(bodyHtml) {
  return bodyHtml.replace(/(^|\n)```([a-zA-Z0-9_-]+)?\n([\s\S]*?)\n```(?=\n|$)/g, function (match, prefix, lang, code) {
    var language = (lang || '').trim();
    var cls = language ? ' class="language-' + escapeHtml(language) + '"' : '';
    return prefix + '<pre><code' + cls + '>' + escapeHtml(code) + '</code></pre>';
  });
}

/**
 * Auto-wrap bare text lines with <p>.
 *
 * Skips:
 *   - empty lines
 *   - lines starting with `<` (HTML tags)
 *   - lines starting with `{` (shortcodes)
 *   - lines inside <pre> / <script> / <style> / <table>
 *   - lines inside \[ … \] or $$ … $$ display math blocks
 */
function wrapBareParagraphs(bodyHtml) {
  var preserved = [];
  var str = bodyHtml.replace(/<(pre|script|style|table)[\s\S]*?<\/\1>/gi, function (match) {
    var placeholder = '__WP_' + preserved.length + '__';
    preserved.push(match);
    return placeholder;
  });

  // Protect HTML comments too: a comment like <!-- <p> 自动补段落 --> contains
  // literal <p>/</p> that would otherwise corrupt the openParagraphDepth counter
  // below, causing every subsequent bare line to be treated as "inside a
  // paragraph" and never wrapped in <p> (which then collapses onto headings).
  str = str.replace(/<!--[\s\S]*?-->/g, function (match) {
    var placeholder = '__WP_' + preserved.length + '__';
    preserved.push(match);
    return placeholder;
  });

  var lines = str.split('\n');
  var inDisplayMath = false;
  var openParagraphDepth = 0;
  for (var i = 0; i < lines.length; i++) {
    var trimmed = lines[i].trim();
    if (!trimmed) continue;

    // Display math blocks: skip their inner lines, but never let the state
    // machine leak past the closing delimiter (otherwise the bare text that
    // follows a block is wrongly treated as "still inside math" and never
    // gets wrapped in <p>, causing it to collapse onto adjacent headings).
    if (inDisplayMath) {
      // Inside a block — look for the matching close delimiter on this line.
      if (/\\\]/.test(trimmed) || /\$\$/.test(trimmed)) inDisplayMath = false;
      continue;
    }
    // Single-line display math ($$...$$ on one line): skip without toggling.
    if (/^\$\$[\s\S]*\$\$$/.test(trimmed)) continue;
    // Opening delimiter of a multi-line display block.
    if (trimmed === '$$' || /\\\[/.test(trimmed)) {
      inDisplayMath = true;
      continue;
    }

    var isInsideParagraph = openParagraphDepth > 0;
    var opensParagraph = (trimmed.match(/<p\b/gi) || []).length;
    var closesParagraph = (trimmed.match(/<\/p>/gi) || []).length;

    if (!isInsideParagraph) {
      if (trimmed.charAt(0) === '<') {
        openParagraphDepth += opensParagraph - closesParagraph;
        continue;
      }
      if (trimmed.charAt(0) === '{') continue;
      if (trimmed.startsWith('__WP_')) continue;

      var indent = lines[i].match(/^(\s*)/)[1];
      lines[i] = indent + '<p>' + trimmed + '</p>';
      openParagraphDepth += opensParagraph - closesParagraph;
      continue;
    }

    openParagraphDepth += opensParagraph - closesParagraph;
    if (openParagraphDepth < 0) openParagraphDepth = 0;
  }
  str = lines.join('\n');

  for (var j = 0; j < preserved.length; j++) {
    str = str.replace('__WP_' + j + '__', preserved[j]);
  }
  return str;
}

/**
 * Rough reading-time estimate ("N min read") based on stripped text length.
 */
function estimateReadingTime(html) {
  var text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, '');
  var minutes = Math.max(1, Math.ceil(text.length / 400));
  return minutes + ' min read';
}

/**
 * Consecutive <p>| ... |</p> lines → real <table>. Optional separator row
 * (|---|---|) is detected and skipped from the body.
 */
function transformMarkdownTables(bodyHtml) {
  return bodyHtml.replace(
    /(?:<p>(?:Table|表格|表)\s*\d*[：:].+<\/p>\n?)?(?:<p>\|.+\|<\/p>\n?)+/g,
    function (match) {
      var caption = '';
      var captionMatch = match.match(/^<p>((?:Table|表格|表)\s*\d*[：:].+)<\/p>\n?/);
      var tableSource = match;
      if (captionMatch) {
        caption = captionMatch[1].trim();
        tableSource = match.slice(captionMatch[0].length);
      }

      var rowRe = /<p>\|(.+)\|<\/p>/g;
      var rows = [];
      var m;
      while ((m = rowRe.exec(tableSource)) !== null) {
        var cells = m[1].split('|').map(function (c) { return c.trim(); });
        rows.push(cells);
      }
      if (rows.length === 0) return match;

      var hasSeparator = rows.length >= 2 &&
        rows[1].every(function (c) { return /^[-:]+$/.test(c); });

      var headerCells = rows[0];
      var dataStartIdx = hasSeparator ? 2 : 1;
      var dataRows = rows.slice(dataStartIdx);

      var html = '<div class="table-wrap">\n<table>\n';
      html += '<thead><tr>';
      for (var h = 0; h < headerCells.length; h++) {
        html += '<th>' + headerCells[h] + '</th>';
      }
      html += '</tr></thead>\n';

      if (dataRows.length > 0) {
        html += '<tbody>\n';
        for (var r = 0; r < dataRows.length; r++) {
          html += '<tr>';
          for (var c = 0; c < dataRows[r].length; c++) {
            html += '<td>' + dataRows[r][c] + '</td>';
          }
          html += '</tr>\n';
        }
        html += '</tbody>\n';
      }
      html += '</table>\n</div>';
      if (caption) {
        html += '\n<p><em>' + caption + '</em></p>';
      }
      return html;
    }
  );
}

/**
 * Move table captions outside the horizontally scrollable region.
 * Source files may still use semantic <caption>; build output converts the
 * text to an italic paragraph below the table.
 */
function transformTableCaptionScroll(bodyHtml) {
  return bodyHtml.replace(
    /<div class="([^"]*\btable-wrap\b[^"]*)">\s*<table([^>]*)>\s*(?:<caption>([\s\S]*?)<\/caption>\s*)?([\s\S]*?)<\/table>\s*<\/div>/g,
    function (match, className, tableAttributes, caption, tableContent) {
      if (match.indexOf('table-scroll') !== -1) return match;

      var html = '<div class="' + className + '">\n<div class="table-scroll">\n<table' + tableAttributes + '>\n';
      html += tableContent.trim() + '\n</table>\n</div>\n</div>';
      if (caption) {
        html += '\n<p><em>' + caption.trim() + '</em></p>';
      }
      return html;
    }
  );
}

/**
 * Extract the first <div class="className"> block (balanced) from html.
 * Returns { html, body } where html is the extracted block (or '') and
 * body is the original html with the block removed.
 */
function extractFirstDiv(html, className) {
  var escaped = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  var exactRe = new RegExp('<div class="' + escaped + '"');
  var wordRe = new RegExp('<div class="[^"]*\\b' + escaped + '\\b');
  var match = html.match(exactRe) || html.match(wordRe);
  if (!match) return { html: '', body: html };
  var start = match.index;
  var gt = html.indexOf('>', start);
  if (gt === -1) return { html: '', body: html };
  var depth = 1;
  var i = gt + 1;
  while (i < html.length && depth > 0) {
    if (html.substring(i, i + 5) === '<div ') {
      depth++;
      var gt2 = html.indexOf('>', i);
      i = gt2 + 1;
    } else if (html.substring(i, i + 5) === '<div>') {
      depth++;
      i += 5;
    } else if (html.substring(i, i + 6) === '</div>') {
      depth--;
      i += 6;
    } else {
      i++;
    }
  }
  return { html: html.substring(start, i), body: html.substring(0, start) + html.substring(i) };
}

module.exports = {
  escapeHtml,
  processBody,
  transformFencedCodeBlocks,
  wrapBareParagraphs,
  estimateReadingTime,
  transformMarkdownTables,
  transformTableCaptionScroll,
  extractFirstDiv,
  transformLatex,
};
