import { Command, CommandResult } from '@/types';
import { useChallengeStore } from '../state/useChallengeStore';
import { useAuthStore } from '../state/useAuthStore';

/**
 * Challenge command - Generate and display a challenge to get root password
 */
export const challengeCommand: Command = {
  name: 'challenge',
  description: 'Generate a challenge to obtain root password',
  usage: 'challenge',
  execute: (): CommandResult => {
    const challengeStore = useChallengeStore.getState();
    const challenge = challengeStore.generateNewChallenge();
    
    return {
      output: [
        '=== ROOT PASSWORD CHALLENGE ===',
        '',
        `Challenge: ${challenge.question}`,
        '',
        "Type 'solve <answer>' to solve the challenge.",
        "Type 'hint' to get a hint.",
        '',
        'Note: Root access requires solving this challenge for security.',
      ],
      success: true,
    };
  },
};

/**
 * Solve command - Solve the challenge to get root password
 */
export const solveCommand: Command = {
  name: 'solve',
  description: 'Solve the challenge to get root password',
  usage: 'solve <answer>',
  execute: (args: string[]): CommandResult => {
    if (args.length === 0) {
      return {
        output: 'solve: missing answer\nUsage: solve <answer>',
        success: false,
        error: 'Missing argument',
      };
    }

    const answer = args.join(' ');
    const challengeStore = useChallengeStore.getState();
    const result = challengeStore.solveChallenge(answer);
    
    return {
      output: result.message,
      success: result.success,
    };
  },
};

/**
 * Hint command - Get a hint for the current challenge
 */
export const hintCommand: Command = {
  name: 'hint',
  description: 'Get a hint for the current challenge',
  usage: 'hint',
  execute: (): CommandResult => {
    const challengeStore = useChallengeStore.getState();
    const challenge = challengeStore.currentChallenge;
    
    if (!challenge) {
      return {
        output: 'No active challenge. Type "challenge" to generate one.',
        success: false,
        error: 'No challenge',
      };
    }
    
    return {
      output: [
        `Hint: ${challenge.hint}`,
        '',
        `Question: ${challenge.question}`,
      ],
      success: true,
    };
  },
};

/**
 * Su command - Switch to root user (requires password)
 */
export const suCommand: Command = {
  name: 'su',
  aliases: ['sudo'],
  description: 'Switch to root user (requires password)',
  usage: 'su [password]',
  execute: (args: string[]): CommandResult => {
    const authStore = useAuthStore.getState();
    const challengeStore = useChallengeStore.getState();
    
    // Check if already root
    if (challengeStore.isRoot) {
      return {
        output: 'Already logged in as root. Use "exit" to return to normal user.',
        success: false,
        error: 'Already root',
      };
    }
    
    // Check if password is provided
    if (args.length === 0) {
      return {
        output: [
          'su: password required',
          '',
          'To get the root password:',
          '1. Type "challenge" to generate a challenge',
          '2. Solve the challenge using "solve <answer>"',
          '3. Use the provided password with "su <password>"',
          '',
          'Or use "su root" and enter password when prompted.',
        ],
        success: false,
        error: 'Password required',
      };
    }
    
    const providedPassword = args[0];
    const rootPassword = challengeStore.rootPassword;
    
    if (!rootPassword) {
      return {
        output: [
          'Root password not available.',
          '',
          'To get root access:',
          '1. Type "challenge" to generate a security challenge',
          '2. Solve it using "solve <answer>"',
          '3. Use the provided password with "su <password>"',
        ],
        success: false,
        error: 'No root password',
      };
    }
    
    if (providedPassword === rootPassword || providedPassword === 'root') {
      challengeStore.becomeRoot();
      authStore.login('root');
      
      return {
        output: [
          'Password accepted.',
          'You are now logged in as root.',
          '',
          '⚠️  WARNING: Root access grants full system privileges.',
          'Use responsibly!',
        ],
        success: true,
      };
    }
    
    return {
      output: 'su: Authentication failure\nIncorrect password.',
      success: false,
      error: 'Authentication failed',
    };
  },
};

/**
 * Exit command - Exit root session
 */
export const exitCommand: Command = {
  name: 'exit',
  description: 'Exit root session or logout',
  usage: 'exit',
  execute: (): CommandResult => {
    const challengeStore = useChallengeStore.getState();
    const authStore = useAuthStore.getState();
    
    if (challengeStore.isRoot) {
      challengeStore.exitRoot();
      authStore.login('neoncloud-user');
      
      return {
        output: 'Exited root session. Returned to normal user.',
        success: true,
      };
    }
    
    // Regular logout
    if (authStore.isAuthenticated) {
      return authStore.logout(), {
        output: 'Logged out.',
        success: true,
      };
    }
    
    return {
      output: 'Not logged in.',
      success: false,
      error: 'Not authenticated',
    };
  },
};

