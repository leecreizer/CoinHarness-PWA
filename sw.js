const CACHE = 'coinharness-mobile-v6';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.png', './icon.svg'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

// 같은 출처(앱 셸)만 SW가 처리. 업비트/alternative.me 등 외부 API는 SW를 거치지 않는다.
// 네트워크 우선 → 온라인이면 항상 최신 코드, 오프라인이면 캐시로 폴백(앱은 계속 열림).
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
  );
});
