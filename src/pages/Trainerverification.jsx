import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../components/PrimaryButton";
import BackArrow from "../assets/backarrow.svg";
import Trainerverificationlogo from "../assets/trainerverificationlogo.svg";
import { isTrainerIdAvailable, insertTrainerId } from "../utils/supabaseQueries";
// import { getUserData } from "../utils/userOnboarding";
// import {updateTrainerField} from '../utils/trainerOnboarding'

const Trainerverification = () => {
  const navigate = useNavigate();
  const prefixRef = useRef(null);
  const digitsRef = useRef(null);
  const [prefix, setPrefix] = useState("");
  const [digits, setDigits] = useState("");
  const [error, setError] = useState("");

  const handlePrefixChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
    if (val.length <= 2) {
      setPrefix(val);
      if (val.length === 2) {
        digitsRef.current.focus(); // auto move to digits input
      }
    }
  };

  const handleDigitsChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length <= 3) {
      setDigits(val);
    }
  };

  const handleDigitsKeyDown = (e) => {
    if (e.key === "Backspace" && digits === "") {
      setPrefix((prev) => {
        const newPrefix = prev.slice(0, -1);
        // Delay focus slightly to avoid interfering with value change
        setTimeout(() => {
          prefixRef.current.focus();
        }, 0);
        return newPrefix;
      });
    }
  };

  const validateTrainerId = async () => {
    const id = `${prefix.toUpperCase()}-${digits}`;
    setError("");

    // Basic format check
    if (!/^[A-Z]{2}-\d{3}$/.test(id)) {
      setError(
        "Trainer ID must be 2 letters followed by 3 digits (e.g. AB-123)"
      );
      return false;
    }

    const available = await isTrainerIdAvailable(id);
    if (!available) {
      setError("Trainer ID is already taken, change last digits.");
      return false;
    }

    return id;
  };

  const handleSubmit = async () => {
    const trainerId = await validateTrainerId();
    if (!trainerId) return;

    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setError("Something went wrong. Please try again. about user_id");
      return;
    }

    const { data } = await insertTrainerId(userId, trainerId);
    console.log("Trainer Verification Data", data[0]);
    if (data) {
      console.log("Trainer Verification Data", data);
      localStorage.setItem("trainer_id", data[0].trainer_id);
      navigate("/trainer/manageclient");
    } else {
      setError("Something went wrong. Please try again. else part");
    }
  };

  return (
    <div
      className="flex flex-col justify-between items-center"
      style={{
        background: "#FFFFFF",
      }}
    >
      <div className="flex flex-col items-center">
        <BackArrow
          onClick={() => navigate(-1)}
          style={{
            width: "30px",
            height: "30px",
            position: "absolute",
            display: "flex",
            top: "40px",
            left: "5px",
          }}
        />
      </div>
      <div className="flex flex-col items-center mt-[80px]">
        <Trainerverificationlogo
          style={{
            width: "100%",
            height: "100%",
          }}
        />
        <div className="flex flex-col items-center">
          <h1
            className="text-[#2D3436] font-semibold font-urbanist text-[30px] mt-[5px]"
            style={{
              lineHeight: "1",
            }}
          >
            Trainer Verification
          </h1>
          <p className="text-[18px] mt-[20px] leading-none text-center font-urbanist">
            <span className="text-[#6C757D]">Create your</span>{" "}
            <span className="text-[#2D3436] font-medium">Trainer ID</span>
          </p>
          <div className="flex justify-center items-center gap-x-[5px] mt-[5px]">
            <input
              ref={prefixRef}
              className="w-[35px] h-[31px] border rounded-[8px] border-[#E9ECEF] text-[#2D3436] text-[20px] font-jetbrainsmono text-center"
              placeholder="JP"
              maxLength={2}
              value={prefix}
              onChange={handlePrefixChange}
              style={{boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.04)"}}
            ></input>
            <p className="justify-center items-center font-urbanist text-[#6C757D] text-[35px] ">
              <span>-</span>
            </p>
            <input
              ref={digitsRef}
              className="w-[62px] h-[31px] border rounded-[8px] border-[#E9ECEF] text-[#2D3436] text-[20px] font-jetbrainsmono text-center"
              placeholder="180"
              type="text"
              value={digits}
              onChange={handleDigitsChange}
              onKeyDown={handleDigitsKeyDown}
              style={{boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.04)"}}
            ></input>
          </div>
          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-[15px] mt-2 w-[100%] font-urbanist">{error}</p>
          )}
          <div className="flex flex-col mt-[15px]">
            <p className="text-[#2D3436] font-urbanist font-medium text-[18px]">
              <span>Trainer ID must be:</span>
            </p>
            <div className="flex flex-col justify-center items-start mt-[5px]">
              <div className="flex justify-center items-center">
                <div className='h-[8px] w-[8px] rounded-[50%] bg-[#4ECDC4] mt-[px]'></div>
                <span className="font-urbanist font-regular text-[#6C757D] text-[15px] ml-[8px]">
                  The first two letters must be from A to Z.
                </span>
              </div>
              <div className="flex justify-center items-center mt-[5px]">
                <div className='h-[8px] w-[8px] rounded-[50%] bg-[#4ECDC4] mt-[0px]'></div>
                <span className="font-urbanist font-regular text-[#6C757D] text-[15px] ml-[8px]">
                  Next three digits must be 0-9.
                </span>
              </div>
            </div>
          </div>

          <div className="w-full flex justify-center mt-[30px]">
            <PrimaryButton
              text="CREATE & PROCEED"
              onClick={handleSubmit}
              customStyle={{
                width: "360px",
                height: "60px",
                borderRadius: "15px",
                fontSize: "23px",
                boxShadow: "0px 12px 26px rgba(255, 118, 117, 0.30)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trainerverification;
