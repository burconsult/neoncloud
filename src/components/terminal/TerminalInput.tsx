import { useEffect, useRef, KeyboardEvent, forwardRef, useImperativeHandle, useState } from 'react';
import { useTerminalStore } from '@/game/state/useTerminalStore';
import { useFileSystemStore } from '@/game/state/useFileSystemStore';
import { useAuthStore } from '@/game/state/useAuthStore';
import { useChallengeStore } from '@/game/state/useChallengeStore';
import { useConnectionStore } from '@/game/state/useConnectionStore';
import { Icon } from '@/components/ui/Icon';
import { getAutocompleteCandidates, completeInput } from '@/utils/autocomplete';
import './TerminalInput.css';

interface TerminalInputProps {
  onExecute: (command: string) => void;
  disabled?: boolean;
}

export interface TerminalInputHandle {
  focus: () => void;
}

export const TerminalInput = forwardRef<TerminalInputHandle, TerminalInputProps>(
  ({ onExecute, disabled = false }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
  const {
    currentInput,
    setCurrentInput,
    navigateHistory,
    isExecuting,
  } = useTerminalStore();
  const { currentDirectory, fileSystem } = useFileSystemStore();
  const username = useAuthStore((state) => state.username);
  const isRoot = useChallengeStore((state) => state.isRoot);
  const vpnConnected = useConnectionStore((state) => state.vpnConnected);
  const vpnType = useConnectionStore((state) => state.vpnType);
  const remoteServer = useConnectionStore((state) => state.remoteServerConnected);
  const [completionCandidates, setCompletionCandidates] = useState<string[]>([]);
  const [showCompletions, setShowCompletions] = useState(false);
  
  // Show root indicator in prompt
  const displayUsername = isRoot ? 'root' : username;
  const promptSymbol = isRoot ? '#' : '$';
  
  // Format directory for display (show ~ for home directory)
  // Handle both local (/home/neoncloud-user) and server (/home) home directories
  const displayPath = currentDirectory === '/home/neoncloud-user' || currentDirectory === '/home'
    ? '~' 
    : currentDirectory.replace('/home/neoncloud-user', '~').replace('/home', '~');
  
  // Determine hostname based on connection state
  const displayHost = remoteServer || 'neoncloud';
  
  // Determine VPN indicator class
  const vpnClass = vpnConnected 
    ? vpnType === 'premium' 
      ? 'prompt-vpn--premium' 
      : 'prompt-vpn--basic'
    : '';

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  useEffect(() => {
    // Focus input when component mounts or becomes enabled
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled || isExecuting) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (currentInput.trim()) {
          onExecute(currentInput.trim());
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        const upCommand = navigateHistory('up');
        setCurrentInput(upCommand);
        break;

      case 'ArrowDown':
        e.preventDefault();
        const downCommand = navigateHistory('down');
        setCurrentInput(downCommand);
        break;

      case 'Tab':
        e.preventDefault();
        handleTabCompletion();
        break;

      default:
        break;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(e.target.value);
    setShowCompletions(false);
    setCompletionCandidates([]);
  };

  const handleTabCompletion = () => {
    const { candidates, isComplete } = getAutocompleteCandidates(
      fileSystem,
      currentDirectory,
      currentInput
    );

    if (candidates.length === 0) {
      // No matches - do nothing (terminal behavior)
      return;
    }

    if (isComplete || candidates.length === 1) {
      // Single match or complete - complete it
      const completed = completeInput(currentInput, candidates);
      setCurrentInput(completed);
      setShowCompletions(false);
      setCompletionCandidates([]);
    } else {
      // Multiple matches - show them and complete common prefix
      setCompletionCandidates(candidates);
      setShowCompletions(true);
      
      // Complete common prefix
      const completed = completeInput(currentInput, candidates);
      if (completed !== currentInput) {
        setCurrentInput(completed);
      }
    }
  };

    return (
      <div className="terminal-input-container">
        <span className="command-prompt">
          <Icon name="terminal" size={16} className="prompt-icon" aria-hidden={true} />
          <span className={`prompt-user ${isRoot ? 'prompt-user--root' : ''}`}>{displayUsername}</span>
          <span className="prompt-separator">@</span>
          <span className={`prompt-host ${vpnClass}`}>{displayHost}</span>
          {vpnConnected && (
            <span className={`prompt-vpn-indicator ${vpnClass}`} title={`${vpnType === 'premium' ? 'Premium' : 'Basic'} VPN Active`}>
              [VPN]
            </span>
          )}
          <span className="prompt-path">:{displayPath}{promptSymbol}</span>
        </span>
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="terminal-input"
            value={currentInput}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || isExecuting}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            aria-label="Terminal command input"
          />
          <span className="cursor" aria-hidden="true">
            ▊
          </span>
        </div>
        {showCompletions && completionCandidates.length > 0 && (
          <div className="autocomplete-suggestions" role="listbox">
            {completionCandidates.map((candidate, index) => (
              <div 
                key={index} 
                className="autocomplete-item" 
                role="option"
                onClick={() => {
                  const parts = currentInput.trim().split(/\s+/);
                  const lastArg = parts[parts.length - 1] || '';
                  const beforeLastArg = currentInput.substring(0, currentInput.length - lastArg.length);
                  setCurrentInput(beforeLastArg + candidate);
                  setShowCompletions(false);
                  setCompletionCandidates([]);
                  inputRef.current?.focus();
                }}
              >
                {candidate}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

