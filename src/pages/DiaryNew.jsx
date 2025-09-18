import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Homepagelogo from "../assets/homepagelogo.svg";
import Homefire from "../assets/homefire.png";
import Homeproteinbar from "../assets/homeproteinbar.svg";
import Homecarbsbar from "../assets/homecarbsbar.svg";
import Homefatbar from "../assets/homefatbar.svg";
import NavigationBar from "../components/NavBar";
import BottomSheet from "../components/BottomSheet";
import ChartWeight from "../components/ChartWeight";
import NotificationBell from "../assets/notificationbell.svg";
import DemoCharts from "../components/DemoCharts";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Notification from "./Notification";
import Fire from "../assets/fire.json";
import Lottie from "lottie-react";
import CurrentTime from "../components/CurrentTime"; 
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, color } from "framer-motion";
Chart.register(ChartDataLabels);

import { useUser } from "../context/UserContext";
import {
  fetchWeightRecords,
  upsertUserStreakRow,
} from "../utils/supabaseQueries";

const { getLocalDateString } = CurrentTime;

const DiaryNew = () => {
  const location = useLocation();
  // const navigate = useNavigate();
  const { calculatedCalories } = useUser();
  const [labels, setLabels] = useState([]);
  const [data, setData] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(false); // 🔄 Used to refetch
  const [activeTab, setActiveTab] = useState(() => {
    const routeToTabMap = {
      "/diary": "Diary",
      "/workout": "Workout",
      "/diet": "Diet",
      "/profile": "Profile",
    };
    return routeToTabMap[location.pathname] || "Diary";
  });

  const [isFabOpen, setIsFabOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleNotification = () => {
    setShowNotification(!showNotification);
  };
  const handleNavChange = (tabName, isFabPressed) => {
    if (isFabPressed) {
      setIsFabOpen((prev) => !prev);
    } else {
      setActiveTab(tabName);
      setIsFabOpen(false);
    }
  };

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  // Cached value for instant paint
  const [streak, setStreak] = useState(() => {
    const n = Number(localStorage.getItem("streak_current") || "0");
    return Number.isFinite(n) ? n : 0;
  });

  // Compute and sync once per local day when Diary becomes visible
  useEffect(() => {
    if (!userId) return;

    let fired = false;

    const syncStreakIfNeeded = async () => {
      if (document.visibilityState !== "visible" || fired) return;
      fired = true;

      const today = getLocalDateString();
      const last = localStorage.getItem("streak_lastActive");
      const cachedCount = Number(localStorage.getItem("streak_current") || "0");

      // Skip network if already synced today
      if (last === today) return;

      // Compute next count purely on client
      let nextCount;
      if (!last) {
        nextCount = 1;
      } else {
        const dLast = new Date(`${last}T00:00:00`);
        const dToday = new Date(`${today}T00:00:00`);
        const diffDays = Math.round((dToday - dLast) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) nextCount = cachedCount + 1;
        else nextCount = 1; // streak broken or first after gap
      }

      // Write to DB (single upsert) and mirror cache
      const { data, error } = await upsertUserStreakRow({
        userId,
        lastActiveDate: today,
        currentStreak: nextCount,
      });

      if (!error && data) {
        localStorage.setItem("streak_lastActive", today);
        localStorage.setItem(
          "streak_current",
          String(data.current_streak ?? nextCount)
        );
        setStreak(Number(data.current_streak ?? nextCount));
      }
    };

    const onVisibility = () => syncStreakIfNeeded();
    const onPageShow = () => syncStreakIfNeeded();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);

    // Attempt immediately if already visible
    syncStreakIfNeeded();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [userId]);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    fetchWeightRecords(userId).then(({ data, error }) => {
      if (error) {
        console.error("Error fetching weight records:", error.message);
      } else if (data && data.length > 0) {
        const sortedData = data.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setLabels(
          sortedData.map((record) => {
            const d = new Date(record.date);
            return `${d.getDate()}/${d.getMonth() + 1}`; // e.g., 20/3
          })
        );
        setData(sortedData.map((record) => record.weight_record));
      } else {
        console.log("No weight records found");
      }
    });
  }, [refreshFlag]);

  const triggerRefresh = () => setRefreshFlag((prev) => !prev); // flip to trigger

  return (
    <AnimatePresence>
      <div
        className="flex flex-col justify-between items-center"
        style={{
          background: "#FFFFFF",
        }}
      >
        <div className="flex justify-between items-end">
          <h1
            className="text-[#2D3436] font-semibold font-urbanist text-[28px] mt-[65px]"
            style={{
              lineHeight: "1",
              textAlign: "left",
              width: "325px",
            }}
          >
            Hello, Champ! Complete your daily nutrition
          </h1>
          <div
            className="mb-[10px] mr-[-5px] flex justify-center items-center w-[51px] h-[51px] rounded-[50%] border border-[#E9ECEF] bg-white"
            style={{ boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)" }}
            onClick={handleNotification}
          >
            <NotificationBell />
          </div>
        </div>
        {showNotification && (
          <motion.div
            className="flex justify-center items-center z-[90] absolute bg-black/50 w-[100%] h-[100%]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Notification onClose={() => setShowNotification(false)} />
          </motion.div>
        )}
        <div>
          <div className="items-center mt-[14px]">
            <div
              className="border bg-white border-[#E9ECEF] border-[1px] rounded-[23px] w-[384px] h-[391px]"
              style={{ boxShadow: "0px 4px 14px rgba(0, 0, 0, 0.08)" }}
            >
              <div className="flex justify-between mt-[5px] ml-[15px]">
                <span className="text-[#2D3436] font-urbanist text-[22px]">
                  Food Log Calories
                </span>
                <div className="flex justify-center items-center gap-x-[3px] mr-[15px]">
                  <Lottie
                    animationData={Fire}
                    autoplay={true}
                    loop={2}
                    style={{ width: 25, height: 25 }}
                  />
                  <span className="text-[#FF0000] font-urbanist font-bold text-[18px]">
                    {streak}
                  </span>
                </div>
              </div>
              <div className="justify-center mt-[20px] relative">
                <Homepagelogo className="relative justify-center w-full items-center" />
                <p>
                  <span className="absolute mt-[80px] items-center text-[#2D3436] font-urbanist font-bold inset-0 m-auto w-[100px] h-[5px] text-[50px]">
                    {calculatedCalories.toFixed(0)}
                  </span>
                  <span className="absolute mt-[150px] items-center text-[#6C757D] font-urbanist m-auto mr-[75px] inset-0 w-[180px] h-[5px] text-[20px]">
                    Kcal Remaining
                  </span>
                </p>
                <div className="flex ml-[10px] gap-x-[20px]">
                  <div className="flex">
                    <Homeproteinbar className="h-[55px] w-[55px]" />
                    <div className="flex flex-col items-start ml-[10px]">
                      <span className="text-[#6C757D] font-urbanist text-[15px]">
                        Protein
                      </span>
                      <div className="flex items-baseline">
                        <span className="text-[#2D3436] font-urbanist font-semibold text-[17px]">
                          {((calculatedCalories * 0.15) / 4).toFixed(0)}
                        </span>
                        <span className="text-[#6C757D] font-urbanist font-semibold text-[14px] ml-[2px]">
                          g
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex">
                    <Homecarbsbar className="h-[55px] w-[55px] " />
                    <div className="flex flex-col items-start ml-[10px]">
                      <span className="text-[#6C757D] font-urbanist text-[15px]">
                        Carbs
                      </span>
                      <div className="flex items-baseline">
                        <span className="text-[#2D3436] font-urbanist font-semibold text-[17px]">
                          {((calculatedCalories * 0.6) / 4).toFixed(0)}
                        </span>
                        <span className="text-[#6C757D] font-urbanist font-semibold text-[14px] ml-[2px]">
                          g
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex">
                    <Homefatbar className="h-[55px] w-[55px] " />
                    <div className="flex flex-col items-start ml-[10px]">
                      <span className="text-[#6C757D] font-urbanist text-[15px]">
                        Fat
                      </span>
                      <div className="flex items-baseline">
                        <span className="text-[#2D3436] font-urbanist font-semibold text-[17px]">
                          {(
                            (calculatedCalories -
                              (calculatedCalories * 0.15).toFixed(0) -
                              (calculatedCalories * 0.6).toFixed(0)) /
                            9
                          ).toFixed(0)}
                        </span>
                        <span className="text-[#6C757D] font-urbanist font-semibold text-[14px] ml-[2px]">
                          g
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="border border-[#E9ECEF] border-[1px] rounded-[23px] w-[384px] h-[262px] mt-[8px]"
            style={{ boxShadow: "0px 4px 14px rgba(0, 0, 0, 0.08)" }}
          >
            <h1 className="mt-[5px] ml-[15px]">
              <span className="text-[#2D3436] font-urbanist text-[22px]">
                Weight in kg
              </span>
            </h1>

            <div className="flex justify-center mt-[10px] scroll-smooth-x">
              <DemoCharts labels={labels} dataPoints={data} />
            </div>
          </div>
        </div>
        <BottomSheet
          isOpen={isFabOpen}
          onClose={() => setIsFabOpen(false)}
          onWeightSubmitSuccess={triggerRefresh}
        />
        <NavigationBar
          activeTab={activeTab}
          onTabChange={handleNavChange}
          isFabOpen={isFabOpen}
        />
      </div>
    </AnimatePresence>
  );
};
export default DiaryNew;
