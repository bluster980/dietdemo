import React, { useEffect, useState } from "react";
import NotificationCard from "../components/NotificationCard";
import NotificationSub from "../components/NotificationSub";
import BackArrow from "../assets/backarrow.svg";
import LetterBox from "../assets/letterbox.svg";
import AddPlus from "../assets/addplus.svg";
import {
  fetchUserNotifications,
  fetchTrainerNotifications,
  updateQnaAnswer,
} from "../utils/supabaseQueries";
import { useUser } from "../context/UserContext";

const Notification = ({ onClose, role, trainerUserId }) => {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useUser();
  const [readNotifications, setReadNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("readNotifications") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    async function load() {
      if (role === "trainer") {
        if (!trainerUserId) return; // wait until parent passes it
        setLoading(true);
        const { data, error } = await fetchTrainerNotifications(trainerUserId);
        if (!error) setNotifications(data || []);
        setLoading(false);
        return;
      }
      if (!userData?.user_id) return; // client mode
      setLoading(true);
      const { data, error } = await fetchUserNotifications(userData.user_id);
      if (!error) setNotifications(data || []);
      setLoading(false);
    }
    load();
  }, [role, trainerUserId, userData?.user_id]);

  const handleSelectNotification = (notif) => {
    setSelectedNotification(notif);
    if (!readNotifications.includes(notif.notify_id)) {
      const updated = [...readNotifications, notif.notify_id];
      setReadNotifications(updated);
      localStorage.setItem("readNotifications", JSON.stringify(updated));
    }
  };

  // For NotificationSub to go back
  const handleBack = () => setSelectedNotification(null);

  return (
    <div
      className="absolute  rounded-[23px] border border-[#E9ECEF] flex flex-col"
      style={{
        // Perfect centering using transform technique
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "var(--bg)",
        borderColor: "var(--profile-border)",

        // Responsive dimensions
        width: "93.5%",
        maxWidth: "420px", // Max width for larger screens
        height: "72.5vh",
        maxHeight: "650px", // Max height constraint

        boxShadow: "0px 24px 60px rgba(0, 0, 0, 0.18)",
        overflow: "hidden",
        paddingBottom: "10px",
      }}
    >
      <div className="flex items-center justify-between mt-[15px] px-3 flex-shrink-0">
        {/* Left: always reserves space for back arrow */}
        <div className="min-w-[32px] flex justify-start mt-[-1.5%]">
          {selectedNotification && (
            <BackArrow
              onClick={handleBack}
              className="cursor-pointer"
              style={{ color: "#6C757D" }}
            />
          )}
        </div>

        {/* Title expands responsively */}
        <p className="flex-1 text-center font-urbanist font-semibold text-[25px] mt-[1px]" style={{color: "var(--general-charcoal-text)"}}>
          Notification
        </p>

        {/* Right: always reserves space for close button */}
        <div
          className="min-w-[20px] h-[20px] flex items-center justify-center mr-[4%] mt-[-2%] rounded-[10px] bg-white cursor-pointer"
          style={{
            boxShadow: "0px 1px 5px rgba(0,0,0,0.15)",
            border: "1px solid #E9ECEF",
            color: "#6C757D",
          }}
          onClick={onClose}
        >
          <AddPlus
            style={{ color: "#FF7675", transform: "rotate(45deg)", scale: 1.2 }}
          />
        </div>
      </div>
      {/* Divider - Fixed */}
      <div className="w-full h-[1px] flex-shrink-0" style={{backgroundColor: "var(--profile-divider)"}}></div>

      {/* Content Section - Grows to Fill Remaining Space */}
      <div className="flex-1 min-h-0 overflow-hidden" style={{ paddingBottom: '0px' }}>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            Loading...
          </div>
        ) : notifications.length > 0 ? (
          <div
            className="h-full overflow-y-auto flex justify-center px-2"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "transparent transparent",
              
              // paddingBottom: "10px",
              // border: "3px solid red",
              // borderRadius: "0 0 23px 23px",
            }}
          >
            <div className="flex flex-col items-center w-full" style={{ paddingBottom: '15px' }} >
              {selectedNotification ? (
                <NotificationSub
                  notification={selectedNotification}
                  onBack={handleBack}
                  onClose={onClose}
                  role={role}
                  onSaveAnswer={async (notify_id, answerText) => {
                    const { data, error } = await updateQnaAnswer(
                      notify_id,
                      answerText
                    );
                    if (!error && data) {
                      setNotifications((prev) =>
                        prev.map((n) =>
                          n.notify_id === notify_id
                            ? { ...n, answer: data.answer }
                            : n
                        )
                      );
                      setSelectedNotification((s) =>
                        s?.notify_id === notify_id
                          ? { ...s, answer: data.answer }
                          : s
                      );
                      return true;
                    }
                    return false;
                  }}
                />
              ) : (
                notifications.map((notif, index) => (
                  <NotificationCard
                  key={notif.notify_id}
                  notification={notif}
                  onClick={() => handleSelectNotification(notif)}
                  isRead={readNotifications.includes(notif.notify_id)}
                  isLast={index === notifications.length - 1}
                  />
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-full px-4">
            <LetterBox />
            <p className="flex flex-col justify-center items-center mt-[15px]">
              <span className="text-[#000000] font-urbanist font-medium text-[28px]">
                No Notification yet
              </span>
              <span className="text-[#000000] font-urbanist text-[18px] text-center">
                Your notification will appear here once you've received them.
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
