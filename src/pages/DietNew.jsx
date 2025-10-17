import React, { useState, useEffect, useRef } from "react";
import BackArrow from "../assets/backarrow.svg";
import { useNavigate, useLocation } from "react-router-dom";
import DayDate from "../components/DayDate";
import NavigationBar from "../components/NavBar";
import DietCard from "../components/DietCard";
import { fetchUserDietWithDetails } from "../utils/supabaseQueries";
import { useAuth } from "../context/AuthContext";
import "../styles/dietresponsive.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dayIndex(day) {
  const i = DAYS.indexOf(String(day).slice(0, 3));
  return i === -1 ? 0 : i;
}

const Diet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ready } = useAuth();
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(true);
  const [dietByMealTime, setDietByMealTime] = useState({});
  const [userId, setUserId] = useState(null);
  const prevDayRef = useRef(null);
  const [slideDir, setSlideDir] = useState("none");
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const uid = localStorage.getItem("user_id");
    setUserId(uid || null);
  }, []);

  useEffect(() => {
    const pathToTab = {
      "/diary": "Diary",
      "/workout": "Workout",
      "/diet": "Diet",
      "/profile": "Profile",
    };
    setActiveTab(pathToTab[location.pathname] || "");
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleDateChange = (dateObj) => {
    setSelectedDay(dateObj.day);
  };

  useEffect(() => {
    if (!selectedDay) return;
    const prev = prevDayRef.current;
    if (!prev) {
      prevDayRef.current = selectedDay;
      setSlideDir("none");
      return;
    }
    const curIdx = dayIndex(selectedDay);
    const prevIdx = dayIndex(prev);
    const diff = (curIdx - prevIdx + 7) % 7;
    if (diff === 0) setSlideDir("none");
    else if (diff <= 3) setSlideDir("left");
    else setSlideDir("right");
    prevDayRef.current = selectedDay;
  }, [selectedDay]);

  useEffect(() => {
    if (!ready || !userId) return;
    let cancelled = false;
    const fetchData = async () => {
      const { data, error } = await fetchUserDietWithDetails(userId);
      if (cancelled) return;

      if (error) {
        console.error("Error fetching diet data:", error.message);
        setDietByMealTime({});
        setLoading(false);
        return;
      }

      if (Array.isArray(data) && data.length > 0) {
        const grouped = data.reduce((acc, item) => {
          const { meal_time, meals, quantity, meal_name } = item;
          if (!meal_time) return acc;
          if (!acc[meal_time]) acc[meal_time] = [];
          if (meals) {
            acc[meal_time].push({
              ...meals,
              meal_name: meals.meal_name || meal_name,
              quantity: quantity ?? 0,
            });
          }
          return acc;
        }, {});
        setDietByMealTime(grouped);
      } else {
        setDietByMealTime({});
        console.log("No diet plans found for this user.");
      }
      setLoading(false);
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [ready, userId]);

  const isReady = !loading;
  const ORDER = { breakfast: 0, lunch: 1, dinner: 2, snacks: 3 };

  const sortedEntries = Object.entries(dietByMealTime)
    .filter(([, meals]) => Array.isArray(meals) && meals.length > 0)
    .sort(([a], [b]) => {
      const ra = ORDER[a?.toLowerCase?.()] ?? Number.POSITIVE_INFINITY;
      const rb = ORDER[b?.toLowerCase?.()] ?? Number.POSITIVE_INFINITY;
      return ra - rb;
    });

  return (
    <div className="df-viewport">
      <main className="diet-page">
        {/* Back Arrow */}
        <button 
          className="diet-back-btn" 
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <BackArrow className="diet-back-icon" />
        </button>

        {/* Day Date Selector */}
        <div className="diet-date-wrap">
          <DayDate onDateChange={handleDateChange} />
        </div>

        {/* Diet Cards List */}
        <div className="diet-list">
          {!isReady ? (
            <p className="diet-empty">Loading diet plan...</p>
          ) : (
            <div
              key={selectedDay || "static"}
              className={`diet-slides ${
                slideDir === "left"
                  ? "enter-left"
                  : slideDir === "right"
                  ? "enter-right"
                  : "enter-none"
              }`}
            >
              {sortedEntries.length > 0 ? (
                sortedEntries.map(([mealTime, meals], idx) => (
                  <div
                    key={mealTime}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <DietCard title={mealTime} meals={meals} />
                  </div>
                ))
              ) : (
                <p className="diet-empty">No diet plan configured</p>
              )}
            </div>
          )}
        </div>

        {/* Navigation Bar */}
        <div className="nav-wrap">
          <NavigationBar activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </main>
    </div>
  );
};

export default Diet;
