import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Line,
  ReferenceLine,
} from "recharts";
import React, { useRef, useLayoutEffect } from "react";

const formatWeight = (value) => {
  if (value == null) return "";
  // Round to 2 decimals, always display 2 decimals if has decimal, else int
  // Ensure 67.00 → 67, 67.5 → 67.50, 67.55 → 67.55
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2);
};

const CustomDot = ({ cx, cy, value }) => {
  const isDecimal = value != null && !Number.isInteger(value);
  return (
    <g>
      <foreignObject
        x={cx - (isDecimal ? 18 : 13)} // slight shift if wider
        y={cy - 15}
        width={isDecimal ? 38 : 26}
        height={28}
      >
        <div
          className="bg-white text-[12px] font-semibold rounded-xl shadow px-2 py-0.5 text-center border border-[#E9ECEF]"
          style={{
            minWidth: isDecimal ? 38 : 26,
            lineHeight: "20px",
            borderRadius: "8px",
            fontFamily: "urbanist",
            color: "#2D3436",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
          }}
        >
          {formatWeight(value)}
        </div>
      </foreignObject>
    </g>
  );
};

const WeightChart = ({ labels, dataPoints }) => {
  const data = dataPoints.map((point, index) => ({
    date: labels[index],
    value: point,
  }));
  const slotWidth = 60;
  const minSlotCount = 6;
  const dataLength = data.length * slotWidth;
  const chartPixelWidth = Math.max(dataLength, minSlotCount * slotWidth);
  const paddedData = [...data];
  const scrollerRef = useRef(null);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // Defer one tick in case ResponsiveContainer computes width asynchronously
    const doScrollRight = () => {
      el.scrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
    };
    doScrollRight();
    // Safety: if layout finishes a frame later, run once more
    const id = requestAnimationFrame(doScrollRight);
    return () => cancelAnimationFrame(id);
  }, [labels.length, dataPoints.length]); // rerun when data size changes

  if (paddedData.length < minSlotCount) {
    const lastDate =
      labels.length > 0
        ? (() => {
            const [day, month] = labels[labels.length - 1].split("/");
            return new Date(new Date().getFullYear(), month - 1, day);
          })()
        : new Date();
    // console.log("LastDate ####", lastDate)
    for (let i = paddedData.length; i < minSlotCount; i++) {
      lastDate.setDate(lastDate.getDate() + 1);
      paddedData.push({
        date: lastDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
        }), // format: dd/mm
        value: null, // this will break the line
      });
    }
  }
  const lastValidIndex = [...paddedData]
    .reverse()
    .findIndex((d) => d.value !== null && d.value !== undefined);

  const lastValidDate =
    paddedData[paddedData.length - 1 - lastValidIndex]?.date;

  return (
    <div className="w-full flex justify-center items-center px-2 py-4 scroll-smooth-x">
      {/* Wrap the chart to center it horizontally */}
      <div
        ref={scrollerRef}
        className={data.length > minSlotCount ? "overflow-x-auto" : ""}
        style={{ overscrollBehaviorX: "contain" }} // optional, for nicer feel
      >
        <div
          className="relative"
          style={
            data.length > minSlotCount
              ? { width: chartPixelWidth, paddingLeft: 10, paddingRight: 10 }
              : { width: chartPixelWidth }
          }
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={paddedData}
              margin={{ top: 15, right: 8, bottom: 10, left: 5 }} // some breathing room
            >
              <defs>
                <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ECDC4" stopOpacity={0.9} />
                  {/* <stop offset="20%" stopColor="#ff5b1f" stopOpacity={0.1} /> */}
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              {/* ✅ Hide Y-axis */}
              <YAxis
                hide
                domain={["dataMin - 5", "auto"]} // ✅ adds vertical spacing below min value
              />

              {/* ✅ Keep labels but hide horizontal axis line */}
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                fontFamily="urbanist"
                padding={{ left: 10, right: 10 }} // ✅ helps show first/last labels
              />

              {/* <Tooltip content={null} /> */}

              <Area
                type="monotone"
                dataKey="value"
                stroke="none"
                fill="url(#orangeGradient)"
                animationDuration={1000}
                // dot={false}
                // activeDot={false}
              />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#4ECDC4"
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={false}
              />

              <ReferenceLine
                x={lastValidDate}
                stroke="#4ECDC4"
                strokeDasharray="4 2"
                isFront
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WeightChart;
