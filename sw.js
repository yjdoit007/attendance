// 앱 화면 파일을 기기에 저장해 두어 인터넷이 없어도 열리게 해요. 출석 기록은 Firebase가 따로 저장·동기화해요.
const CACHE = "attendance-v1";
const SHELL = ["./", "index.html", "firebase-config.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isShell = url.origin === location.origin;
  const isLib = url.hostname === "www.gstatic.com" || url.hostname.endsWith("fonts.googleapis.com") || url.hostname.endsWith("fonts.gstatic.com");
  if (!isShell && !isLib) return; // Firebase 로그인·데이터 요청은 그대로 통과
  // 앱 파일은 새 버전을 먼저 받고, 안 되면 저장해 둔 걸 써요
  e.respondWith(fetch(req).then(res => {
    if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then(r => r || (req.mode === "navigate" ? caches.match("index.html") : undefined))));
});
