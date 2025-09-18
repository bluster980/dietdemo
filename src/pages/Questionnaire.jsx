import React, { useState } from "react";
import PrimaryButton from "../components/PrimaryButton";
import { useNavigate } from "react-router-dom";
import BackArrow from "../assets/backarrow.svg";
import { getUserData } from "../utils/userOnboarding";
import { insertUser, insertWeightRecord } from "../utils/supabaseQueries";
import { updateUserFieldLocally } from "../utils/userOnboarding";
import { useUser } from "../context/UserContext";
import CurrentTime from "../components/CurrentTime";
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

  const [dropdownOpen, setDropdownOpen] = useState(null); // Track open dropdowns
  const [errors, setErrors] = useState({}); // Track validation errors

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDropdownOpen(null); // Close dropdown when an option is selected
    setErrors((prev) => ({ ...prev, [field]: false })); // Clear error for the field
  };

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach((field) => {
      if (!form[field]) {
        newErrors[field] = "Answer this question";
      }
    });

    // Special validation for age between 1-99
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

    if (validateForm()) {
      const userObj = getUserData();
      const { data: insertedUser } = await insertUser(userObj);
      if (insertedUser) {
        setUserData(insertedUser);
        localStorage.setItem("user_id", insertedUser.user_id);

        // add weight record three attributes in weightObj first is user_id second is date and third is weight_record
        const weightObj = {
          user_id: insertedUser.user_id,
          date: getLocalDateString(0),
          weight_record: userObj.weight,
        };

        const weightObj1 = {
          user_id: insertedUser.user_id,
          date: getLocalDateString(1),
          weight_record: userObj.weight + 3,
        };

        const weightObj2 = {
          user_id: insertedUser.user_id,
          date: getLocalDateString(2),
          weight_record: userObj.weight - 7,
        };
        await insertWeightRecord(weightObj);
        await insertWeightRecord(weightObj1);
        await insertWeightRecord(weightObj2);
        navigate("/diary");
      }
    }
  };

  const renderCustomDropdown = (fieldName, value, options) => {
    const allOptions = [{ value: "", label: "Select" }, ...options]; // Add "Select" at the top

    return (
      <div className="relative w-[360px] mt-[5px]">
        <button
          onClick={() =>
            setDropdownOpen(dropdownOpen === fieldName ? null : fieldName)
          }
          className={`w-full h-[50px] px-80 py-2 text-[21px] border text-left text-[#2D3436] outline-none ${
            dropdownOpen === fieldName
              ? "border-[#FF7675]"
              : errors[fieldName]
              ? "border-red-500"
              : "border-[#E5E7EB]"
          } bg-white rounded-[12px]`}
          style={{ color: value ? "black" : "#00000070" }}
        >
          {allOptions.find((o) => o.value === value)?.label || "Select"}

          <div
            className="absolute pointer-events-none"
            style={{
              right: "15px",
              top: "25px",
              transform: "translateY(-45%)",
              fontSize: "20px",
              color: "#00000050",
            }}
          >
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
              className="feather feather-chevron-down"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </button>

        {dropdownOpen === fieldName && (
          <ul className="absolute w-full bg-white border border-[#E5E7EB] mt-[2px] z-10 rounded-[12px] border overflow-hidden">
            {allOptions.map((option, index) => {
              const isSelected = value === option.value;

              return (
                <li
                  key={option.value + fieldName}
                  onClick={() => handleChange(fieldName, option.value)}
                  className={`h-[50px] pl-[20px] px-4 py-40 text-[20px] cursor-pointer ${
                    isSelected
                      ? "font-urbanist font-bold bg-gray-100 text-black"
                      : "text-black"
                  } ${index === 0 ? "rounded-t-[12px]" : ""} ${
                    index === allOptions.length - 1
                      ? "rounded-b-[12px]"
                      : "border-b border-[#E5E7EB]"
                  }`}
                  style={{
                    color: isSelected ? "black" : "rgba(0, 0, 0, 0.6)",
                  }}
                >
                  {option.label}
                </li>
              );
            })}
          </ul>
        )}

        {errors[fieldName] && (
          <p className="text-red-500 text-[15px] mt-1 ml-[5px]">
            Answer this question
          </p>
        )}
      </div>
    );
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
          alt="back arrow"
          onClick={() => navigate(-1)}
          style={{
            width: "30px",
            height: "30px",
            position: "absolute",
            top: "40px",
            left: "5px",
            zIndex: 1,
          }}
        />

        {/* TRAIN TIME */}
        <label className="text-[25px] w-[360px] font-semibold font-urbanist text-[#2D3436] mt-[140px] self-start">
          You wants to train in morning?
        </label>
        {renderCustomDropdown("trainTime", form.trainTime, [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ])}

        {/* PROFESSION */}
        <label className="text-[25px] w-[360px] font-semibold font-urbanist text-[#2D3436] mt-[20px] self-start">
          What is your Profession?
        </label>
        {renderCustomDropdown("profession", form.profession, [
          { value: "sedentary", label: "9 to 5 job (Sedentary lifestyle)" },
          { value: "moderate", label: "Moderately Worker" },
          { value: "heavy", label: "Heavy Worker" },
        ])}

        {/* GOAL */}
        <label className="text-[25px] w-[360px] font-semibold font-urbanist text-[#2D3436] mt-[20px] self-start">
          What is your Goal?
        </label>
        {renderCustomDropdown("goal", form.goal, [
          { value: "Build Muscle", label: "Build Muscle" },
          { value: "Weight Loss", label: "Weight Loss" },
        ])}

        {/* DIET */}
        <label className="text-[25px] w-[360px] font-semibold font-urbanist text-[#2D3436] mt-[20px] self-start">
          What is your Dietary Preference?
        </label>
        {renderCustomDropdown("diet", form.diet, [
          { value: "Veg", label: "Vegetarian" },
          { value: "Non-veg", label: "Non-Vegetarian" },
        ])}

        {/* AGE */}
        <label className="text-[25px] w-[360px] font-semibold font-urbanist text-[#2D3436] mt-[20px] self-start">
          What is your Age?
        </label>
        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          value={form.age}
          onChange={(e) => handleChange("age", e.target.value)}
          className={`w-full h-[50px] mt-[5px] px-4 py-2 text-[21px] border outline-none ${
            form.age
              ? errors.age
                ? "border-red-500"
                : "border-[#E5E7EB]"
              : errors.age
              ? "border-red-500"
              : "border-[#E5E7EB]"
          }`}
          style={{
            borderRadius: "12px",
            backgroundColor: "white",
            paddingLeft: "20px",
            color: form.age ? "black" : "#2D3436",
            textAlign: "left",
            fontFamily: "urbanist",
            fontWeight: "bold",
          }}
        />
        {errors.age && (
          <p className="text-red-500 text-[15px] mt-1 ml-[5px]">{errors.age}</p>
        )}

        <div className="w-full flex justify-center mt-[43px]">
          <PrimaryButton
            text="CONFIRM"
            onClick={handleSubmit}
            customStyle={{
              width: "100%",
              height: "52px",
              borderRadius: "15px",
              fontSize: "23px",
              boxShadow: "0px 12px 26px rgba(255, 118, 117, 0.30)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
