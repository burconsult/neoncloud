/**
 * Action Queue System
 * 
 * Manages queued actions with durations (e.g., tool usage).
 * Actions execute over time with progress updates.
 */

import { useGameTimeStore } from './useGameTimeStore';

export interface QueuedAction {
  id: string;
  type: 'tool' | 'command';
  label: string; // Human-readable label for progress bar
  duration: number; // Game-time milliseconds
  toolId?: string;
  onProgress?: (progress: number, remaining: number) => void; // progress: 0-1, remaining: seconds
  onComplete: () => void | Promise<void>;
  onCancel?: () => void;
}

class ActionQueue {
  private queue: QueuedAction[] = [];
  private current: QueuedAction | null = null;
  private startTime: number | null = null;
  private animationFrameId: number | null = null;
  private progressListeners: Set<(action: QueuedAction | null) => void> = new Set();
  private currentProgress: { progress: number; remaining: number } | null = null;

  /**
   * Add an action to the queue
   */
  enqueue(action: QueuedAction): void {
    // If queue is empty and no current action, start immediately
    if (this.queue.length === 0 && !this.current) {
      this.processAction(action);
    } else {
      this.queue.push(action);
    }
  }

  /**
   * Process an action
   */
  private processAction(action: QueuedAction): void {
    this.current = action;
    this.startTime = Date.now();
    
    // Notify listeners that we have a new active action
    this.notifyProgressListeners();
    
    // Start progress animation
    this.animateProgress();
    
    // Set timeout for completion
    setTimeout(() => {
      this.completeAction();
    }, action.duration);
  }

  /**
   * Animate progress updates
   */
  private animateProgress(): void {
    if (!this.current || !this.startTime) return;

    const update = () => {
      if (!this.current || !this.startTime) return;

      const elapsed = Date.now() - this.startTime!;
      const progress = Math.min(1, elapsed / this.current.duration);
      const remaining = Math.max(0, (this.current.duration - elapsed) / 1000);

      // Store current progress for external access
      this.currentProgress = { progress, remaining };

      // Call progress callback
      if (this.current.onProgress) {
        this.current.onProgress(progress, remaining);
      }

      // Notify listeners
      this.notifyProgressListeners();

      // Continue animation if not complete
      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(update);
      } else {
        this.currentProgress = null;
      }
    };

    this.animationFrameId = requestAnimationFrame(update);
  }

  /**
   * Get current progress (0-1 progress, remaining seconds)
   */
  getCurrentProgress(): { progress: number; remaining: number } | null {
    if (!this.current || !this.startTime || !this.currentProgress) {
      return null;
    }
    return this.currentProgress;
  }

  /**
   * Complete the current action
   */
  private completeAction(): void {
    if (!this.current) return;

    const action = this.current;
    
    // Cancel animation
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Call completion callback
    Promise.resolve(action.onComplete()).catch(error => {
      console.error('Error in action completion callback:', error);
    });

    // Clear current
    this.current = null;
    this.startTime = null;
    
    // Notify listeners
    this.notifyProgressListeners();

    // Process next in queue
    this.processQueue();
  }

  /**
   * Process next action in queue
   */
  private processQueue(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) {
        this.processAction(next);
      }
    }
  }

  /**
   * Cancel an action by ID
   */
  cancel(actionId: string): boolean {
    // Cancel current action
    if (this.current && this.current.id === actionId) {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      
      if (this.current.onCancel) {
        this.current.onCancel();
      }
      
      this.current = null;
      this.startTime = null;
      this.notifyProgressListeners();
      this.processQueue();
      return true;
    }

    // Remove from queue
    const index = this.queue.findIndex(a => a.id === actionId);
    if (index !== -1) {
      const action = this.queue[index];
      if (!action) return false;
      this.queue.splice(index, 1);
      
      if (action.onCancel) {
        action.onCancel();
      }
      return true;
    }

    return false;
  }

  /**
   * Clear all queued actions
   */
  clear(): void {
    // Cancel current
    if (this.current) {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      if (this.current.onCancel) {
        this.current.onCancel();
      }
    }
    
    // Cancel all queued
    this.queue.forEach(action => {
      if (action.onCancel) {
        action.onCancel();
      }
    });

    this.queue = [];
    this.current = null;
    this.startTime = null;
    this.notifyProgressListeners();
  }

  /**
   * Get current action
   */
  getCurrentAction(): QueuedAction | null {
    return this.current;
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Subscribe to progress updates
   */
  onProgress(callback: (action: QueuedAction | null) => void): () => void {
    this.progressListeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.progressListeners.delete(callback);
    };
  }

  /**
   * Notify all progress listeners
   */
  private notifyProgressListeners(): void {
    this.progressListeners.forEach(listener => {
      listener(this.current);
    });
  }
}

// Export singleton instance
export const actionQueue = new ActionQueue();

/**
 * Queue a tool action with duration
 */
export function queueToolAction(
  toolId: string,
  label: string,
  realDurationSeconds: number,
  onComplete: () => void | Promise<void>,
  onProgress?: (progress: number, remaining: number) => void
): string {
  const gameTimeStore = useGameTimeStore.getState();
  const gameDuration = gameTimeStore.toGameDuration(realDurationSeconds);
  
  const actionId = `tool-${toolId}-${Date.now()}`;
  
  const action: QueuedAction = {
    id: actionId,
    type: 'tool',
    label,
    duration: gameDuration,
    toolId,
    onProgress,
    onComplete,
  };
  
  actionQueue.enqueue(action);
  return actionId;
}

