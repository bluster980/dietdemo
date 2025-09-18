import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackArrow from "../assets/backarrow.svg";
import PrimaryButton from "../components/PrimaryButton";
import Ruler from "../components/Ruler";
import man from "../assets/man.png";
import woman from "../assets/woman.png";
import { useGender } from "../context/GenderContext";
import { updateUserFieldLocally } from "../utils/userOnboarding";

const Weightselect = () => {
  const navigate = useNavigate();
  const { selectedGender } = useGender();

  const [weight, setWeight] = useState(35);

  const onWeightSubmit = (weight) => {
    updateUserFieldLocally("weight", weight);
    navigate("/Heightselect");
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
          alt="back arrow"
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
          className="text-[#2D3436] font-semibold font-urbanist text-[35px] mt-[100px]"
          style={{
            lineHeight: "1",
            textAlign: "center",
            width: "370px",
          }}
        >
          What is your weight?
        </h1>
        <div>
          <div className="flex mt-[30px] items-center">
            <h1
              className="text-[#2D3436] font-semibold font-urbanist text-[40px]"
              style={{
                lineHeight: "1",
                textAlign: "right",
                width: "210px",
                marginRight: "8px",
              }}
            >
              {weight - 5}
            </h1>
            <h1
              className="text-[#2D3436] font-semibold font-urbanist text-[23px] mt-[3px]"
              style={{
                lineHeight: "1",
                textAlign: "left",
                width: "150px",
              }}
            >
              kg
            </h1>
          </div>
          <div className="flex justify-center items-center mt-[-10px]">
            <img
              src={selectedGender === "man" ? man : woman}
              alt={`Gender ${selectedGender}`}
              style={{
                width: "175px",
                height: "406px",
                cursor: "pointer",
                filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
              }}
            />
          </div>
          <div className="w-full max-w-[400px] mt-8 overflow-x-scroll scrollbar-hide">
            <Ruler onChange={setWeight} />
          </div>
          <div className="w-full flex justify-center mt-[25px]">
            <PrimaryButton
              text="CONFIRM"
              onClick={() => onWeightSubmit(weight)}
              customStyle={{
                width: "90%",
                height: "52px",
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

export default Weightselect;
