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
//   const [slotWidth, setSlotWidth] = useState(55); 
    const [indicatorPosition, setIndicatorPosition] = useState({ left: 0, width: 0 });
  
    const containerRef = useRef(null);
  const slotRefs = useRef([]);

  // Calculate exact position by measuring actual DOM elements
  const calculateIndicatorPosition = (index) => {
    if (!containerRef.current || !slotRefs.current[index]) return;

    const container = containerRef.current;
    const slot = slotRefs.current[index];

    // Get bounding rectangles
    const containerRect = container.getBoundingClientRect();
    const slotRect = slot.getBoundingClientRect();

    // Calculate slot center relative to container
    const slotCenterX = slotRect.left - containerRect.left + (slotRect.width / 2);

    // Get indicator width from CSS (or use measured value)
    const computedStyle = getComputedStyle(document.documentElement);
    const indicatorWidth = parseFloat(
      computedStyle.getPropertyValue('--daydate-indicator-width') || '45'
    );

    // Position indicator so its center aligns with slot center
    const indicatorLeft = slotCenterX - (indicatorWidth / 2);

    setIndicatorPosition({
      left: indicatorLeft,
      width: indicatorWidth
    });
  };

  useEffect(() => {
    const dates = getWeekDates();
    setWeekDates(dates);

    const todayIndex = dates.findIndex((date) => date.isToday);
    setActiveIndex(todayIndex);

    // Trigger initial onDateChange
    if (onDateChange && dates[todayIndex]) {
      onDateChange(dates[todayIndex]);
    }
  }, []);

 // Recalculate position when activeIndex changes or on resize
  useEffect(() => {
    if (activeIndex === null) return;

    // Calculate after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      calculateIndicatorPosition(activeIndex);
    }, 50);

    return () => clearTimeout(timer);
  }, [activeIndex, weekDates]);

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      if (activeIndex !== null) {
        calculateIndicatorPosition(activeIndex);
      }
    };

    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [activeIndex]);

  const handleDateClick = (index) => {
    setActiveIndex(index);
    if (onDateChange) {
      onDateChange(weekDates[index]);
    }
  };

  return (
    <div className="daydate-wrapper">
      <div ref={containerRef} className="daydate-container" style={{ backgroundColor: "var(--profile-section-card-bg)", borderColor: "var(--profile-border)" }}>
        {/* Date slots with refs */}
        <div className="daydate-slots">
          {weekDates.map((item, index) => (
            <button
              key={index}
              ref={(el) => (slotRefs.current[index] = el)}
              className={`daydate-slot ${
                index === activeIndex ? "daydate-slot-active" : "daydate-slot-inactive"
              }`}
              onClick={() => handleDateClick(index)}
              aria-label={`Select ${item.day} ${item.date}`}
              aria-pressed={index === activeIndex}
            >
              <span className="daydate-date">{item.date}</span>
              <span className="daydate-day">{item.day}</span>
            </button>
          ))}
        </div>

        {/* Active indicator - positioned with actual measurements */}
        {activeIndex !== null && (
          <div
            className="daydate-indicator-track"
            style={{ 
              transform: `translateX(${indicatorPosition.left}px)`,
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <div className="daydate-indicator" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DayDate;
