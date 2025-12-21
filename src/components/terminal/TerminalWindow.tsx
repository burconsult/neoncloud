import { useRef } from 'react';
import { useTerminalStore } from '@/game/state/useTerminalStore';
import { useEducationalPopup } from '@/hooks/useEducationalPopup';
import { useConnectionStore } from '@/game/state/useConnectionStore';
import { TerminalOutput } from './TerminalOutput';
import { TerminalInput } from './TerminalInput';
import { TerminalProgressBar } from './TerminalProgressBar';
import { parseCommand } from '@/game/parser/commandParser';
import { executeCommand } from '@/game/commands/commandExecutor';
import { useGameContext } from '@/hooks/useGameContext';
import { loadSaveFile } from '@/game/save/saveSystem';
import './TerminalWindow.css';

export function TerminalWindow() {
  const inputRef = useRef<{ focus: () => void } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { lines, addCommand, addLine, clearTerminal, setExecuting } =
    useTerminalStore();
  const gameContext = useGameContext();
  const { showPopup, PopupComponent } = useEducationalPopup();

  const handleExecute = async (command: string) => {
    // Capture current connection context
    const connectionStore = useConnectionStore.getState();
    const connectionContext = {
      hostname: connectionStore.remoteServerConnected || 'neoncloud',
      vpnConnected: connectionStore.vpnConnected,
      vpnType: connectionStore.vpnType,
    };
    
    // Add command to terminal with connection context
    addCommand(command, connectionContext);

    // Handle clear command specially
    if (command.toLowerCase().trim() === 'clear' || command.toLowerCase().trim() === 'cls') {
      clearTerminal();
      // Refocus input after clear
      setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }

    setExecuting(true);

    try {
      // Parse command
      const parsed = parseCommand(command);

      // Handle loadfile command specially (needs file input)
      if (parsed.command?.toLowerCase() === 'loadfile' || parsed.command?.toLowerCase() === 'importfile') {
        // Check if on remote server (command already validates, but double-check here)
        const connectionStore = useConnectionStore.getState();
        const currentServer = connectionStore.getCurrentRemoteServer();
        
        if (currentServer) {
          // Don't trigger file input if on remote server
          // The command already returned an error, so we don't need to do anything
          // This is just a safety check
        } else {
          fileInputRef.current?.click();
          addLine({
            type: 'output',
            content: 'Opening file picker... Please select your save file.',
            connectionContext,
          });
        }
        return;
      }

      // Execute command
      // Note: Command executor now emits events automatically
      // Mission handlers listen to these events and complete tasks
      const result = await executeCommand(parsed, gameContext);

        // Add output to terminal with connection context (same as command)
        addLine({
          type: result.success ? 'output' : 'error',
          content: result.output,
          connectionContext,
        });

      // Show educational popup for locked commands
      if (!result.success && result.error === 'Command locked') {
        showPopup({
          id: `command-locked-${parsed.command}`,
          type: 'warning',
          title: 'Command Not Available Yet',
          content: Array.isArray(result.output) ? result.output : [result.output],
          showOnce: false,
        });
      }

      // Show educational popup for first-time command use
      if (result.success && result.educationalContent) {
        const popupId = `command-${parsed.command}-first-use`;
        showPopup({
          id: popupId,
          type: 'info',
          title: result.educationalContent.title || 'Learn More',
          content: result.educationalContent.content || '',
          showOnce: true,
        });
      }

      // Note: Task completion is now handled by event-driven mission handlers
      // The commandExecutor emits 'command:executed' events, and mission handlers
      // listen and complete tasks automatically. No need for manual checking here.
      } catch (error) {
        addLine({
          type: 'error',
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          connectionContext,
        });
    } finally {
      setExecuting(false);
      // Refocus input after command execution
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };


  const handleFileLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setExecuting(true);
    try {
      const result = await loadSaveFile(file);
      if (result.success) {
        addLine({
          type: 'output',
          content: [
            'Game loaded successfully!',
            '',
            'Your progress has been restored.',
            'All missions, currency, and inventory have been loaded.',
          ],
        });
      } else {
        addLine({
          type: 'error',
          content: `Failed to load game: ${result.error || 'Unknown error'}`,
        });
      }
    } catch (error) {
      addLine({
        type: 'error',
        content: `Error loading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setExecuting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileLoad}
        aria-label="Load game save file"
      />
      <div className="terminal-window" role="application" aria-label="Terminal">
        <TerminalOutput lines={lines} />
        <TerminalProgressBar />
        <TerminalInput ref={inputRef} onExecute={handleExecute} />
      </div>
      {PopupComponent}
    </>
  );
}

