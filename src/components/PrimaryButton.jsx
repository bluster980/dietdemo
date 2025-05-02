import React from 'react';

const PrimaryButton = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-[#FF752C] text-white rounded-[100px] font-bold font-palanquindark"
      style={{
        width: '275px',
        height: '70px',
        fontSize: '21px',
        lineHeight: '1',
      }}
    >
      {text}
    </button>
  );
};

export default PrimaryButton;
