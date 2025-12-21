import { useState } from 'react';
import { TerminalWindow } from './TerminalWindow';
import { MissionPanel } from '../mission/MissionPanel';
import { SoftwareStore } from '../store/SoftwareStore';
import './TerminalContainer.css';

export function TerminalContainer() {
  const [showStore, setShowStore] = useState(false);

  return (
    <div className="terminal-container">
      <div className="terminal-sidebar">
        {showStore ? (
          <>
            <button
              className="store-toggle-button"
              onClick={() => setShowStore(false)}
              aria-label="Show missions"
            >
              ← Missions
            </button>
            <SoftwareStore />
          </>
        ) : (
          <>
            <button
              className="store-toggle-button"
              onClick={() => setShowStore(true)}
              aria-label="Show store"
            >
              Store →
            </button>
            <MissionPanel />
          </>
        )}
      </div>
      <div className="terminal-main">
        <TerminalWindow />
      </div>
    </div>
  );
}
