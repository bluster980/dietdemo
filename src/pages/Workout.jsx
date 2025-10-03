import React, { useEffect, useState } from 'react';
import BackArrow from '../assets/backarrow.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import DayDate from '../components/DayDate';
import WorkoutCard from '../components/WorkoutCard';
import NavigationBar from '../components/NavBar';
import DumbellChest from '../assets/dumbellchest.gif';
import { fetchUserWorkoutWithDetails } from '../utils/supabaseQueries';

// get user_id from local storage
const userId = localStorage.getItem('user_id');

const Workout = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [activeTab, setActiveTab] = useState('');
  const [workoutsByDay, setWorkoutsByDay] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);

  
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
    
    useEffect(() => {
  const fetchData = async () => {
      const { data, error } = await fetchUserWorkoutWithDetails(userId);
      if (error) {
        console.error('Error fetching workout data:', error.message);
        setLoading(false);
        return;
      } else if (data.length > 0) {
        console.log('Fetched workout plan with exercise details:', data);

        // Group by day
        const grouped = data.reduce((acc, item) => {
          const { day_of_week: day, exercises } = item;
          if (!acc[day]) acc[day] = [];
          if (exercises) acc[day].push(exercises); // only push if exists
          return acc;
        }, {});

        setWorkoutsByDay(grouped);
        setLoading(false);
      } else {
        console.log('No workout plans found for this user.');
      }
    };

    fetchData();
  }, []);

  const isReady = !loading && selectedDay;

  const handleDateChange = (dateObj) => {
    setSelectedDay(dateObj.day); // Needed to fetch correct day’s workouts
  };
    
    return (
        <div
            className="flex flex-col justify-between items-center"
            style={{
                background: 'linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 24%)',
            }}
        >
          <div className="flex flex-col">
            <BackArrow 
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
            <div className='flex flex-col mt-[80px]'>
              <DayDate onDateChange={handleDateChange} />
            </div>
            <div
              className="flex flex-col w-full h-[73vh] overflow-y-scroll mt-4"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'transparent transparent',
              }}
            >
              {/* <div className="flex flex-col w-full h-[73vh] overflow-y-scroll mt-4"> */}
              {!isReady ? (
                <p className="text-center text-gray-500 mt-6">Loading workouts...</p> // ✅ loader while data fetches
              ) : (
                <>
                  {(workoutsByDay[selectedDay] || []).map((exercise, index) => (
                    <WorkoutCard key={index} exercise={exercise} />
                  ))}

                  {(workoutsByDay[selectedDay]?.length === 0 ||
                    !workoutsByDay[selectedDay]) && (
                    <p className="text-center text-gray-400 mt-6">No workouts for {selectedDay}</p>
                  )}
                </>
              )}

            {/* </div> */}

            </div>
          </div>
            <NavigationBar
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
      </div>
    );
}
export default Workout;
