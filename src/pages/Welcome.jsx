import React from 'react';
import PrimaryButton from '../components/PrimaryButton';
import homeMan from '../assets/homeman.png';
import RunCard from '../assets/runcard.svg';
import HomeHeart from '../assets/homeheart.svg';
import HomeEnergy from '../assets/homeenergy.svg';
import HomeBars from '../assets/homebars.svg';
import { useNavigate } from 'react-router-dom';
import '../styles/welcomeresponsive.css';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-viewport">
      <div className="welcome-page" style={{ backgroundColor: "var(--bg)" }}>
        {/* Hero Section */}
        <div className="welcome-hero">
          <div className="welcome-circle-container">
            {/* Decorative Cards */}
            <RunCard className="welcome-card welcome-card-runcard"/>
            <HomeHeart className="welcome-card welcome-card-heart" />
            
            {/* Main Circle with Image */}
            <div className="welcome-circle">
              <img
                src={homeMan}
                alt="Fitness motivation"
                className="welcome-hero-image"
              />
            </div>

            <HomeEnergy className="welcome-card welcome-card-energy" />
            <HomeBars className="welcome-card welcome-card-bars" />
          </div>

          {/* Title */}
          <h1 className="welcome-title" style={{ color: "var(--general-charcoal-text)" }}>
            Energize your life!
          </h1>

          {/* Subtitle */}
          <p className="welcome-subtitle" style={{ color: "var(--faded-text)" }}>
            If you want to succeed in life, <br />
            you gotta be Fit and Fine.
          </p>
        </div>

        {/* CTA Button */}
        <div className="welcome-cta">
          <PrimaryButton
            text="GET STARTED"
            onClick={() => navigate('/otp1')}
            customStyle={{
              width: 'var(--welcome-button-width)',
              height: 'var(--welcome-button-height)',
              borderRadius: 'var(--welcome-button-radius)',
              fontSize: 'var(--welcome-button-text-size)',
              boxShadow: '0px 12px 26px rgba(255, 118, 117, 0.30)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Welcome;
