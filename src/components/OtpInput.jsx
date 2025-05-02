import React, { useRef, useState } from "react";

function OTPInput({ onChangeOTP }) {
  const length = 4;
  const [otp, setOTP] = useState(Array(length).fill(""));
  const inputsRef = useRef([]);

  const focusInput = (index) => {
    if (inputsRef.current[index]) {
      inputsRef.current[index].focus();
    }
  };

  const handleChange = (e, index) => {
    const value = e.target.value;

    // Allow only numbers
    if (!/^\d*$/.test(value)) return;

    const updatedOTP = [...otp];
    updatedOTP[index] = value;

    setOTP(updatedOTP);
    onChangeOTP && onChangeOTP(updatedOTP.join(""));

    if (value && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const updatedOTP = [...otp];
        updatedOTP[index] = "";
        setOTP(updatedOTP);
      } else if (index > 0) {
        focusInput(index - 1);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("Text");
    const digits = pasteData.replace(/\D/g, "").slice(0, length).split("");

    const updatedOTP = [...otp];
    for (let i = 0; i < digits.length; i++) {
      updatedOTP[i] = digits[i];
    }

    setOTP(updatedOTP);
    onChangeOTP && onChangeOTP(updatedOTP.join(""));

    const nextIndex = digits.length >= length ? length - 1 : digits.length;
    focusInput(nextIndex);
  };

  return (
    <div onPaste={handlePaste} className="flex justify-center items-center gap-60 mt-[30px]">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          maxLength="1"
          inputMode="numeric"
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          style={{
            width: "50px",
            height: "45px",
            fontSize: "28px",
            fontWeight: "600",
            borderBottom: "2px solid #00000050",
            textAlign: "center",
            outline: "none",
            background: "linear-gradient(to bottom, #f8f8f8 0%, #ffffff 100%)",
            borderTopRightRadius: "5px",
            borderTopLeftRadius: "5px",

          }}
        />
      ))}
    </div>
  );
}

export default OTPInput;
