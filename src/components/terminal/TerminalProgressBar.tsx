/**
 * Terminal Progress Bar Component
 * 
 * Displays progress for timed actions (tool usage, etc.)
 */

import { useEffect, useState } from 'react';
import { actionQueue } from '@/game/time/actionQueue';
import { formatDuration } from '@/game/time/useGameTimeStore';
import './TerminalProgressBar.css';

interface ProgressBarState {
  label: string;
  progress: number; // 0-1
  remaining: number; // seconds
}

export function TerminalProgressBar() {
  const progressState = useActionProgress();

  if (!progressState) {
    return null;
  }

  const { label, progress, remaining } = progressState;
  const progressPercent = Math.round(progress * 100);

  return (
    <div className="terminal-progress-bar" role="progressbar" aria-label={label} aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-bar-label">{label}</div>
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progressPercent}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="progress-bar-info">
        <span className="progress-bar-percent">{progressPercent}%</span>
        <span className="progress-bar-remaining">
          {remaining > 0 ? `${formatDuration(remaining)} remaining` : 'Completing...'}
        </span>
      </div>
    </div>
  );
}

/**
 * Hook to track current action progress
 * Returns progress state for the currently executing action
 */
export function useActionProgress(): ProgressBarState | null {
  const [progressState, setProgressState] = useState<ProgressBarState | null>(null);

  useEffect(() => {
    let animationFrameId: number | null = null;

    const updateProgress = () => {
      const action = actionQueue.getCurrentAction();
      const progress = actionQueue.getCurrentProgress();
      
      if (!action || !progress) {
        setProgressState(null);
        return;
      }

      setProgressState({
        label: action.label,
        progress: progress.progress,
        remaining: progress.remaining,
      });

      if (progress.progress < 1) {
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };

    // Subscribe to action changes
    const unsubscribe = actionQueue.onProgress((action) => {
      if (action) {
        updateProgress();
      } else {
        setProgressState(null);
      }
    });

    // Also update periodically for smooth animation
    const interval = setInterval(() => {
      updateProgress();
    }, 50); // Update every 50ms

    return () => {
      unsubscribe();
      clearInterval(interval);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return progressState;
}

