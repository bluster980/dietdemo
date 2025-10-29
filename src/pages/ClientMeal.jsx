import { React, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BackArrow from "../assets/backarrow.svg";
import oatmeal from "../assets/oatmeal.png";
import ProfileEditPen from "../assets/profileeditpen.svg";
import Search from "../assets/search.svg";
import ClientDietCard from "../components/ClientDietCard";
import { fetchAllMeals, upsertDietPlansBulk } from "../utils/supabaseQueries";
import toast from "react-hot-toast";
import "../styles/clientmealresponsive.css";

const ClientMeal = () => {
  const location = useLocation();
  const routeUserId = location.state?.user_id;
  const clientName = location.state?.name;
  const navigate = useNavigate();
  const [isActiveTime, setActiveTime] = useState("Snacks");
  const [isPreviewEnabled, setIsPreviewEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allMeals, setAllMeals] = useState([]);

  const userId = routeUserId;

  useEffect(() => {
    const fetchMeals = async () => {
      const { data, error } = await fetchAllMeals();
      if (error) {
        console.error("Error fetching meals:", error.message);
      } else {
        setAllMeals(data);
      }
    };
    fetchMeals();
  }, []);

  const filteredMeals = allMeals.filter((mealObj) =>
    mealObj.meal_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const [timeMeals, setTimeMeals] = useState({
    Breakfast: [],
    Lunch: [],
    Snacks: [],
    Dinner: [],
  });

  function handlePreviewClick() {
    setIsPreviewEnabled(!isPreviewEnabled);
  }

  const addMeal = (mealToAdd) => {
    setTimeMeals((prev) => {
      const isDuplicate = prev[isActiveTime].some(
        (ml) => ml.meal_name === mealToAdd.meal_name
      );
      if (isDuplicate) return prev;
      return {
        ...prev,
        [isActiveTime]: [...prev[isActiveTime], mealToAdd],
      };
    });
  };

  const removeMeal = (mealToRemove) => {
    setTimeMeals((prev) => ({
      ...prev,
      [isActiveTime]: prev[isActiveTime].filter(
        (ml) => ml.meal_name !== mealToRemove.meal_name
      ),
    }));
  };

  async function handleSaveAll() {
    if (!userId) {
      toast.error("Missing user");
      return;
    }

    const rows = [];
    for (const time of Object.keys(timeMeals)) {
      const list = timeMeals[time];
      if (!list || list.length === 0) continue;
      for (const ml of list) {
        rows.push({
          user_id: userId,
          meal_name: ml.meal_name,
          meal_time: time,
          quantity: ml.qty,
        });
      }
    }

    if (rows.length === 0) {
      toast("Nothing to save");
      return;
    }

    const { error } = await upsertDietPlansBulk(rows);
    if (error) {
      console.error("Save error:", error.message);
      toast.error(error.message);
    } else {
      toast.success("Saved successfully");
    }
  }

  return (
    <div className="clientmeal-viewport">
      <div className="clientmeal-page" style={{backgroundColor: "var(--bg)"}}>
        {/* Back Arrow */}
        <button 
          className="clientmeal-back-btn" 
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <BackArrow className="clientmeal-back-icon" style={{ color: "var(--faded-text)"}}/>
        </button>

        {/* Save Button */}
        <div className="clientmeal-header">
          <button 
            className="clientmeal-save-btn"
            onClick={handleSaveAll}
            style={{ 
              backgroundColor: "var(--dietcard-bg)", 
              borderColor: "var(--profile-border)" 
            }}
          >
            <ProfileEditPen className="clientmeal-save-icon" />
            <span className="clientmeal-save-text" style={{ color: "var(--faded-text)" }}>
              Save
            </span>
          </button>
        </div>

        {/* Client Info Bar */}
        <div className="clientmeal-client-info-wrapper">
          <div 
            className="clientmeal-client-info"
            style={{ 
              backgroundColor: "var(--dietcard-bg)", 
              borderColor: "var(--profile-border)" 
            }}
          >
            <img
              src={oatmeal}
              className="clientmeal-client-avatar"
              alt="Client avatar"
            />
            <span className="clientmeal-client-name" style={{ color: "var(--general-charcoal-text)" }}>
              {clientName || "Nilvana Lara"}
            </span>
          </div>
        </div>

        {/* Meal Time Tabs */}
        <div className="clientmeal-tabs-wrapper">
          {["Breakfast", "Lunch", "Dinner", "Snacks"].map((time, index) => (
            <button
              key={index}
              className={`clientmeal-tab ${
                isActiveTime === time ? "clientmeal-tab-active" : ""
              }`}
              onClick={() => setActiveTime(time)}
              style={{
                backgroundColor: isActiveTime === time ? "var(--active-tab-bg)" : "var(--dietcard-bg)",
                borderColor: isActiveTime === time ? "var(--active-tab-border)" : "var(--profile-border)",
                color: isActiveTime === time ? "var(--general-charcoal-text)" : "var(--faded-text)"
              }}
            >
              {time}
            </button>
          ))}
        </div>

        {/* Search Bar and Counter */}
        <div className="clientmeal-search-wrapper">
          <div 
            className="clientmeal-search-container"
            style={{ 
              backgroundColor: "var(--dietcard-bg)", 
              borderColor: "var(--profile-border)" 
            }}
          >
            <Search className="clientmeal-search-icon" />
            <input
              className="clientmeal-search-input"
              placeholder="Search Meal Name"
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ color: "var(--faded-text)" }}
            />
          </div>
          <button
            className="clientmeal-counter-btn"
            onClick={handlePreviewClick}
            style={{ 
              backgroundColor: "var(--dietcard-bg)", 
              borderColor: "var(--profile-border)" 
            }}
          >
            <span className="clientmeal-counter-text" style={{ color: "var(--general-charcoal-text)" }}>
              {timeMeals[isActiveTime].length}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="clientmeal-divider" style={{ backgroundColor: "var(--profile-border)" }} />

        {/* Meal List */}
        <div className="clientmeal-list-container">
          <div className="clientmeal-list-scroll">
            {filteredMeals.map((mealObj) => (
              <ClientDietCard
                key={mealObj.meal_name}
                meal={mealObj}
                addButton={true}
                mode="select"
                onAdd={(mealWithQty) => addMeal(mealWithQty)}
              />
            ))}
          </div>
        </div>

        {/* Preview Modal */}
        {isPreviewEnabled && (
          <div className="clientmeal-preview-overlay">
            <div className="clientmeal-preview-scroll">
              <div className="clientmeal-preview-content">
                {timeMeals[isActiveTime].map((meal) => (
                  <ClientDietCard
                    key={`${isActiveTime}-${meal.meal_name}`}
                    meal={meal}
                    addButton={"preview"}
                    mode="preview"
                    onRemove={(e) => {
                      e?.stopPropagation?.();
                      removeMeal(meal);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientMeal;
