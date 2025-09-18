import React from 'react';
import PrimaryButton from '../components/PrimaryButton';
import homeMan from '../assets/homeman.png';
import RunCard from '../assets/runcard.svg';
import HomeHeart from '../assets/homeheart.svg';
import HomeEnergy from '../assets/homeenergy.svg';
import HomeBars from '../assets/homebars.svg';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col justify-between items-center"
      style={{
        background: '#FFFFFF',
      }}
    >

      <div className="flex flex-col items-center mt-[150px]">
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '160px',
            // backgroundColor: '#FFFFFF50',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            position: 'relative',
            overflow: 'visible',
            background: 'radial-gradient(50% 50% at 50% 50%, rgba(83, 207, 195, 0.14) 0%, rgba(83, 207, 195, 0.09) 67.79%, rgba(227, 255, 253, 0.04) 87.98%, rgba(227, 255, 253, 0) 98.56%)'
          }}
        >
        <RunCard
          style={{
            width: '134px',
            height: '74px',
            position: 'absolute',
            display: 'flex',
            top: '-15px',
            left: '0px',
            // bottom: '50px',
            zIndex: 1,
          }}
        />
        <HomeHeart
          style={{
            width: '144px',
            height: '74px',
            position: 'absolute',
            display: 'flex',
            top: '-10px',
            // left: '105px',
            right: '-8px',
            zIndex: 1,
          }}
        />
          <div className='flex justify-center items-center w-[357px] h-[357px] mt-[20px] rounded-[50%]'> 

            <img
            src={homeMan}
            alt="Home man"
            style={{
              // width: '320px',
              // height: '235px',
              marginBottom: '0px',
            }}
            />
          </div>

          <HomeEnergy
            style={{
              width: '144px',
              height: '74px',
              position: 'absolute',
              display: 'flex',
              top: '295px',
              // right: '150px',
              left: '0px',
              zIndex: 1,
            }}
          />
          <HomeBars
            style={{
              width: '174px',
              height: '84px',
              position: 'absolute',
              display: 'flex',
              top: '285px',
              // left: '207px',
              right: '-25px',
              zIndex: 1,
            }}
          />
        </div>

        <h1
          className="font-semibold text-center font-urbanist"
          style={{
            fontSize: '40px',
            color: '#1F2937',
            marginTop: '55px',
            lineHeight: '1',
          }}
        >
          Energize your life!
        </h1>

        <p
          className="text-center font-urbanist"
          style={{
            color: '#4B5563',
            fontSize: '22px',
            marginTop: '15px',
            lineHeight: '1.3',
          }}
        >
          If you want to succeed in life, <br />
          you gotta be Fit and Fine.
        </p>
      </div>

      <div className="w-full flex justify-center mt-[66px]">
        <PrimaryButton
          text="GET STARTED"
          onClick={() => navigate('/otp1')}
          customStyle={{
            width: '360px',
            height: '60px',
            borderRadius: '15px',
            fontSize: '23px',
            boxShadow: '0px 12px 26px rgba(255, 118, 117, 0.30)',
          }}
        />
      </div>
    </div>
  );
};

export default Welcome;
