import React, {useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import Homepagelogo from '../assets/homepagelogo.svg';
import Homefire from '../assets/homefire.png';
import Homeproteinbar from '../assets/homeproteinbar.svg';
import Homecarbsbar from '../assets/homecarbsbar.svg';
import Homefatbar from '../assets/homefatbar.svg';
import NavigationBar from '../components/NavBar';
import BottomSheet from '../components/BottomSheet';
import ChartWeight from '../components/ChartWeight';
import NotificationBell from '../assets/notificationbell.svg';
import DemoCharts from '../components/DemoCharts';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Notification from './Notification';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, color } from 'framer-motion';
Chart.register(ChartDataLabels);

import { useUser } from '../context/UserContext';
import { fetchWeightRecords } from '../utils/supabaseQueries';

const Diary = () => {
    const location = useLocation();
    // const navigate = useNavigate();
    const { calculatedCalories } = useUser();
    const [labels, setLabels] = useState([]);
    const [data, setData] = useState([]);
    const [refreshFlag, setRefreshFlag] = useState(false); // 🔄 Used to refetch
    const [activeTab, setActiveTab] = useState(() => {
        const routeToTabMap = {
            '/diary': 'Diary',
            '/workout': 'Workout',
            '/diet': 'Diet',
            '/profile': 'Profile',
        };
        return routeToTabMap[location.pathname] || 'Diary';
    });

    const [isFabOpen, setIsFabOpen] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    const handleNotification = () => {
        setShowNotification(!showNotification);
    }
    const handleNavChange = (tabName, isFabPressed) => {
        if (isFabPressed) {
            setIsFabOpen((prev) => !prev);
        } else {
            setActiveTab(tabName);
            setIsFabOpen(false);
        }
    };
    
    useEffect(() => {

        const userId = localStorage.getItem('user_id');
        if (!userId) return;

        fetchWeightRecords(userId).then(({ data, error }) => {
            if (error) {
                console.error('Error fetching weight records:', error.message);
            } else if (data && data.length > 0) {
                const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
                setLabels(sortedData.map(record => {
                    const d = new Date(record.date);
                    return `${d.getDate()}/${d.getMonth() + 1}`; // e.g., 20/3
                }));
                setData(sortedData.map(record => record.weight_record));
            } else {
                console.log('No weight records found');
            }
        });
    }, [refreshFlag]);

    const triggerRefresh = () => setRefreshFlag(prev => !prev); // flip to trigger

    return (
    <AnimatePresence>
    <div
        className="flex flex-col justify-between items-center"
        style={{
        background: 'linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 24%)',
        }}
        >
        <div className="flex justify-between items-end">
            <h1
            className="text-[#2D3436] font-bold font-manjari text-[28px] mt-[65px]"
            style={{
            lineHeight: '1',
            textAlign: 'left',
            width: '325px',
            }}
            >
            Hello, Champ! Complete your daily nutrition
            </h1>
            <div className='mb-[10px] mr-[-5px] flex justify-center items-center w-[51px] h-[51px] rounded-[50%] border border-[#c7c7c7] bg-white' onClick={handleNotification}>
                <NotificationBell />
            </div>
        </div>
        {showNotification && (
            <motion.div
                className="flex justify-center items-center z- absolute inset-0 bg-[rgba(45,52,54,0.45)]"
                style={{
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                >
                <Notification onClose={() => setShowNotification(false)} />
            </motion.div>
        )}
        <div>
            <div className="items-center mt-[14px]">
                <div className="border bg-white border-gray-300 border-[1.5px] rounded-[23px] w-[384px] h-[391px]">
                    <h1 className='mt-[5px] ml-[15px]'>
                        <span className="text-[#333333] font-mako text-[22px]">
                            Food Log Calories
                        </span>
                    </h1>
                    <div className="justify-center mt-[20px] relative">
                        <Homepagelogo className="relative justify-center w-full items-center" />
                        <img 
                            src={Homefire} 
                            alt="Homefire" 
                            className="absolute inset-0 m-auto mt-[75px] w-[55px] h-[55px]" 
                            style={{ pointerEvents: 'none' }}
                        />
                        <p>
                            <span className="absolute mt-[130px] items-center text-[#333333] font-manrope font-bold inset-0 m-auto w-[60px] h-[5px] text-[28px]">
                                {calculatedCalories.toFixed(0)}
                            </span>
                            <span className="absolute mt-[160px] text-[#848A8D] font-mako inset-0 m-auto w-[90px] h-[5px] text-[20px]">
                                Remaining
                            </span>
                        </p>
                        <div className="flex ml-[10px] gap-x-[20px]">
                            <div className="flex">
                                <Homeproteinbar className="h-[55px] w-[55px]" />
                                <div className="flex flex-col items-start ml-[10px]">
                                    <span className="text-[#848A8D] font-mako text-[15px]">Protein</span>
                                    <div className="flex items-baseline">
                                        <span className="text-[#333333] font-mako font-bold text-[17px]">{((calculatedCalories*0.15) / 4).toFixed(0)}</span>
                                        <span className="text-[#848A8D] font-mako font-bold text-[14px] ml-[2px]">g</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex">
                                <Homecarbsbar className="h-[55px] w-[55px] " />
                                <div className="flex flex-col items-start ml-[10px]">
                                    <span className="text-[#848A8D] font-mako text-[15px]">Carbs</span>
                                    <div className="flex items-baseline">
                                        <span className="text-[#333333] font-mako font-bold text-[17px]">{((calculatedCalories*0.60) / 4).toFixed(0)}</span>
                                        <span className="text-[#848A8D] font-mako font-bold text-[14px] ml-[2px]">g</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex">
                                <Homefatbar className="h-[55px] w-[55px] " />
                                <div className="flex flex-col items-start ml-[10px]">
                                    <span className="text-[#848A8D] font-mako text-[15px]">Fat</span>
                                    <div className="flex items-baseline">
                                        <span className="text-[#333333] font-mako font-bold text-[17px]">{((calculatedCalories - (calculatedCalories*0.15).toFixed(0) - (calculatedCalories*0.60).toFixed(0))/9).toFixed(0)}</span>
                                        <span className="text-[#848A8D] font-mako font-bold text-[14px] ml-[2px]">g</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="border border-gray-300 border-[1.5px] rounded-[23px] w-[384px] h-[262px] mt-[8px]">
                <h1 className="mt-[5px] ml-[15px]">
                    <span className="text-[#333333] font-mako text-[22px]">Weight in kg</span>
                </h1>
            
                <div className="flex justify-center mt-[10px] overflow-x-auto scrollbar-none" style={{scrollbarColor: 'transparent transparent'}}>
                    <DemoCharts labels={labels} dataPoints={data} />
                </div>
            </div>
        </div>
        <BottomSheet
            isOpen={isFabOpen}
            onClose={() => setIsFabOpen(false)}
            onWeightSubmitSuccess={triggerRefresh}
        />
        <NavigationBar
            activeTab={activeTab}
            onTabChange={handleNavChange}
            isFabOpen={isFabOpen}
        />
    </div>
    </AnimatePresence>
    );
}
export default Diary;
