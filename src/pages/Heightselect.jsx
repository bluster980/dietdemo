import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackArrow from "../assets/backarrow.svg";
import PrimaryButton from "../components/PrimaryButton";
import Rulervertical from "../components/Rulervertical";
import man from "../assets/man.png";
import woman from "../assets/woman.png";
import { useGender } from "../context/GenderContext";
import { updateUserFieldLocally, patchUserCache } from "../utils/userOnboarding";
import "../styles/heightselectresponsive.css";

const Heightselect = () => {
  const navigate = useNavigate();
  const { selectedGender } = useGender();
  const [height, setHeight] = useState(134);

  const onHeightSubmit = (height) => {
    patchUserCache('height', height);
    updateUserFieldLocally("height", height);
    navigate("/questionnaire");
  };

  return (
    <div className="heightselect-viewport">
      <div className="heightselect-page" style={{ backgroundColor: "var(--bg)" }}>
        {/* Back Arrow */}
        <button
          className="heightselect-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <BackArrow className="heightselect-back-icon" style={{color: "var(--general-charcoal-text)"}}/>
        </button>

        {/* Content Container */}
        <div className="heightselect-content">
          {/* Title */}
          <h1
            className="heightselect-title"
            style={{ color: "var(--general-charcoal-text)" }}
          >
            What is your Height?
          </h1>

          {/* Main Section with Image and Ruler */}
          <div className="heightselect-main">
            <div className="heightselect-left-section">
              {/* Height Display */}
              <div className="heightselect-display">
                <h1
                  className="heightselect-value"
                  style={{ color: "var(--general-charcoal-text)" }}
                >
                  {height - 3}
                </h1>
                <h1
                  className="heightselect-unit"
                  style={{ color: "var(--general-charcoal-text)" }}
                >
                  Cm
                </h1>
              </div>

              {/* Character Image */}
              <div className="heightselect-image-container">
                <img
                  src={selectedGender === "man" ? man : woman}
                  alt={`Gender ${selectedGender}`}
                  className="heightselect-image"
                />
              </div>
            </div>

            {/* Ruler Section */}
            <div className="heightselect-ruler-wrapper">
              <div className="heightselect-ruler-container">
                <Rulervertical onChange={setHeight} />
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="heightselect-button-wrapper">
            <PrimaryButton
              text="CONFIRM"
              onClick={() => onHeightSubmit(height - 3)}
              customStyle={{
                width: "var(--heightselect-button-width)",
                height: "var(--heightselect-button-height)",
                borderRadius: "var(--heightselect-button-radius)",
                fontSize: "var(--heightselect-button-text-size)",
                boxShadow: "0px 12px 26px rgba(255, 118, 117, 0.30)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heightselect;
