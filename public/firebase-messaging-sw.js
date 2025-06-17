// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// ✅ 이 줄 추가 - Firebase 초기화
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// 백그라운드 메시지 처리
messaging.onBackgroundMessage((payload) => {
    console.log('백그라운드 메시지 수신:', payload);

    const notificationTitle = payload.notification?.title || '새 메시지';
    const notificationOptions = {
        body: payload.notification?.body || '새로운 채팅 메시지가 도착했습니다.',
        icon: '/timo-logo-notification.png',
        badge: '/timo-logo-notification.png',
        data: payload.data,
        tag: 'chat-notification',
        requireInteraction: true
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const data = event.notification.data;

    if (data?.chatRoomId) {
        event.waitUntil(
            clients.openWindow(`/chat?roomId=${data.chatRoomId}&tab=chat`)
        );
    } else {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
