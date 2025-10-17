// components/BigRadial.jsx
import React, { useMemo } from "react";
import useMeasure from "../hooks/useMeasure";

export default function BigRadial({
  value = 65,
  arcColor = "#22C7B8",
  ringTrack = "rgba(0,0,0,0.06)",
  arcStart = -210,
  arcSweep = 240
}) {
  const [ref, w] = useMeasure(300);

  // Maintain existing responsive sizing
  const size = useMemo(() => {
    const target = w * 0.82;
    return Math.max(220, Math.min(360, Math.round(target)));
  }, [w]);

  const stroke = Math.round(Math.max(12, Math.min(22, size * 0.055)));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  // Main arc (teal) length
  const clamped = Math.max(0, Math.min(100, value));
  const mainVisible = (clamped / 100) * (arcSweep / 360) * c;

  // Gray negative-sweep arc length
  // We render a separate arc rotated to align baseline and simulate negative sweep
  const grayVisible = Math.max(0.0001, (arcSweep / 360) * c * 0.86);

  // Base start
  const start = arcStart + 90;

  return (
    <div ref={ref} className="hero-wrap" aria-label="Food log calories circular progress">
      <div style={{ width: size, height: size, position: "relative" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>

          {/* Light gray full track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={ringTrack}
            strokeWidth={stroke}
            fill="none"
          />

          {/* Gray negative-sweep track (left-to-mid) */}
          <g transform={`rotate(${start} ${size / 2} ${size / 2})`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={arcColor}
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${grayVisible} ${c - grayVisible}`}
              style={{ opacity: 0.25 }}
            />
          </g>

          {/* Main teal progress arc (top layer) */}
          <g transform={`rotate(${start} ${size / 2} ${size / 2})`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={arcColor}
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${mainVisible} ${c - mainVisible}`}
              className="big-arc"
            />
          </g>

          {/* Subtle glow behind arcs (optional, can be muted) */}
          <defs>
            <radialGradient id="glow" cx="50%" cy="65%">
              <stop offset="0%" stopColor="rgba(0, 201, 167, 0.18)" />
              <stop offset="70%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r - stroke} fill="url(#glow)" />

          {/* Center placeholder circle for alignment (transparent) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={Math.max(0, r - stroke * 1.25)}
            fill="transparent"
            stroke="transparent"
          />
        </svg>

        {/* Center text – adjust as needed to fit the new arcs */}
        <div className="hero-center" aria-label="Kcal remaining text">
          <span className="hero-num">1698</span>
          <span className="hero-sub">Kcal Remaining</span>
        </div>
      </div>
    </div>
  );
}
