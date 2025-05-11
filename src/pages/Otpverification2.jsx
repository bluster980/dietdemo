import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../components/PrimaryButton';
import backArrow from '../assets/backarrow.svg';
import Otpverificationpage2 from '../assets/otpverificationpage2.svg';
import OtpInput from '../components/OtpInput';


const Otpverification2 = ({ generatedOTP, mobileNumber }) => {
    const [enteredOTP, setEnteredOTP] = useState('');
    const navigate = useNavigate();

    const handleVerify = () => {
        const hardcodedOTP = "1234"; // Replace with the actual OTP generation logic
        if (enteredOTP === hardcodedOTP) {
            alert("OTP Verified Successfully!");
            navigate("/genderselect")
        } else {
            alert("Incorrect OTP!");
        }
    };

    return (
        <div
        className="flex flex-col justify-between items-center"
        style={{
            background: 'linear-gradient(to bottom, #FFD98E 0%, #FFFFFF 24%)',
        }}
        >
        <div className="flex flex-col items-center">
        <img
            src={backArrow}
            alt="back arrow"
            onClick={() => navigate(-1)}
            style={{
                width: '30px',
                height: '30px',
                position: 'absolute',
                display: 'flex',
                top: '40px',
                left: '5px',
                // zIndex: 1,
            }}
            />
        </div>
        <div className="flex flex-col items-center h-[360px] mt-[80px]">
            <img
                src={Otpverificationpage2}
                alt="Otp verificationpage2"
                style={{
                    width: '500px',
                    height: '500px',
                }}
            />
            <div className="flex flex-col items-center">
                <h1
                    className="text-[#000000] font-bold font-manjari text-[30px] mt-[14px]"
                    style={{
                        lineHeight: '1',
                    }}
                >
                    OTP Verification
                </h1>
                <p
                    className="text-[13px] mt-[13px] leading-none text-center font-mada"
                    >
                    <span className="text-[#00000060]">
                        Enter the OTP sent to
                    </span>{' '}
                    <span className="text-[#000000] font-medium">
                            {mobileNumber}
                    </span>
                </p>
                <OtpInput length={4} onChangeOTP={setEnteredOTP}/>
                <p
                    className="text-[13px] leading-none text-center font-mada mt-[35px]"
                    >
                    <span className="text-[#00000060]">
                        Didn’t receive the OTP?
                    </span>
                    <span className="text-[#FF752C] font-bold">
                        RESEND OTP
                    </span>
                </p>
                <div className="w-full flex justify-center mt-[33px]">
                    <PrimaryButton text="VERIFY & PROCEED" onClick={handleVerify} />
                </div>
            </div>
        </div>
    </div>
    );
}

export default Otpverification2;