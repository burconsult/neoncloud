import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { loadMissionModules } from './game/missions/missionLoader';
import { loadToolModules } from './game/tools/toolLoader';
import { loadWorldEntities, initializeDiscoveryState, validateWorldGraph } from './game/world/loader';
import { loadChallengeGenerators } from './game/challenges/challengeLoader';
import './styles/index.css';
import './styles/diagrams.css';

// Load all world entities at application startup
loadWorldEntities();

// Initialize discovery state (mark known entities like NeonCloud)
initializeDiscoveryState();

// Load all mission modules at application startup
loadMissionModules();

// Validate world graph relationships (must be called after both entities and missions are loaded)
validateWorldGraph();

// Load all tool modules at application startup
loadToolModules();

// Load all challenge generators at application startup
loadChallengeGenerators();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

