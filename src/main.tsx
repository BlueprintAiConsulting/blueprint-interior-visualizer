import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const splash = document.getElementById('splash-screen');
if (splash) {
  setTimeout(() => splash.classList.add('hidden'), 800);
  setTimeout(() => splash.remove(), 1400);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);
