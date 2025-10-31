/* eslint-disable no-undef */
// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBi5g55CPAX1tGg7Tzi9AlqgAMt3noxjoE",
  authDomain: "diet-delta-9db39.firebaseapp.com",
  projectId: "diet-delta-9db39",
  storageBucket: "diet-delta-9db39.firebasestorage.app",
  messagingSenderId: "456610766651",
  appId: "1:456610766651:web:5dcf1a873732e7c845e11e",
  measurementId: "G-JFEQJQ8LGB",
});

const messaging = firebase.messaging();

// ✅ Handle background messages with custom notification
// This REPLACES Firebase's default notification
self.addEventListener('push', (event) => {
  console.log('📩 Raw push received');
  
  const payload = event.data.json();
  const notification = payload.notification || {};
  
  const notificationTitle = notification.title || 'Diet Delta';
  const notificationOptions = {
    body: notification.body || 'You have a new notification',
    icon: '/icons/download192.png',
    badge: '/icons/notificationicon.png',
    tag: 'dietdelta-notification',
    renotify: false,
    vibrate: [200, 100, 200]
  };
  
  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('✅ Firebase messaging service worker loaded with custom handler');
