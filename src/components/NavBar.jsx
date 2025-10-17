import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DiaryIcon from '../assets/diary.svg';
import WorkoutIcon from '../assets/workout.svg';
import DietIcon from '../assets/diet.svg';
import ProfileIcon from '../assets/profile.svg';
import PlusCross from '../assets/pluscross.svg';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';


const NavigationBar = ({ activeTab, onTabChange, isFabOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();


  const currentPath = location.pathname;
  const isActiveDiary = activeTab === 'Diary';

  const tabs = [
    { title: 'Diary', Icon: DiaryIcon, path: '/diary' },
    { title: 'Workout', Icon: WorkoutIcon, path: '/workout' },
    ...(isActiveDiary ? [{ title: 'Spacer', Icon: () => <div className="h-[35px] w-[45px]" /> }] : []),
    { title: 'Diet', Icon: DietIcon, path: '/diet' },
    { title: 'Profile', Icon: ProfileIcon, path: '/profile' },
  ];


  const handleClick = (title, path) => {
    if (title === 'FAB') {
      onTabChange?.(null, true);
    } else {
      onTabChange?.(title, false);
      navigate(path);
    }
  };


  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">


  {/* FAB Shadow - render this first so it's lowest */}
  {isActiveDiary && (
    <div
      className="absolute z-[70] w-[80px] h-[80px] bottom-0 mb-[15px] bg-white flex items-center justify-center transition-opacity duration-300"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        borderRadius: '30px',
        boxShadow: '0px -5px 10px #00000015',
        backgroundColor: 'var(--navbar-background)'
      }}
    />
  )}


  {/* Navbar - higher than shadow, lower than FAB */}
  <div
    className="relative z-[80] h-[75px] w-full flex justify-around items-center bg-white"
    style={{
      borderTopLeftRadius: '40px',
      borderTopRightRadius: '40px',
      boxShadow: 'var(--navbar-shadow)',
      backgroundColor: 'var(--navbar-background)'
    }}
  >
    {tabs.map((tab, index) => {
      const isSpacer = tab.title === 'Spacer';
      return (
        <button
          key={index}
          onClick={() => !isSpacer && handleClick(tab.title, tab.path)}
          className={`relative flex flex-col items-center justify-center font-urbanist h-full flex-1 ${
            isSpacer
              ? 'opacity-0 pointer-events-none'
              : currentPath.startsWith(tab.path)
              ? `text-[var(--navbar-active)] font-bold`
              : 'text-[var(--navbar-inactive)]'
          }`}
        >
          <tab.Icon
            className={`h-[25px] w-[25px] ${
              isSpacer
                ? ''
                : currentPath.startsWith(tab.path)
                ? `fill-[var(--navbar-active)]`
                : 'fill-[var(--navbar-inactive)]'
            }`}
          />
          <span className="text-[15px]">
            {isSpacer ? '' : tab.title}
          </span>
          {/* underline */}
          {!isSpacer && (
            <div
              className={`absolute bottom-[10px] h-[2px] rounded-full transition-all duration-200 ${
                currentPath.startsWith(tab.path) ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                width: 18,           // 12–18px looks good
                backgroundColor: 'var(--chart-start)'
              }}
            />
          )}
        </button>
      );
    })}
  </div>


  {/* FAB - topmost */}
  {activeTab === 'Diary' && (
    <div
      className="absolute z-[90] bottom-[15px] w-[80px] h-[80px] bg-white flex items-center justify-center transition-opacity duration-300"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        borderRadius: '30px',
        backgroundColor: 'var(--navbar-background)'
      }}
    >
      <button
        onClick={() => handleClick('FAB')}
        className="z-[100] w-[60px] h-[60px] bg-[#FF7675] flex items-center justify-center focus:outline-none"
        style={{
          borderRadius: '24px',
          boxShadow: '0px 10px 24px 0px rgba(255, 118, 117, 0.35)',
        }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isFabOpen ? 135 : 0 }}
          transition={{ type: 'tween', ease: 'easeInOut', duration: 0.4 }}
          className="flex items-center justify-center"
        >
          <PlusCross
            className="h-[25px] w-[25px]"
            style={{
              filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.3))',
              color: 'white'
            }}
          />
        </motion.div>
      </button>
    </div>
  )}
</div>


  );
};


export default NavigationBar;