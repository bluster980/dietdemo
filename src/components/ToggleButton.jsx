import React from 'react';

const ToggleButton = ({isActive, onToggle}) => {

  return (
    <div
      onClick={onToggle}
      className={`w-[58px] h-[26px] rounded-full flex items-center transition-all duration-300 ${
        isActive ? 'bg-[#4ECDC4]' : 'bg-[#E9ECEF]'
      }`}
    >
      <div
        className={`w-[24px] h-[24px] bg-white rounded-full transform transition-transform duration-300 ${
          isActive ? 'translate-x-[33px]' : 'translate-x-[1px]'
        }`} style={{boxShadow: `${isActive ? '1px 0px 7px rgba(78, 205, 196, 0.7)' : '-1px 0px 7px rgba(233, 236, 239, 1)'}`}}
      ></div>
    </div>
  );
};

export default ToggleButton;
