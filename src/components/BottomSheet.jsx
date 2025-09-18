// src/components/BottomSheet.jsx
import React, { useState } from 'react';
import WeighingScale from '../assets/weighingscale.svg';
import RightArrow from '../assets/rightarrow.svg';
import { useUser } from '../context/UserContext';
import { updateUserField, updateOrInsertWeightRecord } from '../utils/supabaseQueries'
import toast from 'react-hot-toast';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, color } from 'framer-motion';

const BottomSheet = ({ isOpen, onClose, onWeightSubmitSuccess }) => {
  const [weightInput, setWeightInput] = useState('');
  const { userData, setUserData } = useUser();
  
  // if (isLoading) {
  //   return <div className="text-center text-[25px] py-10 text-gray-500">Loading...</div>;
  // }

  // if (!userData) {
  //   return <div className="text-center text-[25px] mt-10 text-gray-500">Loading...</div>;
  // }


   const handleWeightSubmit = async () => {
    if (!userData) {
      toast.error("User data missing. Please refresh the page.");
      return;
    }

    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight <= 0) {
      toast.error('Please enter a valid weight.');
      return;
    }

    try {
      const { data, error } = await updateUserField(userData.user_id, 'weight', weight);
      if (error) {
        toast.error('❌ Error updating weight: ' + error.message);
        return;
      }

      await updateOrInsertWeightRecord(userData.user_id, weight); // ✅ Add to weightrecords
      toast.success("Weight recorded successfully!", { duration: 5000 });
      setWeightInput('');
      // ✅ Inform parent to refresh chart
      if (typeof onWeightSubmitSuccess === 'function') {
        onWeightSubmitSuccess();
      }

      // Update local context
      const updatedUserData = { ...userData, weight: data.weight };
      setUserData(updatedUserData);


      onClose(); // close the bottom sheet
    } catch (err) {
      console.error('Update failed:', err);
      alert('Something went wrong.');
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1) Semi-transparent black overlay */}
          <motion.div
            className="fixed left-0 right-0 bottom-0 top-[0px] bg-black/50 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            />


          {/* 2) The actual sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-40 bg-white rounded-[15px] pt-[10px] px-6 pb-6"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
            {/* You can replace the content below with whatever you need */}
            <div className='flex justify-center h-[130px] mb-[100px]'>
                <div className='mt-[8px]'>
                    <WeighingScale />
                    <p className='flex flex-col text-[#2D3436] h-[10px] w-[210px] font-urbanist font-semibold text-[25px] mt-[16px]'>
                        <span >Enter your</span>
                        <span style={{'lineHeight': '1'}}>today’s weight</span>
                    </p>
                </div>
                <div className='flex w-[170px] h-[60px] border border-[#E9ECEF] rounded-[11px] mt-[20px]' style={{boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)'}}>
                    <div>
                        <p className='flex flex-col text-[#000000] h-[10px] w-[100px] font-palanquin text-[15px] mt-[5px] ml-[15px]'>
                            <span>Weight, kg</span>
                        </p>
                        <input
                            inputMode="decimal" // for mobile keyboards
                            className='flex justify-center items-center mt-[12px] w-[80px] h-[28px] bg-transparent border-none outline-none text-[22px] font-urbanist font-semibold text-[#6C757D] placeholder-top'
                            placeholder="00.00"
                            value={weightInput}
                            onChange={(e) => setWeightInput(e.target.value)}
                            style={{
                                textAlign: 'left',
                                resize: 'none',
                                paddingLeft: '15px',
                            }}
                        />
                    </div>
                    <div className='flex mt-[7px]'>
                        <div onClick={handleWeightSubmit} className='flex justify-center items-center h-[45px] w-[45px] rounded-[15px] bg-[#ff7675]'>
                            <RightArrow className='h-[22px] w-[22px]' style={{color: 'white'}}/>
                        </div>
                    </div>
                </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
