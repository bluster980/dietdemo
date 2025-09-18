import React from "react";
import { useRef } from "react";
import { useState, useEffect } from "react";

const getWeekDates = () => {
    const today = new Date();
    const dayIndex = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayIndex);
    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        return {
            date: date.getDate(),
            day: date.toLocaleDateString("en-US", { weekday: "short" }),
            isToday: i === dayIndex,
        };
    });
    return weekDates;
};

const DayDate = ({ onDateChange }) => {
    const [weekDates, setWeekDates] = useState([]);
    const [activeIndex, setActiveIndex] = useState(null);
    const [slotWidth, setSlotWidth] = useState(55); // fallback default
    const containerRef = useRef(null);

    useEffect(() => {
        const dates = getWeekDates();
        setWeekDates(dates);

        const todayIndex = dates.findIndex((date) => date.isToday);
        setActiveIndex(todayIndex);

        if (containerRef.current) {
            const actualWidth = containerRef.current.offsetWidth;
            setSlotWidth(actualWidth / 7);
        }

        // ✅ Trigger initial onDateChange on mount
        if (onDateChange && dates[todayIndex]) {
            onDateChange(dates[todayIndex]);
        }
    }, []);


    const handleDateClick = (index) => {
        setActiveIndex(index);
        if (onDateChange) {
            onDateChange(weekDates[index]);
        }
    };


    return (
        <div className="flex flex-col items-center justify-center">
            <div
                ref={containerRef}
                className="bg-white w-[385px] border border-gray-300 border-1 h-[73px] rounded-[10px] flex items-center justify-center relative"
            >
                <div className="flex w-full justify-center items-center">
                    {weekDates.map((item, index) => (
                        <p
                            key={index}
                            className={`z-10 w-[55px] text-[#000000] font-bold font-urbanist text-[20px] flex flex-col items-center cursor-pointer ${
                                index === activeIndex ? "text-[#2D3436]" : "text-[#6C757D]"
                            }`}
                            onClick={() => handleDateClick(index)}
                        >
                            <span className="mt-[5px] font-inter">{item.date}</span>
                            <span
                                className={`text-[15px] ${
                                    index === activeIndex ? "text-[#2D3436]" : "text-[#6C757D]"
                                }`}
                            >
                                {item.day}
                            </span>
                        </p>
                    ))}
                </div>
                {activeIndex !== null && (
                    <div
                        className="absolute left-0 top-[6.5px] flex"
                        style={{ transform: `translateX(${activeIndex * slotWidth}px)` }}
                    >
                        <div
                            style={{ width: `${slotWidth}px` }}
                            className="flex justify-center items-center"
                        >
                            {/* <div className="bg-[#FF752C30] border border-[#FF752C] w-[45px] h-[60px] rounded-[13px]" /> */}
                            <div className="bg-[#E6FCF5] border border-[#4ECDC4] w-[45px] h-[60px] rounded-[13px]" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DayDate;
