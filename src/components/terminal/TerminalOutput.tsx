import { useEffect, useRef } from 'react';
import React from 'react';
import { TerminalLine } from '@/game/state/useTerminalStore';
import { useFileSystemStore } from '@/game/state/useFileSystemStore';
import { useAuthStore } from '@/game/state/useAuthStore';
import { useChallengeStore } from '@/game/state/useChallengeStore';
import { useConnectionStore } from '@/game/state/useConnectionStore';
import { Icon } from '@/components/ui/Icon';
import './TerminalOutput.css';

interface TerminalOutputProps {
  lines: TerminalLine[];
}

export function TerminalOutput({ lines }: TerminalOutputProps) {
  const outputRef = useRef<HTMLDivElement>(null);
  const currentDirectory = useFileSystemStore((state) => state.currentDirectory);
  const username = useAuthStore((state) => state.username);
  const isRoot = useChallengeStore((state) => state.isRoot);
  const vpnConnected = useConnectionStore((state) => state.vpnConnected);
  const vpnType = useConnectionStore((state) => state.vpnType);
  const remoteServer = useConnectionStore((state) => state.remoteServerConnected);
  
  // Format directory for display (show ~ for home directory)
  const displayPath = currentDirectory === '/home/neoncloud-user' || currentDirectory === '/home'
    ? '~' 
    : currentDirectory.replace('/home/neoncloud-user', '~').replace('/home', '~');
  
  // Show root indicator
  const displayUsername = isRoot ? 'root' : username;
  const promptSymbol = isRoot ? '#' : '$';
  
  // Determine hostname based on connection state (for current prompt only)
  const displayHost = remoteServer || 'neoncloud';

  useEffect(() => {
    // Auto-scroll to bottom when new lines are added
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  const renderContent = (content: string | string[], type: TerminalLine['type']): React.ReactNode => {
    if (Array.isArray(content)) {
      return content.map((line, index) => {
        // Check if this is the help instruction line (last line with help text)
        const isHelpInstruction = line.includes("Type 'help <command>'");
        const isEmpty = line === '';
        
        return (
          <div 
            key={index} 
            className={`output-line ${isHelpInstruction ? 'output-line--help-instruction' : ''} ${isEmpty ? 'output-line--empty' : ''}`}
          >
            {type === 'error' && !isEmpty && (
              <Icon name="error" size={14} className="output-icon output-icon--error" aria-hidden={true} />
            )}
            {type === 'output' && index === 0 && !isEmpty && (
              <Icon name="success" size={14} className="output-icon output-icon--success" aria-hidden={true} />
            )}
            {!isEmpty && line}
          </div>
        );
      });
    }
    return (
      <div className="output-line">
        {type === 'error' && (
          <Icon name="error" size={14} className="output-icon output-icon--error" aria-hidden={true} />
        )}
        {type === 'output' && (
          <Icon name="success" size={14} className="output-icon output-icon--success" aria-hidden={true} />
        )}
        {content}
      </div>
    );
  };

  return (
    <div ref={outputRef} className="terminal-output" role="log" aria-live="polite">
      {lines.length === 0 && (
        <div className="output-line welcome-message">
          <div className="welcome-title">
            <Icon name="terminal" size={32} className="welcome-icon" aria-hidden={true} />
            NeonCloud Terminal
          </div>
          <div className="welcome-text">
            <Icon name="server" size={16} className="welcome-icon-small" aria-hidden={true} />
            Educational Network Security Simulator
          </div>
          <div className="welcome-text">
            <Icon name="help" size={16} className="welcome-icon-small" aria-hidden={true} />
            Type 'help' to see available commands.
          </div>
        </div>
      )}
      {lines.map((line) => {
        const content = renderContent(line.content, line.type);
        const isArray = Array.isArray(line.content);
        
        // Use stored connection context if available, otherwise use current state
        const context = line.connectionContext || {
          hostname: displayHost,
          vpnConnected,
          vpnType,
        };
        
        const contextHost = context.hostname;
        const contextVPN = context.vpnConnected;
        const contextVPNType = context.vpnType;
        const contextVPNClass = contextVPN
          ? contextVPNType === 'premium'
            ? 'prompt-vpn--premium'
            : 'prompt-vpn--basic'
          : '';
        
        // For historical lines, we need to figure out the path from that time
        // For simplicity, we'll use the current path (this could be enhanced later)
        const historicalPath = displayPath;
        
        if (isArray) {
          // For array content, render each item on its own line
          return (
            <React.Fragment key={line.id}>
              {line.type === 'command' && (
                <div className={`output-line output-line--${line.type}`}>
                  <span className="command-prompt">
                    <Icon name="terminal" size={14} className="prompt-icon" aria-hidden={true} />
                    <span className={`prompt-user ${isRoot ? 'prompt-user--root' : ''}`}>{displayUsername}</span>
                    <span className="prompt-separator">@</span>
                    <span className={`prompt-host ${contextVPNClass}`}>{contextHost}</span>
                    {contextVPN && (
                      <span className={`prompt-vpn-indicator ${contextVPNClass}`} title={`${contextVPNType === 'premium' ? 'Premium' : 'Basic'} VPN Active`}>
                        [VPN]
                      </span>
                    )}
                    <span className="prompt-path">:{historicalPath}{promptSymbol}</span>
                  </span>
                </div>
              )}
              {content}
            </React.Fragment>
          );
        }
        
        // For single content, render normally
        return (
          <div
            key={line.id}
            className={`output-line output-line--${line.type}`}
          >
            {line.type === 'command' && (
              <span className="command-prompt">
                <Icon name="terminal" size={14} className="prompt-icon" aria-hidden={true} />
                <span className={`prompt-user ${isRoot ? 'prompt-user--root' : ''}`}>{displayUsername}</span>
                <span className="prompt-separator">@</span>
                <span className={`prompt-host ${contextVPNClass}`}>{contextHost}</span>
                {contextVPN && (
                  <span className={`prompt-vpn-indicator ${contextVPNClass}`} title={`${contextVPNType === 'premium' ? 'Premium' : 'Basic'} VPN Active`}>
                    [VPN]
                  </span>
                )}
                <span className="prompt-path">:{historicalPath}{promptSymbol}</span>
              </span>
            )}
            {content}
          </div>
        );
      })}
    </div>
  );
}

