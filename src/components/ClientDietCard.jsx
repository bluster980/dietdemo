import React, { useMemo, useState } from "react";
import Dietfire from "../assets/dietfire.svg";
import AddPlus from "../assets/addplus.svg";
import toast from "react-hot-toast";
import "../styles/clientdietcardresponsive.css";

const ClientDietCard = ({
  meal,
  addButton,
  mode = "select",
  onAdd,
  onRemove,
}) => {
  const [qty, setQty] = useState("");

  const isScaled = meal?.isScaled === true;
  const effectiveQty =
    mode === "preview" ? Number(meal?.qty) || 0 : Number(qty) || NaN;

  const p100 = Number(meal.protein) || 0;
  const c100 = Number(meal.carbs) || 0;
  const f100 = Number(meal.fat) || 0;
  const kcal100 = Number(meal?.calories) || 0;

  const hasQty =
    mode === "preview"
      ? effectiveQty > 0
      : qty !== "" && !Number.isNaN(effectiveQty) && effectiveQty > 0;
  const factor = isScaled ? 1 : (hasQty ? effectiveQty / 100 : 1);

  const p = +(p100 * factor).toFixed(1);
  const c = +(c100 * factor).toFixed(1);
  const f = +(f100 * factor).toFixed(1);
  const kcal = Math.round(kcal100 * factor);

  const { hp, hc, hf } = useMemo(() => {
    const maxVal = Math.max(p, c, f, 1);
    return {
      hp: Math.round((p / maxVal) * 100),
      hc: Math.round((c / maxVal) * 100),
      hf: Math.round((f / maxVal) * 100),
    };
  }, [p, c, f]);

  const minPct = 6;
  const pct = (x) => `${Math.max(x, p || c || f ? minPct : 0)}%`;

  // Updated handler to limit quantity to 3 digits
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    
    // Allow empty string (for clearing input)
    if (value === "") {
      setQty("");
      return;
    }
    
    // Only update if the value has 3 or fewer digits
    if (value.length <= 3) {
      setQty(value);
    }
    // If more than 3 digits, don't update state (input won't change)
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (mode !== "select") return;
    const q = Number(qty);
    if (!qty || Number.isNaN(q) || q <= 0) {
      toast.error("Please select quantity");
      return;
    }
    onAdd?.({
      ...meal,
      qty: q,
      calories: kcal,
      protein: p,
      carbs: c,
      fat: f,
      isScaled: true,
    });
    setQty("");
  };

  return (
    <div className="dietcard-wrapper">
      <div 
        className="dietcard-container"
        style={{ 
          backgroundColor: "var(--dietcard-bg)", 
          borderColor: "var(--profile-border)" 
        }}
      >
        <img
          src={meal.img_url}
          className="dietcard-image"
          alt={meal.meal_name}
        />
        
        <div className="dietcard-content">
          <div className="dietcard-header">
            <span className="dietcard-meal-name" style={{ color: "var(--general-charcoal-text)" }}>
              {meal.meal_name}
            </span>
            <div className="dietcard-calories">
              <Dietfire className="dietcard-fire-icon" />
              <p className="dietcard-calories-text">
                <span className="dietcard-calories-value" style={{ color: "var(--faded-text)" }}>
                  {kcal}
                </span>
                <span className="dietcard-calories-unit" style={{ color: "var(--faded-text)" }}>
                  kcal
                </span>
              </p>
            </div>
          </div>

          <div className="dietcard-macros">
            {/* Protein */}
            <div className="dietcard-macro-bar-container">
              <div className="dietcard-macro-bar" style={{ backgroundColor: "#F8F9FA" }}>
                <div
                  className="dietcard-macro-bar-fill"
                  style={{ height: pct(hp), backgroundColor: "#FFA8A6" }}
                />
              </div>
            </div>
            <div className="dietcard-macro-info">
              <div className="dietcard-macro-value" style={{ color: "var(--faded-text)" }}>
                <span>{Math.round(p)}</span>
                <span>g</span>
              </div>
              <div className="dietcard-macro-label" style={{ color: "var(--faded-text)" }}>
                Protein
              </div>
            </div>

            {/* Carbs */}
            <div className="dietcard-macro-bar-container">
              <div className="dietcard-macro-bar" style={{ backgroundColor: "#F8F9FA" }}>
                <div
                  className="dietcard-macro-bar-fill"
                  style={{ height: pct(hc), backgroundColor: "#c7fceb" }}
                />
              </div>
            </div>
            <div className="dietcard-macro-info">
              <div className="dietcard-macro-value" style={{ color: "var(--faded-text)" }}>
                <span>{Math.round(c)}</span>
                <span>g</span>
              </div>
              <div className="dietcard-macro-label" style={{ color: "var(--faded-text)" }}>
                Carbs
              </div>
            </div>

            {/* Fats */}
            <div className="dietcard-macro-bar-container">
              <div className="dietcard-macro-bar" style={{ backgroundColor: "#F8F9FA" }}>
                <div
                  className="dietcard-macro-bar-fill"
                  style={{ height: pct(hf), backgroundColor: "#ffe28c" }}
                />
              </div>
            </div>
            <div className="dietcard-macro-info">
              <div className="dietcard-macro-value" style={{ color: "var(--faded-text)" }}>
                <span>{Math.round(f)}</span>
                <span>g</span>
              </div>
              <div className="dietcard-macro-label" style={{ color: "var(--faded-text)" }}>
                Fats
              </div>
            </div>

            {/* Spacer bar */}
            <div className="dietcard-macro-bar-container">
              <div className="dietcard-macro-bar" style={{ backgroundColor: "#F8F9FA" }}>
                <div className="dietcard-macro-bar-fill" style={{ height: "60%", backgroundColor: "#97c1fc" }} />
              </div>
            </div>

            {/* Quantity */}
            {mode === "select" ? (
              <div className="dietcard-macro-info">
                <div className="dietcard-quantity-input-wrapper">
                  <input
                    type="number"
                    className="dietcard-quantity-input"
                    placeholder="100"
                    value={qty}
                    onChange={handleQuantityChange}
                    style={{ 
                      backgroundColor: "var(--dietcard-bg)", 
                      borderColor: "var(--profile-border)",
                      color: "var(--faded-text)"
                    }}
                  />
                  <span className="dietcard-quantity-unit" style={{ color: "var(--faded-text)" }}>g</span>
                </div>
                <div className="dietcard-macro-label" style={{ color: "var(--faded-text)" }}>
                  Quantity
                </div>
              </div>
            ) : (
              <div className="dietcard-macro-info">
                <span className="dietcard-macro-value" style={{ color: "var(--faded-text)" }}>
                  {meal?.qty ?? 0}g
                </span>
                <span className="dietcard-macro-label" style={{ color: "var(--faded-text)" }}>
                  Quantity
                </span>
              </div>
            )}
          </div>
        </div>

        {addButton && (
          <button
            className="dietcard-action-btn"
            onClick={mode === "select" ? handleAddClick : onRemove}
            aria-label={mode === "select" ? "Add meal" : "Remove meal"}
          >
            <AddPlus
              className="dietcard-action-icon"
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
  );
};

export default ClientDietCard;
