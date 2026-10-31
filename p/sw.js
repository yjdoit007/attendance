// 학부모용 알림 받기: 앱이 닫혀 있어도, 다른 화면을 보고 있어도 푸시 알림을 띄워요.
// 알림 표시는 직접 해요(Firebase 기본 처리는 같은 사이트 화면이 열려 있으면 알림을 숨겨요).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {}); // 홈 화면 앱으로 설치할 수 있게 해요.
self.addEventListener("push", e => {
  let d = {};
  try { const j = e.data ? e.data.json() : {}; d = j.data || j.notification || j; } catch(err){ d = {body: e.data ? e.data.text() : ""}; }
  e.waitUntil(self.registration.showNotification(d.title || "출결 알림", {
    body: d.body || "", icon: "../icon-192.png", badge: "../icon-192.png", tag: d.tag || undefined, data: {link: d.link || "./"}
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL(e.notification.data?.link || "./", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({type: "window", includeUncontrolled: true}).then(list => {
    const w = list.find(c => c.url.startsWith(self.registration.scope));
    return w ? w.focus() : self.clients.openWindow(url);
  }));
});
