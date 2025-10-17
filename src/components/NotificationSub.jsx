import React from "react";
import { useState, useEffect } from "react";
import oatmeal from "../assets/oatmeal.png";
import { parseNotification, formatTime } from "../utils/notificationHelpers";

const NotificationSub = ({ notification, role, onSaveAnswer }) => {
  const { type, title, query } = parseNotification(notification.content);
  const timeStr = formatTime(notification.time);
  const [answer, setAnswer] = useState(notification.answer || "");
  const [isEditing, setIsEditing] = useState(() => !notification.answer);
  const isTrainerQna = role === "trainer" && notification.type === "qna";

  useEffect(() => {
    setAnswer(notification.answer || "");
    setIsEditing(!notification.answer);
  }, [notification?.notify_id, notification?.answer]);

  const handleSave = async () => {
    const ok = await onSaveAnswer?.(notification.notify_id, answer);
    if (ok) setIsEditing(false);
  };

  return (
    <div className="flex justify-center items-center mt-[8px] w-full px-2">
      <div
        className="flex flex-col bg-[#ffffff] border border-[#E9ECEF] rounded-[10px]"
        style={{
          width: "95%",
          height: "50vh",
          maxHeight: "500px",
          boxShadow: "0px 4px 14px rgba(0, 0, 0, 0.08)",
          paddingBottom: "15px",
          backgroundColor: "var(--profile-section-card-bg)",
          borderColor: "var(--profile-border)",
        }}
      >
        {/* Header Section - Fixed Height */}
        <div
          className="flex items-start gap-x-[10px] px-3 pt-3 flex-shrink-0"
          style={{ paddingLeft: "10px", paddingTop: "10px" }}
        >
          <div className="flex-shrink-0">
            <div
              className="h-[52px] w-[52px] rounded-full"
              style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.25)" }}
            >
              <img
                src={oatmeal}
                alt="Notification"
                className="w-[52px] h-[52px] rounded-[10px]"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0" style={{ marginRight: "15px" }}>
            <div className="flex items-center justify-between">
              <span className="text-[#2D3436] font-urbanist font-semibold text-[20px] truncate" style={{color: "var(--general-charcoal-text)"}}>
                {type}
              </span>
              <span className="text-[#909497] font-urbanist text-[12px] whitespace-nowrap ml-2">
                {timeStr}
              </span>
            </div>
            <div className="w-full h-[1px] bg-[#F1F3F5] my-2" style={{ backgroundColor: "var(--profile-divider)"}}></div>
          </div>
        </div>

        {/* Scrollable Content Section - Grows to Fill Space */}
        
          <div className="px-3 flex-shrink-0" 
          style={{
            paddingLeft: "70px",
            paddingRight: "15px",
            paddingBottom: "5px",
          }}>
            {/* Question Section */}
            <span className="text-[#6C757D] font-urbanist font-semibold text-[16px] mb-1" style={{color: "var(--faded-text)"}}>
              Question :
            </span>
            <div className="mt-1 mb-3 max-h-[80px] overflow-y-auto">
              <span className="text-[#2D3436] font-urbanist text-[13px] text-justify break-words" style={{color: "var(--general-charcoal-text)"}}>
                {type === "Meeting"
                  ? notification.content
                  : `${title} ${query ? "- " + query : ""}`}
              </span>
            </div>
            </div>

            {/* Answer Label - Fixed (always visible) */}
            <div className="px-3 flex-shrink-0" 
            style={{
            paddingLeft: "70px",
            paddingRight: "15px",
            // paddingBottom: "15px",
          }}>
              <span className="text-[#6C757D] font-urbanist font-semibold text-[16px]" style={{color: "var(--faded-text)"}}>
                Answer :
              </span>
            </div>

            {/* Answer Content - ONLY THIS SCROLLS */}
            <div className="flex-1 overflow-y-auto px-3 pt-2 pb-3 min-h-0" 
            style={{
            paddingLeft: "70px",
            paddingRight: "15px",
            paddingBottom: "10px",
          }}>
              <span className="block text-[#2D3436] font-urbanist text-[13px] text-justify break-words" style={{color: "var(--general-charcoal-text)"}}>
                {notification.answer || "No answer provided yet."}
              </span>
            </div>
          

        {/* Textarea Section - Fixed Height at Bottom (if editing) */}
        {isTrainerQna && isEditing && (
          <div className="px-3 pb-3 flex-shrink-0" style={{ height: "35%" }}>
            <textarea
              className="w-full border rounded-[5px] p-2 text-[14px] text-[#2D3436] resize-none"
              style={{ height: "calc(100% - 35px)" }}
              placeholder="Write your answer..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <button
              className="mt-[5px] px-[12px] py-[4px] rounded-[5px] bg-[#FF7675] text-white text-[12px] disabled:opacity-50"
              onClick={handleSave}
              disabled={!answer.trim()}
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSub;
