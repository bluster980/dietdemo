// src/App.jsx
import React from 'react';
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
import ClientCard from './components/ClientCard';
import ClientDietCard from './components/ClientDietCard';
import Clientmanage from './pages/Clientmanage';
import ConfirmDialog from './components/ConfirmDialog';
import ClientExcercise from './pages/ClientExcercise';
import ClientMeal from './pages/ClientMeal';
import NotificationSub from './components/NotificationSub';
import DemoCharts from './components/DemoCharts';
import ChartsSec from './components/ChartsSec';
import DiaryNew from './pages/DiaryNew';
import WorkoutNew from './pages/WorkoutNew';
import DietNew from './pages/DietNew';
import ProfileNew from './pages/ProfileNew';
import { PrivateRoute, PublicOnlyRoute } from './context/AuthContext';
import DiaryResponsive from './pages/DiaryResponsive';
import CalorieCircle from './pages/CalorieCircle';

function App() {
  // const [generatedOTP, setGeneratedOTP] = useState("");
  // const [, setMobileNumber] = useState("");

  return (
    <>
      {/* Safe-area status bar background patch */}
      <div className="fixed top-0 left-0 right-0 h-[env(safe-area-inset-top)] bg-[#FFFFFF] z-50 pointer-events-none" />

      <Routes>
        <Route path="/" element={
          <PublicOnlyRoute>
            <Welcome />
          </PublicOnlyRoute>
        } />
         <Route path="/otp1" element={
          <PublicOnlyRoute>
            <Userverification />
          </PublicOnlyRoute>
        } />
        <Route path="/otp2" element={
          <PublicOnlyRoute>
            <Trainerverification />
          </PublicOnlyRoute>
        } />
        
        <Route path="/genderselect" element={
          <PrivateRoute>
            <Genderselect />
          </PrivateRoute>
        } />
        <Route path="/weightselect" element={
          <PrivateRoute>
            <Weightselect />
          </PrivateRoute>
        } />
        <Route path="/heightselect" element={
          <PrivateRoute>
            <Heightselect />
          </PrivateRoute>
        } />
        <Route path="/questionnaire" element={
          <PrivateRoute>
            <Questionnaire />
          </PrivateRoute>
        } />
        {/* Private app pages */}
        <Route path="/diary" element={
          <PrivateRoute>
            <DiaryResponsive />
          </PrivateRoute>
        } />
        <Route path="/workout" element={
          <PrivateRoute>
            <WorkoutNew />
          </PrivateRoute>
        } />
        <Route path="/diet" element={
          <PrivateRoute>
            <DietNew />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <ProfileNew />
          </PrivateRoute>
        } />
        <Route path="/profile/qna" element={
          <PrivateRoute>
            <Qna />
          </PrivateRoute>
        } />
        <Route path="/profile/meeting" element={
          <PrivateRoute>
            <Meeting />
          </PrivateRoute>
        } />
        <Route path="/profile/upload" element={
          <PrivateRoute>
            <Upload />
          </PrivateRoute>
        } />
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


