import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  username: string;
  sessionStartTime: Date | null;
  
  // Actions
  login: (username: string) => void;
  logout: () => void;
  getSessionDuration: () => number; // Returns seconds
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  username: 'guest',
  sessionStartTime: null,

  login: (username: string) => {
    set({
      isAuthenticated: true,
      username: username || 'neoncloud-user',
      sessionStartTime: new Date(),
    });
    
    // Persist to localStorage
    try {
      localStorage.setItem('neoncloud-auth', JSON.stringify({
        isAuthenticated: true,
        username: username || 'neoncloud-user',
      }));
    } catch (e) {
      // Ignore localStorage errors
    }
  },

  logout: () => {
    set({
      isAuthenticated: false,
      username: 'guest',
      sessionStartTime: null,
    });
    
    // Clear localStorage
    try {
      localStorage.removeItem('neoncloud-auth');
    } catch (e) {
      // Ignore localStorage errors
    }
  },

  getSessionDuration: () => {
    const startTime = get().sessionStartTime;
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime.getTime()) / 1000);
  },
}));

// Load auth state from localStorage on initialization
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('neoncloud-auth');
    if (stored) {
      const auth = JSON.parse(stored);
      if (auth.isAuthenticated && auth.username) {
        useAuthStore.getState().login(auth.username);
      }
    }
  } catch (e) {
    // Ignore localStorage errors
  }
}

