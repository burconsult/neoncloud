import { Command, CommandResult } from '@/types';
import { useAuthStore } from '../state/useAuthStore';
import { emitUserLogout } from '../events/eventBus';

export const loginCommand: Command = {
  name: 'login',
  description: 'Login to the system',
  usage: 'login [username]',
  execute: (args: string[]): CommandResult => {
    const username = (args.length > 0 && args[0]) ? args[0] : 'neoncloud-user';
    
    if (useAuthStore.getState().isAuthenticated) {
      return {
        output: `Already logged in as ${useAuthStore.getState().username}. Use 'logout' to sign out.`,
        success: false,
        error: 'Already authenticated',
      };
    }

    useAuthStore.getState().login(username);
    
    return {
      output: [
        `Welcome, ${username}!`,
        'You are now logged in to NeonCloud Terminal.',
        '',
        'Type "help" to see available commands.',
      ],
      success: true,
    };
  },
};

export const logoutCommand: Command = {
  name: 'logout',
  aliases: ['exit'],
  description: 'Logout from the system',
  usage: 'logout',
  execute: (): CommandResult => {
    const authState = useAuthStore.getState();
    
    if (!authState.isAuthenticated) {
      return {
        output: 'Not logged in.',
        success: false,
        error: 'Not authenticated',
      };
    }

    const username = authState.username || 'user';
    
    // Perform logout
    authState.logout();
    
    // Emit logout event (App.tsx will listen and return to intro screen)
    emitUserLogout(username);

    return {
      output: `Logging you out, ${username}...`,
      success: true,
    };
  },
};

