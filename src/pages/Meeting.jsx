import React, { useEffect, useState } from "react";
import BackArrow from "../assets/backarrow.svg";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavBar";
import PrimaryButton from "../components/PrimaryButton";
import ToggleButton from "../components/ToggleButton";
import Meetings from "../assets/meetings.svg";
import { useUser } from "../context/UserContext";
import toast from "react-hot-toast";
import {
  createMeetingNotification,
  getTrainerUserId,
  fetchLatestMeeting,
} from "../utils/supabaseQueries";
import "../styles/meetingresponsive.css";

const generateTimeSlots = () => {
  const now = new Date();
  const minutes = now.getMinutes();
  const nextSlot = new Date(now);
  nextSlot.setHours(now.getHours());

  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  nextSlot.setMinutes(roundedMinutes % 60);
  if (roundedMinutes >= 60) nextSlot.setHours(nextSlot.getHours() + 1);

  nextSlot.setSeconds(0);
  nextSlot.setMilliseconds(0);

  // Add at least 1 hour
  nextSlot.setTime(nextSlot.getTime() + 60 * 60 * 1000);

  // Create 12 time slots (30 mins apart)
  const slots = [];
  for (let i = 0; i < 12; i++) {
    const slot = new Date(nextSlot.getTime() + i * 30 * 60 * 1000);
    let hours = slot.getHours();
    const mins = slot.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    slots.push(`${hours}:${mins} ${ampm}`);
  }
  return slots;
};

const Meeting = () => {
  const navigate = useNavigate();
  const { userData, lastMeetingDate, setLastMeetingDate } = useUser();
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(2);
  const [activeCallType, setActiveCallType] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.user_id) {
      setIsSubmitted(false);
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    if (lastMeetingDate && lastMeetingDate === today) {
      setIsSubmitted(true);
      setLoading(false);
      return;
    }

    const checkMeetingEligibility = async () => {
      const { data, error } = await fetchLatestMeeting(userData.user_id);
      if (error) {
        setIsSubmitted(false);
      } else if (data) {
        const meetingDate = new Date(data.time).toISOString().split("T")[0];
        if (meetingDate === today) {
          setIsSubmitted(true);
          setLastMeetingDate(meetingDate);
        } else {
          setIsSubmitted(false);
        }
      } else {
        setIsSubmitted(false);
      }
      setLoading(false);
    };

    checkMeetingEligibility();
  }, [userData, lastMeetingDate, setLastMeetingDate]);

  useEffect(() => {
    setTimeSlots(generateTimeSlots());
  }, []);

  const handleVoiceToggle = () => {
    setActiveCallType(activeCallType === "voice" ? "video" : "voice");
  };
  const handleVideoToggle = () => {
    setActiveCallType(activeCallType === "video" ? "voice" : "video");
  };

  if (loading || isSubmitted === null) {
    return (
      <div className="meeting-loading">
        {/* loader */}
      </div>
    );
  }

  const handleSubmit = async () => {
    if (activeCallType === null) {
      toast.error("Please choose Voice or Video call.");
      return;
    }
    const fullContent = `${timeSlots[selectedIndex]} - ${activeCallType}`;
    const trainerUserId = await getTrainerUserId(userData.trainer_id);
    if (!trainerUserId) {
      alert("Could not find trainer. Please try again.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    setLastMeetingDate(today);
    setIsSubmitted(true);
    toast.success("Meeting scheduled successfully");

    const response = await createMeetingNotification({
      content: fullContent,
      sender_id: userData.user_id,
      receiver_id: trainerUserId,
      answer: `This Meeting is Scheduled by ${userData.name} on ${fullContent}.`,
    });

    if (!response.success) {
      alert("Failed to schedule meeting");
      setIsSubmitted(false);
      setLastMeetingDate(null);
    }
  };

  const isReady = !isSubmitted && (activeCallType === "voice" || activeCallType === "video");

  return (
    <div className="df-viewport">
      <main className="meeting-page">
        {/* Back Arrow */}
        <button 
          className="meeting-back-btn" 
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <BackArrow className="profile-back-icon" />
        </button>

        {/* Page Title */}
        <h1 className="meeting-page-title" style={{ color: "var(--general-charcoal-text)"}}>Schedule Meeting</h1>

        {/* Meeting Card */}
        <div className="meeting-card" style={{backgroundColor: "var(--dietcard-bg)", borderColor: "var(--profile-border)"}}>
          {!isSubmitted ? (
            <>
              {/* Time Slots Section */}
              <div className="meeting-section">
                <h2 className="meeting-section-title" style={{color: "var(--faded-text)"}}>Select Hour</h2>
                <div className="meeting-time-grid">
                  {timeSlots.map((time, index) => {
                    const selected = selectedIndex === index;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedIndex(index)}
                        className={`meeting-time-slot ${selected ? 'meeting-time-slot-selected' : ''}`}
                        aria-pressed={selected}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Call Type Section */}
              <div className="meeting-section meeting-call-type-section">
                <div className="meeting-toggle-row">
                  <span className="meeting-toggle-label" style={{color: "var(--faded-text)"}}>Voice Call</span>
                  <ToggleButton
                    isActive={activeCallType === "voice"}
                    onToggle={handleVoiceToggle}
                  />
                </div>
                <div className="meeting-toggle-row">
                  <span className="meeting-toggle-label" style={{color: "var(--faded-text)"}}>Video Call</span>
                  <ToggleButton
                    isActive={activeCallType === "video"}
                    onToggle={handleVideoToggle}
                  />
                </div>
              </div>

              {/* Spacer */}
              <div className="meeting-spacer"></div>

              {/* Submit Button */}
              <div className="meeting-button-wrapper">
                <PrimaryButton
                  text="CONFIRM"
                  onClick={handleSubmit}
                  disabled={!isReady}
                  customStyle={{
                    width: "100%",
                    height: "var(--meeting-button-height)",
                    borderRadius: 12,
                    background: !isReady ? "#FFC2BE" : "#FF7675",
                    boxShadow: "none",
                    cursor: !isReady ? "not-allowed" : "pointer",
                    opacity: !isReady ? 0.7 : 1,
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    letterSpacing: 0,
                    fontWeight: 700,
                  }}
                />
                <div className="meeting-notice">
                  <div className="meeting-notice-dot"></div>
                  <span className="meeting-notice-text">One meeting per day</span>
                </div>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="meeting-success-wrapper">
              <div className="meeting-success-content">
                <div className="meeting-success-icon">
                  <Meetings />
                </div>
                <p className="meeting-success-text" style={{color: "var(--faded-text)"}}>
                  Your meeting with the trainer is scheduled at{" "}
                  <span className="meeting-success-time">{timeSlots[selectedIndex]}</span>
                </p>
              </div>
              <div className="meeting-reschedule">
                <span className="meeting-reschedule-text">Do you want to change time?</span>
                <button
                  type="button"
                  className="meeting-reschedule-btn"
                  onClick={() => setIsSubmitted(false)}
                >
                  Reschedule
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Bar */}
        <div className="nav-wrap">
          <NavigationBar />
        </div>
      </main>
    </div>
  );
};

export default Meeting;
