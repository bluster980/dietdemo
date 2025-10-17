import React, { useState, useMemo } from "react";
import AddPlus from "../assets/addplus.svg";
import toast from "react-hot-toast";

const WorkoutCard = ({
  exercise,
  addButton,
  mode = "select",
  isEditing = true,
  isSelectedForDay = false,
  onAdd,
  onRemove,
  onBeginEdit,
  viewMode = "trainer-select",
}) => {
  const [repsInput, setRepsInput] = useState("");
  const [setsInput, setSetsInput] = useState("");

  const isClientView = viewMode === "client-view";
  const isSelectAndEditing =
    mode === "select" && isEditing && !isSelectedForDay;

  const isValid = useMemo(() => {
    if (!isSelectAndEditing) return true;
    return (
      String(repsInput).trim().length > 0 && String(setsInput).trim().length > 0
    );
  }, [isSelectAndEditing, repsInput, setsInput]);

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (!isSelectAndEditing) return;
    if (!isValid) {
      toast.error("Please fill Reps and Sets");
      return;
    }
    onAdd?.({
      ...exercise,
      reps: repsInput,
      sets: setsInput,
    });
    // clear local inputs after add to visually exit edit state
    setRepsInput("");
    setSetsInput("");
  };

  // Optional: inform parent to mark this card as editing when user engages
  const beginEdit = () => onBeginEdit?.();

  // Choose display values: when selected for day, show exercise.reps/sets (saved in parent)
   const repsDisplay = isClientView
    ? exercise.reps
    : isSelectAndEditing
      ? repsInput
      : exercise.reps ?? repsInput;

  const setsDisplay = isClientView
    ? exercise.sets
    : isSelectAndEditing
      ? setsInput
      : exercise.sets ?? setsInput;

  return (
    <div className="workout-card-wrapper">
      <div className="workout-card" style={{ backgroundColor: "var(--profile-section-card-bg)", borderColor: "var(--profile-border)" }}>
        {/* Left side - Exercise info */}
        <div className="workout-card-info">
          <h3 className="workout-card-title" style={{color: "var(--general-charcoal-text"}}>{exercise.exercise_name}</h3>
          
          <div className="workout-card-detail">
            <span className="workout-label" style={{color: "var(--faded-text"}}>Target:</span>
            <span className="workout-value" style={{color: "var(--general-charcoal-text"}}>{exercise.target}</span>
          </div>

          {isClientView ? (
            <div className="workout-card-detail">
              <span className="workout-label" style={{color: "var(--faded-text"}}>Reps:</span>
              <span className="workout-value" style={{color: "var(--general-charcoal-text"}}>{repsDisplay}</span>
            </div>
          ) : isSelectAndEditing ? (
            <div className="workout-card-detail">
              <span className="workout-label">Reps:</span>
              <input
                type="text"
                className="workout-input"
                placeholder={exercise.reps || "e.g. 10-12"}
                value={repsInput}
                onFocus={beginEdit}
                onChange={(e) => setRepsInput(e.target.value)}
              />
            </div>
          ) : (
            <div className="workout-card-detail">
              <span className="workout-label" style={{color: "var(--faded-text"}}>Reps:</span>
              <span className="workout-value" style={{color: "var(--general-charcoal-text"}}>{repsDisplay}</span>
            </div>
          )}

          {isClientView ? (
            <div className="workout-card-detail">
              <span className="workout-label" style={{color: "var(--faded-text"}}>Sets:</span>
              <span className="workout-value" style={{color: "var(--general-charcoal-text"}}>{setsDisplay}</span>
            </div>
          ) : isSelectAndEditing ? (
            <div className="workout-card-detail">
              <span className="workout-label">Sets:</span>
              <input
                type="number"
                min="1"
                className="workout-input workout-input-sets"
                placeholder={exercise.sets || "3"}
                value={setsInput}
                onFocus={beginEdit}
                onChange={(e) => setSetsInput(e.target.value)}
              />
            </div>
          ) : (
            <div className="workout-card-detail">
              <span className="workout-label" style={{color: "var(--faded-text"}}>Sets:</span>
              <span className="workout-value" style={{color: "var(--general-charcoal-text"}}>{setsDisplay}</span>
            </div>
          )}

          <div className="workout-card-detail">
            <span className="workout-label" style={{color: "var(--faded-text"}}>Rest:</span>
            <span className="workout-value" style={{color: "var(--general-charcoal-text"}}>{exercise.rest}</span>
          </div>
        </div>

        {/* Right side - GIF */}
        <div className="workout-card-media">
          <img
            src={`/gifs/${exercise.gif_url.replaceAll(" ", "")}.gif`}
            alt={exercise.exercise_name}
            className="workout-gif"
          />
          {!isClientView && addButton && (
            <button
              className="workout-add-btn"
              style={{
                opacity: mode === "select" && (!isSelectAndEditing || !isValid) ? 0.5 : 1,
                pointerEvents: mode === "select" && (!isSelectAndEditing || !isValid) ? "none" : "auto",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (mode === "select") return handleAddClick(e);
                return onRemove?.(e);
              }}
              aria-disabled={mode === "select" && (!isSelectAndEditing || !isValid)}
              aria-label={addButton === "preview" ? "Remove exercise" : "Add exercise"}
            >
              <AddPlus
                style={
                  addButton === "preview"
                    ? { transform: "rotate(45deg)", color: "#ff7675" }
                    : { color: "#ff7675" }
                }
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutCard;
