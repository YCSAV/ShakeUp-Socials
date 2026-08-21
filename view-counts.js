// Live YouTube view counts — finds every element tagged data-yt-id (the same
// attribute hover-play.js already uses) and fetches its current view count
// from the YouTube Data API, then renders a small pill badge on the thumb.
//
// Requires a free YouTube Data API v3 key:
//   1. https://console.cloud.google.com/apis/library/youtube.googleapis.com
//      → enable "YouTube Data API v3" on a Google Cloud project.
//   2. Create an API key under APIs & Services → Credentials.
//   3. Restrict it (Application restrictions → Websites) to your live
//      domain so it can't be copied and used elsewhere.
//   4. Paste it below in place of YOUR_YOUTUBE_API_KEY_HERE.
//
// Until a real key is set, this script quietly does nothing — thumbnails
// look and behave exactly as they do today, no broken requests, no errors.
(function () {
  var YT_API_KEY = 'AIzaSyBsGcVnilJfDbTeJi1YsUuLco36Hh8q5is';

  if (!YT_API_KEY || YT_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') return;

  // Skip any thumb explicitly opted out of the view-count badge
  // (data-no-views), while still letting hover-play.js target it normally.
  var containers = document.querySelectorAll('[data-yt-id]:not([data-no-views])');
  if (!containers.length) return;

  var ids = Array.from(new Set(
    Array.from(containers)
      .map(function (el) { return el.getAttribute('data-yt-id'); })
      .filter(Boolean)
  ));
  if (!ids.length) return;

  function formatCount(n) {
    // Always round to a whole number in whatever unit applies — no decimals,
    // ever — so every badge reads the same way (336K, not 336K next to 414.9K).
    n = Number(n) || 0;
    if (n >= 1e9) return Math.round(n / 1e9) + 'B';
    if (n >= 1e6) return Math.round(n / 1e6) + 'M';
    if (n >= 1e3) return Math.round(n / 1e3) + 'K';
    return String(n);
  }

  function renderBadge(container, count) {
    if (container.querySelector('.yt-badge')) return;
    var badge = document.createElement('span');
    badge.className = 'yt-badge';
    badge.innerHTML =
      '<svg class="icon ic-3"><use href="#ic-eye"/></svg>' +
      '<span>' + formatCount(count) + ' views</span>';
    container.appendChild(badge);
    // Defer to next frame so the CSS transition actually fires.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { badge.classList.add('is-visible'); });
    });
  }

  // YouTube's API allows up to 50 IDs per request — batch to keep quota low
  // (a whole page of videos costs 1 request / 1 quota unit, not one each).
  var batches = [];
  for (var i = 0; i < ids.length; i += 50) batches.push(ids.slice(i, i + 50));

  batches.forEach(function (batch) {
    var url = 'https://www.googleapis.com/youtube/v3/videos' +
      '?part=statistics&id=' + batch.join(',') + '&key=' + YT_API_KEY;

    fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data || !Array.isArray(data.items)) return;
        data.items.forEach(function (item) {
          var count = item.statistics && item.statistics.viewCount;
          if (count == null) return;
          document
            .querySelectorAll('[data-yt-id="' + item.id + '"]:not([data-no-views])')
            .forEach(function (container) { renderBadge(container, count); });
        });
      })
      .catch(function () {
        // Fail silently — thumbnails simply show without a view badge.
      });
  });
})();
