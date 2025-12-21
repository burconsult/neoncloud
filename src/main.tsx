import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { loadMissionModules } from './game/missions/missionLoader';
import { loadToolModules } from './game/tools/toolLoader';
import './styles/index.css';
import './styles/diagrams.css';

// Load all mission modules at application startup
loadMissionModules();

// Load all tool modules at application startup
loadToolModules();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

