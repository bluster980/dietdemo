import React from 'react';
import CalorieRing from '../components/CalorieRing';

function CalorieCircle() {
  return (
    <div
      style={{
        width: '100%',            // or any fixed/max width
        maxWidth: '300px',
        aspectRatio: '1 / 1',     // keep it square
      }}
    >
      <CalorieRing
        size={300}                // virtual coordinate space
        strokeWidth={14}
        progress={2125 / 6500}
        value={2125}
      />
    </div>
  );
}

export default CalorieCircle;
