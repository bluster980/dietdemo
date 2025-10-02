import React, {useState, useEffect} from 'react';
import BackArrow from '../assets/backarrow.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import DayDate from '../components/DayDate';
import NavigationBar from '../components/NavBar';
import DietCard from '../components/DietCard';
// import banana from '../assets/banana.png';
// import oatmeal from '../assets/oatmeal.png';
import { fetchUserDietWithDetails } from '../utils/supabaseQueries';

const userId = localStorage.getItem('user_id');

// const meals = [
//     {
//         name: "Grilled Chicken Salad",
//         image: oatmeal,
//         kcal: 350,
//         protein: 30,
//         carbs: 10,
//         fat: 15,
//     },
//     {
//         name: "Avocado Toast",
//         image: banana,
//         kcal: 250,
//         protein: 6,
//         carbs: 30,
//         fat: 12,
//     },
//     {
//         name: "Greek Yogurt with Berries",
//         image: banana,
//         kcal: 200,
//         protein: 15,
//         carbs: 20,
//         fat: 5,
//     },
//     {
//         name: "Protein Smoothie",
//         image: banana,
//         kcal: 300,
//         protein: 25,
//         carbs: 40,
//         fat: 5,
//     },
    
// ];

const Diet = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState('');
    const [selectedDay, setSelectedDay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dietByDayAndMeal, setDietByDayAndMeal] = useState({});

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

    const handleDateChange = (dateObj) => {
      setSelectedDay(dateObj.day); // e.g. 'Monday', 'Tuesday', etc.
    };
    
    useEffect(() => {
      const fetchData = async () => {
        const { data, error } = await fetchUserDietWithDetails(userId);
        if (error) {
          console.error('Error fetching diet data:', error.message);
          setLoading(false);
          return;
        }

        if (data.length > 0) {
          console.log('Fetched diet plan:', data);

          const grouped = data.reduce((acc, item) => {
            const { meal_time, meals } = item;

            if (!acc[meal_time]) acc[meal_time] = [];

            if (meals) acc[meal_time].push(meals); // Only push if exists

            return acc;
          }, {});

          setDietByDayAndMeal(grouped);
        } else {
          console.log('No diet plans found for this user.');
        }

        setLoading(false);
      };

      fetchData();
    }, []);

    const isReady = !loading && selectedDay;
    
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
            <div className='flex flex-col mt-[80px]'>
              <DayDate onDateChange={handleDateChange}/>
            </div>
            <div
              className="flex flex-col w-full h-[73vh] overflow-y-scroll mt-4"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'transparent transparent',
              }}
            >
              {!isReady ? (
                <p className="text-center text-gray-500 mt-6">Loading diet plan...</p>
              ) : (
                <>
                  {dietByDayAndMeal[selectedDay] ? (
                    Object.entries(dietByDayAndMeal[selectedDay]).map(([mealTime, meals], index) => (
                      <DietCard key={index} title={mealTime} meals={meals} />
                    ))
                  ) : (
                    <p className="text-center text-gray-400 mt-6">
                      No diet plan for {selectedDay}
                    </p>
                  )}
                </>
              )}
            </div>
            </div>
            <NavigationBar
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />
        </div>
    );
};

export default Diet;
