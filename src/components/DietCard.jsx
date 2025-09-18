import React from 'react';
import Dietfire from '../assets/dietfire.svg'


const DietCard = ({ title, meals }) => {

    const flatMeals = meals.flat();
    console.log("flatMeals", flatMeals);

    return (
        <div className='flex flex-col justify-center items-center mt-[10px]'>
            <div className='z-10 bg-[#ffffff] flex flex-col w-[385px] border border-[#E9ECEF] rounded-[10px] pb-[20px]' style={{boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)' }}>
                <p className='flex flex-col ml-[15px] mt-[5px] text-[#000000] font-urbanist font-medium text-[22px] h-[50px]'>
                    <span>{title}</span>
                </p>
                <div className='flex flex-col items-end w-full gap-y-[25px] mt-[20px]'>
                    {flatMeals.map((meal, index) => (
                        <div key={index} className='flex w-[300px] h-[80px] bg-[#F8F9FA] border border-[#E9ECEF] rounded-l-[15px]' style={{boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.08)' }}>
                            <div
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    marginLeft: '-55px',
                                    marginTop: '-10px',
                                    borderRadius: '50%',
                                    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.25)',
                                }}
                            >
                                <div className='flex'>
                                    <img
                                        src={`/imgs/${meal.img_url.replaceAll(' ', '')}.png`}
                                        alt={meal.name}
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                        }}
                                    />
                                    <div className='flex flex-col ml-[10px]'>
                                        <div className='flex justify-between text-[15px] font-urbanist font-semibold text-[#6C757D] w-[97%] h-[35px] mt-[15px]'>
                                            <div className='w-[60%]'>
                                                <span>{meal.meal_name}</span>
                                            </div>
                                            <span>{meal.quantity} g</span>
                                        </div>
                                        <div className='flex justify-start items-center w-[240px] gap-x-[5px] mt-[10px]'>
                                            <Dietfire />
                                            <p className='text-[15px] font-urbanist text-[#909497]'>
                                                <span>{Math.floor(meal.calories * meal.quantity / 100)}</span>
                                                <span className='ml-[4px]'>kcal</span>
                                            </p>
                                            <div className='w-[8px] h-[8px] bg-[#6C5CE7] rounded-[100%] mt-[1px]'></div>
                                            <p className='text-[15px] font-urbanist text-[#909497]'>
                                                <span>{Math.floor(meal.protein * meal.quantity / 100)}</span>
                                                <span className='ml-[4px]'>g</span>
                                            </p>
                                            <div className='w-[8px] h-[8px] bg-[#4ECDC4] rounded-[50%] mt-[1px]'></div>
                                            <p className='text-[15px] font-urbanist text-[#909497]'>
                                                <span>{Math.floor(meal.carbs * meal.quantity / 100)}</span>
                                                <span className='ml-[4px]'>g</span>
                                            </p>
                                            <div className='w-[8px] h-[8px] bg-[#FFB703] rounded-[50%] mt-[1px]'></div>
                                            <p className='text-[15px] font-urbanist text-[#909497]'>
                                                <span>{Math.floor(meal.fat * meal.quantity / 100)}</span>
                                                <span className='ml-[4px]'>g</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DietCard;