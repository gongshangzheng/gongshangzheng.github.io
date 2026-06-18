/**
 * Inline runtime <script> blocks injected at build time.
 *
 * - buildPdfJsScript: loaded on pages that use {{< docpage >}} shortcodes
 * - buildSlideStateRestoreScript: per-path localStorage page restore for slide decks
 * - injectSlideStateRestore: idempotently insert the script before </body>
 */

function buildPdfJsScript() {
  return `<script>
(function(){
  function loadScript(src) {
    return new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  var pdfWorkerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  function configurePdfJs(lib) {
    if (!lib) throw new Error('PDF.js failed to load');
    lib.GlobalWorkerOptions = lib.GlobalWorkerOptions || {};
    lib.GlobalWorkerOptions.workerSrc = lib.GlobalWorkerOptions.workerSrc || pdfWorkerSrc;
    return lib;
  }
  function ensurePdfJs() {
    if (window.pdfjsLib) return Promise.resolve(configurePdfJs(window.pdfjsLib));
    return loadScript('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js').then(function(){
      return configurePdfJs(window.pdfjsLib);
    });
  }
  function renderOne(el, lib) {
    var src = encodeURI(el.getAttribute('data-docpage-pdf') || '');
    var pageNo = parseInt(el.getAttribute('data-docpage-page') || '1', 10);
    var canvas = el.querySelector('canvas');
    var loading = el.querySelector('.doc-page-loading');
    if (!src || !canvas) return;
    lib.getDocument(src).promise.then(function(pdf){ return pdf.getPage(pageNo); }).then(function(page){
      var stage = el.querySelector('.doc-page-stage') || el;
      var maxWidth = Math.max(320, stage.clientWidth || el.clientWidth || 900);
      var viewport1 = page.getViewport({ scale: 1 });
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var scale = maxWidth / viewport1.width;
      var viewport = page.getViewport({ scale: scale * dpr });
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = Math.floor(viewport.width / dpr) + 'px';
      canvas.style.height = Math.floor(viewport.height / dpr) + 'px';
      return page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
    }).then(function(){
      el.classList.add('is-rendered');
      if (loading) loading.remove();
    }).catch(function(err){
      console.error(err);
      if (loading) loading.textContent = 'PDF 页面渲染失败，请点击“打开原文”。';
    });
  }
  function boot(){
    var nodes = Array.prototype.slice.call(document.querySelectorAll('.doc-page-canvas[data-docpage-pdf], .doc-page-stage[data-docpage-pdf]'));
    if (!nodes.length) return;
    ensurePdfJs().then(function(lib){ nodes.forEach(function(el){ renderOne(el, lib); }); }).catch(function(err){ console.error(err); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
</script>`;
}

function buildSlideStateRestoreScript() {
  return `<script data-slide-state-restore="true">
(function(){
  var storageKey = 'slide-current:' + location.pathname;
  function getSlides() {
    return Array.prototype.slice.call(document.querySelectorAll('.slide'));
  }
  function getSavedSlide(totalSlides) {
    try {
      var saved = parseInt(localStorage.getItem(storageKey) || '0', 10);
      if (Number.isNaN(saved)) return 0;
      return Math.max(0, Math.min(saved, totalSlides - 1));
    } catch (error) {
      return 0;
    }
  }
  function saveSlide(index) {
    try {
      localStorage.setItem(storageKey, String(index));
    } catch (error) {}
  }
  function updateSlideUi(index, totalSlides) {
    var progressFill = document.getElementById('progressFill');
    if (progressFill) progressFill.style.width = ((index + 1) / totalSlides * 100) + '%';
    var slideNumber = document.getElementById('slideNumber');
    if (slideNumber) slideNumber.textContent = (index + 1) + ' / ' + totalSlides;
  }
  function showSlide(index, slides) {
    slides.forEach(function(slide, slideIndex) {
      var isActive = slideIndex === index;
      slide.classList.toggle('active', isActive);
      slide.classList.toggle('visible', isActive);
    });
    updateSlideUi(index, slides.length);
    saveSlide(index);
  }
  function boot() {
    var slides = getSlides();
    if (!slides.length) return;
    showSlide(getSavedSlide(slides.length), slides);
    var observer = new MutationObserver(function() {
      var activeIndex = slides.findIndex(function(slide) {
        return slide.classList.contains('active') || slide.classList.contains('visible');
      });
      if (activeIndex >= 0) saveSlide(activeIndex);
    });
    slides.forEach(function(slide) {
      observer.observe(slide, { attributes: true, attributeFilter: ['class'] });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
</script>`;
}

function injectSlideStateRestore(output) {
  if (!/class=["'][^"']*\bslide\b/i.test(output) || /data-slide-state-restore=["']true["']/i.test(output)) {
    return output;
  }
  var script = buildSlideStateRestoreScript();
  var bodyEndIdx = output.lastIndexOf('</body>');
  if (bodyEndIdx >= 0) {
    return output.slice(0, bodyEndIdx) + script + '\n' + output.slice(bodyEndIdx);
  }
  return output + script;
}

module.exports = {
  buildPdfJsScript,
  buildSlideStateRestoreScript,
  injectSlideStateRestore,
};
