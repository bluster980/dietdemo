import React from "react";
import Dietfire from "../assets/dietfire.svg";

const DietCard = ({ title, meals }) => {
  const flatMeals = meals.flat();

  const getMealData = (meals) => {
    const protein = Math.floor((meals.protein * meals.quantity) / 100);
    const carbs = Math.floor((meals.carbs * meals.quantity) / 100);
    const fat = Math.floor((meals.fat * meals.quantity) / 100);
    const calories = Math.floor((meals.calories * meals.quantity) / 100);

    const maxVal = Math.max(protein, carbs, fat, 1);
    const hp = Math.round((protein / maxVal) * 100);
    const hc = Math.round((carbs / maxVal) * 100);
    const hf = Math.round((fat / maxVal) * 100);

    const minPct = 6;
    const getHeight = (x) => `${Math.max(x, protein || carbs || fat ? minPct : 0)}%`;

    return {
      protein,
      carbs,
      fat,
      calories,
      hp: getHeight(hp),
      hc: getHeight(hc),
      hf: getHeight(hf),
    };
  };

  return (
    <div className="diet-card-wrapper">
      <div className="diet-card" style={{ backgroundColor: "var(--dietcard-bg)", borderColor: "var(--profile-border)" }}>
        {/* Card Title */}
        <h2 className="diet-card-title" style={{ color: "var(--general-charcoal-text)" }}>{title}</h2>

        {/* Meals Container */}
        <div className="diet-meals-container">
          {flatMeals.map((meal, index) => {
            const mealData = getMealData(meal);

            return (
              <div key={index} className="diet-meal-item" style={{backgroundColor: "var(--profile-section-card-bg)", borderColor: "var(--profile-border)", animationDelay: `${index * 80}ms`}}>
                {/* Food Image - Positioned Outside */}
                <div className="diet-meal-image-wrapper">
                  <img
                    src={`/imgs/${meal.img_url.replaceAll(" ", "")}.png`}
                    alt={meal.meal_name}
                    className="diet-meal-image"
                  />
                </div>

                {/* Meal Content */}
                <div className="diet-meal-content">
                  {/* Title and Quantity */}
                  <div className="diet-meal-header">
                    <h3 className="diet-meal-name" style={{ color: "var(--general-charcoal-text"}}>
                      {meal.meal_name.length > 21 
                        ? `${meal.meal_name.slice(0, 20)}...` 
                        : meal.meal_name}
                    </h3>
                    <span className="diet-meal-quantity" style={{color: "var(--general-charcoal-text)"}}>{meal.quantity}g</span>
                  </div>

                  {/* Calories */}
                  <div className="diet-meal-calories">
                    <Dietfire className="diet-fire-icon" />
                    <span className="diet-calories-value" style={{color: "var(--general-charcoal-text"}}>{mealData.calories}</span>
                    <span className="diet-calories-unit" style={{color: "var(--faded-text)"}}>kcal</span>
                  </div>

                  {/* Macros with Progress Bars */}
                  <div className="diet-macros-row">
                    {/* Protein */}
                    <div className="diet-macro-group">
                      <div className="diet-progress-bar">
                        <div 
                          className="diet-progress-fill diet-progress-protein"
                          style={{ height: mealData.hp }}
                        />
                      </div>
                      <div className="diet-macro-info">
                        <span className="diet-macro-value" style={{color: "var(--general-charcoal-text"}}>{mealData.protein}g</span>
                        <span className="diet-macro-label" style={{color: "var(--faded-text)"}}>Protein</span>
                      </div>
                    </div>

                    {/* Carbs */}
                    <div className="diet-macro-group">
                      <div className="diet-progress-bar">
                        <div 
                          className="diet-progress-fill diet-progress-carbs"
                          style={{ height: mealData.hc }}
                        />
                      </div>
                      <div className="diet-macro-info">
                        <span className="diet-macro-value" style={{color: "var(--general-charcoal-text"}}>{mealData.carbs}g</span>
                        <span className="diet-macro-label" style={{color: "var(--faded-text)"}}>Carbs</span>
                      </div>
                    </div>

                    {/* Fats */}
                    <div className="diet-macro-group">
                      <div className="diet-progress-bar">
                        <div 
                          className="diet-progress-fill diet-progress-fat"
                          style={{ height: mealData.hf }}
                        />
                      </div>
                      <div className="diet-macro-info">
                        <span className="diet-macro-value" style={{color: "var(--general-charcoal-text"}}>{mealData.fat}g</span>
                        <span className="diet-macro-label" style={{color: "var(--faded-text)"}}>Fats</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DietCard;
