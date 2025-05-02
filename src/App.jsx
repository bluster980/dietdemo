// src/App.jsx
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Otpverification1 from './pages/Otpverification1';
import Otpverification2 from './pages/Otpverification2';

function App() {
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  return (
    <>
      {/* Safe-area status bar background patch */}
      <div className="fixed top-0 left-0 right-0 h-[env(safe-area-inset-top)] bg-[#FFD98E] z-50 pointer-events-none" />

      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route
          path="/otp1"
          element={
            <Otpverification1
              setGeneratedOTP={setGeneratedOTP}
              setMobileNumber={setMobileNumber}
            />
          }
        />
        <Route
          path="/otp2"
          element={
            <Otpverification2
              generatedOTP={generatedOTP}
              mobileNumber={mobileNumber}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
