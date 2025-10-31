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
    
    const jwtToken = localStorage.getItem('access_token');
    const backendUrl = import.meta.env.VITE_API_BASE_URL;
    
    console.log('🔍 Debug info:', {
      backendUrl,
      hasJwtToken: !!jwtToken,
      userId: userId?.substring(0, 8) + '...',
      tokenLength: fcmToken?.length
    });
    
    if (!backendUrl) {
      console.error('❌ VITE_API_BASE_URL is not defined in .env');
      return { success: false, error: 'Backend URL not configured' };
    }

    const url = `${backendUrl}/api/fcm/store-token`;
    console.log('📡 Sending request to:', url);

    const response = await fetch(url, {
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
    
    console.log('📡 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      console.error('❌ HTTP error:', response.status);
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    const result = await response.json();
    console.log('📦 Backend response:', result);
    
    if (result.success) {
      console.log('✅ FCM token saved to backend successfully!');
    } else {
      console.error('❌ Failed to save FCM token:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Network error saving token:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return { success: false, error: error.message };
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
