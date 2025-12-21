# Time/Duration System Implementation Plan

## Overview

Implement a realistic time/duration system for tool usage with configurable speedup, progress bars, mission timers, and speed bonuses.

## Requirements

1. **Tool Execution Times**:
   - Basic tools take longer (e.g., Basic VPN: 5s, Basic Cracker: 45s)
   - Premium tools take less time (e.g., Premium VPN: 2s, Advanced Cracker: 15s)
   - Realistic but accelerated for gameplay

2. **Speedup System**:
   - Configurable speed multiplier (1x = real-time, 2x = 2x faster, etc.)
   - Default: 5x (45s becomes 9s)
   - User setting in UI

3. **Progress Bar**:
   - Show in terminal during tool execution
   - Real-time progress updates
   - Clear visual feedback

4. **Mission Timer**:
   - Start when user sends first command in mission
   - Display elapsed time
   - Used for speed bonus calculations

5. **Speed Bonus Integration**:
   - Already exists in `useMissionStore.completeMission`
   - Currently hardcoded to `false`
   - Calculate based on mission elapsed time vs. expected time

## Architecture

### 1. Game Time Store (`useGameTimeStore.ts`)

```typescript
interface GameTimeState {
  // Game clock (virtual time, not real time)
  gameTime: number; // milliseconds since game start
  
  // Speedup multiplier
  speedup: number; // 1 = real-time, 5 = 5x faster, etc.
  
  // Settings
  setSpeedup: (multiplier: number) => void;
  
  // Convert real duration to game duration
  toGameDuration: (realDuration: number) => number;
  
  // Get current game time
  getCurrentGameTime: () => number;
}
```

### 2. Tool Duration Definitions (`toolDurations.ts`)

```typescript
export const TOOL_DURATIONS: Record<string, {
  basic: number;    // seconds (real-time)
  premium?: number; // seconds (real-time), optional
}> = {
  'vpn': { basic: 5, premium: 2 },
  'password-cracker': { basic: 45, premium: 15 },
  'log-shredder': { basic: 10 },
  // ... etc
};
```

### 3. Action Queue System (`actionQueue.ts`)

```typescript
interface QueuedAction {
  id: string;
  type: 'tool' | 'command';
  duration: number; // game-time milliseconds
  toolId?: string;
  onProgress?: (progress: number) => void;
  onComplete: () => void | Promise<void>;
  onCancel?: () => void;
}

class ActionQueue {
  queue: QueuedAction[];
  current: QueuedAction | null;
  startTime: number | null;
  
  enqueue(action: QueuedAction): void;
  processQueue(): void;
  cancel(actionId: string): void;
  clear(): void;
}
```

### 4. Mission Timer Integration

Add to `useMissionStore`:
```typescript
interface MissionState {
  // ... existing
  missionStartTime: number | null; // game-time when mission started
  startMissionTimer: () => void; // Called on first command
  getMissionElapsedTime: () => number; // seconds
}
```

### 5. Progress Bar Component (`TerminalProgressBar.tsx`)

```typescript
interface ProgressBarProps {
  label: string;
  progress: number; // 0-1
  duration: number; // seconds
  remaining: number; // seconds
}
```

### 6. Speed Bonus Calculation

In `useMissionStore.completeMission`:
```typescript
const getMissionSpeedBonus = (missionId: string, elapsedTime: number): boolean => {
  // Get expected completion time from mission definition
  const expectedTime = getExpectedCompletionTime(missionId);
  
  // Bonus if completed in < 75% of expected time
  return elapsedTime < (expectedTime * 0.75);
};
```

## Implementation Steps

### Phase 1: Core Time System
1. Create `useGameTimeStore.ts`
2. Create `toolDurations.ts` with all tool durations
3. Create `actionQueue.ts` for queuing timed actions

### Phase 2: UI Components
4. Create `TerminalProgressBar.tsx` component
5. Integrate progress bar into `TerminalWindow`
6. Add speedup setting to UI (header or settings panel)

### Phase 3: Mission Timer
7. Add mission timer to `useMissionStore`
8. Start timer on first command execution
9. Display timer in mission panel or header

### Phase 4: Tool Integration
10. Update `crackCommand` to use action queue
11. Update `vpnConnectCommand` to use action queue
12. Update `shredCommand` to use action queue
13. Update other tool commands as needed

### Phase 5: Speed Bonus
14. Add expected completion times to mission definitions
15. Calculate speed bonus in `completeMission`
16. Display speed bonus in UI

## File Structure

```
src/game/
  time/
    useGameTimeStore.ts        # Game clock and speedup
    toolDurations.ts           # Tool duration definitions
    actionQueue.ts             # Action queue system
    missionTimer.ts            # Mission timing utilities
  state/
    useMissionStore.ts         # Add mission timer
  commands/
    toolCommands.ts            # Update to use action queue
  components/
    terminal/
      TerminalProgressBar.tsx  # Progress bar component
      TerminalWindow.tsx       # Integrate progress bar
  ui/
    SpeedupControl.tsx         # Speedup setting component
```

## Tool Duration Examples

| Tool | Basic Duration | Premium Duration | Notes |
|------|---------------|------------------|-------|
| VPN Connect | 5s | 2s | Connection time |
| Password Cracker | 45s | 15s | Brute force time |
| Log Shredder | 10s | 5s | Overwrite time |
| Firewall Bypass | 30s | 10s | Scanning time |
| Network Analyzer | 20s | 8s | Analysis time |

*All durations are real-time (will be multiplied by speedup)*

## Speedup Recommendations

- **1x**: Real-time (for testing/debugging)
- **2x**: Slightly faster
- **5x**: Default (good balance)
- **10x**: Fast (for experienced players)
- **20x**: Very fast (for speedruns)

## Mission Time Tracking

Start timer on:
- First command execution after mission starts
- NOT on mission initialization (wait for user action)

Expected completion times (for speed bonus):
- Training missions: 5-10 minutes
- Script Kiddie missions: 10-15 minutes
- Cyber Warrior missions: 15-25 minutes
- Digital Ninja missions: 25-40 minutes

## UI Design

### Progress Bar
```
[████████████░░░░░░░░] 60% Complete (18s remaining)
Password Cracker: Analyzing encryption...
```

### Mission Timer (in header or mission panel)
```
Mission Time: 02:34
Speed Bonus Available: ✓ (if on track)
```

### Speedup Control (in header)
```
Game Speed: [5x ▼] (1x, 2x, 5x, 10x, 20x)
```

## Testing Considerations

1. Test with different speedup values
2. Test queue with multiple actions
3. Test cancellation of actions
4. Test mission timer accuracy
5. Test speed bonus calculation
6. Test UI updates during progress

## Backward Compatibility

- Existing missions without durations will use defaults
- Speedup defaults to 5x (fast enough to feel instant but show progress)
- Progress bars only show for actions > 1 second (game-time)

