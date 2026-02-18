(function() {
  function attemptPlay(videoElement) {
    if (!videoElement) {
      return;
    }

    videoElement.muted = true;
    videoElement.defaultMuted = true;
    videoElement.setAttribute('muted', '');
    videoElement.setAttribute('playsinline', '');
    videoElement.setAttribute('autoplay', '');
    videoElement.setAttribute('loop', '');

    var playPromise = videoElement.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function() {});
    }
  }

  function initVideos(scope) {
    var root = scope || document;
    var videoElements = root.querySelectorAll('.myVideo');
    if (!videoElements.length) {
      return;
    }

    videoElements.forEach(function(videoElement) {
      if (videoElement.readyState >= 2) {
        attemptPlay(videoElement);
        return;
      }

      videoElement.addEventListener(
        'loadeddata',
        function() {
          attemptPlay(videoElement);
        },
        { once: true }
      );
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    initVideos(document);
  });

  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState !== 'visible') {
      return;
    }
    initVideos(document);
  });

  if (window.Shopify && Shopify.designMode) {
    document.addEventListener('shopify:section:load', function(event) {
      initVideos(event.target);
    });
  }
})();
