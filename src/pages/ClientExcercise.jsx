import { React, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileEditPen from "../assets/profileeditpen.svg";
import oatmeal from "../assets/oatmeal.png";
import BackArrow from "../assets/backarrow.svg";
import Search from "../assets/search.svg";
import WorkoutCard from "../components/WorkoutCard";
import {
  fetchAllExercises,
  upsertWorkoutPlansBulk,
} from "../utils/supabaseQueries";
import toast from "react-hot-toast";
import "../styles/clientexerciseresponsive.css";

const ClientExcercise = () => {
  const location = useLocation();
  const routeUserId = location.state?.user_id;
  const clientName = location.state?.name;
  const navigate = useNavigate();
  const [isActiveDay, setActiveDay] = useState("Fri");
  const [isPreviewEnabled, setIsPreviewEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState({});
  const [allExercises, setAllExercises] = useState([]);

  const userId = routeUserId;
  console.log("####", userId);

  useEffect(() => {
    const fetchExercises = async () => {
      const { data, error } = await fetchAllExercises();
      if (error) {
        console.error("Error fetching exercises:", error.message);
      } else {
        setAllExercises(data);
      }
    };
    fetchExercises();
  }, []);

  const filteredMeals = allExercises.filter((exObj) =>
    exObj.exercise_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [dayExercises, setDayExercises] = useState({
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
    Sat: [],
    Sun: [],
  });

  const selectedNamesForDay = new Set(
    dayExercises[isActiveDay].map((ex) => ex.exercise_name)
  );
  
  function handlePreviewClick() {
    setIsPreviewEnabled(!isPreviewEnabled);
  }

  const addExerciseForDay = (day, exerciseToAdd) => {
    setDayExercises((prev) => {
      const already = prev[day].some(
        (ex) => ex.exercise_name === exerciseToAdd.exercise_name
      );
      if (already) return prev;
      return {
        ...prev,
        [day]: [...prev[day], exerciseToAdd],
      };
    });
  };

  const removeExercise = (exerciseToRemove) => {
    setDayExercises((prev) => ({
      ...prev,
      [isActiveDay]: prev[isActiveDay].filter(
        (ex) => ex.exercise_name !== exerciseToRemove.exercise_name
      ),
    }));
    setEditing((m) => ({
      ...m,
      [`${isActiveDay}:${exerciseToRemove.exercise_name}`]: true,
    }));
  };

  async function handleSaveAll() {
    if (!userId) {
      toast.error("Missing user");
      return;
    }

    const rows = [];
    for (const day of Object.keys(dayExercises)) {
      const list = dayExercises[day];
      if (!list || list.length === 0) continue;
      for (const ex of list) {
        rows.push({
          user_id: userId,
          day_of_week: day,
          exercise_name: ex.exercise_name,
          reps: ex.reps,
          sets: ex.sets,
        });
      }
    }

    if (rows.length === 0) {
      toast("Nothing to save");
      return;
    }

    const { error } = await upsertWorkoutPlansBulk(rows);
    if (error) {
      console.error("Save error:", error.message);
      toast.error("Failed to save");
    } else {
      toast.success("All days saved");
    }
  }

  return (
    <div className="clientexercise-viewport">
      <div className="clientexercise-page">
        {/* Back Arrow */}
        <button
          className="clientexercise-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <BackArrow className="clientexercise-back-icon" />
        </button>

        {/* Save Button */}
        <div className="clientexercise-header">
          <button
            className="clientexercise-save-btn"
            onClick={handleSaveAll}
            style={{
              backgroundColor: "var(--dietcard-bg)",
              borderColor: "var(--profile-border)",
            }}
          >
            <ProfileEditPen className="clientexercise-save-icon" />
            <span
              className="clientexercise-save-text"
              style={{ color: "var(--faded-text)" }}
            >
              Save
            </span>
          </button>
        </div>

        {/* Client Info Bar */}
        <div className="clientexercise-client-info-wrapper">
          <div
            className="clientexercise-client-info"
            style={{
              backgroundColor: "var(--dietcard-bg)",
              borderColor: "var(--profile-border)",
            }}
          >
            <img
              src={oatmeal}
              className="clientexercise-client-avatar"
              alt="Client avatar"
            />
            <span
              className="clientexercise-client-name"
              style={{ color: "var(--general-charcoal-text)" }}
            >
              {clientName || "Nilvana Lara"}
            </span>
          </div>
        </div>

        {/* Day Tabs */}
        <div className="clientexercise-tabs-wrapper">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
            (day, index) => (
              <button
                key={index}
                className={`clientexercise-tab ${
                  isActiveDay === day ? "clientexercise-tab-active" : ""
                }`}
                onClick={() => setActiveDay(day)}
                style={{
                  backgroundColor:
                    isActiveDay === day
                      ? "var(--active-tab-bg)"
                      : "var(--dietcard-bg)",
                  borderColor:
                    isActiveDay === day
                      ? "var(--active-tab-border)"
                      : "var(--profile-border)",
                  color:
                    isActiveDay === day
                      ? "var(--general-charcoal-text)"
                      : "var(--faded-text)",
                }}
              >
                {day}
              </button>
            )
          )}
        </div>

        {/* Search Bar and Counter */}
        <div className="clientexercise-search-wrapper">
          <div
            className="clientexercise-search-container"
            style={{
              backgroundColor: "var(--dietcard-bg)",
              borderColor: "var(--profile-border)",
            }}
          >
            <Search className="clientexercise-search-icon" />
            <input
              className="clientexercise-search-input"
              placeholder="Search Exercise Name"
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ color: "var(--faded-text)" }}
            />
          </div>
          <button
            className="clientexercise-counter-btn"
            onClick={handlePreviewClick}
            style={{
              backgroundColor: "var(--dietcard-bg)",
              borderColor: "var(--profile-border)",
            }}
          >
            <span
              className="clientexercise-counter-text"
              style={{ color: "var(--general-charcoal-text)" }}
            >
              {dayExercises[isActiveDay].length}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div
          className="clientexercise-divider"
          style={{ backgroundColor: "var(--profile-border)" }}
        />

        {/* Exercise List */}
        <div className="clientexercise-list-container">
          <div className="clientexercise-list-scroll">
            {filteredMeals.map((exObj) => {
              const selected = selectedNamesForDay.has(exObj.exercise_name);
              const editKey = `${isActiveDay}:${exObj.exercise_name}`;
              const isEditing = selected ? false : editing[editKey] ?? true;
              return (
                <WorkoutCard
                  key={`${exObj.exercise_name}-${isActiveDay}`}
                  exercise={exObj}
                  addButton
                  mode="select"
                  isEditing={isEditing}
                  isSelectedForDay={selected}
                  onBeginEdit={() =>
                    setEditing((m) => ({ ...m, [editKey]: true }))
                  }
                  onAdd={(exWithVals) => {
                    addExerciseForDay(isActiveDay, exWithVals);
                    setEditing((m) => ({ ...m, [editKey]: false }));
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Preview Modal */}
        {isPreviewEnabled && (
          <div className="clientexercise-preview-overlay">
            <div className="clientexercise-preview-scroll">
              <div className="clientexercise-preview-content">
                {dayExercises[isActiveDay].map((exercise) => (
                  <WorkoutCard
                    key={`${isActiveDay}-${exercise.exercise_name}`}
                    exercise={exercise}
                    addButton={"preview"}
                    mode="preview"
                    isEditing={false}
                    onRemove={(e) => {
                      e?.stopPropagation?.();
                      removeExercise(exercise);
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

export default ClientExcercise;
