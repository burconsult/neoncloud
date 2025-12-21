import { create } from 'zustand';

export interface ConnectionContext {
  hostname: string; // 'neoncloud' or server ID like 'server-01'
  vpnConnected: boolean;
  vpnType: 'basic' | 'premium' | null;
}

export interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string | string[];
  timestamp: Date;
  connectionContext?: ConnectionContext; // Connection state when this line was created
}

interface TerminalState {
  lines: TerminalLine[];
  commandHistory: string[];
  historyIndex: number;
  currentInput: string;
  isExecuting: boolean;
  
  // Actions
  addLine: (line: Omit<TerminalLine, 'id' | 'timestamp'>) => void;
  addCommand: (command: string, connectionContext?: ConnectionContext) => void;
  setCurrentInput: (input: string) => void;
  addToHistory: (command: string) => void;
  navigateHistory: (direction: 'up' | 'down') => string;
  clearTerminal: () => void;
  setExecuting: (executing: boolean) => void;
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  lines: [],
  commandHistory: [],
  historyIndex: -1,
  currentInput: '',
  isExecuting: false,

  addLine: (line) => {
    const newLine: TerminalLine = {
      ...line,
      id: `line-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      // connectionContext will be provided by the caller if needed
    };
    set((state) => ({
      lines: [...state.lines, newLine],
    }));
  },

  addCommand: (command, connectionContext) => {
    get().addLine({
      type: 'command',
      content: command,
      connectionContext,
    });
    get().addToHistory(command);
    set({ currentInput: '', historyIndex: -1 });
  },

  setCurrentInput: (input) => {
    set({ currentInput: input });
  },

  addToHistory: (command) => {
    if (!command.trim()) return;
    
    set((state) => {
      const newHistory = [...state.commandHistory];
      // Remove duplicate if exists
      const index = newHistory.indexOf(command);
      if (index > -1) {
        newHistory.splice(index, 1);
      }
      // Add to beginning
      return {
        commandHistory: [command, ...newHistory],
      };
    });
  },

  navigateHistory: (direction) => {
    const { commandHistory, historyIndex } = get();
    
    if (commandHistory.length === 0) return '';

    let newIndex = historyIndex;
    
    if (direction === 'up') {
      newIndex = historyIndex < commandHistory.length - 1 
        ? historyIndex + 1 
        : commandHistory.length - 1;
    } else {
      newIndex = historyIndex > 0 ? historyIndex - 1 : -1;
    }

    set({ historyIndex: newIndex });
    
    if (newIndex === -1) {
      return '';
    }
    
    return commandHistory[newIndex] || '';
  },

  clearTerminal: () => {
    set({ lines: [] });
  },

  setExecuting: (executing) => {
    set({ isExecuting: executing });
  },
}));

