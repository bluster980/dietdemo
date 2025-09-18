import React from "react";
import { useNavigate } from "react-router-dom";
import BackArrow from "../assets/backarrow.svg";
import PrimaryButton from "../components/PrimaryButton";
import man from "../assets/man.png";
import woman from "../assets/woman.png";
import { useGender } from "../context/GenderContext";
import { updateUserFieldLocally } from "../utils/userOnboarding";

const Genderselect = () => {
  const navigate = useNavigate();
  const { selectedGender, setSelectedGender } = useGender();

  const handleSelectGender = (gender) => {
    setSelectedGender(gender);
  };

  const onGenderSelect = (selectedGender) => {
    updateUserFieldLocally("gender", selectedGender);
    navigate("/Weightselect");
  };

  return (
    <div
      className="flex flex-col justify-between items-center"
      style={{
        background: "#FFFFFF",
      }}
    >
      <div className="flex flex-col">
        <BackArrow
          onClick={() => navigate(-1)}
          style={{
            width: "30px",
            height: "30px",
            position: "absolute",
            display: "flex",
            top: "40px",
            left: "5px",
            zIndex: 1,
          }}
        />
        <h1
          className="text-[#2D3436] font-semibold font-urbanist text-[35px] mt-[105px]"
          style={{
            lineHeight: "1",
            textAlign: "left",
            width: "370px",
          }}
        >
          Select Gender
        </h1>
      </div>
      <div className="flex gap-20 mt-[34px]">
        <div
          className={`flex h-[500px] overflow-hidden rounded-[20px] ${
            selectedGender === "man" ? "bg-[#F3FFFE]" : ""
          }`}
          style={{
            border: "1px solid #E5E7EB",
            boxShadow: "0px 4px 14px rgba(17, 24, 39, 0.06)",
          }}
          onClick={() => handleSelectGender("man")}
        >
          <img
            src={man}
            alt="Gender man"
            style={{
              width: "175px",
              height: "406px",
              marginTop: "20px",
              cursor: "pointer",
              filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
            }}
          />
        </div>
        <div
          className={`flex h-[500px] overflow-hidden rounded-[20px] ${
            selectedGender === "woman" ? "bg-[#F3FFFE]" : ""
          }`}
          style={{
            border: "1px solid #E5E7EB",
            boxShadow: "0px 4px 14px rgba(17, 24, 39, 0.06)",
          }}
          onClick={() => handleSelectGender("woman")}
        >
          <img
            src={woman}
            alt="Gender woman"
            style={{
              width: "175px",
              height: "406px",
              marginTop: "20px",
              cursor: "pointer",
              filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
            }}
          />
        </div>
      </div>
      <div className="flex">
        <h1
          className="text-[#1F2937] font-medium font-urbanist text-[35px] mt-[-50px]"
          style={{
            lineHeight: "1",
            textAlign: "center",
            width: "180px",
          }}
        >
          Man
        </h1>
        <h1
          className="text-[#1F2937] font-medium font-urbanist text-[35px] mt-[-50px]"
          style={{
            lineHeight: "1",
            textAlign: "center",
            width: "180px",
          }}
        >
          Woman
        </h1>
      </div>
      <div className="w-full flex justify-center mt-[55px]">
        <PrimaryButton
          text="CONFIRM"
          onClick={() => onGenderSelect(selectedGender)}
          customStyle={{
            width: "88%",
            height: "52px",
            borderRadius: "15px",
            fontSize: "23px",
            boxShadow: "0px 12px 26px rgba(255, 118, 117, 0.30)",
          }}
        />
      </div>
    </div>
  );
};

export default Genderselect;
