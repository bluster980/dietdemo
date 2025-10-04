import React, { useEffect, useState, useMemo } from "react";
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

// Visual tokens (aligned with QnA)
const CARD_MAX_W = 420;
const PAGE_GUTTER = 7; // same gutters as QnA [web:94][web:121]
const BORDER_DEFAULT = "#E9ECEF";

// Inner content width helper (aligned with QnA)
const contentWidth = {
  width: `calc(100% - ${PAGE_GUTTER * 2}px)`,
  maxWidth: CARD_MAX_W - PAGE_GUTTER * 2,
  margin: "0 auto",
  boxSizing: "border-box",
};

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
  }, [userData, lastMeetingDate, setLastMeetingDate]); // layout unaffected [web:109]

  useEffect(() => {
    setTimeSlots(generateTimeSlots());
  }, []);

  const handleVoiceToggle = () => {
    setActiveCallType(activeCallType === "voice" ? "video" : "voice");
  };
  const handleVideoToggle = () => {
    setActiveCallType(activeCallType === "video" ? "voice" : "video");
  };

  const containerStyle = useMemo(
    () => ({
      width: `calc(100% - ${PAGE_GUTTER * 2}px)`, // sits inside page gutters [7]
      maxWidth: CARD_MAX_W,
      margin: "16px auto 0",
      background: "#fff",
      borderRadius: 16,
      border: `1px solid ${BORDER_DEFAULT}`,
      boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
      padding: "22px 12px 10px 12px",
      boxSizing: "border-box",
      minHeight: "calc(100vh - 230px)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
    }),
    []
  );

  if (loading || isSubmitted === null) {
    return (
      <div style={{ height: "100vh" }} className="flex justify-center items-center">
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
    <div
      className="flex flex-col items-center"
      style={{
        background: "#ffffff",
        overflowX: "hidden",
        minHeight: "100vh",
        width: "100%",
        paddingLeft: PAGE_GUTTER,     // page gutters (aligned with QnA)
        paddingRight: PAGE_GUTTER,
        boxSizing: "border-box",
      }}
    >
      {/* Back header row (same pattern as QnA) */}
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          margin: "0 auto",
          height: 40,
          display: "flex",
          alignItems: "end",
          position: "relative",
        }}
      >
        <BackArrow
          onClick={() => navigate(-1)}
          style={{
            width: 30,
            height: 30,
            position: "absolute",
            left: -1,
            cursor: "pointer",
          }}
        />
      </div>

      {/* Title below back arrow (same pattern as QnA) */}
      <h1
        style={{
          width: "100%",
          textAlign: "left",
          margin: "24px 0 0 20px",
          fontSize: 32,
          lineHeight: "36px",
          fontWeight: 600,
          fontFamily: "urbanist, system-ui, sans-serif",
        }}
      >
        Schedule Meeting
      </h1>

      {/* Card container (aligned with QnA) */}
      <div
        style={containerStyle}
      >
        {/* TOP GROUP (unique content) */}
        <div id="meet-top" style={{ ...contentWidth }}>
          {!isSubmitted && (
            <>
              <div className="flex flex-col justify-center items-center text-center">
                <p style={{ width: "100%", maxWidth: 360, textAlign: "left", margin: "0 0 0 0" }}>
                  <span className="text-[22px] font-urbanist font-semibold text-[#2D3436]">
                    Select Hour
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap justify-between gap-y-[12px] mt-[12px]">
                {timeSlots.map((time, index) => {
                  const selected = selectedIndex === index;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className="flex items-center justify-center"
                      style={{
                        width: 106,
                        height: 44,
                        borderRadius: 12,
                        border: `1px solid ${selected ? "#FF7675" : "#E9ECEF"}`,
                        background: selected ? "#FF7675" : "#F7F8FA",
                        color: selected ? "#FFFFFF" : "#1F2937",
                        cursor: "pointer",
                        fontSize: 17.5,
                        fontFamily: "urbanist, system-ui, sans-serif",
                        fontWeight: selected ? 700 : 600,
                        boxSizing: "border-box", // avoid overflow [web:109]
                      }}
                      aria-pressed={selected}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>

              <div style={{ height: 18, marginTop: 6 }} />

              <div className="flex justify-between items-center mt-[0px] px-[2px]">
                <p className="text-start">
                  <span className="text-[22px] font-urbanist font-medium text-[#2D3436]">
                    Voice Call
                  </span>
                </p>
                <div className="mt-[2px]">
                  <ToggleButton
                    isActive={activeCallType === "voice"}
                    onToggle={handleVoiceToggle}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-[10px] px-[2px]">
                <p className="text-start">
                  <span className="text-[22px] font-urbanist font-medium text-[#2D3436]">
                    Video Call
                  </span>
                </p>
                <div className="mt-[2px]">
                  <ToggleButton
                    isActive={activeCallType === "video"}
                    onToggle={handleVideoToggle}
                  />
                </div>
              </div>
            </>
          )}

          {isSubmitted && (
            <div
              className="flex flex-col items-center text-center"
              style={{ minHeight: "calc(100vh - 283px)", boxSizing: "border-box" }}
            >
              <div className="flex-1 w-full flex flex-col items-center justify-center">
                <div style={{ height: 110, width: 120 }}>
                  <Meetings />
                </div>

                <div
                  className="flex flex-col justify-center items-center text-center mt-[18px]"
                  style={{ width: "100%", maxWidth: 320, marginLeft: 0 }}
                >
                  <span className="text-[23px] font-urbanistdark text-[#000000]">
                    <span>Your meeting with the trainer is scheduled at </span>
                    <span className="text-[#FF7675]">{timeSlots[selectedIndex]}</span>
                  </span>
                </div>
              </div>

              <div className="w-full flex justify-center items-center mb-[4px] mt-[8px]">
                <span className="text-[15px] font-urbanist text-[#6B7280]">
                  Do you want to change time?
                </span>
                <button
                  type="button"
                  className="text-[15px] font-urbanist font-bold text-[#FF7675] ml-[6px] underline"
                  onClick={() => setIsSubmitted(false)}
                >
                  Reschedule
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Spacer to push CTA down (same pattern as QnA) */}
        <div style={{ flex: 1 }} />

        {/* Bottom CTA (same styling as QnA) */}
        {!isSubmitted && (
          <div
            id="meet-bottom"
            style={{ ...contentWidth, marginTop: 12, paddingBottom: 0 }}
            className="flex flex-col items-center"
          >
            <PrimaryButton
              text="CONFIRM"
              onClick={handleSubmit}
              disabled={!isReady}
              customStyle={{
                width: "100%",
                height: 52,
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
            <div
              className="w-full flex justify-center items-center gap-x-[5px]"
              style={{ marginTop: 8 }}
            >
              <div className="h-[8px] w-[8px] rounded-[50%] bg-[#4ECDC4] font-urbanist" />
              <span className="text-[12px] text-[#909497]">One meeting per day</span>
            </div>
          </div>
        )}
      </div>

      <NavigationBar />
    </div>
  );
};

export default Meeting;
