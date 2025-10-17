import React, { useEffect, useRef, useState } from "react";
import BackArrow from "../assets/backarrow.svg";
import { useNavigate, useLocation } from "react-router-dom";
import DayDate from "../components/DayDate";
import WorkoutCard from "../components/WorkoutCard";
import NavigationBar from "../components/NavBar";
import { fetchUserWorkoutWithDetails } from "../utils/supabaseQueries";
import { useAuth } from "../context/AuthContext";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dayIndex(day) {
  const i = DAYS.indexOf(String(day).slice(0, 3));
  return i === -1 ? 0 : i;
}

const WorkoutNew = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ready } = useAuth(); // from your AuthProvider
  const [activeTab, setActiveTab] = useState("");
  const [workoutsByDay, setWorkoutsByDay] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const prevDayRef = useRef(null);
  const [slideDir, setSlideDir] = useState("none");

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
    // wrap-around aware direction: moving forward => slide from right to left
    const diff = (curIdx - prevIdx + 7) % 7;
    if (diff === 0) {
      setSlideDir("none");
    } else if (diff <= 3) {
      setSlideDir("left"); // e.g., Tue -> Wed
    } else {
      setSlideDir("right"); // e.g., Wed -> Tue (backwards)
    }
    prevDayRef.current = selectedDay;
  }, [selectedDay]);

  // Keep userId in React state so it’s reactive
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

  // Fetch on auth ready + userId + selectedDay
  useEffect(() => {
    // Don’t attempt fetch until auth bootstrap and userId exist
    if (!ready || !userId || !selectedDay) return;

    let cancelled = false;
    const run = async () => {
      setLoading(true);
      const { data, error } = await fetchUserWorkoutWithDetails(userId);
      if (cancelled) return;
      if (error) {
        console.error("Error fetching workout data:", error.message);
        setWorkoutsByDay({});
        setLoading(false);
        return;
      }
      if (Array.isArray(data) && data.length > 0) {
        const grouped = data.reduce((acc, item) => {
          const day = item.day_of_week;
          const ex = item.exercises
            ? {
                exercise_name: item.exercise_name,
                target: item.exercises.target,
                rest: item.exercises.rest,
                gif_url: item.exercises.gif_url,
                reps: item.reps,
                sets: item.sets,
              }
            : {
                exercise_name: item.exercise_name,
                reps: item.reps,
                sets: item.sets,
              };
          if (!acc[day]) acc[day] = [];
          acc[day].push(ex);
          return acc;
        }, {});
        setWorkoutsByDay(grouped);
      } else {
        setWorkoutsByDay({});
        console.log("No workout plans found for this user.");
      }
      setLoading(false);
    };
    run();

    return () => {
      cancelled = true;
    };
  }, [ready, userId, selectedDay]);

  // Set day from DayDate
  const handleDateChange = (dateObj) => {
    setSelectedDay(dateObj.day);
  };

  const isReady = !loading && selectedDay;

  return (
    <div className="df-viewport">
      <div className="df-canvas df-canvas-full">
        <main className="workout-page">
          {/* Back Arrow */}
          <button 
            className="workout-back-btn" 
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <BackArrow className="workout-back-icon" />
          </button>

          {/* Day Date Selector */}
          <div className="workout-date-wrap">
            <DayDate onDateChange={handleDateChange} />
          </div>

          {/* Workout Cards List */}
          <div className="workout-list">
            {!isReady ? (
              <p className="workout-empty">Loading workouts...</p>
            ) : (
              <div
                key={selectedDay}
                className={`workout-slides ${
                  slideDir === "left"
                    ? "enter-left"
                    : slideDir === "right"
                    ? "enter-right"
                    : "enter-none"
                }`}
              >
                {(workoutsByDay[selectedDay] || []).map((exercise, index) => (
                  <WorkoutCard
                    key={index}
                    exercise={exercise}
                    viewMode="client-view"
                  />
                ))}
                {(workoutsByDay[selectedDay]?.length === 0 ||
                  !workoutsByDay[selectedDay]) && (
                  <p className="workout-empty">No workouts for {selectedDay}</p>
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
    </div>
  );
};

export default WorkoutNew;
