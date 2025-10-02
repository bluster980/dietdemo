import React, { useEffect, useState } from "react";
import BackArrow from "../assets/backarrow.svg";
import { useNavigate, useLocation } from "react-router-dom";
import DayDate from "../components/DayDate";
import WorkoutCard from "../components/WorkoutCard";
import NavigationBar from "../components/NavBar";
import DumbellChest from "../assets/dumbellchest.gif";
import { fetchUserWorkoutWithDetails } from "../utils/supabaseQueries";

// get user_id from local storage
const userId = localStorage.getItem("user_id");

const WorkoutNew = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("");
  const [workoutsByDay, setWorkoutsByDay] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await fetchUserWorkoutWithDetails(userId);
      if (error) {
        console.error("Error fetching workout data:", error.message);
        setLoading(false);
        return;
      } else if (data.length > 0) {
        console.log("Fetched workout plan with exercise details:", data);

        // Group by day
        const grouped = data.reduce((acc, item) => {
          const day = item.day_of_week;
          // Merge plan row (reps, sets, exercise_name) with lookup fields from exercises
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

        setLoading(false);
      } else {
        console.log("No workout plans found for this user.");
      }
    };

    fetchData();
  }, []);

  const isReady = !loading && selectedDay;

  const handleDateChange = (dateObj) => {
    setSelectedDay(dateObj.day); // Needed to fetch correct day’s workouts
  };

  return (
    <div
      className="flex flex-col justify-between items-center"
      style={{
        background: "#FFFFFF",
      }}
    >
      <div className="flex flex-col">
        <BackArrow
          onClick={() => navigate(-1)}
          style={{
            width: "30px",
            height: "30px",
            position: "absolute",
            display: "flex",
            top: "40px",
            left: "5px",
            zIndex: 1,
          }}
        />
        <div className="flex flex-col mt-[80px]">
          <DayDate onDateChange={handleDateChange} />
        </div>
        <div
          className="flex flex-col w-full h-[73vh] overflow-y-scroll mt-4"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "transparent transparent",
          }}
        >
          {/* <div className="flex flex-col w-full h-[73vh] overflow-y-scroll mt-4"> */}
          {!isReady ? (
            <p className="text-center text-gray-500 mt-6">
              Loading workouts...
            </p> // ✅ loader while data fetches
          ) : (
            <>
              {(workoutsByDay[selectedDay] || []).map((exercise, index) => (
                <WorkoutCard key={index} exercise={exercise} viewMode="client-view" />
              ))}

              {(workoutsByDay[selectedDay]?.length === 0 ||
                !workoutsByDay[selectedDay]) && (
                <p className="text-center text-gray-400 mt-6">
                  No workouts for {selectedDay}
                </p>
              )}
            </>
          )}

          {/* </div> */}
        </div>
      </div>
      <NavigationBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};
export default WorkoutNew;
