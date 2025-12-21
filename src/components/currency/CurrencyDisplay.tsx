import { useCurrencyStore } from '@/game/state/useCurrencyStore';
import { useMissionStore } from '@/game/state/useMissionStore';
import { getPlayerRank } from '@/game/player/playerRank';
import { Icon } from '@/components/ui/Icon';
import './CurrencyDisplay.css';

export function CurrencyDisplay() {
  const balance = useCurrencyStore((state) => state.balance);
  const totalEarned = useCurrencyStore((state) => state.totalEarned);
  // Subscribe to mission store to trigger re-renders when missions are completed
  useMissionStore((state) => state.completedMissions);
  const rankInfo = getPlayerRank();

  // Format number with commas
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-US');
  };

  return (
    <div className="currency-container">
      <div className="player-rank" title={rankInfo.description}>
        <Icon name="user" size={16} className="rank-icon" aria-hidden={true} />
        <span className="rank-text">{rankInfo.rank}</span>
      </div>
      <div className="currency-display" title={`Total Earned: ${formatCurrency(totalEarned)} NC`}>
        <Icon name="circle" size={16} className="currency-icon" aria-hidden={true} />
        <span className="currency-amount">{formatCurrency(balance)}</span>
        <span className="currency-symbol">NC</span>
      </div>
    </div>
  );
}

