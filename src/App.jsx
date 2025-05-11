// src/App.jsx
import React, { useState } from 'react';
// import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Otpverification1 from './pages/Otpverification1';
import Otpverification2 from './pages/Otpverification2';
import Genderselect from './pages/Genderselect';
import Questionnaire from './pages/Questionnaire';
import Weightselect from './pages/Weightselect';
import Heightselect from './pages/Heightselect';

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
        <Route path="/genderselect" element={<Genderselect />} />
        <Route path="/weightselect" element={<Weightselect />} />
        <Route path="/heightselect" element={<Heightselect />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
      </Routes>
    </>
  );
}

export default App;


