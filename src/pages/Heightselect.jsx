import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import backArrow from '../assets/backarrow.svg';
import PrimaryButton from '../components/PrimaryButton';
import Rulervertical from '../components/Rulervertical';
import man from '../assets/man.png'
import woman from '../assets/woman.png'
import { useGender } from '../context/GenderContext';

const Heightselect = () => {
    const navigate = useNavigate();
    const { selectedGender } = useGender();

    const [height, setHeight] = useState(134);

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
          className="text-[#000000] font-bold font-manjari text-[35px] mt-[130px]"
          style={{
            lineHeight: '1',
            textAlign: 'center',
            width: '370px',
          }}
          >
            What is your Height?
        </h1>
        <div>
            <div className="flex ml-[20px]">
                <div>
                    <div className='flex mt-[58px]'>
                        <h1
                        className="text-[#000000] font-bold font-manjari text-[40px]"
                        style={{
                            lineHeight: '1',
                            textAlign: 'right',
                            width: '100px',
                            marginRight: '10px',
                        }}
                        >
                            {height-2}
                        </h1>
                        <h1
                        className="text-[#000000] font-bold font-manjari text-[23px] mt-[7px]"
                        style={{
                            lineHeight: '1',
                            textAlign: 'left',
                            width: '40px',
                        }}
                        >
                            Cm
                        </h1>
                    </div>
                    <img 
                        src={selectedGender === 'man' ? man : woman}
                        alt={`Gender ${selectedGender}`}
                        style={{
                        width: '200px',
                        height: '450px',
                        cursor: 'pointer',
                        }}
                    />
                </div>
                <div className='w-[170px] h-[400px] mt-[35px] items-end'>
                        <Rulervertical  onChange={setHeight}/>
                </div>
            </div>
            <div className="w-full flex justify-center mt-[25px]">
                <PrimaryButton
                text="CONFIRM"
                onClick={() => navigate('/questionnaire')}
                />
            </div>
        </div>
      </div>
    </div>
    );
}

export default Heightselect;