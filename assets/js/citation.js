(function () {
  function slugifyKey(raw) {
    return String(raw || '')
      .trim()
      .replace(/^@+/, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-:.]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function extractKey(text) {
    var value = String(text || '').trim();
    if (!value) return '';
    return slugifyKey(value);
  }

  function findReferenceForKey(key) {
    if (!key) return null;
    var selectors = [
      '#ref-' + CSS.escape(key),
      '[data-cite-key="' + key.replace(/"/g, '\\"') + '"]',
      '[data-ref-key="' + key.replace(/"/g, '\\"') + '"]',
      '#cite-' + CSS.escape(key)
    ];

    for (var i = 0; i < selectors.length; i++) {
      var match = document.querySelector(selectors[i]);
      if (match) return match;
    }

    var candidates = document.querySelectorAll('.sources li, .references li, .reference-list li, .bibliography li, .sources p, .references p');
    for (var j = 0; j < candidates.length; j++) {
      var node = candidates[j];
      var nodeKey = extractKey(node.getAttribute('data-cite-key') || node.getAttribute('data-ref-key') || '');
      if (nodeKey && nodeKey === key) return node;
      var text = (node.textContent || '').trim();
      if (text.indexOf('[@' + key + ']') === 0 || text.indexOf('@' + key) === 0) return node;
    }

    return null;
  }

  function buildPreview(referenceEl) {
    if (!referenceEl) return '';
    var clone = referenceEl.cloneNode(true);
    var text = (clone.textContent || '').replace(/\s+/g, ' ').trim();
    return text;
  }

  function extractHref(referenceEl) {
    if (!referenceEl) return '';
    var link = referenceEl.querySelector('a[href]');
    return link ? link.href : '';
  }

  function ensurePopover() {
    var existing = document.getElementById('cite-popover');
    if (existing) return existing;

    var pop = document.createElement('div');
    pop.id = 'cite-popover';
    pop.className = 'cite-popover';
    pop.hidden = true;
    document.body.appendChild(pop);
    return pop;
  }

  function placePopover(pop, target) {
    var rect = target.getBoundingClientRect();
    var popRect = pop.getBoundingClientRect();
    var top = window.scrollY + rect.bottom + 10;
    var left = window.scrollX + rect.left;

    if (left + popRect.width > window.scrollX + window.innerWidth - 16) {
      left = window.scrollX + window.innerWidth - popRect.width - 16;
    }
    if (left < window.scrollX + 16) left = window.scrollX + 16;

    if (top + popRect.height > window.scrollY + window.innerHeight - 16) {
      top = window.scrollY + rect.top - popRect.height - 10;
    }
    if (top < window.scrollY + 16) top = window.scrollY + 16;

    pop.style.top = top + 'px';
    pop.style.left = left + 'px';
  }

  function renderPopover(pop, citeEl, referenceEl, href) {
    var key = citeEl.getAttribute('data-cite-key') || citeEl.textContent || '';
    var preview = buildPreview(referenceEl);
    var escapedKey = key.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    var escapedPreview = preview.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    var escapedHref = href.replace(/"/g, '&quot;');

    pop.innerHTML = '' +
      '<div class="cite-popover-key">' + escapedKey + '</div>' +
      (escapedPreview ? '<div class="cite-popover-text">' + escapedPreview + '</div>' : '') +
      (href ? '<a class="cite-popover-link" href="' + escapedHref + '" target="_blank" rel="noopener">打开原始链接</a>' : '<div class="cite-popover-muted">未找到原始链接</div>');

    pop.hidden = false;
    placePopover(pop, citeEl);
  }

  function hidePopoverSoon(pop) {
    window.clearTimeout(pop.__hideTimer);
    pop.__hideTimer = window.setTimeout(function () {
      pop.hidden = true;
    }, 120);
  }

  function enhanceCitations() {
    var cites = document.querySelectorAll('cite');
    if (!cites.length) return;

    var pop = ensurePopover();
    pop.addEventListener('mouseenter', function () {
      window.clearTimeout(pop.__hideTimer);
    });
    pop.addEventListener('mouseleave', function () {
      hidePopoverSoon(pop);
    });

    cites.forEach(function (citeEl) {
      var key = extractKey(citeEl.textContent);
      if (!key) return;

      var ref = findReferenceForKey(key);
      var href = extractHref(ref);

      citeEl.classList.add('cite-enhanced');
      citeEl.setAttribute('data-cite-key', key);
      if (ref && !ref.id) ref.id = 'ref-' + key;
      if (ref) citeEl.setAttribute('data-cite-target', ref.id || ('ref-' + key));
      if (href) {
        citeEl.setAttribute('data-cite-href', href);
        citeEl.title = href;
      }
      if (ref) {
        ref.classList.add('cite-reference');
        ref.setAttribute('data-cite-key', key);
      }

      citeEl.addEventListener('click', function () {
        if (ref) {
          ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
          ref.classList.add('cite-reference-highlight');
          window.setTimeout(function () {
            ref.classList.remove('cite-reference-highlight');
          }, 1800);
          if (history && history.replaceState) {
            history.replaceState(null, '', '#' + (ref.id || ('ref-' + key)));
          }
          return;
        }
        if (href) {
          window.open(href, '_blank', 'noopener');
        }
      });

      citeEl.addEventListener('mouseenter', function () {
        window.clearTimeout(pop.__hideTimer);
        renderPopover(pop, citeEl, ref, href);
      });

      citeEl.addEventListener('mouseleave', function () {
        hidePopoverSoon(pop);
      });

      citeEl.addEventListener('focus', function () {
        renderPopover(pop, citeEl, ref, href);
      });

      citeEl.addEventListener('blur', function () {
        hidePopoverSoon(pop);
      });

      citeEl.tabIndex = 0;
      citeEl.setAttribute('role', 'button');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceCitations);
  } else {
    enhanceCitations();
  }
})();
