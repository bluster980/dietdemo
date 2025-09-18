import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackArrow from "../assets/backarrow.svg";
import PrimaryButton from "../components/PrimaryButton";
import Rulervertical from "../components/Rulervertical";
import man from "../assets/man.png";
import woman from "../assets/woman.png";
import { useGender } from "../context/GenderContext";
import { updateUserFieldLocally } from "../utils/userOnboarding";

const Heightselect = () => {
  const navigate = useNavigate();
  const { selectedGender } = useGender();

  const [height, setHeight] = useState(134);

  const onHeightSubmit = (height) => {
    updateUserFieldLocally("height", height);
    navigate("/questionnaire");
  };

  return (
    <div
      className="flex flex-col justify-between items-center"
      style={{
        background: " #FFFFFF",
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
          className="text-[#2D3436] font-semibold font-urbanist text-[35px] mt-[130px]"
          style={{
            lineHeight: "1",
            textAlign: "center",
            width: "370px",
          }}
        >
          What is your Height?
        </h1>
        <div>
          <div className="flex ml-[20px]">
            <div className="flex flex-col justify-center">
              <div className="flex mt-[58px]">
                <h1
                  className="text-[#2D3436] font-semibold font-urbanist text-[40px]"
                  style={{
                    lineHeight: "1",
                    textAlign: "right",
                    width: "100px",
                    marginRight: "10px",
                  }}
                >
                  {height - 3}
                </h1>
                <h1
                  className="text-[#2D3436] font-semibold font-urbanist text-[23px] mt-[7px]"
                  style={{
                    lineHeight: "1",
                    textAlign: "left",
                    width: "40px",
                  }}
                >
                  Cm
                </h1>
              </div>
              <img
                src={selectedGender === "man" ? man : woman}
                alt={`Gender ${selectedGender}`}
                style={{
                  width: "200px",
                  height: "450px",
                  cursor: "pointer",
                  filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
                }}
              />
            </div>
            <div className="w-[170px] h-[400px] mt-[35px] items-end">
              <Rulervertical onChange={setHeight} />
            </div>
          </div>
          <div className="w-full flex justify-center mt-[35px]">
            <PrimaryButton
              text="CONFIRM"
              onClick={() => onHeightSubmit(height)}
              customStyle={{
                width: "93%",
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

export default Heightselect;
