import { useCurrencyStore } from '@/game/state/useCurrencyStore';
import { useMissionStore } from '@/game/state/useMissionStore';
import { getPlayerRank } from '@/game/player/playerRank';
import { getCategoryColor, getCategoryStars } from '@/game/missions/categoryUtils';
import { Icon } from '@/components/ui/Icon';
import './CurrencyDisplay.css';

export function CurrencyDisplay() {
  const balance = useCurrencyStore((state) => state.balance);
  const totalEarned = useCurrencyStore((state) => state.totalEarned);
  // Subscribe to mission store to trigger re-renders when missions are completed
  useMissionStore((state) => state.completedMissions);
  const rankInfo = getPlayerRank();
  
  // Get category color based on player's current category
  const rankColor = getCategoryColor(rankInfo.category);
  const rankStars = getCategoryStars(rankInfo.category);

  // Format number with commas
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-US');
  };

  return (
    <div className="currency-container">
      <div 
        className="player-rank" 
        title={rankInfo.description}
        style={{ '--rank-color': rankColor } as React.CSSProperties}
      >
        <span className="rank-stars">
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
                size={12}
                color={i < rankStars ? rankColor : undefined}
                aria-hidden={true}
              />
            </span>
          ))}
        </span>
        <Icon name="user" size={16} className="rank-icon" color={rankColor} aria-hidden={true} />
        <span className="rank-text" style={{ color: rankColor }}>{rankInfo.rank}</span>
      </div>
      <div className="currency-display" title={`Total Earned: ${formatCurrency(totalEarned)} NC`}>
        <Icon name="circle" size={16} className="currency-icon" aria-hidden={true} />
        <span className="currency-amount">{formatCurrency(balance)}</span>
        <span className="currency-symbol">NC</span>
      </div>
    </div>
  );
}

