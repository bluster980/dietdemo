import React from "react";
import { useNavigate } from "react-router-dom";
import BackArrow from "../assets/backarrow.svg";
import PrimaryButton from "../components/PrimaryButton";
import man from "../assets/man.png";
import woman from "../assets/woman.png";
import { useGender } from "../context/GenderContext";
import { updateUserFieldLocally, patchUserCache } from "../utils/userOnboarding";
import "../styles/genderselectresponsive.css";

const Genderselect = () => {
  const navigate = useNavigate();
  const { selectedGender, setSelectedGender } = useGender();

  const handleSelectGender = (gender) => {
    setSelectedGender(gender);
    patchUserCache('gender', gender);
    updateUserFieldLocally('gender', gender);
  };

  const onGenderSelect = (selectedGender) => {
    patchUserCache('gender', selectedGender);
    updateUserFieldLocally("gender", selectedGender);
    navigate("/Weightselect");
  };

  return (
    <div className="genderselect-viewport">
      <div className="genderselect-page" style={{backgroundColor: "var(--bg)"}}>
        {/* Back Arrow */}
        <button
          className="genderselect-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <BackArrow className="genderselect-back-icon" style={{color: "var(--general-charcoal-text)"}}/>
        </button>

        {/* Title */}
        <h1
          className="genderselect-title"
          style={{ color: "var(--general-charcoal-text)" }}
        >
          Select Gender
        </h1>

        {/* Gender Cards */}
        <div className="genderselect-cards-container">
          <div
            className={`genderselect-card ${
              selectedGender === "man" ? "genderselect-card-selected" : ""
            }`}
            onClick={() => handleSelectGender("man")}
            style={{
              backgroundColor: selectedGender === "man" ? "#F3FFFE" : "var(--dietcard-bg)",
              borderColor: "var(--profile-border)",
            }}
          >
            <img
              src={man}
              alt="Gender man"
              className="genderselect-image"
            />
          </div>
          <div
            className={`genderselect-card ${
              selectedGender === "woman" ? "genderselect-card-selected" : ""
            }`}
            onClick={() => handleSelectGender("woman")}
            style={{
              backgroundColor: selectedGender === "woman" ? "#F3FFFE" : "var(--dietcard-bg)",
              borderColor: "var(--profile-border)",
            }}
          >
            <img
              src={woman}
              alt="Gender woman"
              className="genderselect-image"
            />
          </div>
        </div>

        {/* Labels */}
        <div className="genderselect-labels">
          <h2
            className="genderselect-label"
            style={{ color: "var(--general-charcoal-text)" }}
          >
            Man
          </h2>
          <h2
            className="genderselect-label"
            style={{ color: "var(--general-charcoal-text)" }}
          >
            Woman
          </h2>
        </div>

        {/* Button */}
        <div className="genderselect-button-wrapper">
          <PrimaryButton
            text="CONFIRM"
            onClick={() => onGenderSelect(selectedGender)}
            disabled={!selectedGender}
            customStyle={{
              width: "var(--genderselect-button-width)",
              height: "var(--genderselect-button-height)",
              borderRadius: "var(--genderselect-button-radius)",
              fontSize: "var(--genderselect-button-text-size)",
              boxShadow: "0px 12px 26px rgba(255, 118, 117, 0.30)",
              opacity: selectedGender ? 1 : 0.5,
              cursor: selectedGender ? "pointer" : "not-allowed",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Genderselect;
