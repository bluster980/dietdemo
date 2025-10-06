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
    <div
      className="flex flex-col justify-between items-center"
      style={{
        background: "var(--bg)",
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
            top: "10px",
            left: "5px",
            zIndex: 1,
            color: "var(--edit-button-text)",
          }}
        />
      </div>
      {profileData && (
        <div className="flex flex-col mt-[50px]">
          <div
            className="h-[115px] w-[385px] rounded-[10px] border border-1 border-[#E9ECEF] justify-center items-center"
            style={{ boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.07)", borderColor: "var(--profile-border)", backgroundColor: "var(--profile-section-card-bg)" }}
          >
            <div className="flex">
              <div className="flex flex-col">
                <div className="relative h-[100px] w-[100px] rounded-full overflow-hidden bg-gray-200 mt-[5px] ml-[5px]">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover rounded rounded-[50%] border border-[#E9ECEF]"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center mt-[10px] font-urbanist">
                      <span className="text-[20px] h-[22px] text-gray-500 inset-0 flex items-center justify-center">
                        No
                      </span>
                      <span className="text-[20px] h-[22px] text-gray-500 inset-0 flex items-center justify-center">
                        Image
                      </span>
                      <span className="text-[20px] h-[22px] text-gray-500 inset-0 flex items-center justify-center">
                        Selected
                      </span>
                    </div>
                  )}

                  {isEditingProfile && (
                    <div
                      onClick={() => croppableRef.current?.clickTrigger()}
                      className="absolute text-[22px] inset-0 bg-black bg-opacity-40 flex items-center justify-center font-urbanist font-bold text-[#ffffff] cursor-pointer"
                    >
                      Edit
                    </div>
                  )}
                  <CroppableImagePicker
                    ref={croppableRef}
                    onCropComplete={handleImageCropped}
                  />
                </div>
                {/* {userData?.is_pro_user ? (
                                <ProBadge className='relative ml-[40px] mt-[-22px] h-[30px] w-[30px]' />
                            ) : (
                                <NotProBadge className='relative ml-[40px] mt-[-22px] h-[30px] w-[30px]' />
                            )} */}
              </div>
              <div className="flex flex-col w-[200px] min-w-[190px]">
                {isEditingProfile ? (
                  <div className="flex flex-col w-full">
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        handleProfileChange("name", e.target.value)
                      }
                      className="text-[#2D3436] mt-[12px] ml-[5px] font-urbanist w-[180px] h-[20px] font-bold text-[20px] border border-gray-300 rounded px-1"
                    />
                    <span className="text-[#6C757D] ml-[5px] font-urbanist w-[110px] text-[13px] mt-[2px]">
                      +91 {profileData.mobile_number}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col mt-[5px] ml-[5px]">
                    <div className="flex items-center">
                      <span className="text-[#2D3436] font-urbanist font-bold text-[20px]" style={{color: "var(--general-charcoal-text)"}}>
                        {profileData.name}
                      </span>
                      {userData?.is_pro_user ? (
                        <div className="flex justify-center items-center text-center font-roboto font-semibold text-[#0B7285] text-[12px] w-[35px] h-[18px] bg-[#E6FCF5] border border-[#C3FAE8] rounded-[10px] ml-[5px] mt-[2px]">
                          <span>PRO</span>
                        </div>
                      ) : null}
                    </div>
                    <span className="text-[#6C757D] font-urbanist text-[13px] mt-[-3px]" style={{color: "var(--faded-text)"}}>
                      +91 {profileData.mobile_number}
                    </span>
                  </div>
                )}

                <div className="flex ml-[5px] mt-[5px] items-center">
                  <ProfileCake className="h-[20px] w-[20px]" />
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileData.age}
                      onChange={(e) =>
                        handleProfileChange("age", e.target.value)
                      }
                      className="ml-[5px] text-[#2D3436] font-urbanist text-[13px] border border-gray-300 rounded px-1 w-[20px]"
                    />
                  ) : (
                    <span className="text-[#2D3436] font-urbanist text-[13px] ml-[5px] mt-[2px]" style={{color: "var(--general-charcoal-text)"}}>
                      {profileData.age}
                    </span>
                  )}
                  <span className="text-[#2D3436] font-urbanist text-[13px] ml-[5px] mt-[2px]" style={{color: "var(--general-charcoal-text)"}}>
                    {" "}
                    years
                  </span>

                  <ProfileBicep className="h-[20px] w-[20px] ml-[10px]" />
                  <span className="text-[#2D3436] font-urbanist text-[13px] ml-[5px] mt-[2px]"  style={{color: "var(--general-charcoal-text)"}}>
                    {profileData.goal}
                  </span>
                </div>

                <div className="flex mt-[5px] ml-[5px] items-center">
                  <ProfileDiet className="h-[20px] w-[20px]" />
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileData.diet_preference}
                      onChange={(e) =>
                        handleProfileChange("diet_preference", e.target.value)
                      }
                      className="ml-[5px] text-[#2D3436] font-urbanist text-[13px] border border-gray-300 rounded px-1 w-[55px]"
                    />
                  ) : (
                    <span className="text-[#2D3436] font-urbanist w-[50px] text-[13px] ml-[5px]" style={{color: "var(--general-charcoal-text)"}}>
                      {profileData.diet_preference}
                    </span>
                  )}
                  <TrainerId className="h-[20px] w-[20px] ml-[10px]" />
                  {isEditingProfile && !userData.trainer_id ? (
                    <>
                      <input
                        type="text"
                        value={tempTrainerId}
                        maxLength={6}
                        onChange={(e) =>
                          setTempTrainerId(e.target.value.toUpperCase())
                        }
                        placeholder="JP-180"
                        className="text-[#2D3436] font-urbanist text-[13px] w-[70px] ml-[5px] mt-[2px] border border-gray-300 rounded px-1"
                      />
                    </>
                  ) : (
                    <span className="text-[#2D3436] font-urbanist text-[13px] ml-[5px] mt-[px]" style={{color: "var(--general-charcoal-text)"}}>
                      {userData.trainer_id
                        ? userData.trainer_id
                        : "Trainer's ID"}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-[80px] flex justify-end mt-[10px] ml-[-10px]">
                {!isEditingProfile ? (
                  <div className="flex justify-center items-center w-[50px] h-[23px] rounded-[11px] bg-[#F8F9FA] border border-[#E9ECEF]" style={{background: "var(--edit-button-bg)", borderColor: "var(--profile-border)"}}>
                    <ProfileEditPen
                      className="h-[15px] w-[15px] ml-[px]"
                      style={{ color: "var(--edit-button-text)" }}
                    />
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="z-1 h-full ml-[2px] justify-center items-center text-[#6C757D] font-urbanist font-bold text-[12px]"
                      style={{ color: "var(--edit-button-text)" }}
                    >
                      {isEditingProfile ? "Done" : "Edit"}
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex justify-center items-center w-[60px] h-[23px] rounded-[11px] bg-[#FF7675]"
                    style={{
                      boxShadow: "0px 6px 18px rgba(255, 118, 117, 0.30)",
                    }}
                  >
                    <ProfileEditPen
                      className="h-[15px] w-[15px] ml-[px]"
                      style={{ color: "#ffffff" }}
                    />
                    <button
                      onClick={handleDone}
                      disabled={!userData || !isModified}
                      className="z-1 h-full ml-[2px] justify-center items-center text-[#ffffff] font-urbanist font-bold text-[12px]"
                    >
                      {isEditingProfile ? "Done" : "Edit"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <div
              className="w-[385px] h-[160px] rounded-[10px] border border-1 border-[#E9ECEF] mt-[10px]"
              style={{ boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.07)", borderColor: "var(--profile-border)", backgroundColor: "var(--profile-section-card-bg)" }}
            >
              <div className="flex items-center">
                <ProfileStatistics className="h-[27px] w-[27px] ml-[10px] mt-[5px]" />
                <span className="text-[#2D3436] font-urbanist text-[24px] ml-[10px] mt-[3px]" style={{color: "var(--general-charcoal-text)"}}>
                  Statistics
                </span>
              </div>
              <div className="w-full h-[1px] bg-[#F1F3F5]" style={{ background: "var(--profile-divider)" }}></div>
              <div className="flex">
                <div className="flex flex-col">
                  <div className="flex flex-col mt-[8px] ml-[15px]">
                    <span className="text-[#6C757D] font-urbanist text-[15px] h-[15px]" style={{color: "var(--faded-text)"}}>
                      Calories
                    </span>
                    <div className="flex mt-[5px]">
                      <span className="text-[#2D3436] font-urbanist font-bold text-[20px]" style={{color: "var(--general-charcoal-text)"}}>
                        {calculatedCalories.toFixed(0)}
                      </span>
                      <span className="text-[#6C757D] font-urbanist font-bold text-[20px] ml-[5px]" style={{color: "var(--faded-text)"}}>
                        {" "}
                        kcal
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col mt-[8px] ml-[15px]">
                    <span className="text-[#6C757D] font-urbanist text-[15px] h-[15px]" style={{color: "var(--faded-text)"}}>
                      Protein
                    </span>
                    <div className="flex mt-[5px]">
                      <span className="text-[#2D3436] font-urbanist font-bold text-[20px]" style={{color: "var(--general-charcoal-text)"}}>
                        {((calculatedCalories * 0.15) / 4).toFixed(0)}
                      </span>
                      <span className="text-[#6C757D] font-urbanist font-bold text-[20px] ml-[5px]" style={{color: "var(--faded-text)"}}>
                        gm
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col ml-[70px]">
                  <div className="flex flex-col mt-[8px] ml-[10px]">
                    <span className="text-[#6C757D] font-urbanist text-[15px] h-[15px]" style={{color: "var(--faded-text)"}}>
                      Weight
                    </span>
                    <div className="flex mt-[5px]">
                      <span className="text-[#2D3436] font-urbanist font-bold text-[20px]" style={{color: "var(--general-charcoal-text)"}}>
                        {profileData.weight}
                      </span>
                      <span className="text-[#6C757D] font-urbanist font-bold text-[20px] ml-[5px]" style={{color: "var(--faded-text)"}}>
                        {" "}
                        kg
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col mt-[8px] ml-[10px]">
                    <span className="text-[#6C757D] font-urbanist text-[15px] h-[15px]" style={{color: "var(--faded-text)"}}>
                      Height
                    </span>
                    <div className="flex mt-[5px]">
                      <span className="text-[#2D3436] font-urbanist font-bold text-[20px]" style={{color: "var(--general-charcoal-text)"}}>
                        {profileData.height}
                      </span>
                      <span className="text-[#6C757D] font-urbanist font-bold text-[20px] ml-[5px]" style={{color: "var(--faded-text)"}}>
                        {" "}
                        cm
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-[#2D3436] font-urbanist text-[22px] ml-[20px] mt-[9px]" style={{color: "var(--general-charcoal-text)"}}>
                  My Goals
                </span>
                {!isEditingProfile2 ? (
                  <div className="flex mr-[10px] mt-[14px] justify-center items-center w-[50px] h-[23px] rounded-[11px] bg-[#F8F9FA] border border-[#E9ECEF]" style={{background: "var(--edit-button-bg)", borderColor: "var(--profile-border)"}}>
                    <ProfileEditPen
                      className="h-[15px] w-[15px] ml-[px]"
                      style={{ color: "var(--edit-button-text)" }}
                    />
                    <button
                      onClick={() => setIsEditingProfile2(true)}
                      className="z-1 h-full ml-[2px] justify-center items-center text-[#6C757D] font-urbanist font-bold text-[12px] mt-[-2px]"
                      style={{ color: "var(--edit-button-text)" }}
                    >
                      {isEditingProfile2 ? "Done" : "Edit"}
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex mr-[10px] mt-[9px] justify-center items-center w-[60px] h-[23px] rounded-[11px] bg-[#FF7675] "
                    style={{
                      boxShadow: "0px 6px 18px rgba(255, 118, 117, 0.30)",
                    }}
                  >
                    <ProfileEditPen
                      className="h-[15px] w-[15px] ml-[px]"
                      style={{ color: "#ffffff" }}
                    />
                    <button
                      onClick={handleDone2}
                      disabled={!userData || !isModified}
                      className="z-1 h-full ml-[2px] justify-center items-center text-[#ffffff] font-urbanist font-bold text-[12px] mt-[-3px]"
                    >
                      {isEditingProfile2 ? "Done" : "Edit"}
                    </button>
                  </div>
                )}
              </div>
              <div className="flex justify-start items-center mt-[5px] ml-[25px]">
                <div className="h-[8px] w-[8px] rounded-[50%] bg-[#4ECDC4] mt-[1px]"></div>
                <span className="font-urbanist font-regular text-[#6C757D] text-[15px] ml-[8px]" style={{color: "var(--goal-list-title)"}}>
                  {" "}
                  Nutrition:{" "}
                </span>
                {profileData.targeted_weight > profileData.weight ? (
                  <span className="font-urbanist font-regular text-[#2D3436] text-[15px] ml-[4px]" style={{color: "var(--goal-list-desc)"}}>
                    High Protein
                  </span>
                ) : (
                  <span className="font-urbanist font-regular text-[#2D3436] text-[15px] ml-[4px]" style={{color: "var(--goal-list-desc)"}}>
                    Low Carbs
                  </span>
                )}
              </div>
              <div className="flex justify-start items-center mt-[5px] ml-[25px]">
                <div className="h-[8px] w-[8px] rounded-[50%] bg-[#4ECDC4] mt-[1px]"></div>
                <span className="font-urbanist font-regular text-[#6C757D] text-[15px] ml-[8px]" style={{color: "var(--goal-list-title)"}}>
                  {" "}
                  Goal:{" "}
                </span>
                {profileData.targeted_weight > profileData.weight ? (
                  <span className="font-urbanist font-regular text-[#2D3436] text-[15px] ml-[4px]" style={{color: "var(--goal-list-desc)"}}>
                    Build Muscle
                  </span>
                ) : (
                  <span className="font-urbanist font-regular text-[#2D3436] text-[15px] ml-[4px]" style={{color: "var(--goal-list-desc)"}}>
                    Weight Loss
                  </span>
                )}
              </div>
              <div className="flex justify-start items-center mt-[5px] ml-[25px]">
                <div className="h-[8px] w-[8px] rounded-[50%] bg-[#4ECDC4] mt-[1px]"></div>
                <span className="font-urbanist font-regular text-[#6C757D] text-[15px] ml-[8px]" style={{color: "var(--goal-list-title)"}}>
                  {" "}
                  Weight:{" "}
                </span>
                {isEditingProfile2 ? (
                  <input
                    type="decimal"
                    value={profileData.targeted_weight}
                    onChange={(e) =>
                      handleProfileChange("targeted_weight", e.target.value)
                    }
                    className="ml-[4px] text-[#2D3436] font-urbanist font-regular text-[15px] border border-gray-300 rounded px-1 w-[30px]"
                  />
                ) : (
                  <span className="font-urbanist font-regular text-[#2D3436] text-[15px] ml-[4px]" style={{color: "var(--goal-list-desc)"}}>
                    {" "}
                    {profileData.targeted_weight}{" "}
                  </span>
                )}
                <span className="font-urbanist font-regular text-[#2D3436] text-[15px] ml-[4px]" style={{color: "var(--goal-list-desc)"}}>
                  {" "}
                  kg{" "}
                </span>
              </div>
              <div className="flex justify-start items-center mt-[5px] ml-[25px]">
                <div className="h-[8px] w-[8px] rounded-[50%] bg-[#4ECDC4] mt-[1px]"></div>
                <span className="font-urbanist font-regular text-[#6C757D] text-[15px] ml-[8px]" style={{color: "var(--goal-list-title)"}}>
                  {" "}
                  Calories:{" "}
                </span>

                <span className="font-urbanist font-regular text-[#2D3436] text-[15px] ml-[4px]" style={{color: "var(--goal-list-desc)"}}>
                  {" "}
                  {targetedCalories}{" "}
                </span>

                <span className="font-urbanist font-regular text-[#2D3436] text-[15px] ml-[4px]" style={{color: "var(--goal-list-desc)"}}>
                  {" "}
                  kcal{" "}
                </span>
              </div>
              <div className="flex justify-start items-center mt-[5px] ml-[25px]">
                <div className="h-[8px] w-[8px] rounded-[50%] bg-[#4ECDC4] mt-[1px]"></div>
                <span className="font-urbanist font-regular text-[#6C757D] text-[15px] ml-[8px]" style={{color: "var(--goal-list-title)"}}>
                  {" "}
                  steps:{" "}
                </span>

                <span className="font-urbanist font-regular text-[#2D3436] text-[15px] ml-[4px]" style={{color: "var(--goal-list-desc)"}}>
                  {" "}
                  5000{" "}
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <div
                className="flex justify-between items-center mt-[9px] px-[10px]"
                onClick={() => navigate("/profile/qna")}
              >
                <div className="flex items-start">
                  <ProfileQna
                    className="h-[27px] w-[27px] mt-[10px]"
                    style={{ color: "var(--profile-sub-section-desc)" }}
                  />
                  <div className="flex flex-col ml-[10px]">
                    <span className="text-[#2D3436] font-urbanist text-[20px]" style={{color: "var(--profile-sub-section)"}}>
                      Q&A
                    </span>
                    <span className="text-[#6C757D] font-urbanist text-[15px] mt-[-4px]" style={{color: "var(--profile-sub-section-desc)"}}>
                      Ask your daily questions
                    </span>
                  </div>
                </div>
                <BackArrow
                  style={{ transform: "rotate(180deg)", color: "var(--edit-button-text)" }}
                />
              </div>
              <div className="flex justify-center mt-[10px]">
                <div className="justify-between items-center h-[1px] w-[365px] bg-[#F1F3F5]" style={{color: "var(--profile-divider)"}}></div>
              </div>

              <div
                className="flex justify-between items-center mt-[9px] px-[10px]"
                onClick={() => navigate("/profile/meeting")}
              >
                <div className="flex items-start">
                  <ProfileMeeting
                    className="h-[27px] w-[27px] mt-[10px]"
                    style={{ color: "var(--profile-sub-section-desc)" }}
                  />
                  <div className="flex flex-col ml-[10px]">
                    <span className="text-[#2D3436] font-urbanist text-[20px]" style={{color: "var(--profile-sub-section)"}}>
                      Meeting with Trainer
                    </span>
                    <span className="text-[#6C757D] font-urbanist text-[15px] mt-[-4px]" style={{color: "var(--profile-sub-section-desc)"}}>
                      Voice/video call
                    </span>
                  </div>
                </div>
                <BackArrow
                  style={{ transform: "rotate(180deg)", color: "var(--edit-button-text)" }}
                />
              </div>

              <div className="flex justify-center mt-[10px]">
                <div className="justify-between items-center h-[1px] w-[365px] bg-[#F1F3F5]" style={{color: "var(--profile-divider)"}}></div>
              </div>

              <div className="flex justify-between items-center mt-[9px] px-[10px]">
                <div className="flex items-start">
                  <ProfileDarkMode
                    className="h-[27px] w-[27px] mt-[10px]"
                    style={{ color: "var(--profile-sub-section-desc)" }}
                  />
                  <div className="flex flex-col ml-[10px]">
                    <span className="text-[#2D3436] font-urbanist text-[20px] " style={{color: "var(--profile-sub-section)"}}>
                      Dark Mode
                    </span>
                    <span className="text-[#6C757D] font-urbanist text-[15px]  mt-[-4px]" style={{color: "var(--profile-sub-section-desc)"}}>
                      Theme Preferences
                    </span>
                  </div>
                </div>
                <ToggleButton isActive={isDarkMode} onToggle={toggleDarkMode} />
              </div>

              <div className="flex justify-center mt-[10px]">
                <div className="justify-between items-center h-[1px] w-[365px] bg-[#F1F3F5]" style={{color: "var(--profile-divider)"}}></div>
              </div>

              <div
                className="flex justify-between items-center mt-[9px] px-[10px]"
                onClick={() => navigate("/profile/upload")}
              >
                <div className="flex items-start">
                  <ProfileUpload
                    className="h-[27px] w-[27px] mt-[10px]"
                    style={{ color: "var(--profile-sub-section-desc)" }}
                  />
                  <div className="flex flex-col ml-[10px]">
                    <span className="text-[#2D3436] font-urbanist text-[20px] " style={{color: "var(--profile-sub-section)"}}>
                      Upload Images
                    </span>
                    <span className="text-[#6C757D] font-urbanist text-[15px]  mt-[-4px]" style={{color: "var(--profile-sub-section-desc)"}}>
                      Current Progress
                    </span>
                  </div>
                </div>
                <BackArrow
                  style={{ transform: "rotate(180deg)", color: "var(--edit-button-text)" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <NavigationBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default ProfileNew;
