// src/utils/notifications.js
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase-config';

export const requestNotificationPermission = async (userId) => {
  try {
    // Validate userId exists
    if (!userId) {
      console.error('❌ Cannot request FCM permission: userId is missing');
      return null;
    }

    console.log('🔔 Requesting notification permission for user:', userId.substring(0, 8) + '...');

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      
      if (!token) {
        console.error('❌ Failed to get FCM token');
        return null;
      }

      console.log('📱 FCM Token obtained:', token.substring(0, 20) + '...');
      
      // Save token to backend with userId
      await saveTokenToBackend(userId, token);
      
      return token;
    } else {
      console.log('❌ Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting notification permission:', error);
    return null;
  }
};

const saveTokenToBackend = async (userId, fcmToken) => {
  try {
    console.log('🚀 Saving FCM token to backend...');
    
    const jwtToken = localStorage.getItem('access_token'); // Your JWT token key
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    
    if (!backendUrl) {
      console.error('❌ VITE_BACKEND_URL is not defined');
      return;
    }

    const response = await fetch(`${backendUrl}/api/fcm/store-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({
        userId: userId,
        fcmToken: fcmToken,
        deviceInfo: navigator.userAgent.substring(0, 100)
      })
    });
    
    const result = await response.json();
    console.log('📦 Backend response:', result);
    
    if (result.success) {
      console.log('✅ FCM token saved to backend successfully!');
    } else {
      console.error('❌ Failed to save FCM token:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error saving token to backend:', error);
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('📩 Foreground notification received:', payload);
      resolve(payload);
    });
  });
