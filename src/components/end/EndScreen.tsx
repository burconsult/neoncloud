import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useMissionStore } from '@/game/state/useMissionStore';
import { useCurrencyStore } from '@/game/state/useCurrencyStore';
import { getAllMissions } from '@/game/missions/missionLoader';
import { getPlayerRank } from '@/game/player/playerRank';
import { 
  getCategoryColor, 
  getCategoryName, 
  getCategoryStars,
  getCategoryStats,
} from '@/game/missions/categoryUtils';
import { MissionCategory } from '@/types';
import './EndScreen.css';

interface EndScreenProps {
  onRestart: () => void;
  onContinue: () => void;
  category?: string; // Category that was just completed
  isFinal?: boolean; // Whether this is the final completion screen
}

export function EndScreen({ onRestart, onContinue, category, isFinal = false }: EndScreenProps) {
  const [stats, setStats] = useState<{
    totalMissions: number;
    completedMissions: number;
    totalNeonCoins: number;
    playerRank: string;
    completionPercentage: number;
    categoryStats?: Record<MissionCategory, { completed: number; total: number; percentage: number }>;
  } | null>(null);

  useEffect(() => {
    const missionStore = useMissionStore.getState();
    const currencyStore = useCurrencyStore.getState();
    const allMissions = getAllMissions();
    const completedMissions = missionStore.completedMissions || [];
    
    const totalMissions = allMissions.length;
    const completedCount = completedMissions.length;
    const completionPercentage = totalMissions > 0 
      ? Math.round((completedCount / totalMissions) * 100) 
      : 0;
    
    const playerRankInfo = getPlayerRank();
    
    // Get stats for each category
    const categoryStats: Record<MissionCategory, { completed: number; total: number; percentage: number }> = {
      'training': getCategoryStats('training'),
      'script-kiddie': getCategoryStats('script-kiddie'),
      'cyber-warrior': getCategoryStats('cyber-warrior'),
      'digital-ninja': getCategoryStats('digital-ninja'),
    };
    
    setStats({
      totalMissions,
      completedMissions: completedCount,
      totalNeonCoins: currencyStore.balance,
      playerRank: playerRankInfo.rank,
      completionPercentage,
      categoryStats,
    });
  }, []);

  if (!stats) {
    return (
      <div className="end-screen">
        <div className="end-content">
          <div className="end-loading">
            <Icon name="terminal" size={64} className="end-icon" aria-hidden={true} />
            <p>Loading completion stats...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="end-screen">
      <div className="end-content">
        <div className="end-header">
          <Icon name="terminal" size={80} className="end-icon" aria-hidden={true} />
          <h1 className="end-title">Mission Complete</h1>
          <p className="end-subtitle">Congratulations, {stats.playerRank}!</p>
        </div>

        <div className="end-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <Icon name="terminal" size={32} aria-hidden={true} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.completedMissions} / {stats.totalMissions}</div>
              <div className="stat-label">Missions Completed</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Icon name="award" size={32} aria-hidden={true} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalNeonCoins.toLocaleString()}</div>
              <div className="stat-label">NeonCoins Earned</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Icon name="award" size={32} aria-hidden={true} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.playerRank}</div>
              <div className="stat-label">Final Rank</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Icon name="success" size={32} aria-hidden={true} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.completionPercentage}%</div>
              <div className="stat-label">Completion</div>
            </div>
          </div>
        </div>

        <div className="end-message">
          <p>
            You've completed all available missions in NeonCloud! You've mastered the basics
            of network security, terminal navigation, and cybersecurity operations.
          </p>
          <p>
            Your journey from a trainee to a {stats.playerRank} demonstrates your dedication
            to learning and understanding the digital world.
          </p>
        </div>

        <div className="end-actions">
          <button 
            className="end-button end-button-primary" 
            onClick={onRestart}
            aria-label="Start a new game"
          >
            <Icon name="refresh" size={20} aria-hidden={true} />
            Start New Game
          </button>
          <button 
            className="end-button end-button-secondary" 
            onClick={onContinue}
            aria-label="Continue exploring"
          >
            <Icon name="play" size={20} aria-hidden={true} />
            Continue Exploring
          </button>
        </div>

        <div className="end-credits">
          <p className="credits-text">
            Created by{' '}
            <a 
              href="https://x.com/burconsult" 
              target="_blank" 
              rel="noopener noreferrer"
              className="credits-link"
            >
              @burconsult
            </a>
            {' • '}
            <a 
              href="https://github.com/burconsult/neoncloud" 
              target="_blank" 
              rel="noopener noreferrer"
              className="credits-link"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

