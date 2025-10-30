import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BackArrow from "../assets/backarrow.svg";
import Userverificationlogo from "../assets/userverificationlogo.svg";
import HorizontalLine from "../assets/horizontalline.svg";
import { updateUserFieldLocally } from "../utils/userOnboarding";
import { useUser } from "../context/UserContext";
import { userAgeNotNull, trainerIdDecided } from "../utils/supabaseQueries";
import "../styles/userverificationresponsive.css";
import { toast } from "react-hot-toast";

const Userverification = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("client");
  const [name, setName] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const roleRef = useRef(selectedRole);
  const nameRef = useRef(name);
  const { refreshUser, refreshTrainer } = useUser();

  const handleCheckboxChange = (role) => {
    const updatedRole =
      selectedRole === role ? (role === "client" ? "trainer" : "client") : role;
    setSelectedRole(updatedRole);
    roleRef.current = updatedRole;
  };

  // ADD THIS EFFECT TO MONITOR NAME INPUT
  useEffect(() => {
    const trimmedName = name.trim();
    setIsButtonDisabled(trimmedName.length === 0);
  }, [name]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.phone.email/sign_in_button_v1.js";
    script.async = true;
    document.body.appendChild(script);

    window.phoneEmailListener = async (userObj) => {
      const trimmedName = nameRef.current?.trim();
      if (!trimmedName || trimmedName.length === 0) {
        toast.error("Please enter your name before proceeding", {
          duration: 3000,
          position: "top-center",
        });
        return; // Block the flow
      }
      const user_json_url = userObj.user_json_url;

      sessionStorage.setItem("user_json_url", user_json_url);
      updateUserFieldLocally("mobile_number", userObj.user_phone_number);

      // const trimmedName = nameRef.current?.trim();
      if (trimmedName) {
        updateUserFieldLocally("name", trimmedName);
      }
      try {
        const res = await fetch("https://dietdelta.onrender.com/api/auth/jwt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_json_url,
            name: trimmedName || "",
            role: roleRef.current,
          }),
        });
        if (!res.ok) throw new Error("Verification failed");
        console.log("JWT creation response from backend:", res);
        const { access_token, user_id } = await res.json();

        localStorage.setItem("access_token", access_token);
        console.log("USER_ID FROM USERVERIFICATION", user_id);
        localStorage.setItem("user_id", user_id);

        if (roleRef.current === "trainer") {
          await refreshTrainer();
          const { data } = await trainerIdDecided(user_id);
          console.log("TRAINER ID DECIDED", data);
          if (data) {
            navigate("/trainer/manageclient", { replace: true });
          } else {
            navigate("/trainer/trainerverification", { replace: true });
          }
        } else {
          await refreshUser();
          const { data } = await userAgeNotNull(user_id);
          if (data.exists) {
            navigate("/Diary", { replace: true });
          } else {
            navigate("/Genderselect", { replace: true });
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Verification failed. Please try again.", {
          // ADD ERROR TOAST
          duration: 3000,
        });
      }
    };

    return () => {
      window.phoneEmailListener = null;
    };
  }, []);

  return (
    <div className="userverification-viewport">
      <div
        className="userverification-page"
        style={{ backgroundColor: "var(--bg)" }}
      >
        {/* Back Arrow */}
        <button
          className="userverification-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <BackArrow
            className="userverification-back-icon"
            style={{ color: "var(--faded-text)" }}
          />
        </button>

        {/* Content */}
        <div className="userverification-content">
          {/* Logo */}
          <div className="userverification-logo-wrapper">
            <Userverificationlogo className="userverification-logo" />
          </div>

          {/* Form Section */}
          <div className="userverification-form">
            <h1
              className="userverification-title"
              style={{ color: "var(--general-charcoal-text)" }}
            >
              OTP Verification
            </h1>

            <div className="userverification-subtitle">
              <p style={{ color: "var(--faded-text)" }}>
                We will send you an{" "}
                <span
                  className="userverification-subtitle-highlight"
                  style={{ color: "var(--general-charcoal-text)" }}
                >
                  One Time Password
                </span>{" "}
              </p>
              <p style={{ color: "var(--faded-text)" }}>
                on your mobile number.
              </p>
            </div>

            <p
              className="userverification-label"
              style={{ color: "var(--general-charcoal-text)" }}
            >
              Your Lovely Name <span style={{ color: "#FF7675" }}>*</span>{" "}
              {/* ADD ASTERISK */}
            </p>

            <input
              type="text"
              className="userverification-input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                nameRef.current = e.target.value;
              }}
              placeholder="Enter your name"
              style={{
                color: "var(--general-charcoal-text)",
                backgroundColor: "var(--profile-section-card-bg)",
                borderRadius: "8px",
              }}
              autoFocus
            />

            <HorizontalLine
              className="userverification-line"
              style={{ color: "var(--profile-divider)" }}
            />

            {/* Role Selection */}
            <div className="userverification-roles">
              <div className="userverification-role-option">
                <input
                  type="checkbox"
                  checked={selectedRole === "trainer"}
                  onChange={() => handleCheckboxChange("trainer")}
                  className="userverification-checkbox"
                  id="role-trainer"
                />
                <label
                  htmlFor="role-trainer"
                  className="userverification-role-label"
                  style={{ color: "var(--general-charcoal-text)" }}
                >
                  Trainer
                </label>
              </div>

              <div className="userverification-role-option">
                <input
                  type="checkbox"
                  checked={selectedRole === "client"}
                  onChange={() => handleCheckboxChange("client")}
                  className="userverification-checkbox"
                  id="role-client"
                />
                <label
                  htmlFor="role-client"
                  className="userverification-role-label"
                  style={{ color: "var(--general-charcoal-text)" }}
                >
                  Client
                </label>
              </div>
            </div>

            {/* ADD HELPER TEXT */}
            {isButtonDisabled && (
              <p className="userverification-helper-text">
                Please enter your name to continue
              </p>
            )}
            {/* Sign In Button Container */}
            <div
              className={`userverification-button-container ${
                isButtonDisabled ? "userverification-button-disabled" : ""
              }`} // ADD CONDITIONAL CLASS
              style={{
                opacity: isButtonDisabled ? 0.5 : 1, // ADD VISUAL FEEDBACK
                cursor: isButtonDisabled ? "not-allowed" : "pointer",
              }}
            >
              <div
                className="pe_signin_button"
                data-client-id={import.meta.env.VITE_CLIENT_ID_PHONE_OTP}
                data-color="#FF7675"
                style={{
                  pointerEvents: isButtonDisabled ? "none" : "auto", // DISABLE CLICKS
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Userverification;
