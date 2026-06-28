// 星海 · 自动更新 service worker
// 策略:网络优先(network-first)——每次都先拿线上最新版,拿到就缓存一份;
// 离线/失败时回退到上次缓存。只管本站自己的文件(同源),embedding 模型那种
// 跨域 CDN 请求放行走浏览器原生缓存,不进这里,免得把几十 MB 模型塞进来。
const CACHE = 'starsea-v2';

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
