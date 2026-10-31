// 학부모용 알림 받기: 앱이 닫혀 있어도 푸시 알림을 띄워요.
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js", "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js", "../firebase-config.js");
firebase.initializeApp(self.FIREBASE_CONFIG);
firebase.messaging();
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {}); // 홈 화면 앱으로 설치할 수 있게 해요.
