import React from 'react';
import { useNavigate } from 'react-router-dom';
import backArrow from '../assets/backarrow.svg';
import PrimaryButton from '../components/PrimaryButton';
import man from '../assets/man.png'
import woman from '../assets/woman.png'
import { useGender } from '../context/GenderContext';

const Genderselect = () => {
    const navigate = useNavigate();
    const {selectedGender, setSelectedGender} = useGender();

    const handleSelectGender = (gender) => {
      setSelectedGender(gender);
    };

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
        className="text-[#000000] font-bold font-manjari text-[35px] mt-[138px]"
        style={{
        lineHeight: '1',
        textAlign: 'left',
        width: '370px',
        }}
        >
        Select Gender
      </h1>
      </div>
      <div className="flex gap-20 mt-[24px]">
      <div 
      className={`flex h-[500px] overflow-hidden rounded-[20px] ${selectedGender === 'man' ? 'bg-orange-100' : ''}`} 
      style={{
        border: '1.5px solid #D9D9D9',
      }}
      onClick={() => handleSelectGender('man')}
      >
      <img 
      src={man}
      alt="Gender man"
      style={{
        width: '175px',
        height: '406px',
        marginTop: '20px',
        cursor: 'pointer',
      }}
      />
      </div>
      <div 
      className={`flex h-[500px] overflow-hidden rounded-[20px] ${selectedGender === 'woman' ? 'bg-orange-100' : ''}`} 
      style={{
        border: '1.5px solid #D9D9D9',
      }}
      onClick={() => handleSelectGender('woman')}
      >
      <img
      src={woman}
      alt="Gender woman"
      style={{
        width: '175px',
        height: '406px',
        marginTop: '20px',
        cursor: 'pointer',
      }}
      />
      </div>
      </div>
      <div className='flex'>
      <h1
      className="text-[#2E456D] font-bold font-manjari text-[35px] mt-[-50px]"
      style={{
        lineHeight: '1',
        textAlign: 'center',
        width: '180px',
      }}
      >
        Man
      </h1>
      <h1
      className="text-[#2E456D] font-bold font-manjari text-[35px] mt-[-50px]"
      style={{
        lineHeight: '1',
        textAlign: 'center',
        width: '180px',
      }}
      >
        Woman
      </h1>
      </div>
      <div className="w-full flex justify-center mt-[50px]">
      <PrimaryButton
      text="CONFIRM"
      onClick={() => navigate('/weightselect')}
      />
      </div>
    </div>    
    );
}

export default Genderselect;