// UserContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getUserFromDb, getTrainerFromDb } from "../utils/supabaseQueries";
import { requestNotificationPermission, onMessageListener } from "../utils/pushnotifications"; // ← ADD THIS

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserDataState] = useState(null);
  const [calculatedCalories, setCalculatedCalories] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastQnaTime, setLastQnaTime] = useState(null);
  const [lastMeetingDate, setLastMeetingDate] = useState(null);
  const [fcmToken, setFcmToken] = useState(null); 

 // 🗑️ CLEANUP: Remove VitePWA service worker (keep only Firebase)
  useEffect(() => {
    const cleanupServiceWorkers = async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        console.log('🔍 Found', registrations.length, 'service workers');
        
        for (const registration of registrations) {
          const scriptURL = registration.active?.scriptURL || '';
          
          // Remove VitePWA service worker (/sw.js)
          if (scriptURL.includes('/sw.js')) {
            console.log('🗑️ Removing VitePWA service worker:', scriptURL);
            await registration.unregister();
            console.log('✅ VitePWA service worker removed!');
          } else if (scriptURL.includes('firebase-messaging-sw.js')) {
            console.log('✅ Keeping Firebase service worker:', scriptURL);
          }
        }
        
        // Verify cleanup
        const remaining = await navigator.serviceWorker.getRegistrations();
        console.log('📊 Remaining service workers:', remaining.length);
        
        if (remaining.length === 1 && remaining[0].active?.scriptURL.includes('firebase-messaging-sw.js')) {
          console.log('✅ SUCCESS: Only Firebase SW is active now!');
        }
      }
    };
    
    cleanupServiceWorkers();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);

      // Try localStorage first, for fast load
      let parsed;
      try {
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData && storedUserData !== "undefined") {
          parsed = JSON.parse(storedUserData);
          if (parsed && parsed.user_id) {
            setUserDataState(parsed);
          }
        }
      } catch (err) {
        console.error("Failed to parse stored userData:", err);
      }

      //  Always fallback to fresh DB fetch (if user_id is present)
      const uid = localStorage.getItem("user_id");
      const token = localStorage.getItem("access_token");
      if ((!parsed || !parsed.user_id) && uid && token) {
        const { data, error } = await getUserFromDb(uid); // ensure this attaches Authorization + apikey
        if (data) {
          setUserDataState(data);
          localStorage.setItem("userData", JSON.stringify(data));
        } else if (error) {
          console.warn("Failed to fetch from DB:", error);
        }
      } else if (parsed?.user_id) {
        // Even if we had cached data, refresh from DB to stay current
        const { data, error } = await getUserFromDb(parsed.user_id);
        if (data) {
          setUserDataState(data);
          localStorage.setItem("userData", JSON.stringify(data));
        } else if (error) {
          console.warn("Failed to fetch from DB:", error);
        }
      }

      setIsLoading(false);
    };
    fetchUserData();
  }, []);

  // Sync setUserData with localStorage
  const setUserData = (data) => {
    if (!data || typeof data !== "object" || !data.user_id) return;
    setUserDataState(data);
    localStorage.setItem("userData", JSON.stringify(data));

    // ← ADD THIS: Request FCM when user data is set
    if (data.user_id && !fcmToken) {
      requestNotificationPermission(data.user_id)
        .then(token => {
          if (token) {
            setFcmToken(token);
            console.log('✅ FCM setup complete');
          }
        })
        .catch(err => console.error('FCM setup failed:', err));
    }
  };



  const refreshUser = useCallback(async () => {
    const uid = localStorage.getItem("user_id");
    const token = localStorage.getItem("access_token");
    if (!uid || !token) return { data: null, error: "missing-credentials" };
    const { data, error } = await getUserFromDb(uid); // must attach apikey + Authorization
    if (data) setUserData(data);
    return { data, error };
  }, [fcmToken]);

  const refreshTrainer = useCallback(async () => {
    const uid = localStorage.getItem("user_id");
    const token = localStorage.getItem("access_token");
    if (!uid || !token) return { data: null, error: "missing-credentials" };
    const { data, error } = await getTrainerFromDb(uid); // must attach apikey + Authorization
    if (data) setUserData(data);
    return { data, error };
  }, [fcmToken]);

  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);
      // fast path from cache
      const stored = localStorage.getItem("userData");
      if (stored && stored !== "undefined") {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.user_id) setUserDataState(parsed);
          if (!fcmToken) {
              requestNotificationPermission(parsed.user_id)
                .then(token => {
                  if (token) setFcmToken(token);
                })
                .catch(err => console.error('FCM setup failed:', err));
            }
        } catch {
          console.error("Failed to parse stored userData:", stored);
        }
      }
      // always refresh from DB if credentials exist
      await refreshUser();
      await refreshTrainer();
      setIsLoading(false);
    };
    bootstrap();
  }, []);

  useEffect(() => {
    if (!userData?.user_id) return;

    const unsubscribe = onMessageListener()
      .then((payload) => {
        console.log('📩 Received notification:', payload);
        // Show toast or custom notification UI here
        // You can use react-hot-toast or your own notification component
        alert(`${payload.notification.title}\n${payload.notification.body}`);
      })
      .catch((err) => console.log('Failed to receive message:', err));

    return () => {
      // Cleanup if needed
    };
  }, [userData?.user_id]);

  const calculateCalories = (weight, height, age, gender, profession) => {
    if (!weight || !height || !age || !gender || !profession) {
      console.error("calculateCalories: invalid argument(s)");
      return;
    }

    let lifestyle = 1.2;
    if (profession === "moderate") lifestyle = 1.55;
    else if (profession === "heavy") lifestyle = 1.725;

    let calories;
    if (gender === "man") {
      calories = (10 * weight + 6.25 * height - 5 * age + 5) * lifestyle;
    } else {
      calories = (10 * weight + 6.25 * height - 5 * age - 161) * lifestyle;
    }

    setCalculatedCalories(calories);
  };

  useEffect(() => {
    const storedTime = localStorage.getItem("lastQnaTime");
    if (storedTime) setLastQnaTime(storedTime);
  }, []);

  useEffect(() => {
    if (lastQnaTime) {
      localStorage.setItem("lastQnaTime", lastQnaTime);
    }
  }, [lastQnaTime]);

  useEffect(() => {
    const storedDate = localStorage.getItem("lastMeetingDate");
    if (storedDate) setLastMeetingDate(storedDate);
  }, []);

  useEffect(() => {
    if (lastMeetingDate) {
      localStorage.setItem("lastMeetingDate", lastMeetingDate);
    }
  }, [lastMeetingDate]);

  // Recalculate calories when userData changes
  useEffect(() => {
    if (
      userData?.weight &&
      userData?.height &&
      userData?.age &&
      userData?.gender &&
      userData?.profession
    ) {
      calculateCalories(
        userData.weight,
        userData.height,
        userData.age,
        userData.gender,
        userData.profession
      );
    }
  }, [userData]);

  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        calculatedCalories,
        calculateCalories,
        isLoading,
        lastQnaTime,
        setLastQnaTime,
        lastMeetingDate,
        setLastMeetingDate,
        refreshUser,
        refreshTrainer,
        fcmToken,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
