# Time/Duration System Implementation Status

## ✅ Completed

1. **Game Time Store** (`src/game/time/useGameTimeStore.ts`)
   - Game clock with speedup multiplier
   - Duration conversion (real-time to game-time)
   - Persistent speedup setting

2. **Tool Duration Definitions** (`src/game/time/toolDurations.ts`)
   - Duration definitions for all tools
   - Basic vs Premium durations
   - Helper functions for lookup

3. **Action Queue System** (`src/game/time/actionQueue.ts`)
   - Queue management for timed actions
   - Progress tracking
   - Completion callbacks

4. **Mission Timer** (`src/game/time/missionTimer.ts`)
   - Expected completion times
   - Speed bonus calculation

5. **Mission Store Updates** (`src/game/state/useMissionStore.ts`)
   - Mission start time tracking
   - Timer starts on first command
   - Speed bonus integration

6. **Progress Bar Component** (`src/components/terminal/TerminalProgressBar.tsx`)
   - Visual progress indicator
   - Real-time updates
   - Integrated into terminal

7. **Command Executor Updates** (`src/game/commands/commandExecutor.ts`)
   - Starts mission timer on first command

## 🚧 In Progress

1. **Tool Commands Integration**
   - Need to refactor `crackCommand` to use action queue
   - Need to refactor `vpnConnectCommand` to use action queue
   - Need to refactor `shredCommand` to use action queue

## 📋 Remaining

1. **Speedup UI Control**
   - Add speedup selector to header
   - Allow user to change speedup (1x-20x)

2. **Mission Timer Display**
   - Show elapsed time in UI
   - Display in header or mission panel

3. **Testing**
   - Test with different speedup values
   - Test queue with multiple actions
   - Test mission timer accuracy

## Implementation Notes

### Tool Command Refactoring Pattern

Current commands execute synchronously. To add timing:

1. Queue action with duration
2. Return immediately with "starting" message
3. Actual work happens in `onComplete` callback
4. Add final output to terminal when complete

Example structure:
```typescript
// Get duration
const softwareId = hasAdvancedCracker ? 'password-cracker-advanced' : 'password-cracker-basic';
const duration = getToolDurationFromSoftware(softwareId);

// Queue action
queueToolAction(
  'password-cracker',
  `Password Cracker: ${crackerType}`,
  duration,
  async () => {
    // Do actual work here
    // Add output to terminal
    useTerminalStore.getState().addLine({...});
    emitToolUsed('crack', target, true);
  }
);

// Return immediately
return {
  output: [`Starting ${crackerType} Password Cracker...`],
  success: true,
};
```

### Challenges

1. **Async Command Results**: Commands currently return synchronously. Actions complete asynchronously.
   - Solution: Return immediately, use callbacks for final results

2. **Terminal Output**: Need to add output after action completes
   - Solution: Use `useTerminalStore.getState().addLine()` in onComplete

3. **Error Handling**: Actions can fail
   - Solution: Handle errors in onComplete callback

