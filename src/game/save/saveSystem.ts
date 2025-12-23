/**
 * Game save/load system
 * Allows players to save and load their game state to/from JSON files
 */

import { useAuthStore } from '../state/useAuthStore';
import { useCurrencyStore } from '../state/useCurrencyStore';
import { useInventoryStore } from '../state/useInventoryStore';
import { useMissionStore } from '../state/useMissionStore';
import { useChallengeStore } from '../state/useChallengeStore';
import { useEducationalStore } from '../state/useEducationalStore';
import { useFileSystemStore } from '../state/useFileSystemStore';
import { useMissionPanelStore } from '../state/useMissionPanelStore';
import { useConnectionStore } from '../state/useConnectionStore';
import { useEmailStore } from '../state/useEmailStore';
import { useLoreStore } from '../state/useLoreStore';

export interface GameSaveData {
  version: string;
  timestamp: number;
  auth: {
    isAuthenticated: boolean;
    username: string;
  };
  currency: {
    balance: number;
    totalEarned: number;
    totalSpent: number;
    transactions: Array<{
      id: string;
      type: 'earn' | 'spend';
      amount: number;
      description: string;
      timestamp: number;
      category?: 'achievement' | 'mission' | 'task' | 'bonus' | 'purchase';
    }>;
  };
  inventory: {
    ownedSoftware: string[];
    storageCapacity: number;
    baseStorageCapacity: number;
  };
  missions: {
    currentMissionId: string | null;
    completedMissions: string[];
    taskProgress: Record<string, Record<string, boolean>>;
  };
  challenge: {
    isRoot: boolean;
    currentChallenge: import('../challenges/ChallengeModule').Challenge | null;
    attempts: number;
    rootPassword: string | null;
  };
  educational: {
    dismissedPopups: string[];
    shownPopups: string[];
  };
  fileSystem: {
    currentDirectory: string;
    activeServerId: string | null;
    // Note: File system structure is not saved as it's static/default
  };
  missionPanel: {
    expandedMissions: string[];
    expandedMissionId: string | null;
  };
  connections: {
    vpnConnected: boolean;
    vpnType: 'basic' | 'premium' | null;
    remoteServerConnected: string | null;
    serverCredentials: Record<string, { serverId: string; username: string; password: string }>;
  };
  email: {
    emails: Array<{
      id: string;
      from: string;
      to: string;
      subject: string;
      body: string;
      timestamp: number;
      read: boolean;
      attachments?: Array<{
        filename: string;
        encrypted: boolean;
        encryptedContent: string;
        decryptedContent?: string;
        password?: string;
      }>;
      missionId?: string;
    }>;
    currentEmailId: string | null;
  };
  lore: {
    entries: Array<{
      id: string;
      title: string;
      content: string;
      category: 'world' | 'organization' | 'technology' | 'mission' | 'character';
      unlockedAt?: number;
      missionId?: string;
    }>;
  };
}

const SAVE_VERSION = '1.0.0';

/**
 * Export all game state to a JSON string
 */
export function exportGameSave(): string {
  const authState = useAuthStore.getState();
  const currencyState = useCurrencyStore.getState();
  const inventoryState = useInventoryStore.getState();
  const missionState = useMissionStore.getState();
  const challengeState = useChallengeStore.getState();
  const educationalState = useEducationalStore.getState();
  const fileSystemState = useFileSystemStore.getState();
  const missionPanelState = useMissionPanelStore.getState();
  const connectionState = useConnectionStore.getState();
  const emailState = useEmailStore.getState();
  const loreState = useLoreStore.getState();

  const saveData: GameSaveData = {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    auth: {
      isAuthenticated: authState.isAuthenticated,
      username: authState.username,
    },
    currency: {
      balance: currencyState.balance,
      totalEarned: currencyState.totalEarned,
      totalSpent: currencyState.totalSpent,
      transactions: currencyState.transactions,
    },
    inventory: {
      ownedSoftware: inventoryState.ownedSoftware,
      storageCapacity: inventoryState.storageCapacity,
      baseStorageCapacity: inventoryState.baseStorageCapacity,
    },
    missions: {
      currentMissionId: missionState.currentMission?.id || null,
      completedMissions: missionState.completedMissions,
      taskProgress: missionState.taskProgress,
    },
    challenge: {
      isRoot: challengeState.isRoot,
      currentChallenge: challengeState.currentChallenge,
      attempts: challengeState.attempts,
      rootPassword: challengeState.rootPassword,
    },
    educational: {
      dismissedPopups: Array.from(educationalState.dismissedPopups),
      shownPopups: Array.from(educationalState.shownPopups),
    },
      fileSystem: {
        currentDirectory: fileSystemState.currentDirectory,
        activeServerId: fileSystemState.activeServerId,
      },
    missionPanel: {
      expandedMissions: Array.from(missionPanelState.expandedMissions),
      expandedMissionId: missionPanelState.expandedMissionId,
    },
    connections: {
      vpnConnected: connectionState.vpnConnected,
      vpnType: connectionState.vpnType,
      remoteServerConnected: connectionState.remoteServerConnected,
      serverCredentials: connectionState.serverCredentials,
    },
    email: {
      emails: emailState.emails,
      currentEmailId: emailState.currentEmailId,
    },
    lore: {
      entries: loreState.entries,
    },
  };

  return JSON.stringify(saveData, null, 2);
}

/**
 * Import game state from a JSON string
 */
export function importGameSave(saveDataString: string): { success: boolean; error?: string } {
  try {
    const saveData: GameSaveData = JSON.parse(saveDataString);

    // Validate save data structure
    if (!saveData.version || !saveData.timestamp) {
      return { success: false, error: 'Invalid save file format' };
    }

    // Restore auth state
    if (saveData.auth) {
      if (saveData.auth.isAuthenticated && saveData.auth.username) {
        useAuthStore.getState().login(saveData.auth.username);
      } else {
        useAuthStore.getState().logout();
      }
    }

    // Restore currency state
    if (saveData.currency) {
      useCurrencyStore.setState({
        balance: saveData.currency.balance ?? 0,
        totalEarned: saveData.currency.totalEarned ?? 0,
        totalSpent: saveData.currency.totalSpent ?? 0,
        transactions: saveData.currency.transactions ?? [],
      });
    }

    // Restore inventory state
    if (saveData.inventory) {
      useInventoryStore.setState({
        ownedSoftware: saveData.inventory.ownedSoftware ?? [],
        storageCapacity: saveData.inventory.storageCapacity ?? 100,
        baseStorageCapacity: saveData.inventory.baseStorageCapacity ?? 100,
      });
    }

    // Restore mission state
    if (saveData.missions) {
      // Set task progress and completed missions directly
      useMissionStore.setState({
        taskProgress: saveData.missions.taskProgress || {},
        completedMissions: saveData.missions.completedMissions || [],
      });
      
      // Restore current mission if exists
      if (saveData.missions.currentMissionId) {
        useMissionStore.getState().startMission(saveData.missions.currentMissionId);
      }
    }

    // Restore challenge state
    if (saveData.challenge) {
      useChallengeStore.setState({
        isRoot: saveData.challenge.isRoot ?? false,
        currentChallenge: saveData.challenge.currentChallenge ?? null,
        attempts: saveData.challenge.attempts ?? 0,
        rootPassword: saveData.challenge.rootPassword ?? null,
      });
    }

    // Restore educational state
    if (saveData.educational) {
      useEducationalStore.setState({
        dismissedPopups: new Set(saveData.educational.dismissedPopups ?? []),
        shownPopups: new Set(saveData.educational.shownPopups ?? []),
      });
    }

    // Restore connection state first (needed for file system restore)
    if (saveData.connections) {
      useConnectionStore.setState({
        vpnConnected: saveData.connections.vpnConnected ?? false,
        vpnType: saveData.connections.vpnType ?? null,
        remoteServerConnected: saveData.connections.remoteServerConnected ?? null,
        serverCredentials: saveData.connections.serverCredentials ?? {},
      });
    }

      // Restore file system state (after connection state)
      if (saveData.fileSystem) {
        const fileSystemStore = useFileSystemStore.getState();
        // Restore server connection if needed
        if (saveData.fileSystem.activeServerId) {
          fileSystemStore.setActiveServer(saveData.fileSystem.activeServerId);
        }
        // Set directory after server is set (setActiveServer already sets it)
        if (!saveData.fileSystem.activeServerId) {
          fileSystemStore.setCurrentDirectory(saveData.fileSystem.currentDirectory ?? '/home/neoncloud-user');
        }
      }

    // Restore mission panel state
    if (saveData.missionPanel) {
      useMissionPanelStore.setState({
        expandedMissions: new Set(saveData.missionPanel.expandedMissions ?? []),
        expandedMissionId: saveData.missionPanel.expandedMissionId ?? null,
      });
    }

    // Restore email state
    if (saveData.email) {
      useEmailStore.setState({
        emails: saveData.email.emails ?? [],
        currentEmailId: saveData.email.currentEmailId ?? null,
      });
    }

    // Restore lore state
    if (saveData.lore) {
      useLoreStore.setState({
        entries: saveData.lore.entries ?? [],
      });
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error loading save file',
    };
  }
}

/**
 * Download save file to user's computer
 */
export function downloadSaveFile(): void {
  const saveData = exportGameSave();
  const blob = new Blob([saveData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  link.href = url;
  link.download = `neoncloud-save-${timestamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Load save file from user's file input
 */
export function loadSaveFile(file: File): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = importGameSave(content);
      resolve(result);
    };
    
    reader.onerror = () => {
      resolve({ success: false, error: 'Failed to read file' });
    };
    
    reader.readAsText(file);
  });
}

