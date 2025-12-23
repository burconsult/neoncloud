import { useInventoryStore } from '@/game/state/useInventoryStore';
import { Icon } from '../ui/Icon';
import './InventoryPanel.css';

export function InventoryPanel() {
  const { getOwnedSoftware, getStorageUsage, getStorageRemaining, storageCapacity } = useInventoryStore();
  
  const ownedSoftware = getOwnedSoftware();
  const storageUsage = getStorageUsage();
  const storageRemaining = getStorageRemaining();
  
  // Convert to TB for display (100 units = 1 TB)
  const formatStorage = (units: number): string => {
    const tb = (units / 100).toFixed(2);
    return `${tb} TB`;
  };
  
  const storagePercentage = storageCapacity > 0 
    ? Math.round((storageUsage / storageCapacity) * 100) 
    : 0;

  const purchasedTools = ownedSoftware.filter(software => {
    // Filter out storage upgrades (they don't use storage, they increase capacity)
    return software.storageSize === undefined || software.storageSize > 0;
  });

  return (
    <div className="inventory-panel">
      <div className="inventory-header">
        <Icon name="server" size={20} className="inventory-icon" aria-hidden={true} />
        <h3 className="inventory-title">Storage & Inventory</h3>
      </div>

      <div className="inventory-storage">
        <div className="inventory-storage-header">
          <span className="inventory-storage-label">Storage Usage</span>
          <span className="inventory-storage-value">
            {formatStorage(storageUsage)} / {formatStorage(storageCapacity)}
          </span>
        </div>
        <div className="inventory-storage-bar-container">
          <div 
            className="inventory-storage-bar"
            style={{ width: `${storagePercentage}%` }}
            role="progressbar"
            aria-valuenow={storagePercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Storage usage: ${storagePercentage}%`}
          />
        </div>
        <div className="inventory-storage-footer">
          <span className="inventory-storage-remaining">
            {formatStorage(storageRemaining)} remaining
          </span>
          <span className="inventory-storage-percentage">
            {storagePercentage}% used
          </span>
        </div>
      </div>

      <div className="inventory-software">
        <h4 className="inventory-section-title">System & Software</h4>
        <div className="inventory-software-list">
          {/* OS - Always shown */}
          <div className="inventory-software-item inventory-software-item-system">
            <div className="inventory-software-info">
              <span className="inventory-software-name">NeonCloud OS</span>
              <span className="inventory-software-category">System</span>
            </div>
            <div className="inventory-software-storage">
              <Icon name="server" size={14} aria-hidden={true} />
              <span>0.30 TB</span>
            </div>
          </div>
          
          {/* Purchased tools */}
          {purchasedTools.map((software) => {
            const storageSize = software.storageSize !== undefined ? software.storageSize : 10;
            const storageTB = (storageSize / 100).toFixed(2);
            
            return (
              <div key={software.id} className="inventory-software-item">
                <div className="inventory-software-info">
                  <span className="inventory-software-name">{software.name}</span>
                  <span className="inventory-software-category">{software.category}</span>
                </div>
                <div className="inventory-software-storage">
                  <Icon name="server" size={14} aria-hidden={true} />
                  <span>{storageTB} TB</span>
                </div>
              </div>
            );
          })}
          
          {/* Empty state if no purchased software */}
          {purchasedTools.length === 0 && (
            <div className="inventory-empty-hint-software">
              <Icon name="package" size={16} aria-hidden={true} />
              <span>No additional software purchased yet</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
