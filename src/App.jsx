// src/App.jsx
import React from 'react';
// import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Userverification from './pages/Userverification';
import Trainerverification from './pages/Trainerverification';
import Genderselect from './pages/Genderselect';
import Questionnaire from './pages/Questionnaire';
import Weightselect from './pages/Weightselect';
import Heightselect from './pages/Heightselect';
import Diary from './pages/Diary';
import Navbar from './components/NavBar';
import Workout from './pages/Workout';
import Diet from './pages/Diet';
import DayDate from './components/DayDate';
import WorkoutCard from './components/WorkoutCard';
import DietCard from './components/DietCard';
import Profile from './pages/Profile';
import Qna from './pages/Qna';
import Meeting from './pages/Meeting';
import Upload from './pages/Upload';
import ImagePicker from './components/ImagePicker';
import BottomSheet from './components/BottomSheet';
import OtpDemo from './pages/OtpDemo';
import ClientCard from './components/ClientCard';
import ClientDietCard from './components/ClientDietCard';
import Clientmanage from './pages/Clientmanage';
import ConfirmDialog from './components/ConfirmDialog';
import ClientExcercise from './pages/ClientExcercise';
import ClientMeal from './pages/ClientMeal';
// import Notification from './pages/Notification';
import NotificationSub from './components/NotificationSub';
import DemoCharts from './components/DemoCharts';
import ChartsSec from './components/ChartsSec';
import DiaryNew from './pages/DiaryNew';
import WorkoutNew from './pages/WorkoutNew';
import DietNew from './pages/DietNew';
import ProfileNew from './pages/ProfileNew';

function App() {
  // const [generatedOTP, setGeneratedOTP] = useState("");
  // const [, setMobileNumber] = useState("");

  return (
    <>
      {/* Safe-area status bar background patch */}
      <div className="fixed top-0 left-0 right-0 h-[env(safe-area-inset-top)] bg-[#FFD98E] z-50 pointer-events-none" />

      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route
          path="/otp1"
          element={
            <Userverification
              // setGeneratedOTP={setGeneratedOTP}
              // setMobileNumber={setMobileNumber}
            />
          }
        />
        <Route
          path="/otp2"
          element={
            <Trainerverification
              // generatedOTP={generatedOTP}
              // mobileNumber={mobileNumber}
            />
          }
        />
        <Route path="/genderselect" element={<Genderselect />} />
        <Route path="/weightselect" element={<Weightselect />} />
        <Route path="/heightselect" element={<Heightselect />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/diary" element={<DiaryNew />} />
        <Route path="/workout" element={<WorkoutNew />} />
        <Route path="/diet" element={<DietNew />} />
        <Route path="/profile" element={<ProfileNew />} />
        <Route path="/profile/qna" element={<Qna />} />
        <Route path="/profile/meeting" element={<Meeting />} />
        <Route path="/profile/upload" element={<Upload />} />
        <Route path="/navbar" element={<Navbar />} />
        <Route path='/trainer/trainerverification' element={<Trainerverification />} />
        <Route path="/trainer/manageclient" element={<Clientmanage />} />
        <Route path="/trainer/clientexcercise" element={<ClientExcercise />} />
        <Route path="/trainer/clientmeal" element={<ClientMeal />} />
        <Route path="/notification" element={<NotificationSub />} />
        
      </Routes>
    </>
  );
}

export default App;


