import React from "react";
import oatmeal from "../assets/oatmeal.png";
import { parseNotification, formatTime } from "../utils/notificationHelpers";

const NotificationSub = ({ notification }) => {
  const { type, title, query } = parseNotification(notification.content);
  const timeStr = formatTime(notification.time);
  return (
    <div className="flex justify-center items-center mt-[8px]">
      <div
        className="flex w-[355px] h-[50vh] bg-[#ffffff] border border-[#E9ECEF] rounded-[10px] gap-x-[10px]"
        style={{ boxShadow: "0px 4px 14px rgba(0, 0, 0, 0.08)" }}
      >
        <div className="flex h-full w-[60px] mt-[3%] ml-[1%]">
          <div
            className="flex ml-[10%] h-[52px] w-[58px] rounded-[50%]"
            style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.25)" }}
          >
            <img
              src={oatmeal}
              alt="Notification"
              className="w-[52px] h-[52px] rounded-[10px]"
            />
          </div>
        </div>
        <div className="flex w-[98%] flex-col mt-[2%]">
          <div className="flex items-center justify-between pr-[10px]">
            <span className="text-[#2D3436] font-urbanist font-semibold text-[20px]">
              {type}
            </span>
            <span className="text-[#909497] font-urbanist text-[12px]">
              {timeStr}
            </span>
          </div>
          <div className="w-full h-[1px] bg-[#F1F3F5]"></div>
          <div className="flex flex-col mr-[5%]">
            <span className="text-[#6C757D] font-urbanist font-semibold text-[16px]">
              Question :
            </span>
            <div className="max-h-[60px] overflow-y-auto pr-[6px]">
                <span className="text-[#2D3436] font-urbanist text-[13px] text-justify">
                {type === "Meeting"
                    ? notification.content
                    : `${title} ${query ? "- " + query : ""}`}
                </span>
            </div>
            <span className="text-[#6C757D] font-urbanist font-semibold text-[16px] ">
              Answer :
            </span>
            <div className="max-h-[300px] overflow-y-auto pr-[6px]">
              <span className="block text-[#2D3436] font-urbanist text-[13px] text-justify break-words">
                {notification.answer}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSub;
