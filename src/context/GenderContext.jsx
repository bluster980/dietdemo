import { createContext, useContext, useState } from 'react';

const GenderContext = createContext();

export const GenderProvider = ({ children }) => {
  const [selectedGender, setSelectedGender] = useState(null);
  return (
    <GenderContext.Provider value={{ selectedGender, setSelectedGender }}>
      {children}
    </GenderContext.Provider>
  );
};

export const useGender = () => useContext(GenderContext);
