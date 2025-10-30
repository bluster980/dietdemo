import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase-config';

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      
      console.log('FCM Token:', token);
      
      // Send this token to your backend to save it
      await saveTokenToBackend(token);
      
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};


// Save token to your backend
const saveTokenToBackend = async (token) => {
  try {
    const userId = localStorage.getItem('userId');
    const jwtToken = localStorage.getItem('token');
    
    // Get device info (optional)
    const deviceInfo = `${navigator.userAgent.substring(0, 100)}`;
    
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/fcm/store-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({
        userId: userId,
        fcmToken: token,
        deviceInfo: deviceInfo
      })
    });
    
    const result = await response.json();
    console.log('Token saved:', result);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

// Remove token on logout
export const removeTokenOnLogout = async () => {
  try {
    const token = await messaging.getToken();
    
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/fcm/remove-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fcmToken: token })
    });
  } catch (error) {
    console.error('Error removing token:', error);
  }
};
// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      resolve(payload);
    });
  });
