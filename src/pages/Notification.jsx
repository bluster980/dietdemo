import React, { useEffect, useState } from "react";
// import { useNavigate } from 'react-router-dom';
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
      className="absolute bg-[#FFFFFF] h-[72.5vh] w-[93.5%] mt-[20px] rounded-[23px] border border-[#E9ECEF]"
      style={{ boxShadow: "0px 24px 60px rgba(0, 0, 0, 0.18)" }}
    >
      <div className="flex items-center justify-between mt-[15px] px-3">
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
        <p className="flex-1 text-center text-[#2D3436] font-urbanist font-semibold text-[25px] mt-[1px]">
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
      <div>
        <div className="w-full h-[1px] bg-[#F1F3F5]"></div>{" "}
        {/* Added Devider for seperationn as per AI suggestion */}
        {loading ? (
          <div className="flex justify-center items-center h-[60vh]">
            Loading...
          </div>
        ) : notifications.length > 0 ? (
          <div
            className="flex h-[65vh] justify-center overflow-y-scroll rounded-[23px]"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "transparent transparent",
            }}
          >
            <div className="flex flex-col items-center w-full">
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
                      // locally patch the updated row so UI reflects instantly
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
                notifications.map((notif) => (
                  <NotificationCard
                    key={notif.notify_id}
                    notification={notif}
                    onClick={() => handleSelectNotification(notif)}
                    isRead={readNotifications.includes(notif.notify_id)}
                  />
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-[59vh]">
            <LetterBox />
            <p className="flex flex-col justify-center items-center mt-[15px]">
              <span className="text-[#000000] font-urbanist font-medium text-[28px]">
                No Notification yet
              </span>
              <span className="text-[#000000] font-urbanist text-[18px] h-[20px]">
                Your notification will appear here once
              </span>
              <span className="text-[#000000] font-urbanist text-[18px]">
                you’ve received them.
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
