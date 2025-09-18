import React, {useState, useEffect, useRef} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BackArrow from '../assets/backarrow.svg';
import DemoProfile from '../assets/profile.svg';
import ProBadge from '../assets/probadge.svg';
import NotProBadge from '../assets/notprobadge.svg';
import ProfileCake from '../assets/profilecake.svg';
import ProfileBicep from '../assets/profilebicep.svg';
import ProfileDiet from '../assets/profilediet.svg';
import TrainerId from '../assets/trainerid.svg';
import ProfileEditPen from '../assets/profileeditpen.svg';
import ProfileStatistics from '../assets/profilestatistics.svg';
import ProfileQna from '../assets/profileqna.svg';
import ProfileMeeting from '../assets/profilemeeting.svg';
import ProfileDarkMode from '../assets/profiledarkmode.svg';
import ProfileUpload from '../assets/profileupload.svg';
import NavigationBar from '../components/NavBar';
import ToggleButton from '../components/ToggleButton';
import CroppableImagePicker from '../components/CroppableImagePicker/CroppableImagePicker';
import { useUser } from '../context/UserContext';
import { updateUserField, isTrainerIdAvailable } from '../utils/supabaseQueries'
// import { Alert } from '@mui/material';
import toast from 'react-hot-toast';

const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
    const [activeTab, setActiveTab] = useState('');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingProfile2, setIsEditingProfile2] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [profileData, setProfileData] = useState(null); // initially null
    const { userData, calculatedCalories, isLoading } = useUser();
    const [tempTrainerId, setTempTrainerId] = useState("");
    const [targetedCalories, setTargetedCalories] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);


    // const [showCropper, setShowCropper] = useState(false);
    const croppableRef = useRef(null);
    const { setUserData } = useUser();

    const toggleDarkMode = () => {
        // console.log(isDarkMode);
        setIsDarkMode(!isDarkMode);
    };

    const calculateTargetedCalories = (weight, height, age, gender, profession) => {
        let lifestyle = 1.2;
        if (profession === 'moderate') lifestyle = 1.55;
        else if (profession === 'heavy') lifestyle = 1.725;

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
                trainer_id: userData.trainer_id || null
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
    }, [profileData?.targeted_weight, profileData?.height, profileData?.age, profileData?.profession, userData?.gender]);

    useEffect(() => {
        if (!userData?.user_id) return;
        const savedImage = localStorage.getItem(`profileImage_${userData.user_id}`);
        if (savedImage) {
            setProfileImage(savedImage);
        }
    }, [userData]);

    useEffect(() => {
      const pathToTab = {
        '/diary': 'Diary',
        '/workout': 'Workout',
        '/diet': 'Diet',
        '/profile': 'Profile',
      };
      setActiveTab(pathToTab[location.pathname] || '');
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
        const { data, error } = await updateUserField(userData.user_id, field, value);
        if (data && data[field] !== undefined) {
            const updatedUserData = { ...userData, [field]: data[field] };
            setUserData(updatedUserData);
            localStorage.setItem("userData", JSON.stringify(updatedUserData));
        } else {
            console.warn("Failed to update field:", field, { data, error });
        }
    };


    const handleProfileSubmit = async () => {
        if (!userData?.user_id) return;

        // Set trainer_id if it was input for the first time
        if (!userData.trainer_id && tempTrainerId) {
            profileData.trainer_id = tempTrainerId;
        }

        for (const key in profileData) {
            if (profileData[key] !== userData[key] && profileData[key] !== '') {
                if (key === "trainer_id") {
                    const isAvailable = await isTrainerIdAvailable(profileData[key]);
                    if (isAvailable) {
                        toast.error('Invalid Trainer ID', {duration: 1500});
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
        setIsEditingProfile(false);        // exit editing mode
    };

    const handleDone2 = async () => {
        await handleProfileSubmit(); // update to DB
        setIsEditingProfile2(false);        // exit editing mode
    }


    if (isLoading || !userData) {
        return <div className="text-center mt-10 text-gray-500">Loading...</div>;
    }


    return (
        <div
            className="flex flex-col justify-between items-center"
            style={{
                background: 'linear-gradient(to bottom, #FFD98E 0%, #FFFFFF 24%)',
            }}
        >
          <div className="flex flex-col">
            <BackArrow 
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
            </div>
            {profileData && (
            <div className='flex flex-col mt-[80px]'>
                <div className='h-[115px] w-[385px] bg-white rounded-[10px] border border-1 border-gray-300 justify-center items-center'>
                    <div className='flex'>
                        <div className='flex flex-col'>
                            <div className="relative h-[100px] w-[100px] rounded-full overflow-hidden bg-gray-200 mt-[5px] ml-[5px]">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className='flex flex-col items-center justify-center mt-[10px]'>
                                        <span className="text-[20px] h-[22px] text-gray-500 inset-0 flex items-center justify-center">No</span>
                                        <span className="text-[20px] h-[22px] text-gray-500 inset-0 flex items-center justify-center">Image</span>
                                        <span className="text-[20px] h-[22px] text-gray-500 inset-0 flex items-center justify-center">Selected</span>
                                    </div>
                                )}

                                {isEditingProfile && (
                                    <div
                                    onClick={() => croppableRef.current?.clickTrigger()}
                                    className="absolute text-[20px] inset-0 bg-black bg-opacity-40 flex items-center justify-center text-[#f3f3f3] font-semibold cursor-pointer"
                                  >
                                    Edit
                                  </div>                                  
                                )}
                                <CroppableImagePicker
                                    ref={croppableRef}
                                    onCropComplete={handleImageCropped}
                                />                                  
                            </div>
                            {userData?.is_pro_user ? (
                                <ProBadge className='relative ml-[40px] mt-[-22px] h-[30px] w-[30px]' />
                            ) : (
                                <NotProBadge className='relative ml-[40px] mt-[-22px] h-[30px] w-[30px]' />
                            )}
                        </div>
                        <div className='flex flex-col w-[200px] min-w-[190px]'>
                            {isEditingProfile ? (
                                <div className="flex flex-col w-full">
                                <input
                                type="text"
                                value={profileData.name}
                                onChange={(e) => handleProfileChange("name", e.target.value)}
                                className="text-[#333333] mt-[12px] ml-[5px] font-palanquin w-[180px] h-[20px] font-bold text-[20px] border border-gray-300 rounded px-1"
                                />
                                <span className="text-[#00000090] ml-[5px] font-mako w-[110px] text-[13px] mt-[2px]">+91 {profileData.mobile_number}</span>
                            </div>
                            ) : (
                            <p className='flex flex-col mt-[5px] ml-[5px]'>
                                <span className='text-[#333333] font-palanquin font-bold text-[20px]'>{profileData.name}</span>
                                <span className='text-[#00000090] font-mako text-[13px] mt-[-3px]'>+91 {profileData.mobile_number}</span>
                            </p>
                            )}

                            <div className='flex ml-[5px] mt-[5px] items-center'>
                            <ProfileCake className='h-[20px] w-[20px]' />
                            {isEditingProfile ? (
                                <input
                                type="text"
                                value={profileData.age}
                                onChange={(e) => handleProfileChange("age", e.target.value)}
                                className="ml-[5px] text-[#00000090] font-mako text-[13px] border border-gray-300 rounded px-1 w-[20px]"
                                />
                            ) : (
                                <span className='text-[#00000090] font-mako text-[13px] ml-[5px] mt-[2px]'>{profileData.age}</span>
                            )}
                            <span className='text-[#00000090] font-mako text-[13px] ml-[5px] mt-[2px]'> years</span>

                            <ProfileBicep className='h-[20px] w-[20px] ml-[10px]' />
                                <span className='text-[#00000090] font-mako text-[13px] ml-[5px] mt-[2px]'>{profileData.goal}</span>
                            </div>

                            <div className='flex mt-[5px] ml-[5px] items-center'>
                            <ProfileDiet className='h-[20px] w-[20px]' />
                            {isEditingProfile ? (
                                <input
                                type="text"
                                value={profileData.diet_preference}
                                onChange={(e) => handleProfileChange("diet_preference", e.target.value)}
                                className="ml-[5px] text-[#00000090] font-mako text-[13px] border border-gray-300 rounded px-1 w-[55px]"
                                />
                            ) : (
                                <span className='text-[#00000090] font-mako w-[50px] text-[13px] ml-[5px]'>{profileData.diet_preference}</span>
                            )}
                            <TrainerId className='h-[20px] w-[20px] ml-[10px]' />
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
                                    className="text-[#00000090] font-mako text-[13px] w-[70px] ml-[5px] mt-[2px] border border-gray-300 rounded px-1"
                                    />
                                    {/* {trainerError && (
                                        <p className="w-full ml-[2px] text-red-500 text-[8px] mt-1">{trainerError}</p>
                                    )} */}
                                </>
                                ) : (
                                <span className="text-[#00000090] font-mako text-[13px] ml-[5px] mt-[px]">{userData.trainer_id ? userData.trainer_id :"Trainer's ID"}</span>
                            )}
                            </div>

                        </div>
                        <div className='w-[80px] flex justify-end mt-[10px] ml-[-10px]'>
                            {!isEditingProfile ? (
                            <div className='flex justify-center items-center w-[50px] h-[23px] rounded-[11px] bg-[#f8f8f8] border border-1.5 border-gray-300'>
                                <ProfileEditPen className='h-[15px] w-[15px] ml-[px]' />
                                <button
                                    onClick={() => setIsEditingProfile(true)}
                                    className='z-1 h-full ml-[2px] justify-center items-center text-[#00000095] font-palanquin font-bold text-[12px]'
                                    >
                                    {isEditingProfile ? "Done" : "Edit"}
                                </button>
                            </div>
                            ) : (
                                <div className='flex justify-center items-center w-[60px] h-[23px] rounded-[11px] bg-[#f8f8f8] border border-1.5 border-gray-300'>
                                <ProfileEditPen className='h-[15px] w-[15px] ml-[px]' />
                                <button
                                    onClick={handleDone}
                                    disabled={!userData || !isModified}
                                    className='z-1 h-full ml-[2px] justify-center items-center text-[#00000095] font-palanquin font-bold text-[12px]'
                                    >
                                    {isEditingProfile ? "Done" : "Edit"}
                                </button>
                            </div>
                            )}
                        </div>
                    </div>
                </div>
                <div>
                    <div className='w-[385px] h-[150px] bg-[#f9f9f9] rounded-[10px] border border-1 border-gray-300 mt-[5px]'>
                        <div className='flex items-center'>
                            <ProfileStatistics className='h-[27px] w-[27px] ml-[10px] mt-[5px]' />
                            <span className='text-[#333333] font-mako text-[24px] ml-[10px] mt-[3px]'>Statistics</span>
                        </div>
                        <div className='flex mt-[px] h-[125px] bg-white rounded-[10px] border border-1 border-gray-300'>
                            <div className='flex flex-col'>
                                <div className='flex flex-col mt-[8px] ml-[15px]'>
                                    <span className='text-[#333333] font-mako text-[15px]'>Calories</span>
                                    <span className='text-[#555555] mt-[-3px] font-manrope font-bold text-[20px]'>{calculatedCalories.toFixed(0)} kcal</span>
                                </div>
                                <div className='flex flex-col mt-[8px] ml-[15px]'>
                                    <span className='text-[#333333] font-mako text-[15px]'>Protein</span>
                                    <span className='text-[#555555] mt-[-3px] font-manrope font-bold text-[20px]'>{((calculatedCalories*0.15) / 4).toFixed(0)} gm</span>
                                </div>
                            </div>
                            <div className='flex flex-col ml-[70px]'>
                                <div className='flex flex-col mt-[8px] ml-[10px]'>
                                    <span className='text-[#333333] font-mako text-[15px]'>Weight</span>
                                    <span className='text-[#555555] mt-[-3px] font-manrope font-bold text-[20px]'>{profileData.weight} kg</span>
                                </div>
                                <div className='flex flex-col mt-[8px] ml-[10px]'>
                                    <span className='text-[#333333] font-mako text-[15px]'>Height</span>
                                    <span className='text-[#555555] mt-[-3px] font-manrope font-bold text-[20px]'>{profileData.height} cm</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col'>
                        <div className='flex items-center justify-between'>
                            <span className='text-[#333333] font-mako text-[22px] ml-[20px] mt-[20px]'>My Goals</span>
                            {!isEditingProfile2 ? (
                            <div className='flex mr-[10px] mt-[25px] justify-center items-center w-[50px] h-[23px] rounded-[11px] bg-[#f8f8f8] border border-1.5 border-gray-300'>
                                <ProfileEditPen className='h-[15px] w-[15px] ml-[px]' />
                                <button
                                    onClick={() => setIsEditingProfile2(true)}
                                    className='z-1 h-full ml-[2px] justify-center items-center text-[#00000095] font-palanquin font-bold text-[12px]'
                                    >
                                    {isEditingProfile2 ? "Done" : "Edit"}
                                </button>
                            </div>
                            ) : (
                                <div className='flex mr-[10px] mt-[25px] justify-center items-center w-[60px] h-[23px] rounded-[11px] bg-[#f8f8f8] border border-1.5 border-gray-300'>
                                <ProfileEditPen className='h-[15px] w-[15px] ml-[px]' />
                                <button
                                    onClick={handleDone2}
                                    disabled={!userData || !isModified}
                                    className='z-1 h-full ml-[2px] justify-center items-center text-[#00000095] font-palanquin font-bold text-[12px]'
                                    >
                                    {isEditingProfile2 ? "Done" : "Edit"}
                                </button>
                            </div>
                            )}
                        </div>
                        <div className='flex justify-start items-center mt-[5px] ml-[25px]'>
                            <div className='h-[8px] w-[8px] rounded-[50%] border border-[#777747] mt-[1px]'></div>
                            <span className='font-mako font-regular text-[#777747] text-[15px] ml-[8px]'> Nutrition: </span>
                            {profileData.targeted_weight > profileData.weight ? (
                                <span className='font-mako font-regular text-[#555454] text-[15px] ml-[4px]'>High Protein</span>
                            ) : (
                                <span className='font-mako font-regular text-[#555454] text-[15px] ml-[4px]'>Low Carbs</span>
                            )}
                            
                        </div>
                        <div className='flex justify-start items-center mt-[5px] ml-[25px]'>
                            <div className='h-[8px] w-[8px] rounded-[50%] border border-[#777747] mt-[1px]'></div>
                            <span className='font-mako font-regular text-[#777747] text-[15px] ml-[8px]'> Goal: </span>
                            {profileData.targeted_weight > profileData.weight ? (
                                <span className='font-mako font-regular text-[#555454] text-[15px] ml-[4px]'>Build Muscle</span>
                            ) : (
                                <span className='font-mako font-regular text-[#555454] text-[15px] ml-[4px]'>Weight Loss</span>
                            )}
                        </div>
                        <div className='flex justify-start items-center mt-[5px] ml-[25px]'>
                            <div className='h-[8px] w-[8px] rounded-[50%] border border-[#777747] mt-[1px]'></div>
                            <span className='font-mako font-regular text-[#777747] text-[15px] ml-[8px]'> Weight: </span>
                            {isEditingProfile2 ? (
                                <input
                                    type="decimal"
                                    value={profileData.targeted_weight}
                                    onChange={(e) => handleProfileChange("targeted_weight", e.target.value)}
                                    className="ml-[4px] text-[#555454] font-mako font-regular text-[15px] border border-gray-300 rounded px-1 w-[30px]"
                                />
                            ) : (
                                <span className='font-mako font-regular text-[#555454] text-[15px] ml-[4px]'> {profileData.targeted_weight} </span>
                            )}
                            <span className='font-mako font-regular text-[#555454] text-[15px] ml-[4px]'> kg </span>

                        </div>
                        <div className='flex justify-start items-center mt-[5px] ml-[25px]'>
                            <div className='h-[8px] w-[8px] rounded-[50%] border border-[#777747] mt-[1px]'></div>
                            <span className='font-mako font-regular text-[#777747] text-[15px] ml-[8px]'> Calories: </span>
                            
                                <span className='font-mako font-regular text-[#555454] text-[15px] ml-[4px]'> {targetedCalories} </span>
                            
                            <span className='font-mako font-regular text-[#555454] text-[15px] ml-[4px]'> kcal </span>
                        </div>
                        <div className='flex justify-start items-center mt-[5px] ml-[25px]'>
                            <div className='h-[8px] w-[8px] rounded-[50%] border border-[#777747] mt-[1px]'></div>
                            <span className='font-mako font-regular text-[#777747] text-[15px] ml-[8px]'> steps: </span>
                            
                                <span className='font-mako font-regular text-[#555454] text-[15px] ml-[4px]'> 5000 </span>
                        </div>
                    </div>
                    <div className='flex flex-col'>
                        <div className='flex justify-between items-center mt-[15px] px-[10px]' onClick={() => navigate('/profile/qna')}>
                            <div className='flex items-start'>
                                <ProfileQna className='h-[27px] w-[27px] mt-[10px]' />
                                <div className='flex flex-col ml-[10px]'>
                                    <span className='text-[#1f1f1f] font-mako text-[20px]'>Q&A</span>
                                    <span className='text-[#00000090] font-mako text-[15px] mt-[-4px]'>Ask your daily questions</span>
                                </div>
                            </div>
                            <BackArrow style={{transform: 'rotate(180deg)'}} />
                        </div>
                        <div className='flex justify-center mt-[10px]'>
                            <div className='justify-between items-center h-[1px] w-[365px] bg-[#d4d4d4]'></div>
                        </div>
                        

                        <div className='flex justify-between items-center mt-[10px] px-[10px]' onClick={() => navigate('/profile/meeting')}>
                            <div className='flex items-start'>
                                <ProfileMeeting className='h-[27px] w-[27px] mt-[10px]' />
                                <div className='flex flex-col ml-[10px]'>
                                    <span className='text-[#1f1f1f] font-mako text-[20px]'>Meeting with Trainer</span>
                                    <span className='text-[#00000090] font-mako text-[15px] mt-[-4px]'>Voice/video call</span>
                                </div>
                            </div>
                            <BackArrow style={{ transform: 'rotate(180deg)' }} />
                        </div>
                        
                        <div className='flex justify-center mt-[10px]'>
                            <div className='justify-between items-center h-[1px] w-[365px] bg-[#d4d4d4]'></div>
                        </div>

                        <div className='flex justify-between items-center mt-[10px] px-[10px]'>
                            <div className='flex items-start'>
                                <ProfileDarkMode className='h-[27px] w-[27px] mt-[10px]' />
                                <div className='flex flex-col ml-[10px]'>
                                    <span className='text-[#1f1f1f] font-mako text-[20px] '>Dark Mode</span>
                                    <span className='text-[#00000090] font-mako text-[15px]  mt-[-4px]'>Theme Preferences</span>
                                </div>
                            </div>
                            <ToggleButton isActive={isDarkMode} onToggle={toggleDarkMode} />
                        </div>

                        <div className='flex justify-center mt-[10px]'>
                            <div className='justify-between items-center h-[1px] w-[365px] bg-[#d4d4d4]'></div>
                        </div>

                        <div className='flex justify-between items-center mt-[10px] px-[10px]' onClick={() => navigate('/profile/upload')}>
                            <div className='flex items-start'>
                                <ProfileUpload className='h-[27px] w-[27px] mt-[10px]' />
                                <div className='flex flex-col ml-[10px]'>
                                    <span className='text-[#1f1f1f] font-mako text-[20px] '>Upload Images</span>
                                    <span className='text-[#00000090] font-mako text-[15px]  mt-[-4px]'>Current Progress</span>
                                </div>
                            </div>
                            <BackArrow style={{transform: 'rotate(180deg)',}} />
                        </div>
                    </div>
                </div>
            </div>
            )}
            <NavigationBar
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />
        </div>
    );
};


export default Profile;