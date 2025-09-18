import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { GenderProvider } from './context/GenderContext.jsx';
import '@mui/material/styles';
import '@mui/x-date-pickers/themeAugmentation';
import '@mui/material/CssBaseline'; // important for consistent UI
import { UserProvider } from './context/UserContext.jsx';
import '@lottiefiles/lottie-player';
import { Toaster } from 'react-hot-toast';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <GenderProvider>
          <UserProvider>
            <Toaster position="top-center" reverseOrder={false} />
            <App />
          </UserProvider>
        </GenderProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
