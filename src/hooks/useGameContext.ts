import { useMemo } from 'react';
import { GameContext } from '@/types';
import { createCommandRegistry } from '@/game/commands/commandRegistry';
import { useFileSystemStore } from '@/game/state/useFileSystemStore';

export function useGameContext(): GameContext {
  const commandRegistry = useMemo(() => createCommandRegistry(), []);
  const currentDirectory = useFileSystemStore((state) => state.currentDirectory);
  const fileSystem = useFileSystemStore((state) => state.fileSystem);

  return useMemo<GameContext>(
    () => ({
      currentDirectory,
      fileSystem,
      mission: null,
      player: {
        level: 1,
        xp: 0,
        unlockedCommands: [],
        badges: [],
        completedMissions: [],
      },
      commandRegistry,
    }),
    [commandRegistry, currentDirectory, fileSystem]
  );
}

