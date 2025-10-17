import React, { useState } from "react";
import WeighingScale from "../assets/weighingscale.svg";
import RightArrow from "../assets/rightarrow.svg";
import { useUser } from "../context/UserContext";
import {
  updateUserField,
  updateOrInsertWeightRecord,
} from "../utils/supabaseQueries";
import toast from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import "../styles/bottomsheetresponsive.css";

const BottomSheet = ({ isOpen, onClose, onWeightSubmitSuccess }) => {
  const [weightInput, setWeightInput] = useState("");
  const { userData, setUserData } = useUser();

  const handleWeightSubmit = async () => {
    if (!userData) {
      toast.error("User data missing. Please refresh the page.");
      return;
    }

    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight <= 0) {
      toast.error("Please enter a valid weight.");
      return;
    }

    try {
      const { data, error } = await updateUserField(userData.user_id, {
        weight: weight,
      });
      if (error) {
        toast.error("❌ Error updating weight: " + error.message);
        return;
      }

      await updateOrInsertWeightRecord(userData.user_id, weight);
      toast.success("Weight recorded successfully!", { duration: 5000 });
      setWeightInput("");

      if (typeof onWeightSubmitSuccess === "function") {
        onWeightSubmitSuccess();
      }

      const updatedUserData = { ...userData, weight: data.weight };
      setUserData(updatedUserData);

      onClose();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="bottomsheet-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="bottomsheet-container"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="bottomsheet-content">
              {/* Left side - Icon & Text */}
              <div className="bottomsheet-left">
                <WeighingScale className="bottomsheet-icon" />
                <div className="bottomsheet-title" style={{color: "var(--general-charcoal-text)"}}>
                  <span>Enter your</span>
                  <span>today's weight</span>
                </div>
              </div>

              {/* Right side - Input & Submit */}
              <div className="bottomsheet-input-container">
                <div className="bottomsheet-input-field">
                  <label className="bottomsheet-label" style={{color: "var(--faded-text)"}}>Weight, kg</label>
                  <input
                    inputMode="decimal"
                    className="bottomsheet-input"
                    placeholder="00.00"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    style={{color: "var(--general-charcoal-text)"}}
                  />
                </div>
                <button
                  onClick={handleWeightSubmit}
                  className="bottomsheet-submit-btn"
                  aria-label="Submit weight"
                >
                  <RightArrow className="bottomsheet-arrow" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
