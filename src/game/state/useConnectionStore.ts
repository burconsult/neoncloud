import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ServerCredentials {
  serverId: string;
  username: string;
  password: string;
}

interface ConnectionState {
  vpnConnected: boolean;
  vpnType: 'basic' | 'premium' | null;
  remoteServerConnected: string | null; // Server ID or null
  serverCredentials: Record<string, ServerCredentials>; // serverId -> credentials
  
  // Actions
  connectVPN: (type: 'basic' | 'premium') => void;
  disconnectVPN: () => void;
  connectRemoteServer: (serverId: string) => void;
  disconnectRemoteServer: () => void;
  setServerCredentials: (serverId: string, username: string, password: string) => void;
  getServerCredentials: (serverId: string) => ServerCredentials | null;
  isVPNConnected: () => boolean;
  getCurrentRemoteServer: () => string | null;
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set, get) => ({
      vpnConnected: false,
      vpnType: null,
      remoteServerConnected: null,
      serverCredentials: {},

      connectVPN: (type: 'basic' | 'premium') => {
        set({
          vpnConnected: true,
          vpnType: type,
        });
      },

      disconnectVPN: () => {
        set({
          vpnConnected: false,
          vpnType: null,
        });
      },

      connectRemoteServer: (serverId: string) => {
        set({
          remoteServerConnected: serverId,
        });
      },

      disconnectRemoteServer: () => {
        set({
          remoteServerConnected: null,
        });
      },

      isVPNConnected: () => {
        return get().vpnConnected;
      },

      getCurrentRemoteServer: () => {
        return get().remoteServerConnected;
      },

      setServerCredentials: (serverId: string, username: string, password: string) => {
        set((state) => ({
          serverCredentials: {
            ...state.serverCredentials,
            [serverId]: { serverId, username, password },
          },
        }));
      },

      getServerCredentials: (serverId: string) => {
        return get().serverCredentials[serverId] || null;
      },
    }),
    {
      name: 'neoncloud-connections',
      partialize: (state) => ({
        vpnConnected: state.vpnConnected,
        vpnType: state.vpnType,
        remoteServerConnected: state.remoteServerConnected,
        serverCredentials: state.serverCredentials,
      }),
    }
  )
);

