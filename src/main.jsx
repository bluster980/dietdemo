import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { GenderProvider } from './context/GenderContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <GenderProvider>
          <App />
        </GenderProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
