import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/tailwind.css'; // Import the Tailwind CSS
import App from './App'; // Import your App component

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
