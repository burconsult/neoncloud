import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FileSystem } from '@/types';
import { createDefaultFileSystem } from '../filesystem/fileSystem';
import { getServerFileSystem, getServerHomeDirectory } from '../filesystem/serverFileSystems';

interface FileSystemState {
  fileSystem: FileSystem; // Current active file system (local or server)
  currentDirectory: string;
  activeServerId: string | null; // null = local, otherwise server ID
  
  // Actions
  setCurrentDirectory: (path: string) => void;
  getCurrentDirectory: () => string;
  setActiveServer: (serverId: string | null, username?: string) => void;
  getActiveFileSystem: () => FileSystem;
  isOnServer: () => boolean;
}

export const useFileSystemStore = create<FileSystemState>()(
  persist(
    (set, get) => ({
      fileSystem: createDefaultFileSystem(),
      currentDirectory: '/home/neoncloud-user',
      activeServerId: null,

      setCurrentDirectory: (path: string) => {
        set({ currentDirectory: path });
      },

      getCurrentDirectory: () => {
        return get().currentDirectory;
      },

      setActiveServer: (serverId: string | null, username?: string) => {
        if (serverId === null) {
          // Switch back to local file system
          set({
            fileSystem: createDefaultFileSystem(),
            currentDirectory: '/home/neoncloud-user',
            activeServerId: null,
          });
        } else {
          // Switch to server file system
          // Always start in /home directory so players need to navigate to find files
          const serverFileSystem = getServerFileSystem(serverId);
          if (serverFileSystem) {
            const homeDirectory = getServerHomeDirectory(serverId, username);
            set({
              fileSystem: serverFileSystem,
              currentDirectory: homeDirectory,
              activeServerId: serverId,
            });
          }
        }
      },

      getActiveFileSystem: () => {
        return get().fileSystem;
      },

      isOnServer: () => {
        return get().activeServerId !== null;
      },
    }),
    {
      name: 'neoncloud-filesystem',
      partialize: (state) => ({
        currentDirectory: state.currentDirectory,
        activeServerId: state.activeServerId,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) return;
        
        // Restore file system based on active server
        if (state.activeServerId) {
          const serverFileSystem = getServerFileSystem(state.activeServerId);
          if (serverFileSystem) {
            state.fileSystem = serverFileSystem;
            const homeDirectory = getServerHomeDirectory(state.activeServerId);
            state.currentDirectory = homeDirectory;
          }
        } else {
          state.fileSystem = createDefaultFileSystem();
          state.currentDirectory = '/home/neoncloud-user';
        }
      },
    }
  )
);

