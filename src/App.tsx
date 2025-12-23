import { useState, useEffect } from 'react';
import { TerminalContainer } from './components/terminal/TerminalContainer';
import { IntroScreen } from './components/intro/IntroScreen';
import { EndScreen } from './components/end/EndScreen';
import { CurrencyDisplay } from './components/currency/CurrencyDisplay';
import { Icon } from './components/ui/Icon';
import { useConnectionStore } from './game/state/useConnectionStore';
import { useFileSystemStore } from './game/state/useFileSystemStore';
import { useMissionStore } from './game/state/useMissionStore';
import { useCurrencyStore } from './game/state/useCurrencyStore';
import { useInventoryStore } from './game/state/useInventoryStore';
import { useTerminalStore } from './game/state/useTerminalStore';
import { useChallengeStore } from './game/state/useChallengeStore';
import { useEducationalStore } from './game/state/useEducationalStore';
import { useAuthStore } from './game/state/useAuthStore';
import { useMissionPanelStore } from './game/state/useMissionPanelStore';
import { useEmailStore } from './game/state/useEmailStore';
import { registerMissionEventHandlers } from './game/missions/missionEventHandlers';
import { loadMissionModules } from './game/missions/missionLoader';
import { isLastMission } from './game/missions/missionOrdering';
import { getAllMissions } from './game/missions/missionLoader';
import { eventBus } from './game/events/eventBus';
import './App.css';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);

  // Initialize game systems on mount
  useEffect(() => {
    // Load all mission modules
    loadMissionModules();
    
    // Register mission event handlers (decouples commands from missions)
    registerMissionEventHandlers();
    
    // Listen for logout events to return to intro screen
    const unsubscribeLogout = eventBus.on('user:logout', () => {
      setGameStarted(false);
      setShowEndScreen(false);
    });
    
    // Check if game is already completed (all missions done)
    const checkGameCompletion = (completedMissionId?: string) => {
      if (!gameStarted) return;
      
      const missionStore = useMissionStore.getState();
      const completedMissions = missionStore.completedMissions || [];
      const allMissions = getAllMissions();
      
      // Check if all missions are completed
      if (allMissions.length > 0 && completedMissions.length >= allMissions.length) {
        // Find the last mission to verify
        const lastMission = allMissions.find(m => isLastMission(m.id));
        if (lastMission && completedMissions.includes(lastMission.id)) {
          setShowEndScreen(true);
          return;
        }
      }
      
      // Also check if the just-completed mission is the last one
      if (completedMissionId && isLastMission(completedMissionId)) {
        setShowEndScreen(true);
      }
    };
    
    // Check on mount and when missions change
    checkGameCompletion();
    const unsubscribeMissionComplete = eventBus.on('mission:completed', ({ missionId }) => {
      // Use a longer delay to ensure state is fully updated
      setTimeout(() => {
        checkGameCompletion(missionId);
        // Also check again after a bit more time to catch any race conditions
        setTimeout(() => checkGameCompletion(missionId), 200);
      }, 100);
    });
    
    // Cleanup on unmount
    return () => {
      unsubscribeLogout();
      unsubscribeMissionComplete();
    };
  }, [gameStarted]);

  const handleStartNewGame = (username: string) => {
    // Reset all game state
    useConnectionStore.getState().disconnectVPN();
    useConnectionStore.getState().disconnectRemoteServer();
    useFileSystemStore.getState().setActiveServer(null);
    useTerminalStore.getState().clearTerminal();
    useCurrencyStore.getState().reset();
    useInventoryStore.getState().reset();
    useChallengeStore.getState().exitRoot();
    useChallengeStore.getState().clearChallenge();
    useEducationalStore.getState().resetDismissed();
    useMissionStore.getState().setCurrentMission(null);
    useMissionStore.setState({
      completedMissions: [],
      taskProgress: {},
    });
    useMissionPanelStore.setState({
      expandedMissions: new Set(),
      expandedMissionId: null,
    });
    useEmailStore.getState().clearEmails();
    
    // Set username if provided
    if (username) {
      useAuthStore.getState().login(username);
    } else {
      useAuthStore.getState().logout();
    }

    // Start the welcome mission (this will handle emails, lore, etc. via mission module)
    useMissionStore.getState().startMission('welcome-00').catch(console.error);

    setGameStarted(true);
  };

  const handleContinueGame = () => {
    // Just continue with existing state from localStorage
    // The stores will auto-load from localStorage via their persist middleware
    setGameStarted(true);
    
    // Check if game is already completed (all missions done)
    const missionStore = useMissionStore.getState();
    const completedMissions = missionStore.completedMissions || [];
    const allMissions = getAllMissions();
    
    if (allMissions.length > 0 && completedMissions.length >= allMissions.length) {
      const lastMission = allMissions.find(m => isLastMission(m.id));
      if (lastMission && completedMissions.includes(lastMission.id)) {
        setShowEndScreen(true);
      }
    }
  };

  const handleEndScreenRestart = () => {
    handleStartNewGame(useAuthStore.getState().username || 'player');
    setShowEndScreen(false);
  };

  const handleEndScreenContinue = () => {
    setShowEndScreen(false);
    // Continue exploring the completed game
  };

  if (!gameStarted) {
    return <IntroScreen onStartNewGame={handleStartNewGame} onContinueGame={handleContinueGame} />;
  }

  if (showEndScreen) {
    return <EndScreen onRestart={handleEndScreenRestart} onContinue={handleEndScreenContinue} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-header-title">
            <h1>
              <Icon name="terminal" size={32} className="header-icon" aria-hidden={true} />
              NeonCloud
            </h1>
            <p>
              <Icon name="server" size={16} className="header-icon-small" aria-hidden={true} />
              Educational Network Security Game
            </p>
          </div>
          <CurrencyDisplay />
        </div>
      </header>
      <main className="app-main">
        <TerminalContainer />
      </main>
      <footer className="app-footer">
        <p className="footer-credits">
          Created by{' '}
          <a 
            href="https://x.com/burconsult" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            @burconsult
          </a>
          {' • '}
          <a 
            href="https://github.com/burconsult/neoncloud" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
