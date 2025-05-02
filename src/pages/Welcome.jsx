import React from 'react';
import PrimaryButton from '../components/PrimaryButton';
import homeMan from '../assets/homeman.png';
import runCard from '../assets/runcard.svg';
import homeHeart from '../assets/homeheart.svg';
import homeEnergy from '../assets/homeenergy.svg';
import homeBars from '../assets/homebars.svg';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col justify-between items-center"
      style={{
        background: 'linear-gradient(to bottom, #FFD98E 0%, #FFFFFF 100%)',
      }}
    >

      <div className="flex flex-col items-center mt-[226px]">
        <div
          style={{
            width: '320px',
            height: '280px',
            borderRadius: '160px',
            backgroundColor: '#FFFFFF50',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            position: 'relative',
          }}
        >
            <img
          src={runCard}
          alt="Run Card"
          style={{
            width: '134px',
            height: '64px',
            position: 'absolute',
            display: 'flex',
            top: '-50px',
            left: '-20px',
            zIndex: 1,
            // marginTop: '2px',
          }}
        />
        <img
          src={homeHeart}
          alt="Home Heart"
          style={{
            width: '134px',
            height: '54px',
            position: 'absolute',
            display: 'flex',
            top: '-30px',
            left: '205px',
            zIndex: 1,
          }}
        />
          <img
            src={homeMan}
            alt="Home Man"
            style={{
              width: '320px',
              height: '235px',
              marginBottom: '6px',
            }}
          />

          <img
            src={homeEnergy}
            alt="Home Energy"
            style={{
              width: '134px',
              height: '54px',
              position: 'absolute',
              display: 'flex',
              top: '245px',
              right: '200px',
              zIndex: 1,
            }}
          />
          <img
            src={homeBars}
            alt="Home Bars"
            style={{
              width: '150px',
              height: '70px',
              position: 'absolute',
              display: 'flex',
              top: '243px',
              left: '207px',
              zIndex: 1,
            }}
          />
        </div>

        <h1
          className="font-bold text-center font-manjari"
          style={{
            fontSize: '38px',
            color: '#2E456D',
            marginTop: '65px',
            lineHeight: '1',
          }}
        >
          Energize your life!
        </h1>

        <p
          className="text-center font-mako"
          style={{
            color: '#2E456D',
            fontSize: '19px',
            marginTop: '8px',
            lineHeight: '1.3',
          }}
        >
          If you want to succeed in life, <br />
          you gotta be Fit and Fine.
        </p>
      </div>

      <div className="w-full flex justify-center mt-[52px]">
        <PrimaryButton
          text="GET STARTED"
          onClick={() => navigate('/otp1')}
        />
      </div>
    </div>
  );
};

export default Welcome;
