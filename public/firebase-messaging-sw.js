/* eslint-disable no-undef */
import { precacheAndRoute } from 'workbox-precaching';

// Precache all assets
precacheAndRoute(self.__WB_MANIFEST || []);

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

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'Diet Delta';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icons/download192.png',
    badge: '/icons/notificationicon.png',
    data: payload.data,
    tag: 'dietdelta-notification', // ← Prevents duplicates
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Open your app when notification is clicked
  event.waitUntil(
    clients.openWindow('/')
  );
});