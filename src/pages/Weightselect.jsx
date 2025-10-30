import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackArrow from "../assets/backarrow.svg";
import PrimaryButton from "../components/PrimaryButton";
import Ruler from "../components/Ruler";
import man from "../assets/man.png";
import woman from "../assets/woman.png";
import { useGender } from "../context/GenderContext";
import { updateUserFieldLocally, patchUserCache } from "../utils/userOnboarding";
import "../styles/weightselectresponsive.css";

const Weightselect = () => {
  const navigate = useNavigate();
  const { selectedGender } = useGender();
  const [weight, setWeight] = useState(35);

  const onWeightSubmit = (weight) => {
    patchUserCache("weight", weight);
    updateUserFieldLocally("weight", weight);
    navigate("/Heightselect");
  };

  return (
    <div className="weightselect-viewport">
      <div className="weightselect-page" style={{ backgroundColor: "var(--bg)" }}>
        {/* Back Arrow */}
        <button
          className="weightselect-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <BackArrow className="weightselect-back-icon" style={{color: "var(--general-charcoal-text)"}} />
        </button>

        {/* Content Container */}
        <div className="weightselect-content">
          {/* Title */}
          <h1
            className="weightselect-title"
            style={{ color: "var(--general-charcoal-text)" }}
          >
            What is your weight?
          </h1>

          {/* Weight Display */}
          <div className="weightselect-display">
            <h1
              className="weightselect-value"
              style={{ color: "var(--general-charcoal-text)" }}
            >
              {weight - 5}
            </h1>
            <h1
              className="weightselect-unit"
              style={{ color: "var(--general-charcoal-text)" }}
            >
              kg
            </h1>
          </div>

          {/* Character Image */}
          <div className="weightselect-image-container">
            <img
              src={selectedGender === "man" ? man : woman}
              alt={`Gender ${selectedGender}`}
              className="weightselect-image"
            />
          </div>

          {/* Ruler Component */}
          <div className="weightselect-ruler-wrapper">
            <div className="weightselect-ruler-container">
              <Ruler onChange={setWeight} />
            </div>
          </div>

          {/* Confirm Button */}
          <div className="weightselect-button-wrapper">
            <PrimaryButton
              text="CONFIRM"
              onClick={() => onWeightSubmit(weight - 5)}
              customStyle={{
                width: "var(--weightselect-button-width)",
                height: "var(--weightselect-button-height)",
                borderRadius: "var(--weightselect-button-radius)",
                fontSize: "var(--weightselect-button-text-size)",
                boxShadow: "0px 12px 26px rgba(255, 118, 117, 0.30)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weightselect;
