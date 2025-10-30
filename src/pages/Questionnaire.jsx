import React, { useState } from "react";
import PrimaryButton from "../components/PrimaryButton";
import { useNavigate } from "react-router-dom";
import BackArrow from "../assets/backarrow.svg";
import { updateUserField, insertWeightRecord } from "../utils/supabaseQueries";
import { updateUserFieldLocally } from "../utils/userOnboarding";
import { useUser } from "../context/UserContext";
import CurrentTime from "../components/CurrentTime";
import "../styles/questionnaireresponsive.css";

const { getLocalDateString } = CurrentTime;

const Questionnaire = () => {
  const { setUserData } = useUser();

  const [form, setForm] = useState({
    trainTime: "",
    profession: "",
    goal: "",
    diet: "",
    age: "",
  });

  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDropdownOpen(null);
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach((field) => {
      if (!form[field]) {
        newErrors[field] = "Answer this question";
      }
    });

    const ageValue = parseInt(form.age, 10);
    if (form.age && (isNaN(ageValue) || ageValue < 1 || ageValue > 99)) {
      newErrors.age = "Enter a valid age between (1-99)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    updateUserFieldLocally("training_time", form.trainTime);
    updateUserFieldLocally("profession", form.profession);
    updateUserFieldLocally("goal", form.goal);
    updateUserFieldLocally("diet_preference", form.diet);
    updateUserFieldLocally("age", form.age);

    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("access_token");
    if (!userId || !token) {
      navigate("/userverification", { replace: true });
      return;
    }

    if (validateForm()) {
      const storedUser = JSON.parse(localStorage.getItem('userData') || '{}');
      
      const { data, error } = await updateUserField(userId, {
        gender: storedUser.gender,
        weight: storedUser.weight,
        height: storedUser.height,
        training_time: form.trainTime,
        profession: form.profession,
        goal: form.goal,
        diet_preference: form.diet,
        age: form.age,
      });
      if(data) {
        console.log("after inserting DB", data);
      }
      if (error) {
        console.error("Update failed:", error);
        return;
      }
      if (!data) {
        console.warn("No row updated; check RLS, Authorization header, and filters");
        return;
      }
      setUserData(data);
      const weightObj = {
        user_id: userId,
        date: getLocalDateString(0),
        weight_record: storedUser.weight,
      };
      await insertWeightRecord(weightObj);
      navigate("/Diary");
    }
  };

  const renderCustomDropdown = (fieldName, value, options) => {
    const allOptions = [{ value: "", label: "Select" }, ...options];

    return (
      <div className="questionnaire-field-wrapper">
        <button
          onClick={() =>
            setDropdownOpen(dropdownOpen === fieldName ? null : fieldName)
          }
          className={`questionnaire-dropdown-button ${
            dropdownOpen === fieldName
              ? "questionnaire-dropdown-active"
              : errors[fieldName]
              ? "questionnaire-dropdown-error"
              : ""
          }`}
          style={{ 
            color: value ? "var(--general-charcoal-text)" : "var(--general-charcoal-text)",
            backgroundColor: "var(--dietcard-bg)",
            borderColor: dropdownOpen === fieldName 
              ? "#FF7675" 
              : errors[fieldName] 
              ? "#ef4444" 
              : "var(--profile-border)"
          }}
        >
          {allOptions.find((o) => o.value === value)?.label || "Select"}

          <div className="questionnaire-dropdown-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </button>

        {dropdownOpen === fieldName && (
          <ul 
            className="questionnaire-dropdown-menu"
            style={{ 
              backgroundColor: "var(--dietcard-bg)",
              borderColor: "var(--profile-border)"
            }}
          >
            {allOptions.map((option, index) => {
              const isSelected = value === option.value;

              return (
                <li
                  key={option.value + fieldName}
                  onClick={() => handleChange(fieldName, option.value)}
                  className={`questionnaire-dropdown-option ${
                    isSelected ? "questionnaire-dropdown-option-selected" : ""
                  } ${index === 0 ? "questionnaire-dropdown-first" : ""} ${
                    index === allOptions.length - 1
                      ? "questionnaire-dropdown-last"
                      : ""
                  }`}
                  style={{
                    color: isSelected ? "var(--general-charcoal-text)" : "var(--general-charcoal-text)",
                  }}
                >
                  {option.label}
                </li>
              );
            })}
          </ul>
        )}

        {errors[fieldName] && (
          <p className="questionnaire-error-text">
            Answer this question
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="questionnaire-viewport">
      <div className="questionnaire-page" style={{backgroundColor: "var(--bg)"}}>
        {/* Back Arrow */}
        <button
          className="questionnaire-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <BackArrow className="questionnaire-back-icon" style={{color: "var(--general-charcoal-text)"}}/>
        </button>

        {/* Form Content */}
        <div className="questionnaire-form">
          {/* TRAIN TIME */}
          <label 
            className="questionnaire-label"
            style={{ color: "var(--general-charcoal-text)" }}
          >
            You wants to train in morning?
          </label>
          {renderCustomDropdown("trainTime", form.trainTime, [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ])}

          {/* PROFESSION */}
          <label 
            className="questionnaire-label questionnaire-label-spaced"
            style={{ color: "var(--general-charcoal-text)", }}
          >
            What is your Profession?
          </label>
          {renderCustomDropdown("profession", form.profession, [
            { value: "sedentary", label: "9 to 5 job (Sedentary lifestyle)" },
            { value: "moderate", label: "Moderately Worker" },
            { value: "heavy", label: "Heavy Worker" },
          ])}

          {/* GOAL */}
          <label 
            className="questionnaire-label questionnaire-label-spaced"
            style={{ color: "var(--general-charcoal-text)" }}
          >
            What is your Goal?
          </label>
          {renderCustomDropdown("goal", form.goal, [
            { value: "Build Muscle", label: "Build Muscle" },
            { value: "Weight Loss", label: "Weight Loss" },
          ])}

          {/* DIET */}
          <label 
            className="questionnaire-label questionnaire-label-spaced"
            style={{ color: "var(--general-charcoal-text)" }}
          >
            What is your Dietary Preference?
          </label>
          {renderCustomDropdown("diet", form.diet, [
            { value: "Veg", label: "Vegetarian" },
            { value: "Non-veg", label: "Non-Vegetarian" },
          ])}

          {/* AGE */}
          <label 
            className="questionnaire-label questionnaire-label-spaced"
            style={{ color: "var(--general-charcoal-text)" }}
          >
            What is your Age?
          </label>
          <div className="questionnaire-field-wrapper">
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.age}
              onChange={(e) => handleChange("age", e.target.value)}
              className={`questionnaire-input ${
                errors.age ? "questionnaire-input-error" : ""
              }`}
              style={{
                backgroundColor: "var(--dietcard-bg)",
                borderColor: errors.age ? "#ef4444" : "var(--profile-border)",
                color: form.age ? "var(--general-charcoal-text)" : "var(--general-charcoal-text)",
              }}
              placeholder="Enter your age"
            />
            {errors.age && (
              <p className="questionnaire-error-text">{errors.age}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="questionnaire-button-wrapper">
            <PrimaryButton
              text="CONFIRM"
              onClick={handleSubmit}
              customStyle={{
                width: "100%",
                height: "var(--questionnaire-button-height)",
                borderRadius: "var(--questionnaire-button-radius)",
                fontSize: "var(--questionnaire-button-text-size)",
                boxShadow: "0px 12px 26px rgba(255, 118, 117, 0.30)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
