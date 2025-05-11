import React, { useState } from 'react';
import PrimaryButton from '../components/PrimaryButton';
import { useNavigate } from 'react-router-dom';
import backArrow from '../assets/backarrow.svg';

const Questionnaire = () => {
    const [form, setForm] = useState({
        trainTime: '',
        profession: '',
        goal: '',
        diet: '',
        age: '',
    });

    const [dropdownOpen, setDropdownOpen] = useState(null); // Track open dropdowns

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setDropdownOpen(null); // Close dropdown when an option is selected
    };

    const navigate = useNavigate();

    const renderCustomDropdown = (fieldName, value, options) => {
        const allOptions = [{ value: '', label: 'Select' }, ...options]; // Add "Select" at the top
    
        return (
            <div className="relative w-[360px] mt-[5px]">
            <button
                onClick={() => setDropdownOpen(dropdownOpen === fieldName ? null : fieldName)}
                className={`w-full h-[50px] px-80 py-2 text-[21px] border-2 text-left outline-none  ${
                dropdownOpen === fieldName || value ? 'border-orange-500' : 'border-gray-300'
                } bg-white rounded-[12px]`}
                style={{ color: value ? 'black' : '#00000070' }}
            >
                {allOptions.find(o => o.value === value)?.label || 'Select'}
        
                <div className="absolute pointer-events-none" style={{
                right: '15px',
                top: '50%',
                transform: 'translateY(-45%)',
                fontSize: '20px',
                color: '#00000070',
                }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                </div>
            </button>
        
            {dropdownOpen === fieldName && (
                <ul className="absolute w-full bg-white border border-gray-300 mt-[2px] z-10 rounded-[12px] border-2 overflow-hidden">
                {allOptions.map((option, index) => {
                    const isSelected = value === option.value;
        
                    return (
                    <li
                        key={option.value + fieldName}
                        onClick={() => handleChange(fieldName, option.value)}
                        className={`h-[50px] pl-[20px] px-4 py-40 text-[20px] cursor-pointer ${
                        isSelected ? 'font-palanquin font-bold bg-gray-100 text-black' : 'text-black'
                        } ${index === 0 ? 'rounded-t-[12px]' : ''} ${
                        index === allOptions.length - 1 ? 'rounded-b-[12px]' : 'border-b border-gray-300'
                        }`}
                        style={{
                        color: isSelected ? 'black' : 'rgba(0, 0, 0, 0.6)',
                        }}
                    >
                        {option.label}
                    </li>
                    );
                })}
                </ul>
            )}
            </div>
        );
    };
    



    return (
        <div
            className="flex flex-col justify-between items-center"
            style={{
                background: 'linear-gradient(to bottom, #FFD98E 0%, #FFFFFF 24%)',
            }}
        >
            <div className="flex flex-col">
                <img
                    src={backArrow}
                    alt="back arrow"
                    onClick={() => navigate(-1)}
                    style={{
                        width: '30px',
                        height: '30px',
                        position: 'absolute',
                        top: '40px',
                        left: '5px',
                        zIndex: 1,
                    }}
                />

                {/* TRAIN TIME */}
                <label className="text-[25px] w-[360px] font-bold font-manjari mt-[140px] self-start">
                    You wants to train in morning?
                </label>
                {renderCustomDropdown('trainTime', form.trainTime, [
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                ])}

                {/* PROFESSION */}
                <label className="text-[25px] w-[360px] font-bold font-manjari mt-[20px] self-start">
                    What is your Profession?
                </label>
                {renderCustomDropdown('profession', form.profession, [
                    { value: 'sedentary', label: '9 to 5 job (Sedentary lifestyle)' },
                    { value: 'moderately', label: 'Moderately Worker' },
                    { value: 'heavy', label: 'Heavy Worker' },
                ])}

                {/* GOAL */}
                <label className="text-[25px] w-[360px] font-bold font-manjari mt-[20px] self-start">
                    What is your Goal?
                </label>
                {renderCustomDropdown('goal', form.goal, [
                    { value: 'buildMuscle', label: 'Build Muscle' },
                    { value: 'weightLoss', label: 'Weight Loss' },
                ])}

                {/* DIET */}
                <label className="text-[25px] w-[360px] font-bold font-manjari mt-[20px] self-start">
                    What is your Dietary Preference?
                </label>
                {renderCustomDropdown('diet', form.diet, [
                    { value: 'vegetarian', label: 'Vegetarian' },
                    { value: 'nonVegetarian', label: 'Non-Vegetarian' },
                ])}

                {/* AGE */}
                <label className="text-[25px] w-[360px] font-bold font-manjari mt-[20px] self-start">
                    What is your Age?
                </label>
                <input
                    type="number"
                    value={form.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    className={`w-full h-[50px] mt-[5px] px-4 py-2 text-[21px] border-2 outline-none ${
                        form.age ? 'border-orange-500' : 'border-gray-300'
                    }`}
                    style={{
                        borderRadius: '12px',
                        backgroundColor: 'white',
                        paddingLeft: '20px',
                        color: form.age ? 'black' : '#00000070',
                        textAlign: 'left',
                        fontWeight: 'bold',
                    }}
                />

                <div className="w-full flex justify-center mt-[33px]">
                    <PrimaryButton text="CONFIRM" />
                </div>
            </div>
        </div>
    );
};

export default Questionnaire;
