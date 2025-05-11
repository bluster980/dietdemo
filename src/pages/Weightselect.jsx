import React, { useState } from 'react';    
import { useNavigate } from 'react-router-dom';
import backArrow from '../assets/backarrow.svg';
import PrimaryButton from '../components/PrimaryButton';
import Ruler from '../components/Ruler';
import man from '../assets/man.png'
import woman from '../assets/woman.png'
import { useGender } from '../context/GenderContext';

const Weightselect = () => {
    const navigate = useNavigate();
    const { selectedGender } = useGender();

    const [weight, setWeight] = useState(35);

    return (
        <div
      className="flex flex-col justify-between items-center"
      style={{
        background: 'linear-gradient(to bottom, #FFD98E 0%, #FFFFFF 24%)',
      }}
      >
      <div className="flex flex-col">
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
          zIndex: 1,
        }}
        />
        <h1
          className="text-[#000000] font-bold font-manjari text-[35px] mt-[100px]"
          style={{
            lineHeight: '1',
            textAlign: 'center',
            width: '370px',
          }}
          >
            What is your weight?
        </h1>
        <div>
            <div className='flex mt-[30px]'>
                <h1
                className="text-[#000000] font-bold font-manjari text-[40px]"
                style={{
                    lineHeight: '1',
                    textAlign: 'right',
                    width: '210px',
                    marginRight: '8px',
                }}
                >
                    {weight-5}
                </h1>
                <h1
                className="text-[#000000] font-bold font-manjari text-[23px] mt-[3px]"
                style={{
                    lineHeight: '1',
                    textAlign: 'left',
                    width: '150px',
                }}
                >
                    kg
                </h1>
            </div>
            <div className="flex justify-center items-center mt-[-10px]">
                <img 
                    src={selectedGender === 'man' ? man : woman}
                    alt={`Gender ${selectedGender}`}
                    style={{
                    width: '175px',
                    height: '406px',
                    cursor: 'pointer',
                    }}
                />
            </div>
            <div className="w-full max-w-[400px] mt-8 overflow-x-scroll scrollbar-hide">
                    <Ruler onChange={setWeight} />
            </div>
            <div className="w-full flex justify-center mt-[25px]">
                <PrimaryButton
                text="CONFIRM"
                onClick={() => navigate('/heightselect')}
                />
            </div>
        </div>
      </div>
    </div>
    );
}

export default Weightselect;