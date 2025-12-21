import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/game/state/useAuthStore';
import './IntroScreen.css';

interface IntroScreenProps {
  onStartNewGame: (username: string) => void;
  onContinueGame: () => void;
}

export function IntroScreen({ onStartNewGame, onContinueGame }: IntroScreenProps) {
  const [hasExistingGame, setHasExistingGame] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');

  useEffect(() => {
    // Check if there's existing game state in localStorage
    const checkForExistingGame = () => {
      try {
        // Check key stores that indicate game progress
        const hasMissions = localStorage.getItem('neoncloud-missions') !== null;
        const hasCurrency = localStorage.getItem('neoncloud-currency') !== null;
        const hasInventory = localStorage.getItem('neoncloud-inventory') !== null;
        
        // Consider it an existing game if any of these exist
        setHasExistingGame(hasMissions || hasCurrency || hasInventory);
      } catch (error) {
        console.error('Error checking for existing game:', error);
        setHasExistingGame(false);
      } finally {
        setChecking(false);
      }
    };

    checkForExistingGame();
  }, []);

  const handleStartNewGame = () => {
    const trimmedUsername = username.trim();
    
    // Validate username
    if (!trimmedUsername) {
      setUsernameError('Username cannot be empty');
      return;
    }
    
    if (trimmedUsername.length < 2) {
      setUsernameError('Username must be at least 2 characters');
      return;
    }
    
    if (trimmedUsername.length > 20) {
      setUsernameError('Username must be 20 characters or less');
      return;
    }
    
    // Check for valid characters (alphanumeric, underscore, hyphen)
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      setUsernameError('Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }
    
    // Username is valid, set it in auth store and start game
    useAuthStore.getState().login(trimmedUsername);
    onStartNewGame(trimmedUsername);
  };

  if (checking) {
    return (
      <div className="intro-screen">
        <div className="intro-content">
          <div className="intro-loading">
            <Icon name="terminal" size={64} className="intro-icon" aria-hidden={true} />
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="intro-screen">
      <div className="intro-content">
        <div className="intro-header">
          <Icon name="terminal" size={80} className="intro-icon" aria-hidden={true} />
          <h1 className="intro-title">NeonCloud</h1>
          <p className="intro-subtitle">Educational Network Security Simulator</p>
        </div>

        <div className="intro-description">
          <p>
            Learn about networking, cybersecurity, and internet infrastructure through
            hands-on terminal-based missions. Navigate servers, crack passwords, and
            understand how the internet works.
          </p>
        </div>

        {showUsernameInput ? (
          <div className="intro-username-form">
            <label htmlFor="username-input" className="username-label">
              Choose your username:
            </label>
            <input
              id="username-input"
              type="text"
              className="username-input"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.trim());
                setUsernameError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && username.trim()) {
                  handleStartNewGame();
                }
              }}
              placeholder="Enter username (e.g., agent42, hack3r, cyberpunk)"
              autoFocus
              maxLength={20}
              title="Username can contain letters, numbers, underscores, and hyphens"
            />
            {usernameError && (
              <p className="username-error" role="alert">
                {usernameError}
              </p>
            )}
            <div className="username-actions">
              <button
                className="intro-button intro-button--primary"
                onClick={handleStartNewGame}
                disabled={!username.trim()}
                aria-label="Start game with chosen username"
              >
                <Icon name="play" size={20} className="button-icon" aria-hidden={true} />
                Start Game
              </button>
              <button
                className="intro-button intro-button--secondary"
                onClick={() => {
                  setShowUsernameInput(false);
                  setUsername('');
                  setUsernameError('');
                }}
                aria-label="Cancel username input"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="intro-actions">
            {hasExistingGame ? (
              <>
                <button
                  className="intro-button intro-button--primary"
                  onClick={onContinueGame}
                  aria-label="Continue your game"
                >
                  <Icon name="play" size={20} className="button-icon" aria-hidden={true} />
                  Continue Game
                </button>
                <button
                  className="intro-button intro-button--secondary"
                  onClick={() => setShowUsernameInput(true)}
                  aria-label="Start a new game"
                >
                  <Icon name="refresh" size={20} className="button-icon" aria-hidden={true} />
                  New Game
                </button>
              </>
            ) : (
              <button
                className="intro-button intro-button--primary"
                onClick={() => setShowUsernameInput(true)}
                aria-label="Start a new game"
              >
                <Icon name="play" size={20} className="button-icon" aria-hidden={true} />
                Start New Game
              </button>
            )}
          </div>
        )}

        <div className="intro-footer">
          <p className="intro-hint">
            <Icon name="info" size={16} className="hint-icon" aria-hidden={true} />
            Your game progress is automatically saved to your browser's local storage.
            Use the "save" command in-game to export your progress to a file.
          </p>
        </div>
      </div>
    </div>
  );
}

