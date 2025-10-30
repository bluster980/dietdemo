import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../components/PrimaryButton";
import BackArrow from "../assets/backarrow.svg";
import Trainerverificationlogo from "../assets/trainerverificationlogo.svg";
import { isTrainerIdAvailable, insertTrainerId } from "../utils/supabaseQueries";
import "../styles/trainerverificationresponsive.css";

const Trainerverification = () => {
  const navigate = useNavigate();
  const prefixRef = useRef(null);
  const digitsRef = useRef(null);
  const [prefix, setPrefix] = useState("");
  const [digits, setDigits] = useState("");
  const [error, setError] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

   // ADD THIS EFFECT - Monitor input validity
  useEffect(() => {
    const isValid = prefix.length === 2 && digits.length === 3;
    setIsButtonDisabled(!isValid);
  }, [prefix, digits]);

  const handlePrefixChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
    if (val.length <= 2) {
      setPrefix(val);
      setError("");
      if (val.length === 2) {
        digitsRef.current.focus();
      }
    }
  };

  const handleDigitsChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length <= 3) {
      setDigits(val);
      setError("");
    }
  };

  const handleDigitsKeyDown = (e) => {
    if (e.key === "Backspace" && digits === "") {
      setPrefix((prev) => {
        const newPrefix = prev.slice(0, -1);
        setTimeout(() => {
          prefixRef.current.focus();
        }, 0);
        return newPrefix;
      });
    }
  };

  const validateTrainerId = async () => {
    const id = `${prefix.toUpperCase()}-${digits}`;
    setError("");

    if (!/^[A-Z]{2}-\d{3}$/.test(id)) {
      setError(
        "Trainer ID must be 2 letters & 3 digits (e.g. AB-123)"
      );
      return false;
    }

    const available = await isTrainerIdAvailable(id);
    if (!available) {
      setError("Trainer ID is already taken, change last digits.");
      return false;
    }

    return id;
  };

  const handleSubmit = async () => {
    if (isButtonDisabled || isSubmitting) return;
    const trainerId = await validateTrainerId();
    if (!trainerId) return;

    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setError("Something went wrong. Please try again. about user_id");
      setIsSubmitting(false);
      return;
    }

    const { data } = await insertTrainerId(userId, trainerId);
    console.log("Trainer Verification Data", data[0]);
    if (data) {
      console.log("Trainer Verification Data", data);
      localStorage.setItem("trainer_id", data[0].trainer_id);
      navigate("/trainer/manageclient");
    } else {
      setError("Something went wrong. Please try again. else part");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="trainerverification-viewport">
      <div className="trainerverification-page" style={{ backgroundColor: "var(--bg)" }}>
        {/* Back Arrow */}
        <button
          className="trainerverification-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <BackArrow className="trainerverification-back-icon" color="var(--general-charcoal-text)" />
        </button>

        {/* Content */}
        <div className="trainerverification-content">
          {/* Logo */}
          <div className="trainerverification-logo-wrapper">
            <Trainerverificationlogo className="trainerverification-logo" />
          </div>

          {/* Form Section */}
          <div className="trainerverification-form">
            <h1
              className="trainerverification-title"
              style={{ color: "var(--general-charcoal-text)" }}
            >
              Trainer Verification
            </h1>

            <p className="trainerverification-subtitle">
              <span
                className="trainerverification-subtitle-light"
                style={{ color: "var(--faded-text)" }}
              >
                Create your
              </span>{" "}
              <span
                className="trainerverification-subtitle-bold"
                style={{ color: "var(--general-charcoal-text)" }}
              >
                Trainer ID
              </span>
            </p>

            {/* ID Input */}
            <div className="trainerverification-input-group">
              <input
                ref={prefixRef}
                className="trainerverification-input trainerverification-input-prefix"
                placeholder="JP"
                maxLength={2}
                value={prefix}
                onChange={handlePrefixChange}
                disabled={isSubmitting} // ADD THIS
                autoFocus 
                style={{
                  backgroundColor: "var(--profile-section-card-bg)",
                  borderColor: "var(--profile-border)",
                  color: "var(--general-charcoal-text)",
                }}
              />
              <span
                className="trainerverification-separator"
                style={{ color: "var(--faded-text)" }}
              >
                -
              </span>
              <input
                ref={digitsRef}
                className="trainerverification-input trainerverification-input-digits"
                placeholder="180"
                type="text"
                value={digits}
                onChange={handleDigitsChange}
                onKeyDown={handleDigitsKeyDown}
                disabled={isSubmitting}
                style={{
                  backgroundColor: "var(--profile-section-card-bg)",
                  borderColor: "var(--profile-border)",
                  color: "var(--general-charcoal-text)",
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <p className="trainerverification-error">{error}</p>
            )}

            {/* Instructions */}
            <div className="trainerverification-instructions">
              <p
                className="trainerverification-instructions-title"
                style={{ color: "var(--general-charcoal-text)" }}
              >
                Trainer ID must be:
              </p>
              <div className="trainerverification-instructions-list">
                <div className="trainerverification-instruction-item">
                  <div className="trainerverification-bullet"></div>
                  <span
                    className="trainerverification-instruction-text"
                    style={{ color: "var(--faded-text)" }}
                  >
                    The first two letters must be from A to Z.
                  </span>
                </div>
                <div className="trainerverification-instruction-item">
                  <div className="trainerverification-bullet"></div>
                  <span
                    className="trainerverification-instruction-text"
                    style={{ color: "var(--faded-text)" }}
                  >
                    Next three digits must be 0-9.
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="trainerverification-cta">
              <PrimaryButton
                text={isSubmitting ? "CREATING..." : "CREATE & PROCEED"}
                onClick={handleSubmit}
                disabled={isButtonDisabled || isSubmitting}
                customStyle={{
                  width: "var(--trainerverification-button-width)",
                  height: "var(--trainerverification-button-height)",
                  borderRadius: "var(--trainerverification-button-radius)",
                  fontSize: "var(--trainerverification-button-text-size)",
                  boxShadow: "0px 12px 26px rgba(255, 118, 117, 0.30)",
                  opacity: isButtonDisabled || isSubmitting ? 0.5 : 1,
                  cursor: isButtonDisabled || isSubmitting ? "not-allowed" : "pointer",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trainerverification;
