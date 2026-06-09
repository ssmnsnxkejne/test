// Service Worker for D&D 5E 人物卡生成器 PWA
const CACHE_NAME = 'dnd-char-card-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Install: 预缓存核心资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: 网络优先，离线回退
self.addEventListener('fetch', event => {
  // 跳过非 GET 请求和 chrome-extension 等
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.protocol === 'chrome-extension:' || url.protocol === 'edge:' || url.protocol === 'file:') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 缓存成功的 HTML/JS/CSS 请求
        if (response.ok && (url.pathname.endsWith('.html') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.json') || url.pathname === '/' || url.pathname.endsWith('./'))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
