import { useMissionStore } from '@/game/state/useMissionStore';
import { useCurrencyStore } from '@/game/state/useCurrencyStore';
import { useInventoryStore } from '@/game/state/useInventoryStore';
import { getAllMissions } from '@/game/missions/missionLoader';
import { getPlayerRank } from '@/game/player/playerRank';
import { getCategoryColor, getCategoryStars } from '@/game/missions/categoryUtils';
import { Icon } from '../ui/Icon';
import './PlayerStatsPanel.css';

export function PlayerStatsPanel() {
  const { completedMissions } = useMissionStore();
  const { balance, totalEarned, totalSpent } = useCurrencyStore();
  const { getOwnedSoftware } = useInventoryStore();
  
  const allMissions = getAllMissions();
  const ownedSoftware = getOwnedSoftware();
  const rankInfo = getPlayerRank();
  const rankColor = getCategoryColor(rankInfo.category);
  const rankStars = getCategoryStars(rankInfo.category);
  
  const completedCount = completedMissions.length;
  const totalMissions = allMissions.length;
  const completionPercentage = totalMissions > 0 
    ? Math.round((completedCount / totalMissions) * 100) 
    : 0;

  return (
    <div className="player-stats-panel">
      <div className="player-stats-header">
        <Icon name="user" size={20} className="player-stats-icon" aria-hidden={true} />
        <h3 className="player-stats-title">Player Statistics</h3>
      </div>

      <div className="player-stats-section">
        <div className="player-stats-rank">
          <div className="player-stats-rank-header">
            <span className="player-stats-rank-label">Rank</span>
            <div className="player-stats-rank-stars">
              {Array.from({ length: 4 }, (_, i) => (
                <span
                  key={i}
                  style={{ 
                    color: i < rankStars ? rankColor : '#444',
                    opacity: i < rankStars ? 1 : 0.3
                  }}
                >
                  <Icon
                    name={i < rankStars ? 'award' : 'circle'}
                    size={16}
                    color={i < rankStars ? rankColor : undefined}
                    aria-hidden={true}
                  />
                </span>
              ))}
            </div>
          </div>
          <div 
            className="player-stats-rank-value"
            style={{ color: rankColor }}
          >
            {rankInfo.rank}
          </div>
          <div className="player-stats-rank-description">
            {rankInfo.description}
          </div>
        </div>
      </div>

      <div className="player-stats-section">
        <h4 className="player-stats-section-title">Mission Progress</h4>
        <div className="player-stats-grid">
          <div className="player-stats-item">
            <Icon name="check" size={16} className="player-stats-item-icon" aria-hidden={true} />
            <div className="player-stats-item-content">
              <span className="player-stats-item-label">Completed</span>
              <span className="player-stats-item-value">{completedCount} / {totalMissions}</span>
            </div>
          </div>
          <div className="player-stats-item">
            <Icon name="award" size={16} className="player-stats-item-icon" aria-hidden={true} />
            <div className="player-stats-item-content">
              <span className="player-stats-item-label">Progress</span>
              <span className="player-stats-item-value">{completionPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="player-stats-section">
        <h4 className="player-stats-section-title">Economy</h4>
        <div className="player-stats-grid">
          <div className="player-stats-item">
            <Icon name="circle" size={16} className="player-stats-item-icon" aria-hidden={true} />
            <div className="player-stats-item-content">
              <span className="player-stats-item-label">Balance</span>
              <span className="player-stats-item-value">{balance.toLocaleString()} NC</span>
            </div>
          </div>
          <div className="player-stats-item">
            <Icon name="arrow-up" size={16} className="player-stats-item-icon" aria-hidden={true} />
            <div className="player-stats-item-content">
              <span className="player-stats-item-label">Total Earned</span>
              <span className="player-stats-item-value">{totalEarned.toLocaleString()} NC</span>
            </div>
          </div>
          <div className="player-stats-item">
            <Icon name="arrow-down" size={16} className="player-stats-item-icon" aria-hidden={true} />
            <div className="player-stats-item-content">
              <span className="player-stats-item-label">Total Spent</span>
              <span className="player-stats-item-value">{totalSpent.toLocaleString()} NC</span>
            </div>
          </div>
        </div>
      </div>

      <div className="player-stats-section">
        <h4 className="player-stats-section-title">Inventory</h4>
        <div className="player-stats-grid">
          <div className="player-stats-item">
            <Icon name="package" size={16} className="player-stats-item-icon" aria-hidden={true} />
            <div className="player-stats-item-content">
              <span className="player-stats-item-label">Tools Owned</span>
              <span className="player-stats-item-value">{ownedSoftware.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

