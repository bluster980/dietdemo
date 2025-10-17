import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import NotificationBell from "../assets/notificationbell.svg";
import Homepagelogo from "../assets/homepagelogo.svg";
import Homeproteinbar from "../assets/homeproteinbar.svg";
import Homecarbsbar from "../assets/homecarbsbar.svg";
import Homefatbar from "../assets/homefatbar.svg";
import DemoCharts from "../components/DemoCharts";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import BottomSheet from "../components/BottomSheet";
import NavigationBar from "../components/NavBar";
import Notification from "./Notification";
import Fire from "../assets/fire.json";
import { useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
// import BigRadial from "../components/BigRadial";
import CalorieRing from "../components/CalorieRing";
import MiniMeter from "../components/MiniMeter";
import MacrosSizer from "../components/MacrosSizer";
// import "./diary-responsive.css";
import CurrentTime from "../components/CurrentTime";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, color } from "framer-motion";
Chart.register(ChartDataLabels);

import {
  fetchWeightRecords,
  upsertUserStreakRow,
} from "../utils/supabaseQueries";

const { getLocalDateString } = CurrentTime;


export default function DiaryResponsive() {
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
    <div className="df-viewport">
      <div className="df-canvas df-canvas-full">
        <main className="page" 
        style={{
            paddingBottom: '80px',
            minHeight: '100vh',
            maxHeight: '100vh',
            overflowY: 'auto',
            boxSizing: 'border-box'
          }}>
          {/* Top bar */}
          <header className="topbar">
            <h1 className="title" style={{ color: "var(--general-charcoal-text)" }}>
              Hello, Champ! Complete your daily nutrition
            </h1>
            <button
              className="bell"
              aria-label="Notifications"
              onClick={handleNotification}
              style={{ backgroundColor: "var(--profile-section-card-bg)", borderColor: "var(--profile-border)" }}
            >
              <NotificationBell style={{ color: "var(--notification-bell)" }} />
            </button>
          </header>

          {/* Food card */}
          <section className="card" style={{ backgroundColor: "var(--profile-section-card-bg)", borderColor: "var(--profile-border)" }}>
            <div className="card-head">
              <span className="card-title" style={{ color: "var(--general-charcoal-text)" }}>Food Log Calories</span>
              <div className="streak">
                <Lottie
                  animationData={Fire}
                  autoplay
                  loop={2}
                  style={{ width: 24, height: 24 }}
                />
                <span className="streak-count">{streak}</span>
              </div>
            </div>

            <div
              style={{
                width: "100%", // or any fixed/max width
                maxWidth: "250px",
                aspectRatio: "1 / 1", 
                margin: "0 auto",
                marginTop: "20px",
              }}
            >
              <CalorieRing
                size={300} // virtual coordinate space
                strokeWidth={14}
                progress={2125 / 6500}
                value={calculatedCalories}
                middleCircle="var(--calorie-ring-mid-circle)"
                trackColor="var(--calorie-ring-track)"
                calorieRingValueColor="var(--calorie-ring-value)"
                calorieRingUnitColor="var(--faded-text)"
              />
            </div>
            <MacrosSizer>
              {({ iconPx }) => (
                <div className="macros">
                  <div className="macro">
                    <MiniMeter size={iconPx} value={40} color="var(--protein-track)" />
                    <div className="macro-info">
                      <span className="macro-label" style={{ color: "var(--faded-text)" }}>Protein</span>
                      <span className="macro-value" style={{ color: "var(--general-charcoal-text)" }}>
                        {((calculatedCalories * 0.15) / 4).toFixed(0)}<span className="unit" style={{ color: "var(--macros-unit)" }}> g</span>
                      </span>
                    </div>
                  </div>
                  <div className="macro ml-[4px]">
                    <MiniMeter size={iconPx} value={60} color="var(--carbs-track)" />
                    <div className="macro-info">
                      <span className="macro-label" style={{ color: "var(--faded-text)" }}>Carbs</span>
                      <span className="macro-value" style={{ color: "var(--general-charcoal-text)" }}>
                        {((calculatedCalories * 0.6) / 4).toFixed(0)}<span className="unit" style={{ color: "var(--macros-unit)" }}> g</span>
                      </span>
                    </div>
                  </div>
                  <div className="macro ml-[4px]">
                    <MiniMeter size={iconPx} value={30} color="var(--fat-track)" />
                    <div className="macro-info">
                      <span className="macro-label" style={{ color: "var(--faded-text)" }}>Fat</span>
                      <span className="macro-value" style={{ color: "var(--general-charcoal-text)" }}>
                        {(
                            (calculatedCalories -
                              (calculatedCalories * 0.15).toFixed(0) -
                              (calculatedCalories * 0.6).toFixed(0)) /
                            9
                          ).toFixed(0)}<span className="unit" style={{ color: "var(--macros-unit)" }}> g</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </MacrosSizer>
          </section>

          {/* Weight card */}
          <section className="card" style={{ backgroundColor: "var(--profile-section-card-bg)", borderColor: "var(--profile-border)" }}>
            <div className="card-head">
              <span className="card-title" style={{ color: "var(--general-charcoal-text)" }}>Weight in kg</span>
            </div>
            <div className="chart-wrap">
              <DemoCharts labels={labels} dataPoints={data} />
            </div>
          </section>

          {/* Overlays */}
          {showNotification && (
            <div className="overlay" onClick={() => setShowNotification(false)}>
              <div
                className="overlay-inner"
                onClick={(e) => e.stopPropagation()}
              >
                <Notification onClose={() => setShowNotification(false)} />
              </div>
            </div>
          )}

          {/* Bottom */}
          <BottomSheet
          isOpen={isFabOpen}
          onClose={() => setIsFabOpen(false)}
          onWeightSubmitSuccess={triggerRefresh}
        />
          <div className="nav-wrap">
            <NavigationBar
              activeTab={activeTab}
              onTabChange={handleNavChange}
              isFabOpen={isFabOpen}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
