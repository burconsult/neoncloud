import { useConnectionStore } from '@/game/state/useConnectionStore';
import { useFileSystemStore } from '@/game/state/useFileSystemStore';
import { Icon } from '../ui/Icon';
import './NetworkTopologyPanel.css';

export function NetworkTopologyPanel() {
  const { vpnConnected, vpnType, remoteServerConnected } = useConnectionStore();
  const { activeServerId } = useFileSystemStore();

  return (
    <div className="network-topology-panel">
      <div className="network-topology-header">
        <Icon name="network" size={20} className="network-topology-icon" aria-hidden={true} />
        <h3 className="network-topology-title">Network Topology</h3>
      </div>

      <div className="network-topology-content">
        <div className="network-node localhost-node">
          <div className="network-node-header">
            <Icon name="server" size={16} className="network-node-icon" aria-hidden={true} />
            <span className="network-node-name">localhost</span>
            <span className="network-node-status active">●</span>
          </div>
          <div className="network-node-details">
            <div className="network-node-detail">
              <span className="network-node-detail-label">IP:</span>
              <span className="network-node-detail-value">127.0.0.1</span>
            </div>
            <div className="network-node-detail">
              <span className="network-node-detail-label">Status:</span>
              <span className="network-node-detail-value active">Online</span>
            </div>
          </div>
        </div>

        {vpnConnected && (
          <>
            <div className="network-connection">
              <div className="network-connection-line" />
              <div className="network-connection-label">
                <Icon name="shield" size={12} aria-hidden={true} />
                <span>VPN {vpnType === 'premium' ? 'Premium' : 'Basic'}</span>
              </div>
            </div>
            
            <div className="network-node vpn-node">
              <div className="network-node-header">
                <Icon name="shield" size={16} className="network-node-icon" aria-hidden={true} />
                <span className="network-node-name">VPN Server</span>
                <span className="network-node-status active">●</span>
              </div>
              <div className="network-node-details">
                <div className="network-node-detail">
                  <span className="network-node-detail-label">Type:</span>
                  <span className="network-node-detail-value">{vpnType === 'premium' ? 'Premium' : 'Basic'}</span>
                </div>
                <div className="network-node-detail">
                  <span className="network-node-detail-label">Status:</span>
                  <span className="network-node-detail-value active">Connected</span>
                </div>
              </div>
            </div>
          </>
        )}

        {remoteServerConnected && (
          <>
            <div className="network-connection">
              <div className="network-connection-line" />
              <div className="network-connection-label">
                <Icon name="terminal" size={12} aria-hidden={true} />
                <span>SSH</span>
              </div>
            </div>
            
            <div className="network-node remote-node">
              <div className="network-node-header">
                <Icon name="server" size={16} className="network-node-icon" aria-hidden={true} />
                <span className="network-node-name">{remoteServerConnected}</span>
                <span className="network-node-status active">●</span>
              </div>
              <div className="network-node-details">
                <div className="network-node-detail">
                  <span className="network-node-detail-label">Connection:</span>
                  <span className="network-node-detail-value">SSH</span>
                </div>
                <div className="network-node-detail">
                  <span className="network-node-detail-label">Status:</span>
                  <span className="network-node-detail-value active">Connected</span>
                </div>
                <div className="network-node-detail">
                  <span className="network-node-detail-label">Active Server:</span>
                  <span className="network-node-detail-value">{activeServerId || 'No'}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {!vpnConnected && !remoteServerConnected && (
          <div className="network-empty">
            <Icon name="wifi" size={24} className="network-empty-icon" aria-hidden={true} />
            <p>No active connections</p>
            <p className="network-empty-hint">
              Connect to VPN or a remote server to see network topology
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

