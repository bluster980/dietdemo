import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CallClient from "../assets/callclient.svg";
import RemoveClient from "../assets/removeclient.svg";
import EnterArrow from "../assets/enterarrow.svg";
import ConfirmDialog from "./ConfirmDialog";
// import oatmeal from "../assets/oatmeal.png";
import Diet from "../assets/diet.svg";
import Edit from "../assets/edit.svg";
import DietDemo from "../assets/dietdemo.svg";
import WorkoutMod from "../assets/workoutmod.svg";
import Workout from "../assets/workout.svg";
import RightArrow from "../assets/rightarrow.svg";
import PlusCross from "../assets/pluscross.svg";
import DatePicker from "react-datepicker";
import {updatePlanExpiry} from "../utils/supabaseQueries";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/clientcardresponsive.css";
import manIcon from "../assets/manicon.jpg";
import womanIcon from "../assets/womanicon.jpg";

const ClientCard = ({
  client,
  isDropdownOpen,
  onDropdownToggle,
  onClick,
  onActionClick,
  onCloseDropdown,
  isClientRequest,
  onUpdateClient,
  onAcceptClick,
  onRejectClick,
  onRemoveClient,
}) => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isEditingExpiry, setIsEditingExpiry] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [expiryDate, setExpiryDate] = useState(() => {
    if (!client?.subscription_expiry) return null;
    const s = String(client.subscription_expiry);
    let d = null;
    const m1 = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s);
    if (m1) {
      const [, dd, mm, yyyy] = m1;
      d = new Date(Date.UTC(+yyyy, +mm - 1, +dd));
    } else {
      const parts = s.split(" ");
      if (parts.length === 3) {
        d = new Date(s);
        if (isNaN(d)) {
          const [dd, mon, yyyy] = parts;
          const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
          ];
          const mi = months.indexOf(mon);
          if (mi >= 0) d = new Date(Date.UTC(+yyyy, mi, +dd));
        }
      }
    }
    return d && !isNaN(d) ? d : null;
  });

  const displayExpiry = expiryDate
    ? expiryDate
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .replace(/ /g, " ")
    : "N/A";

  useEffect(() => {
    if (!isDropdownOpen) return;
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onCloseDropdown();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen, onCloseDropdown]);

  const handleRemoveClick = (type) => {
    setDialogType(type);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleDropdownClick = (e) => {
    e.stopPropagation();
    onDropdownToggle();
  };

  const handleSaveEdit = async (field) => {
    if (!expiryDate) {
      onUpdateClient(field, { subscription_expiry: "", days: "N/A" });
      setIsEditingExpiry(false);
      return;
    }
    const y = expiryDate.getUTCFullYear();
    const m = String(expiryDate.getUTCMonth() + 1).padStart(2, "0");
    const d = String(expiryDate.getUTCDate()).padStart(2, "0");
    const dbStr = `${y}-${m}-${d}`;

    const today = new Date();
    const todayUTC = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const expUTC = Date.UTC(
      y,
      expiryDate.getUTCMonth(),
      expiryDate.getUTCDate()
    );
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.ceil((expUTC - todayUTC) / msPerDay);
    const days = diffDays > 0 ? diffDays : "Expired";
    
    console.log("updatePlanExpiry:", client.user_id, dbStr);

    const { error } = await updatePlanExpiry(client.user_id, dbStr);
    if (error) {
      console.error("updatePlanExpiry error:", error.message);
      return;
    }

    onUpdateClient(client.user_id, {
      subscription_expiry: `${d}-${m}-${y}`,
      days,
    });

    setIsEditingExpiry(false);
  };

  const calculateDaysRemaining = (dateObj) => {
    if (!dateObj) return "N/A";
    const today = new Date();
    const todayUTC = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const expUTC = Date.UTC(
      dateObj.getUTCFullYear(),
      dateObj.getUTCMonth(),
      dateObj.getUTCDate()
    );
    const diff = Math.ceil((expUTC - todayUTC) / (24 * 60 * 60 * 1000));
    return diff > 0 ? diff : "Expired";
  };

  console.log("ClientCard:", client);
  return (
    <div className="clientcard-wrapper">
      <div className="clientcard-dialog-container">
        <ConfirmDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          onConfirm={async () => {
            setIsDialogOpen(false);
            if (dialogType === "remove" && onRemoveClient)
              await onRemoveClient();
            if (dialogType === "reject" && onRejectClick) await onRejectClick();
            setDialogType(null);
          }}
        />
      </div>

      <div
        className="clientcard-container"
        onClick={onClick}
        style={{ 
          backgroundColor: "var(--dietcard-bg)", 
          borderColor: "var(--profile-border)" 
        }}
      >
        <img
          src={client.gender === "man" ? manIcon : womanIcon}
          className="clientcard-avatar"
          alt="Client avatar"
          style={{borderRadius: '50%'}}
        />
        
        <div className="clientcard-content">
          <div className="clientcard-info-section">
            <div className="clientcard-header">
              <div className="clientcard-header-row">
                <span className="clientcard-name" style={{ color: "var(--general-charcoal-text)" }}>
                  {client.name}
                </span>
                {isEditingExpiry && (
                  <div
                    className="clientcard-save-btn"
                    onClick={() => {
                      handleSaveEdit();
                      setIsEditingExpiry(false);
                    }}
                  >
                    <span className="clientcard-save-text">Save</span>
                  </div>
                )}
              </div>
              <span className="clientcard-mobile" style={{ color: "var(--faded-text)" }}>
                +91 {client.mobile_number}
              </span>
            </div>

            <div className="clientcard-details-row">
              <div className="clientcard-detail-group">
                <span className="clientcard-detail-label" style={{ color: "var(--faded-text)" }}>
                  Plan Expiry
                </span>
                {isEditingExpiry ? (
                  <DatePicker
                    selected={expiryDate}
                    onChange={(date) => setExpiryDate(date || null)}
                    minDate={
                      new Date(new Date().setDate(new Date().getDate() + 1))
                    }
                    dateFormat="dd MMM yyyy"
                    placeholderText="Select date"
                    autoFocus
                    className="clientcard-datepicker"
                  />
                ) : (
                  <span className="clientcard-detail-value" style={{ color: "var(--faded-text)" }}>
                    {displayExpiry}
                  </span>
                )}
              </div>

              <div className="clientcard-detail-group">
                <span className="clientcard-detail-label" style={{ color: "var(--faded-text)" }}>
                  Days Remaining
                </span>
                <span className="clientcard-detail-value" style={{ color: "var(--faded-text)" }}>
                  {isEditingExpiry
                    ? calculateDaysRemaining(expiryDate)
                    : client?.days || "N/A"}
                </span>
              </div>

              {!isClientRequest && (
                <div className="clientcard-call-section">
                  <a href={`tel:${client.mobile_number}`}>
                    <CallClient className="clientcard-call-icon" />
                    <p className="clientcard-call-text" style={{ color: "var(--faded-text)" }}>
                      Call
                    </p>
                  </a>
                </div>
              )}
            </div>
          </div>

          {isClientRequest && (
            <div className="clientcard-request-actions">
              <div
                className="clientcard-accept-btn"
                onClick={() => onAcceptClick && onAcceptClick()}
              >
                <span className="clientcard-accept-text">Accept</span>
                <RightArrow className="clientcard-accept-icon" />
              </div>
              <div
                className="clientcard-reject-btn"
                onClick={() => handleRemoveClick("reject")}
              >
                <span className="clientcard-reject-text">Reject</span>
                <PlusCross className="clientcard-reject-icon" />
              </div>
            </div>
          )}

          {!isClientRequest && (
            <div className="clientcard-dropdown-trigger">
              {!isEditingExpiry && (
                <div className="clientcard-dropdown-toggle-top">
                  <div
                    className="clientcard-dropdown-btn"
                    onClick={handleDropdownClick}
                  >
                    <EnterArrow />
                  </div>
                </div>
              )}
              {isEditingExpiry && (
                <div className="clientcard-dropdown-toggle-edit">
                  <div
                    className="clientcard-dropdown-btn"
                    onClick={handleDropdownClick}
                  >
                    <EnterArrow />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="clientcard-dropdown-menu"
            style={{ 
              backgroundColor: "var(--dietcard-bg)",
              borderColor: "var(--profile-border)"
            }}
          >
            <div
              className="clientcard-dropdown-item"
              onClick={() => navigate('/trainer/clientmeal', { state: { user_id: client.user_id, name: client.name } })}
            >
              <DietDemo className="clientcard-dropdown-icon" />
              <p className="clientcard-dropdown-text" style={{ color: "var(--faded-text)" }}>
                Diet
              </p>
            </div>
            <div
              className="clientcard-dropdown-item"
              onClick={() => navigate('/trainer/clientexcercise', { state: { user_id: client.user_id, name: client.name } })}
            >
              <WorkoutMod className="clientcard-dropdown-icon" />
              <p className="clientcard-dropdown-text" style={{ color: "var(--faded-text)" }}>
                Workout
              </p>
            </div>
            <div
              className="clientcard-dropdown-item"
              onClick={() => {
                setIsEditingExpiry(true);
                onCloseDropdown();
              }}
            >
              <Edit className="clientcard-dropdown-icon" />
              <p className="clientcard-dropdown-text" style={{ color: "var(--faded-text)" }}>
                Edit
              </p>
            </div>
            <div
              className="clientcard-dropdown-item"
              onClick={() => {
                onActionClick("Remove");
                handleRemoveClick("remove");
              }}
            >
              <RemoveClient className="clientcard-dropdown-icon" />
              <p className="clientcard-dropdown-text" style={{ color: "var(--faded-text)" }}>
                Remove
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientCard;
