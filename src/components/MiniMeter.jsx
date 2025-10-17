import React from "react";

export default function MiniMeter({ size = 56, value = 0, color = "#22C7B8", track = "var(--calorie-ring-track)" }) {
  const box = Math.round(size);
  const stroke = Math.max(4, Math.round(box * 0.16)); // 12% looks crisp at small sizes
  const r = (box - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * c;

  return (
    <div className="mini-box" style={{ width: box, height: box }}>
      <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`}>
        <circle cx={box/2} cy={box/2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={box/2} cy={box/2} r={r}
          stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${box/2} ${box/2})`} className="mini-arc" />
      </svg>
    </div>
  );
}