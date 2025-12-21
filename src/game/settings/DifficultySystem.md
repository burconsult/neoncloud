# Difficulty System Design

## Overview
A modular difficulty system that affects:
- Mission hints (shown/hidden)
- Mission completion times (multipliers)
- Tool prices (multipliers)
- Tool execution times (multipliers)

## Difficulty Levels
1. **Easy (Training)**: Full hints, relaxed times, standard prices
2. **Normal**: Standard hints, standard times, standard prices (default)
3. **Hard**: Reduced hints, shorter times, higher prices
4. **Expert**: No hints, very short times, expensive tools

## Implementation Approach

### 1. Game Settings Store
- Store difficulty level (persisted)
- Store other game settings (speed multiplier, etc.)

### 2. Difficulty Configuration
- Define multipliers for each difficulty level
- Price multipliers: Easy=0.8x, Normal=1.0x, Hard=1.5x, Expert=2.0x
- Time multipliers: Easy=1.5x, Normal=1.0x, Hard=0.75x, Expert=0.5x
- Hint availability: Easy=all, Normal=standard, Hard=reduced, Expert=none

### 3. Modular Integration
- Missions check difficulty when displaying hints
- Tools check difficulty when calculating prices/durations
- All through a centralized difficulty helper

### 4. Mission Integration
- Mission tasks can specify which hints are "essential" vs "optional"
- Essential hints always shown (for accessibility)
- Optional hints respect difficulty level

### 5. Tool Integration
- Tool modules can define base prices/durations
- Difficulty system applies multipliers
- Still fully modular - each tool defines its own base values

## Benefits
- Respects modular architecture (no changes to tool/mission structure)
- Easy to add new difficulty levels
- Easy to adjust multipliers
- Missions and tools stay independent of difficulty logic

