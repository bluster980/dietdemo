import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BackArrow from "../assets/backarrow.svg";
import DemoProfile from "../assets/profile.svg";
import ProBadge from "../assets/probadge.svg";
import NotProBadge from "../assets/notprobadge.svg";
import ProfileCake from "../assets/profilecake.svg";
import ProfileBicep from "../assets/profilebicep.svg";
import ProfileDiet from "../assets/profilediet.svg";
import TrainerId from "../assets/trainerid.svg";
import ProfileEditPen from "../assets/profileeditpen.svg";
import ProfileStatistics from "../assets/profilestatistics.svg";
import ProfileQna from "../assets/profileqna.svg";
import ProfileMeeting from "../assets/profilemeeting.svg";
import ProfileDarkMode from "../assets/profiledarkmode.svg";
import ProfileUpload from "../assets/profileupload.svg";
import NavigationBar from "../components/NavBar";
import ToggleButton from "../components/ToggleButton";
import CroppableImagePicker from "../components/CroppableImagePicker/CroppableImagePicker";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeProvider";
import {
  updateUserField,
  isTrainerIdAvailable,
  fetchClientRequestStatus,
  addClientRequest,
} from "../utils/supabaseQueries";
// import { Alert } from '@mui/material';
import toast from "react-hot-toast";
import "../styles/profileresponsive.css";

const ProfileNew = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingProfile2, setIsEditingProfile2] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileData, setProfileData] = useState(null); // initially null
  const { userData, calculatedCalories, isLoading } = useUser();
  const [tempTrainerId, setTempTrainerId] = useState("");
  const [targetedCalories, setTargetedCalories] = useState(null);
  // const [isDarkMode, setIsDarkMode] = useState(false);

  // const [showCropper, setShowCropper] = useState(false);
  const croppableRef = useRef(null);
  const { setUserData } = useUser();
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";

  const toggleDarkMode = () => setTheme(isDarkMode ? "light" : "dark");

  useEffect(() => {
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  const lightColor = '#FFFFFF';
  const darkColor = '#0D0D0D'; // Match your CSS dark background
  const color = isDarkMode ? darkColor : lightColor;
  
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', color);
  }
}, [isDarkMode]);

  const calculateTargetedCalories = (
    weight,
    height,
    age,
    gender,
    profession
  ) => {
    let lifestyle = 1.2;
    if (profession === "moderate") lifestyle = 1.55;
    else if (profession === "heavy") lifestyle = 1.725;

    const s = gender === "man" ? 5 : -161;
    return Math.round((10 * weight + 6.25 * height - 5 * age + s) * lifestyle);
  };

  useEffect(() => {
    if (userData) {
      setProfileData({
        name: userData.name || "",
        mobile_number: userData.mobile_number || "",
        age: userData.age || "",
        targeted_weight: userData.targeted_weight || "",
        weight: userData.weight || "",
        height: userData.height || "",
        profession: userData.profession || "",
        diet_preference: userData.diet_preference || "",
        goal: userData.goal || "",
        steps: userData.steps || "",
        trainer_id: userData.trainer_id || null,
      });
    }
  }, [userData]);

  useEffect(() => {
    if (
      profileData &&
      profileData.targeted_weight &&
      profileData.height &&
      profileData.age &&
      profileData.profession &&
      userData?.gender
    ) {
      const calories = calculateTargetedCalories(
        parseFloat(profileData.targeted_weight),
        parseFloat(profileData.height),
        parseInt(profileData.age),
        userData.gender,
        profileData.profession
      );
      setTargetedCalories(calories);
    }
  }, [
    profileData?.targeted_weight,
    profileData?.height,
    profileData?.age,
    profileData?.profession,
    userData?.gender,
  ]);

  useEffect(() => {
    if (!userData?.user_id) return;
    const savedImage = localStorage.getItem(`profileImage_${userData.user_id}`);
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, [userData]);

  useEffect(() => {
    const pathToTab = {
      "/diary": "Diary",
      "/workout": "Workout",
      "/diet": "Diet",
      "/profile": "Profile",
    };
    setActiveTab(pathToTab[location.pathname] || "");
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleImageCropped = (croppedImage) => {
    setProfileImage(croppedImage);
    toast.success("Profile image updated successfully!", { duration: 5000 });
    localStorage.setItem(`profileImage_${userData.user_id}`, croppedImage);
  };

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUserFieldUpdate = async (field, value) => {
    const partial = { [field]: value };
    const { data, error } = await updateUserField(userData.user_id, partial);
    if (error) {
      console.warn("Failed to update field:", field, { error });
      return;
    }

    if (data) {
      const updatedUserData = { ...userData, ...data };
      setUserData(updatedUserData);
      toast.success("User updated successfully!", { duration: 5000 });
      localStorage.setItem("userData", JSON.stringify(updatedUserData));
    } else {
      console.warn("No data returned after update for field:", field);
    }
  };

  const handleProfileSubmit = async () => {
    if (!userData?.user_id) return;

    // Only if entering a new trainer_id
    if (!userData.trainer_id && tempTrainerId) {
      // First, check if a request already exists
      const { data: existingRequest } = await fetchClientRequestStatus(
        userData.user_id
      );
      if (existingRequest && existingRequest.trainer_id) {
        toast.error(
          `Already requested to trainer ${existingRequest.trainer_id}`
        );
        setTempTrainerId("");
        setProfileData((p) => ({ ...p, trainer_id: null }));
        return;
      }
      // Then, check if the trainer_id is valid/existing
      const isAvailable = await isTrainerIdAvailable(tempTrainerId);
      console.log("Trainer_id from tempTrainerId", tempTrainerId);
      if (isAvailable) {
        toast.error("Invalid Trainer ID", { duration: 1500 });
        setTempTrainerId("");
        setProfileData((p) => ({ ...p, trainer_id: null }));
        return;
      }
      // Add a new request
      const { error } = await addClientRequest(userData.user_id, tempTrainerId);
      if (!error) {
        toast.success("Request sent to trainer!", { duration: 2500 });
      } else {
        console.error(error);
        toast.error("Could not send request.");
      }
      return; // do NOT update users.trainer_id directly
    }

    for (const key in profileData) {
      if (profileData[key] !== userData[key] && profileData[key] !== "") {
        if (key === "trainer_id") {
          const isAvailable = await isTrainerIdAvailable(profileData[key]);
          console.log("Trainer_id from profileData", profileData[key]);
          if (isAvailable) {
            toast.error("Invalid Trainer ID 2", { duration: 1500 });
            return;
          }
        }
        await handleUserFieldUpdate(key, profileData[key]);
      }
    }
    // exit editing mode after successful updates
  };

  const isModified =
    profileData && userData
      ? Object.keys(profileData).some(
          (key) => profileData[key] !== userData[key]
        )
      : false;

  const handleDone = async () => {
    await handleProfileSubmit(); // update to DB
    setIsEditingProfile(false); // exit editing mode
  };

  const handleDone2 = async () => {
    await handleProfileSubmit(); // update to DB
    setIsEditingProfile2(false); // exit editing mode
  };

  if (isLoading || !userData) {
    return <div className="text-center mt-10 text-gray-500">Loading...</div>;
  }

  return (
  <div className="profile-viewport">
    <main className="profile-page">
      {/* Back Arrow */}
      <button 
        className="profile-back-btn" 
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <BackArrow className="profile-back-icon" />
      </button>

      {profileData && (
        <div className="profile-content">
          {/* Profile Info Card */}
          <div className="profile-info-card">
            <div className="profile-info-layout">
              {/* Profile Image */}
              <div className="profile-image-section">
                <div className="profile-image-container">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="profile-image"
                    />
                  ) : (
                    <div className="profile-image-placeholder">
                      <span>No</span>
                      <span>Image</span>
                      <span>Selected</span>
                    </div>
                  )}

                  {isEditingProfile && (
                    <div
                      onClick={() => croppableRef.current?.clickTrigger()}
                      className="profile-image-overlay"
                    >
                      Edit
                    </div>
                  )}
                  <CroppableImagePicker
                    ref={croppableRef}
                    onCropComplete={handleImageCropped}
                  />
                </div>
              </div>

              {/* Profile Details */}
              <div className="profile-details-section">
                {isEditingProfile ? (
                  <div className="profile-name-edit">
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        handleProfileChange("name", e.target.value)
                      }
                      className="profile-name-input"
                    />
                    <span className="profile-mobile">
                      +91 {profileData.mobile_number}
                    </span>
                  </div>
                ) : (
                  <div className="profile-name-display">
                    <div className="profile-name-row">
                      <span className="profile-name">{profileData.name}</span>
                      {userData?.is_pro_user && (
                        <div className="profile-pro-badge">PRO</div>
                      )}
                    </div>
                    <span className="profile-mobile">
                      +91 {profileData.mobile_number}
                    </span>
                  </div>
                )}

                {/* Age & Goal Row */}
                <div className="profile-info-row">
                  <ProfileCake className="profile-icon" />
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileData.age}
                      onChange={(e) =>
                        handleProfileChange("age", e.target.value)
                      }
                      className="profile-age-input"
                    />
                  ) : (
                    <span className="profile-info-text">{profileData.age}</span>
                  )}
                  <span className="profile-info-text">years</span>

                  <ProfileBicep className="profile-icon profile-icon-ml" />
                  <span className="profile-info-text">{profileData.goal}</span>
                </div>

                {/* Diet & Trainer Row */}
                <div className="profile-info-row">
                  <ProfileDiet className="profile-icon" />
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileData.diet_preference}
                      onChange={(e) =>
                        handleProfileChange("diet_preference", e.target.value)
                      }
                      className="profile-diet-input"
                    />
                  ) : (
                    <span className="profile-info-text profile-diet-text">
                      {profileData.diet_preference}
                    </span>
                  )}
                  <TrainerId className="profile-icon profile-icon-ml" />
                  {isEditingProfile && !userData.trainer_id ? (
                    <input
                      type="text"
                      value={tempTrainerId}
                      maxLength={6}
                      onChange={(e) =>
                        setTempTrainerId(e.target.value.toUpperCase())
                      }
                      placeholder="JP-180"
                      className="profile-trainer-input"
                    />
                  ) : (
                    <span className="profile-info-text">
                      {userData.trainer_id
                        ? userData.trainer_id
                        : "Trainer's ID"}
                    </span>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <div className="profile-edit-button-wrapper">
                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="profile-edit-button"
                  >
                    <ProfileEditPen className="profile-edit-icon" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <button
                    onClick={handleDone}
                    disabled={!userData || !isModified}
                    className="profile-done-button"
                  >
                    <ProfileEditPen className="profile-done-icon" />
                    <span>Done</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="profile-stats-card">
            <div className="profile-stats-header">
              <ProfileStatistics className="profile-stats-icon" />
              <span className="profile-stats-title">Statistics</span>
            </div>
            <div className="profile-stats-divider"></div>
            <div className="profile-stats-grid">
              <div className="profile-stat-item">
                <span className="profile-stat-label">Calories</span>
                <div className="profile-stat-value-row">
                  <span className="profile-stat-value">
                    {calculatedCalories.toFixed(0)}
                  </span>
                  <span className="profile-stat-unit">kcal</span>
                </div>
              </div>
              <div className="profile-stat-item">
                <span className="profile-stat-label">Weight</span>
                <div className="profile-stat-value-row">
                  <span className="profile-stat-value">{profileData.weight}</span>
                  <span className="profile-stat-unit">kg</span>
                </div>
              </div>
              <div className="profile-stat-item">
                <span className="profile-stat-label">Protein</span>
                <div className="profile-stat-value-row">
                  <span className="profile-stat-value">
                    {((calculatedCalories * 0.15) / 4).toFixed(0)}
                  </span>
                  <span className="profile-stat-unit">gm</span>
                </div>
              </div>
              <div className="profile-stat-item">
                <span className="profile-stat-label">Height</span>
                <div className="profile-stat-value-row">
                  <span className="profile-stat-value">{profileData.height}</span>
                  <span className="profile-stat-unit">cm</span>
                </div>
              </div>
            </div>
          </div>

          {/* My Goals Section */}
          <div className="profile-goals-section">
            <div className="profile-goals-header">
              <span className="profile-goals-title">My Goals</span>
              {!isEditingProfile2 ? (
                <button
                  onClick={() => setIsEditingProfile2(true)}
                  className="profile-edit-button"
                >
                  <ProfileEditPen className="profile-edit-icon" />
                  <span>Edit</span>
                </button>
              ) : (
                <button
                  onClick={handleDone2}
                  disabled={!userData || !isModified}
                  className="profile-done-button"
                >
                  <ProfileEditPen className="profile-done-icon" />
                  <span>Done</span>
                </button>
              )}
            </div>

            <div className="profile-goals-list">
              <div className="profile-goal-item">
                <div className="profile-goal-dot"></div>
                <span className="profile-goal-label">Nutrition:</span>
                <span className="profile-goal-value">
                  {profileData.targeted_weight > profileData.weight
                    ? "High Protein"
                    : "Low Carbs"}
                </span>
              </div>
              <div className="profile-goal-item">
                <div className="profile-goal-dot"></div>
                <span className="profile-goal-label">Goal:</span>
                <span className="profile-goal-value">
                  {profileData.targeted_weight > profileData.weight
                    ? "Build Muscle"
                    : "Weight Loss"}
                </span>
              </div>
              <div className="profile-goal-item">
                <div className="profile-goal-dot"></div>
                <span className="profile-goal-label">Weight:</span>
                {isEditingProfile2 ? (
                  <input
                    type="text"
                    value={profileData.targeted_weight}
                    onChange={(e) =>
                      handleProfileChange("targeted_weight", e.target.value)
                    }
                    className="profile-goal-input"
                  />
                ) : (
                  <span className="profile-goal-value">
                    {profileData.targeted_weight}
                  </span>
                )}
                <span className="profile-goal-value">kg</span>
              </div>
              <div className="profile-goal-item">
                <div className="profile-goal-dot"></div>
                <span className="profile-goal-label">Calories:</span>
                <span className="profile-goal-value">{targetedCalories}</span>
                <span className="profile-goal-value">kcal</span>
              </div>
              <div className="profile-goal-item">
                <div className="profile-goal-dot"></div>
                <span className="profile-goal-label">steps:</span>
                <span className="profile-goal-value">5000</span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="profile-menu-section">
            <div className="profile-menu-item" onClick={() => navigate("/profile/qna")}>
              <div className="profile-menu-content">
                <ProfileQna className="profile-menu-icon" />
                <div className="profile-menu-text">
                  <span className="profile-menu-title">Q&A</span>
                  <span className="profile-menu-subtitle">Ask your daily questions</span>
                </div>
              </div>
              <BackArrow className="profile-menu-arrow" />
            </div>
            <div className="profile-menu-divider"></div>

            <div className="profile-menu-item" onClick={() => navigate("/profile/meeting")}>
              <div className="profile-menu-content">
                <ProfileMeeting className="profile-menu-icon" />
                <div className="profile-menu-text">
                  <span className="profile-menu-title">Meeting with Trainer</span>
                  <span className="profile-menu-subtitle">Voice/video call</span>
                </div>
              </div>
              <BackArrow className="profile-menu-arrow" />
            </div>
            <div className="profile-menu-divider"></div>

            <div className="profile-menu-item">
              <div className="profile-menu-content">
                <ProfileDarkMode className="profile-menu-icon" />
                <div className="profile-menu-text">
                  <span className="profile-menu-title">Dark Mode</span>
                  <span className="profile-menu-subtitle">Theme Preferences</span>
                </div>
              </div>
              <ToggleButton isActive={isDarkMode} onToggle={toggleDarkMode} />
            </div>
            <div className="profile-menu-divider"></div>

            <div className="profile-menu-item" onClick={() => navigate("/profile/upload")}>
              <div className="profile-menu-content">
                <ProfileUpload className="profile-menu-icon" />
                <div className="profile-menu-text">
                  <span className="profile-menu-title">Upload Images</span>
                  <span className="profile-menu-subtitle">Current Progress</span>
                </div>
              </div>
              <BackArrow className="profile-menu-arrow" />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <div className="nav-wrap">
        <NavigationBar activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </main>
  </div>
);
};

export default ProfileNew;
