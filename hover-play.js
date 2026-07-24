// Hover-to-play for YouTube thumbnails (data-yt-id="VIDEO_ID" on the thumb container).
// On mouseenter/focus, swaps the static thumbnail for a muted, autoplaying embed.
// On mouseleave/blur, removes the embed so playback stops (and the thumbnail returns).
(function () {
  function play(container) {
    if (container.querySelector('iframe')) return;
    var id = container.getAttribute('data-yt-id');
    if (!id) return;
    var origin = window.location.origin && window.location.origin !== 'null'
      ? window.location.origin
      : '';
    var iframe = document.createElement('iframe');
    iframe.className = 'yt-embed-frame';
    iframe.src = 'https://www.youtube.com/embed/' + id +
      '?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&rel=0&loop=1&playlist=' + id +
      (origin ? '&origin=' + encodeURIComponent(origin) : '') +
      '&enablejsapi=1';
    iframe.setAttribute('allow', 'autoplay; encrypted-media');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    container.appendChild(iframe);
    container.classList.add('is-playing');
  }

  function stop(container) {
    var iframe = container.querySelector('iframe.yt-embed-frame');
    if (iframe) iframe.remove();
    container.classList.remove('is-playing');
  }

  document.querySelectorAll('[data-yt-id]').forEach(function (el) {
    el.addEventListener('mouseenter', function () { play(el); });
    el.addEventListener('mouseleave', function () { stop(el); });
    el.addEventListener('focus', function () { play(el); });
    el.addEventListener('blur', function () { stop(el); });
  });
})();
