// Background music toggle bound to #float-music-btn.
// Extracted from dark-mode.js as part of the runtime/* split.

// Music toggle — uses #float-music-btn
(function() {
  var toggleBtn = document.getElementById('float-music-btn');
  var bgm = document.getElementById('bgm');
  if (!toggleBtn || !bgm) return;

  function updateState() {
    toggleBtn.classList.toggle('playing', !bgm.paused);
  }

  toggleBtn.addEventListener('click', function() {
    if (bgm.paused) { bgm.play(); } else { bgm.pause(); }
  });

  bgm.addEventListener('play', updateState);
  bgm.addEventListener('pause', updateState);
  updateState();
})();
