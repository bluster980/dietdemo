import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BackArrow from '../assets/backarrow.svg';
import Userverificationlogo from '../assets/userverificationlogo.svg';
import HorizontalLine from '../assets/horizontalline.svg';
// import { useUser } from '../context/UserContext';
import { updateUserFieldLocally } from '../utils/userOnboarding';
import { Checkbox } from '@mui/material';

const Userverification = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState("client"); // default to client
    const [name, setName] = useState('');
    // const { setUserData } = useUser();
    const roleRef = useRef(selectedRole);
    const nameRef = useRef(name);

    const handleCheckboxChange = (role) => {
        const updatedRole = selectedRole === role ? (role === "client" ? "trainer" : "client") : role;
        setSelectedRole(updatedRole);
        roleRef.current = updatedRole; // Update live
    };

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://www.phone.email/sign_in_button_v1.js";
        script.async = true;
        document.body.appendChild(script);

        window.phoneEmailListener = (userObj) => {
            const user_json_url = userObj.user_json_url;

            sessionStorage.setItem("user_json_url", user_json_url);
            updateUserFieldLocally('mobile_number', userObj.user_phone_number); 

            const trimmedName = nameRef.current?.trim();
            if (trimmedName) {
                updateUserFieldLocally('name', trimmedName);
                // setUserData((prev) => ({ ...prev, name: trimmedName }));
            }
            if (roleRef.current === "trainer") {
                navigate("/trainer/trainerverification");
            } else {
                navigate("/Genderselect");
            }
        };

        return () => {
            window.phoneEmailListener = null;
        };
    }, []);   

    return (
        <div
            className="flex flex-col justify-between items-center"
            style={{
                background: '#FFFFFF',
            }}
        >
            <div className="flex flex-col items-center">
                <BackArrow
                    onClick={() => navigate(-1)}
                    style={{
                        width: '30px',
                        height: '30px',
                        position: 'absolute',
                        display: 'flex',
                        top: '40px',
                        left: '5px',
                    }}
                />
            </div>
            <div className="flex flex-col items-center mt-[80px]">
                <Userverificationlogo
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                />
                <div className="flex flex-col items-center">
                    <h1 className="text-[#2D3436] font-semibold font-urbanist text-[35px] mt-[-32px]">
                        OTP Verification
                    </h1>
                    <div className="flex flex-col text-[16px] mt-[5px] text-center font-urbanist text-[#00000060] leading-none">
                        <p>
                            We will send you an{" "}
                            <span className="text-[#2D3436] font-medium">One Time Password</span>{" "}
                        </p>
                        on your mobile number.
                    </div>
                    <p className="text-[18px] mt-[8px] font-urbanist font-semibold text-[#2D3436]">Your Lovely Name</p>
                    <input
                        type="text"
                        className="w-[150px] h-[40px] text-[20px] text-black outline-none text-center font-poppins font-semibold mt-[-5px]"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            nameRef.current = e.target.value; // update ref in real-time
                        }}
                    />
                    <HorizontalLine style={{ width: '250px', marginTop: '2px' }} />
                    <div className="flex justify-center items-center mt-[10px]">
                        <input
                            type="checkbox"
                            checked={selectedRole === "trainer"}
                            onChange={() => {
                                handleCheckboxChange("trainer");
                                // updateUserFieldLocally('role', "trainer");
                            }}
                            className="w-60 h-60"
                        />
                        <label className="text-[16px] font-urbanist ml-[5px] mr-[10px]">Trainer</label>

                        <input
                            type="checkbox"
                            checked={selectedRole === "client"}
                            onChange={() => {
                                handleCheckboxChange("client")
                                // updateUserFieldLocally('role', "client");
                            }}
                            className="w-60 h-60"
                        />
                        <label className="text-[16px] font-urbanist ml-[5px]">Client</label>
                    </div>

                    <div className='flex justify-center items-center bg-[#FF7675] font-urbanist rounded-[15px] w-[360px] h-[61px] text-[22px] mt-[15px]' style={{ boxShadow: '0px 12px 26px rgba(255, 118, 117, 0.30)'}}  >
                        <div
                            className="pe_signin_button mt-[0px] text-[22px]"
                            data-client-id={import.meta.env.CLIENT_ID_PHONE_OTP}
                            data-color="#FF7675"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Userverification;
