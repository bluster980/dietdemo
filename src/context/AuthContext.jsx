import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');

  return (
    <AuthContext.Provider value={{ mobileNumber, setMobileNumber, generatedOTP, setGeneratedOTP }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
