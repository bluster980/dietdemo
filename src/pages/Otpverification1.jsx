import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../components/PrimaryButton';
import backArrow from '../assets/backarrow.svg';
import Otpverificationpage1 from '../assets/otpverificationpage1.svg';
import horizontalLine from '../assets/horizontalline.svg';


const Otpverification1 = ({ setGeneratedOTP, setMobileNumber }) => {
    const navigate = useNavigate();
    const [inputNumber, setInputNumber] = useState('');

    const handleNext = () => {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        console.log("Generated OTP:", otp);
        setGeneratedOTP(otp);
        setMobileNumber(inputNumber);
        navigate("/otp2");
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
                src={Otpverificationpage1}
                alt="Otp verificationpage1"
                style={{
                    width: '500px',
                    height: '426px',
                }}
            />
            <div className="flex flex-col items-center">
                <h1
                    className="text-[#000000] font-bold font-manjari text-[30px]"
                    style={{
                        lineHeight: '1',
                    }}
                >
                    OTP Verification
                </h1>
                <p
                    className="text-[13px] mt-[10px] leading-none text-center font-mada"
                    >
                    <span className="text-[#00000060]">
                        We will send you an
                    </span>{' '}
                    <span className="text-[#000000] font-medium">
                        One Time Password
                    </span>{' '}
                    <span className="text-[#00000060] justify">
                        <br/> on this mobile number
                    </span>
                </p>
                <p
                    className="text-[13px] mt-[45px] font-mada text-[#00000060]"
                    >
                        Enter Mobile Number
                </p>
                <input
                    type="tel"
                    value={inputNumber}
                    onChange={(e) => setInputNumber(e.target.value)}
                    className="w-[150px] h-[40px] text-[20px] text-black outline-none text-center font-poppins font-semibold"
                />
                <img
                    src={horizontalLine}
                    alt="Horizontal Line"
                    style={{
                        width: '250px',
                    }}
                />
                <div className="w-full flex justify-center mt-[39px]">
                    <PrimaryButton text="GET OTP" onClick={handleNext} />
                </div>
            </div>
        </div>
    </div>
    );
}

export default Otpverification1;