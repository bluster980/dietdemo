import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CallClient from "../assets/callclient.svg";
import RemoveClient from "../assets/removeclient.svg";
import EnterArrow from "../assets/enterarrow.svg";
import ConfirmDialog from "./ConfirmDialog";
import oatmeal from "../assets/oatmeal.png";
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
// eslint-disable-next-line no-unused-vars
import { color, transform } from "framer-motion";

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
  // console.log('ClientCard:', client);
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isEditingExpiry, setIsEditingExpiry] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [expiryDate, setExpiryDate] = useState(() => {
    // client.subscription_expiry is “dd-mm-yyyy” or “dd MMM yyyy” from parent
    if (!client?.subscription_expiry) return null;
    // Try parse dd-mm-yyyy first, else dd MMM yyyy
    const s = String(client.subscription_expiry);
    let d = null;
    // dd-mm-yyyy -> Date UTC
    const m1 = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s);
    if (m1) {
      const [, dd, mm, yyyy] = m1;
      d = new Date(Date.UTC(+yyyy, +mm - 1, +dd));
    } else {
      // dd MMM yyyy (e.g., 18 Sep 2025)
      const parts = s.split(" ");
      if (parts.length === 3) {
        d = new Date(s); // may work in many locales, fallback below if NaN
        if (isNaN(d)) {
          // Map month short manually to index
          const [dd, mon, yyyy] = parts;
          const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          const mi = months.indexOf(mon);
          if (mi >= 0) d = new Date(Date.UTC(+yyyy, mi, +dd));
        }
      }
    }
    return d && !isNaN(d) ? d : null;
  });

  // Keep a derived string for display (dd MMM yyyy)
  const displayExpiry = expiryDate
    ? expiryDate
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .replace(/ /g, " ")
    : "N/A";

  // Close dropdown when clicking outside
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
    setDialogType(type); // "remove" or "reject"
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleDropdownClick = (e) => {
    e.stopPropagation(); // Prevent card click event
    onDropdownToggle();
  };

  const handleSaveEdit = async (field) => {
    if (!expiryDate) {
      onUpdateClient(field, { subscription_expiry: "", days: "N/A" });
      setIsEditingExpiry(false);
      return;
    }
    // Format to DB string (yyyy-mm-dd)
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

    onUpdateClient(field, {
      subscription_expiry: `${d}-${m}-${y}`, // if your list expects dd-mm-yyyy display
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

  return (
    <div className="w-full flex justify-center items-center mt-[10px]">
      {/* confirm dialog for user deletion or not. */}
      <div className="absolute z-30 left-[0px] top-[0px]">
        <ConfirmDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          onConfirm={async () => {
            setIsDialogOpen(false);
            if (dialogType === "remove" && onRemoveClient)
              await onRemoveClient();
            if (dialogType === "reject" && onRejectClick) await onRejectClick();
            setDialogType(null); // clear after use
          }}
        />
      </div>

      <div
        className="relative flex w-[385px] h-[104px] border border-[#E9ECEF] rounded-[10px] bg-white"
        onClick={onClick}
        style={{ boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.04)" }}
      >
        <img
          src={oatmeal}
          className="w-[65px] h-[65px] rounded-[10px] mt-[12px] ml-[12px] text-[15px]"
          alt="No img available"
        />
        <div className="flex ml-[15px] ">
          <div className="flex flex-col mt-[5px]">
            <div className="flex flex-col">
              <div className="flex justify-between items-center">
                <span className="font-urbanist font-semibold text-[20px] text-[#2D3436] h-[26px]">
                  {client.name}
                </span>
                {isEditingExpiry && (
                  <div
                    className="h-[25px] w-[50px] bg-white border border-[#FFC2BE] flex justify-center items-center rounded-[5px] mt-[8px]"
                    onClick={() => {
                      handleSaveEdit(client.id);
                      setIsEditingExpiry(false);
                    }}
                  >
                    <span className="text-[16px] font-urbanist font-semibold text-[#6C757D]">
                      Save
                    </span>
                  </div>
                )}
              </div>
              <span className="font-urbanist font-semibold text-[13px] text-[#777474] mt-[0px]">
                +91 {client.mobile_number}
              </span>
            </div>
            <div className="flex mt-[4px]">
              <div className="flex flex-col">
                <span className="font-urbanist text-[13px] text-[#8B8888]">
                  Plan Expiry
                </span>

                {isEditingExpiry ? (
                  <DatePicker
                    selected={expiryDate} // Date or null
                    onChange={(date) => setExpiryDate(date || null)}
                    minDate={
                      new Date(new Date().setDate(new Date().getDate() + 1))
                    }
                    dateFormat="dd MMM yyyy"
                    placeholderText="Select date"
                    autoFocus
                    className="font-urbanist font-semibold text-[13px] border border-gray-300 rounded px-2 py-1 w-[90px] h-[20px] text-[#656262]"
                  />
                ) : (
                  <span className="font-urbanist font-semibold text-[13px] text-[#656262] mt-[3px]">
                    {displayExpiry}
                  </span>
                )}
              </div>
              <p className="flex flex-col ml-[15px]">
                <span className="font-urbanist text-[13px] text-[#8B8888]">
                  Days Remaining
                </span>
                <span className="font-urbanist font-semibold text-[13px] text-[#656262] mt-[3px]">
                  {isEditingExpiry
                    ? calculateDaysRemaining(expiryDate)
                    : client?.days || "N/A"}
                </span>
              </p>

              {!isClientRequest && (
                <div className="flex flex-col justify-center items-center ml-[18px] mt-[3px]">
                  <a href={client.mobile_number}>
                    <CallClient />
                    <p className="font-urbanist font-semibold text-[13px] text-[#656262]">
                      Call
                    </p>
                  </a>
                </div>
              )}
            </div>
          </div>
          {isClientRequest && (
            <div className="flex flex-col justify-center items-center ml-[23px] gap-y-[4px]">
              <div
                className="flex justify-between items-center h-[40px] w-[88px] border border-[#FFC2BE] rounded-[10px]"
                onClick={() => onAcceptClick && onAcceptClick()} // direct call
                style={{ cursor: "pointer" }}
              >
                <p className="text-[15px] font-urbanist text-[#ff7675] font-bold ml-[11px]">
                  <span>Accept</span>
                </p>
                <RightArrow
                  className="w-[18px] h-[18px] mr-[4px]"
                  style={{ color: "#ff7675" }}
                />
              </div>
              <div
                className="flex justify-between items-center h-[40px] w-[88px] border border-[#d1d1d1] rounded-[10px]"
                onClick={() => handleRemoveClick("reject")}
                style={{ cursor: "pointer" }}
              >
                <p className="text-[15px] font-urbanist text-[#6C757D] font-semibold ml-[11px]">
                  <span>Reject</span>
                </p>
                <PlusCross
                  className="w-[20px] h-[20px] mr-[4px]"
                  style={{ transform: "rotate(45deg)", color: "#6C757D" }}
                />
              </div>
            </div>
          )}
          {!isClientRequest && (
            <div className="w-[68px] flex flex-col mt-[5px]">
              {!isEditingExpiry && (
                <div className="flex justify-end items-end">
                  <div
                    className="h-[20px] w-[20px] rounded-[10px] mt-[5px]"
                    style={{ boxShadow: "0px 1px 5px rgba(0, 0, 0, 0.15)" }}
                    onClick={handleDropdownClick}
                  >
                    <EnterArrow />
                  </div>
                </div>
              )}
              {isEditingExpiry && (
                <div className="flex justify-end items-end mr-[5px]">
                  <div
                    className="h-[20px] w-[20px] rounded-[10px] mt-[5px]"
                    style={{ boxShadow: "0px 1px 5px rgba(0, 0, 0, 0.15)" }}
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
            className="absolute flex flex-col text-center z-20 top-[0px] right-[12px] rounded-[10px] bg-white h-[142px] w-[110px] mt-[35px]"
            style={{ boxShadow: "0px 1px 25px rgba(0, 0, 0, 0.15)" }}
          >
            <div
              className="flex items-center mt-[10px] gap-x-[10px] ml-[10px]"
              onClick={() => navigate("/trainer/clientmeal")}
              style={{ color: "#B7B4B7" }}
            >
              <DietDemo />
              <p className="font-urbanist font-semibold text-[13px] text-[#656262] mt-[3px]">
                Diet
              </p>
            </div>
            <div
              className="flex items-center mt-[8px] gap-x-[10px] ml-[10px]"
              onClick={() => navigate("/trainer/clientexcercise")}
              style={{ color: "#B7B4B7" }}
            >
              <WorkoutMod />
              <p className="font-urbanist font-semibold text-[13px] text-[#656262] mt-[2px]">
                Workout
              </p>
            </div>
            <div
              className="flex items-center mt-[10px] gap-x-[10px] ml-[11.5px]"
              onClick={() => {
                setIsEditingExpiry(true);
                onCloseDropdown();
              }}
              style={{ color: "#B7B4B7" }}
            >
              <Edit />
              <p className="font-urbanist font-semibold text-[13px] text-[#656262] mt-[2px] ml-[0.6px]">
                Edit
              </p>
            </div>
            <div
              className="flex items-center mt-[10px] gap-x-[10px] ml-[12px]"
              onClick={() => {
                onActionClick("Remove");
                handleRemoveClick("remove");
              }}
            >
              <RemoveClient style={{ color: "#B7B4B7" }} />
              <p className="font-urbanist font-semibold text-[13px] text-[#656262] mt-[2px]">
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
