(function () {
  function initLightbox() {
    var article = document.querySelector('.md-content article');
    if (!article || typeof GLightbox !== 'function') return;

    // Wrap standalone markdown images so GLightbox can open them.
    var images = article.querySelectorAll('img');
    images.forEach(function (img) {
      if (img.closest('a')) return;

      var link = document.createElement('a');
      link.href = img.currentSrc || img.src;
      link.className = 'glightbox';
      link.setAttribute('data-gallery', 'content-images');
      link.setAttribute('aria-label', img.alt || 'Open image');

      img.parentNode.insertBefore(link, img);
      link.appendChild(img);
    });

    GLightbox({
      selector: '.md-content article a.glightbox'
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightbox);
  } else {
    initLightbox();
  }
})();


