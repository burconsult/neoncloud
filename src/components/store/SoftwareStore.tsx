import { useState } from 'react';
import { useCurrencyStore } from '@/game/state/useCurrencyStore';
import { useInventoryStore } from '@/game/state/useInventoryStore';
import { useMissionStore } from '@/game/state/useMissionStore';
import { useGameSettingsStore } from '@/game/state/useGameSettingsStore';
import { getAvailableSoftware, Software } from '@/game/inventory/inventoryTypes';
import { getAllSoftwareFromTools, getToolUpgradePaths } from '@/game/tools/toolLoader';
import { applyPriceMultiplier } from '@/game/settings/difficultyConfig';
import { Icon } from '@/components/ui/Icon';
import './SoftwareStore.css';

export function SoftwareStore() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const balance = useCurrencyStore((state) => state.balance);
  const purchaseSoftware = useInventoryStore((state) => state.purchaseSoftware);
  const ownsSoftware = useInventoryStore((state) => state.ownsSoftware);
  const completedMissions = useMissionStore((state) => state.completedMissions);
  const ownedSoftwareIds = useInventoryStore((state) => state.ownedSoftware);
  const difficulty = useGameSettingsStore((state) => state.difficulty);
  
  // Get software from both tool modules and legacy catalog
  const toolSoftware = getAllSoftwareFromTools();
  const legacySoftware = getAvailableSoftware(completedMissions, ownedSoftwareIds);
  
  // Merge and deduplicate (tool modules take precedence)
  const softwareMap = new Map<string, Software>();
  [...toolSoftware, ...legacySoftware].forEach(software => {
    if (!softwareMap.has(software.id)) {
      softwareMap.set(software.id, software);
    }
  });
  const availableSoftware = Array.from(softwareMap.values());
  
  const categories = Array.from(new Set(availableSoftware.map(s => s.category)));

  const filteredSoftware = selectedCategory
    ? availableSoftware.filter(s => s.category === selectedCategory)
    : availableSoftware;

  const getRarityColor = (rarity: Software['rarity']): string => {
    switch (rarity) {
      case 'common': return '#888';
      case 'uncommon': return '#0f0';
      case 'rare': return '#00f';
      case 'epic': return '#a0a';
      case 'legendary': return '#fa0';
      default: return '#888';
    }
  };

  const handlePurchase = (software: Software) => {
    if (purchaseSoftware(software.id)) {
      // Success - could show notification here
    } else {
      // Failed - could show error message
      alert(`Cannot purchase ${software.name}. Check if you have enough neoncoins or if you already own it.`);
    }
  };

  return (
    <div className="software-store">
      <div className="store-header">
        <Icon name="server" size={24} className="store-icon" aria-hidden={true} />
        <h2 className="store-title">Software Store</h2>
        <div className="store-balance">
          <Icon name="circle" size={16} className="balance-icon" aria-hidden={true} />
          <span>{balance.toLocaleString()} NC</span>
        </div>
      </div>

      <div className="store-categories">
        <button
          className={`category-button ${!selectedCategory ? 'active' : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className="store-items">
        {filteredSoftware.length === 0 ? (
          <div className="store-empty">
            <p>No software available. Complete more missions to unlock new items!</p>
          </div>
        ) : (
          filteredSoftware.map(software => {
            const owned = ownsSoftware(software.id);
            const adjustedPrice = applyPriceMultiplier(software.price, difficulty);
            const canAfford = balance >= adjustedPrice;
            
            // Check if this is an upgrade version and if basic is owned
            // Get upgrade paths from tool modules and storage upgrades
            const toolUpgradePaths = getToolUpgradePaths();
            const storageUpgradePaths: Record<string, string> = {
              'storage-upgrade-2': 'storage-upgrade-1',
              'storage-upgrade-3': 'storage-upgrade-2',
            };
            const upgradePaths = { ...toolUpgradePaths, ...storageUpgradePaths };
            const basicVersionId = upgradePaths[software.id];
            const hasBasicVersion = basicVersionId ? ownsSoftware(basicVersionId) : false;
            const isUpgrade = !!basicVersionId;

            return (
              <div
                key={software.id}
                className={`store-item store-item--${software.rarity} ${owned ? 'store-item--owned' : ''}`}
              >
                <div className="store-item-header">
                  <div className="store-item-title-section">
                    <h3 className="store-item-title">{software.name}</h3>
                    <span
                      className="store-item-rarity"
                      style={{ color: getRarityColor(software.rarity) }}
                    >
                      {software.rarity.toUpperCase()}
                    </span>
                  </div>
                  {owned && (
                    <span className="store-item-owned-badge">
                      <Icon name="check-circle" size={16} aria-hidden={true} />
                      Owned
                    </span>
                  )}
                </div>

                <p className="store-item-description">{software.description}</p>

                {software.effects && (
                  <div className="store-item-effects">
                    {software.effects.unlockCommands && (
                      <div className="store-item-effect">
                        <Icon name="terminal" size={14} aria-hidden={true} />
                        <span>Unlocks: {software.effects.unlockCommands.join(', ')}</span>
                      </div>
                    )}
                    {software.effects.increaseStorage && (
                      <div className="store-item-effect">
                        <Icon name="server" size={14} aria-hidden={true} />
                        <span>+{(software.effects.increaseStorage / 100).toFixed(1)} TB Storage</span>
                      </div>
                    )}
                    {software.effects.reduceLatency && (
                      <div className="store-item-effect">
                        <Icon name="network" size={14} aria-hidden={true} />
                        <span>-{software.effects.reduceLatency}% Latency</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="store-item-footer">
                  <div className="store-item-price">
                    <Icon name="circle" size={16} className="price-icon" aria-hidden={true} />
                    <span className={canAfford ? '' : 'price-insufficient'}>
                      {applyPriceMultiplier(software.price, difficulty).toLocaleString()} NC
                    </span>
                  </div>
                  <button
                    className={`store-item-purchase ${owned ? 'store-item-purchase--owned' : ''} ${!canAfford ? 'store-item-purchase--insufficient' : ''} ${isUpgrade && hasBasicVersion && !owned ? 'store-item-purchase--upgrade' : ''}`}
                    onClick={() => handlePurchase(software)}
                    disabled={owned || !canAfford}
                    title={isUpgrade && hasBasicVersion && !owned ? 'Upgrade available - purchase the basic version first or save more NeonCoins' : ''}
                  >
                    {owned 
                      ? 'Owned' 
                      : canAfford 
                        ? 'Purchase' 
                        : 'Insufficient Funds'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

