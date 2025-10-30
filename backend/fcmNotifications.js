// backend/fcmNotifications.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

// Store or update FCM token
async function storeFcmToken(req, res) {
  try {
    const { userId, fcmToken, deviceInfo } = req.body;

    if (!userId || !fcmToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId and fcmToken are required' 
      });
    }

    // Use upsert to insert new or update existing token
    const { data, error } = await supabase
      .from('fcm_tokens')
      .upsert({ 
        user_id: userId,
        token: fcmToken,
        device_info: deviceInfo || null,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id,token',  // Don't duplicate same token for same user
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('Error storing FCM token:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to store FCM token' 
      });
    }

    res.json({ 
      success: true, 
      message: 'FCM token stored successfully',
      data 
    });

  } catch (error) {
    console.error('Error in storeFcmToken:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

// Remove token (when user logs out)
async function removeFcmToken(req, res) {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'fcmToken is required' 
      });
    }

    const { error } = await supabase
      .from('fcm_tokens')
      .delete()
      .eq('token', fcmToken);

    if (error) {
      console.error('Error removing FCM token:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to remove FCM token' 
      });
    }

    res.json({ 
      success: true, 
      message: 'FCM token removed successfully' 
    });

  } catch (error) {
    console.error('Error in removeFcmToken:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

// Get all tokens for a user (for sending notifications to all devices)
async function getUserTokens(userId) {
  const { data, error } = await supabase
    .from('fcm_tokens')
    .select('token')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user tokens:', error);
    return [];
  }

  return data.map(row => row.token);
}

// Clean up old tokens (run this periodically)
async function cleanupStaleTokens() {
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

  const { error } = await supabase
    .from('fcm_tokens')
    .delete()
    .lt('updated_at', twoMonthsAgo.toISOString());

  if (error) {
    console.error('Error cleaning up stale tokens:', error);
  }
}

module.exports = { 
  storeFcmToken, 
  removeFcmToken, 
  getUserTokens,
  cleanupStaleTokens 
};
