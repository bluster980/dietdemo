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
  );
}

export default App;
