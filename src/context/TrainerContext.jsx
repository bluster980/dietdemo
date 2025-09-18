import React, { createContext, useContext , useEffect, useState} from 'react';

const TrainerContext = createContext();

export const TrainerProvider = ({children}) => {
    const [trainerData, setTrainerData] = useState(null);
    // const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // const fetchTrainerData = async () => {
        //     setIsLoading(true);

        // }
    })
    return (
        <TrainerContext.Provider value={{trainerData, setTrainerData}}>
            {children}
        </TrainerContext.Provider>
    )
}

export const useTrainer = () => useContext(TrainerContext);