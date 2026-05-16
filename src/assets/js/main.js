/**
 * Main - Initialize components
 */
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // Mark current nav link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-list a');
    navLinks.forEach(function(link) {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === 'index.html' && href === '/')) {
        link.classList.add('active');
      }
    });
  });
})();