/**
 * Logging Utility
 * Centralized logging for the game
 * In production, logs are suppressed or filtered
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

const isDevelopment = import.meta.env?.DEV || import.meta.env?.MODE === 'development';

/**
 * Create a logger with a context prefix
 */
export function createLogger(context: string): Logger {
  const prefix = `[${context}]`;
  
  return {
    debug: (...args: any[]) => {
      if (isDevelopment) {
        console.debug(prefix, ...args);
      }
    },
    info: (...args: any[]) => {
      if (isDevelopment) {
        console.log(prefix, ...args);
      }
    },
    warn: (...args: any[]) => {
      console.warn(prefix, ...args);
    },
    error: (...args: any[]) => {
      console.error(prefix, ...args);
    },
  };
}

/**
 * Default logger for general use
 */
export const logger = createLogger('NeonCloud');

