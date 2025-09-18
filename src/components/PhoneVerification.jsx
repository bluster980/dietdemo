// Userverification.jsx
import React, { useEffect, useState } from 'react';

const PhoneVerification = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const widgetId = '3565426d6155393536393036'; // Replace with your actual Widget ID
  const tokenAuth = '453993TwaOrx6FQ68370b0bP1'; // Replace with your actual Token

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://verify.msg91.com/otp-provider.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ MSG91 script loaded');
      const config = {
        widgetId,
        tokenAuth,
        exposeMethods: true,
        captchaRenderId: '',
        success: (data) => console.log('✅ OTP Verified:', data),
        failure: (err) => console.error('❌ OTP Failed:', err),
      };
      if (window.initSendOTP) {
        window.initSendOTP(config);
        setScriptLoaded(true);
      } else {
        console.error('❌ initSendOTP not available on window');
      }
    };
    script.onerror = () => console.error('❌ Failed to load MSG91 script');
    document.body.appendChild(script);
  }, []);

  const handleSendOTP = () => {
    if (!phone || phone.length < 10) return alert('Enter valid phone number');
    const fullNumber = `91${phone}`;
    if (typeof window.sendOtp === 'function') {
      window.sendOtp(
        fullNumber,
        (data) => console.log('✅ OTP sent:', data),
        (err) => console.error('❌ Failed to send OTP:', err)
      );
    } else {
      console.error('❌ sendOtp not available yet');
    }
  };

  const handleVerifyOTP = () => {
    if (!otp || otp.length < 4) return alert('Enter a valid OTP');
    if (typeof window.verifyOtp === 'function') {
      window.verifyOtp(
        otp,
        (data) => console.log('✅ OTP verified:', data),
        (err) => console.error('❌ Verification failed:', err)
      );
    } else {
      console.error('❌ verifyOtp not available yet');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-[10px] font-bold">MSG91 OTP Verification</h2>

      <input
        type="tel"
        placeholder="Enter mobile number"
        className="border text-[10px] p-2 rounded w-[120px]"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button
        onClick={handleSendOTP}
        className="text-[10px] bg-blue-500 text-white px-4 py-2 rounded"
        disabled={!scriptLoaded}
      >
        Send OTP
      </button>

      <input
        type="text"
        placeholder="Enter OTP"
        className="border p-2 rounded w-[120px] text-[10px]"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <button
        onClick={handleVerifyOTP}
        className="text-[10px] bg-green-500 text-white px-4 py-2 rounded"
        disabled={!scriptLoaded}
      >
        Verify OTP
      </button>
    </div>
  );
};

export default PhoneVerification;
