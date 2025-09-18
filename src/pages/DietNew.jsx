import React, { useState, useEffect } from "react";
import BackArrow from "../assets/backarrow.svg";
import { useNavigate, useLocation } from "react-router-dom";
import DayDate from "../components/DayDate";
import NavigationBar from "../components/NavBar";
import DietCard from "../components/DietCard";
import { fetchUserDietWithDetails } from "../utils/supabaseQueries";

const userId = localStorage.getItem("user_id");
const Diet = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dietByDayAndMeal, setDietByDayAndMeal] = useState({});

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
    setSelectedDay(dateObj.day); // e.g. 'Monday', 'Tuesday', etc.
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await fetchUserDietWithDetails(userId);
      if (error) {
        console.error("Error fetching diet data:", error.message);
        setLoading(false);
        return;
      }

      if (data.length > 0) {
        console.log("Fetched diet plan:", data);

        const grouped = data.reduce((acc, item) => {
          const { day_of_week, meal_time, meals } = item;

          if (!acc[day_of_week]) acc[day_of_week] = {};
          if (!acc[day_of_week][meal_time]) acc[day_of_week][meal_time] = [];

          if (meals)
            acc[day_of_week][meal_time].push({
              quantity: item.quantity,
              ...meals,
            }); // Only push if exists

          return acc;
        }, {});

        setDietByDayAndMeal(grouped);
      } else {
        console.log("No diet plans found for this user.");
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const isReady = !loading && selectedDay;
  const ORDER = { breakfast: 0, lunch: 1, dinner: 2, snacks: 3 };

  // Build sorted entries for selected day
  const sortedEntries = dietByDayAndMeal[selectedDay]
    ? Object.entries(dietByDayAndMeal[selectedDay])
        .filter(([, meals]) => Array.isArray(meals) && meals.length > 0)
        .sort(([a], [b]) => {
          const ra = ORDER[a?.toLowerCase?.()] ?? Number.POSITIVE_INFINITY;
          const rb = ORDER[b?.toLowerCase?.()] ?? Number.POSITIVE_INFINITY;
          return ra - rb;
        })
    : [];

  return (
    <div
      className="flex flex-col justify-between items-center"
      style={{
        background: "#FFFFFF",
      }}
    >
      <div className="flex flex-col">
        <BackArrow
          alt="back arrow"
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
          {!isReady ? (
            <p className="text-center text-gray-500 mt-6">Loading diet plan...</p>
          ) : sortedEntries.length > 0 ? (
            sortedEntries.map(([mealTime, meals]) => (
              <DietCard key={mealTime} title={mealTime} meals={meals} />
            ))
          ) : (
            <p className="text-center text-gray-400 mt-6">
              No diet plan for {selectedDay}
            </p>
          )}
        </div>
      </div>
      <NavigationBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Diet;
