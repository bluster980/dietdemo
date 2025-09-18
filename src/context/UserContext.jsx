// UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserFromDb } from '../utils/supabaseQueries';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserDataState] = useState(null);
  const [calculatedCalories, setCalculatedCalories] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastQnaTime, setLastQnaTime] = useState(null);
  const [lastMeetingDate, setLastMeetingDate] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);

      // Try localStorage first, for fast load
      let parsed;
      try {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData && storedUserData !== 'undefined') {
          parsed = JSON.parse(storedUserData);
          if (parsed && parsed.user_id) {
            setUserDataState(parsed);
          }
        }
      } catch (err) {
        console.error('Failed to parse stored userData:', err);
      }

      //  Always fallback to fresh DB fetch (if user_id is present)
      if (parsed && parsed.user_id) {
        const { data, error } = await getUserFromDb(parsed.user_id);
        if (data) {
          setUserDataState(data); // Update context
          localStorage.setItem('userData', JSON.stringify(data)); // Sync localStorage
        } else if (error) {
          console.warn('Failed to fetch from DB:', error);
        }
      }
      setIsLoading(false);
    };
    fetchUserData();
  }, []);



  // Sync setUserData with localStorage
  const setUserData = (data) => {
    if (!data || typeof data !== 'object' || !data.user_id) {
      console.warn('[UserContext] ❌ Invalid userData being set:', data);
      return; // Prevent saving "undefined" again
    }

    setUserDataState(data);
    localStorage.setItem('userData', JSON.stringify(data));
  };


  const calculateCalories = (weight, height, age, gender, profession) => {
    if (!weight || !height || !age || !gender || !profession) {
      console.error('calculateCalories: invalid argument(s)');
      return;
    }

    let lifestyle = 1.2;
    if (profession === 'moderate') lifestyle = 1.55;
    else if (profession === 'heavy') lifestyle = 1.725;

    let calories;
    if (gender === 'man') {
      calories = (10 * weight + 6.25 * height - 5 * age + 5) * lifestyle;
    } else {
      calories = (10 * weight + 6.25 * height - 5 * age - 161) * lifestyle;
    }

    setCalculatedCalories(calories);
  };

  useEffect(() => {
    const storedTime = localStorage.getItem('lastQnaTime');
    if (storedTime) setLastQnaTime(storedTime);
  }, []);

  useEffect(() => {
    if (lastQnaTime) {
      localStorage.setItem('lastQnaTime', lastQnaTime);
    }
  }, [lastQnaTime]);

  useEffect(() => {
    const storedDate = localStorage.getItem('lastMeetingDate');
    if (storedDate) setLastMeetingDate(storedDate);
  }, []);

  useEffect(() => {
    if (lastMeetingDate) {
      localStorage.setItem('lastMeetingDate', lastMeetingDate);
    }
  }, [lastMeetingDate]);


  // Recalculate calories when userData changes
  useEffect(() => {
    if (userData?.weight && userData?.height && userData?.age && userData?.gender && userData?.profession) {
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
    <UserContext.Provider value={{ userData, setUserData, calculatedCalories, calculateCalories, isLoading, lastQnaTime, setLastQnaTime, lastMeetingDate, setLastMeetingDate }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

