import React from 'react';

const CalorieRing = ({
  size = 200,            // defines SVG viewBox dimensions
  strokeWidth = 12,      // relative to viewBox units
  progress = 0.7,        // 0–1
  value = 2125,
  unit = 'Kcal Remaining',
  trackColor,
  progressColor = '#4ECDC4',
  shadowColor = '#4ECDC4',
  middleCircle,
  calorieRingValueColor,
  calorieRingUnitColor,
}) => {
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const degToRad = (deg) => (Math.PI * deg) / 180;

  // 135° start, 270° sweep
  const startAngle = degToRad(135);
  const sweep = degToRad(270);
  const endAngle = startAngle + sweep;

  const startX = center + radius * Math.cos(startAngle);
  const startY = center + radius * Math.sin(startAngle);
  const endX   = center + radius * Math.cos(endAngle);
  const endY   = center + radius * Math.sin(endAngle);

  const progSweep     = sweep * Math.min(Math.max(progress, 0), 1);
  const progEndAngle  = startAngle + progSweep;
  const pX = center + radius * Math.cos(progEndAngle);
  const pY = center + radius * Math.sin(progEndAngle);

  const largeArc     = sweep     > Math.PI ? 1 : 0;
  const progLargeArc = progSweep > Math.PI ? 1 : 0;

  // Inner circle radius
  const innerR = radius - strokeWidth * 2.1;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="blur">
          <feGaussianBlur stdDeviation={strokeWidth * 1.5} />
        </filter>
      </defs>

      {/* Track */}
      <path
        d={`
          M ${startX} ${startY}
          A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}
        `}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Progress */}
      <path
        d={`
          M ${startX} ${startY}
          A ${radius} ${radius} 0 ${progLargeArc} 1 ${pX} ${pY}
        `}
        fill="none"
        stroke={progressColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Shadow glow */}
      <circle
        cx={center}
        cy={center}
        r={innerR}
        fill={shadowColor}
        opacity="0.3"
        filter="url(#blur)"
      />

      {/* White center */}
      <circle
        cx={center}
        cy={center}
        r={innerR}
        fill={middleCircle}
      />

      {/* Number */}
      <text
        x={center}
        y={center - size * 0.01}
        textAnchor="middle"
        fontSize={size * 0.2}
        fill={calorieRingValueColor}
        fontWeight="700"
        fontFamily='Urbanist'
      >
        {value.toFixed(0)}
      </text>

      {/* Unit */}
      <text
        x={center}
        y={center + size * 0.12}
        textAnchor="middle"
        fontSize={size * 0.075}
        fill={calorieRingUnitColor}
        fontWeight="500"
        fontFamily='Urbanist'
      >
        {unit}
      </text>
    </svg>
  );
};

export default CalorieRing;
