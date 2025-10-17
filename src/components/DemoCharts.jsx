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
import React, { useRef, useLayoutEffect, useState, useEffect } from "react";

const formatWeight = (value) => {
  if (value == null) return "";
  // Round to 2 decimals, always display 2 decimals if has decimal, else int
  // Ensure 67.00 → 67, 67.5 → 67.50, 67.55 → 67.55
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2);
};

const CustomDot = ({ cx, cy, value, chartWidth }) => {
  const scaleFactor = Math.max(0.7, Math.min(1, chartWidth / 350));
  const isDecimal = value != null && !Number.isInteger(value);

  const baseWidth = isDecimal ? 38 : 26;
  const dotWidth = Math.round(baseWidth * scaleFactor);
  const xOffset = Math.round((isDecimal ? 18 : 13) * scaleFactor);
  const fontSize = Math.max(10, Math.round(12 * scaleFactor));

  return (
    <g>
      <foreignObject
        x={cx - xOffset} // slight shift if wider
        y={cy - 15}
        width={dotWidth}
        height={28}
      >
        <div
          className="bg-white font-semibold rounded-xl shadow px-2 py-0.5 text-center border border-[#E9ECEF]"
          style={{
            fontSize: `${fontSize}px`,
            minWidth: dotWidth,
            lineHeight: "20px",
            borderRadius: "8px",
            fontFamily: "urbanist",
            color: "var(--chart-legend)",
            backgroundColor: "var(--navbar-background)",
            borderColor: "var(--profile-border)",
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
  const [containerWidth, setContainerWidth] = useState(350);
  const scrollerRef = useRef(null);
  const containerRef = useRef(null);

  // Calculate responsive slot width based on container width
  const getSlotWidth = (width) => {
    if (width < 320) return 45;
    if (width < 360) return 50;
    if (width < 400) return 55;
    return 60;
  };

  const slotWidth = getSlotWidth(containerWidth);
  const minSlotCount = 6;

  // Calculate responsive chart height based on container width
  const getChartHeight = (width) => {
    if (width < 320) return 180;
    if (width < 360) return 200;
    if (width < 400) return 220;
    return 230;
  };

  const chartHeight = getChartHeight(containerWidth);

  // Track container width for responsive calculations
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
      setContainerWidth(containerRef.current.offsetWidth);
    }

    return () => observer.disconnect();
  }, []);

  const data = dataPoints.map((point, index) => ({
    date: labels[index],
    value: point,
  }));

  const dataLength = data.length * slotWidth;
  const chartPixelWidth = Math.max(dataLength, minSlotCount * slotWidth);
  const paddedData = [...data];

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

  // Responsive margins based on container width
  const getMargins = (width) => {
    if (width < 320) return { top: 12, right: 5, bottom: 8, left: 2 };
    if (width < 360) return { top: 14, right: 6, bottom: 9, left: 3 };
    return { top: 15, right: 8, bottom: 5, left: 5 };
  };

  // Responsive font size for X-axis
  const getAxisFontSize = (width) => {
    if (width < 320) return 10;
    if (width < 360) return 11;
    return 12;
  };

  const margins = getMargins(containerWidth);
  const axisFontSize = getAxisFontSize(containerWidth);

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center items-center px-2 py-4 scroll-smooth-x"
    >
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
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={paddedData} margin={margins}>
              <defs>
                <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--chart-start)"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--chart-end)"
                    stopOpacity={0.05}
                  />
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
                tick={{ fontSize: axisFontSize }}
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
                stroke="var(--chart-start)"
                strokeWidth={3}
                dot={({ key, ...props }) => (
                  <CustomDot key={key} {...props} chartWidth={containerWidth} />
                )}
                activeDot={false}
              />

              <ReferenceLine
                x={lastValidDate}
                stroke="var(--chart-start)"
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
