import React from 'react';
import ReactDOM from 'react-dom/client'; // <<< IMPORTANT CHANGE: '/client' added
import App from './App';
import './index.css'; // Tailwind directives live here

// Create a root.
const root = ReactDOM.createRoot(document.getElementById('root')); // <<< IMPORTANT CHANGE: createRoot

// Initial render
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);