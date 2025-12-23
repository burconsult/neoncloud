import { useEffect, useMemo } from 'react';
import { useMissionStore } from '@/game/state/useMissionStore';
import { useMissionPanelStore } from '@/game/state/useMissionPanelStore';
import { getAllMissions, getMissionCategories, getCategoryDisplayName } from '@/game/missions/missionLoader';
import { getCategoryColor, getCategoryStars } from '@/game/missions/categoryUtils';
import { MissionCategory } from '@/types';
import { Icon } from '@/components/ui/Icon';
import './MissionPanel.css';

export function MissionPanel() {
  const { currentMission, completedMissions, getMissionProgress, isMissionCompleted, startMission, recordHintUsage } = useMissionStore();
  const { toggleMission, isMissionExpanded, setExpandedMission } = useMissionPanelStore();
  
  const allMissions = getAllMissions();
  const categories = getMissionCategories();

  // Group missions by category
  const missionsByCategory = useMemo(() => {
    const grouped: Record<MissionCategory, typeof allMissions> = {
      'training': [],
      'script-kiddie': [],
      'cyber-warrior': [],
      'digital-ninja': [],
    };
    
    allMissions.forEach(mission => {
      grouped[mission.category].push(mission);
    });
    
    return grouped;
  }, [allMissions]);

    // Auto-start welcome mission if no mission is active and welcome mission not completed
    useEffect(() => {
      if (!currentMission && !isMissionCompleted('welcome-00')) {
        startMission('welcome-00').catch(console.error);
      }
    }, [currentMission, startMission, isMissionCompleted]);

  // Auto-expand current mission when it changes, collapse completed ones
  useEffect(() => {
    if (currentMission) {
      // Expand current mission
      setExpandedMission(currentMission.id);
    } else {
      // Collapse all when no current mission
      setExpandedMission(null);
    }
  }, [currentMission, setExpandedMission]);

  // Determine mission status
  const getMissionStatus = (missionId: string) => {
    if (isMissionCompleted(missionId)) {
      return 'completed';
    }
    if (currentMission?.id === missionId) {
      return 'active';
    }
    
    // Check if mission is unlocked
    const mission = allMissions.find(m => m.id === missionId);
    if (mission?.prerequisites && mission.prerequisites.length > 0) {
      const allPrereqsMet = mission.prerequisites.every(prereq => 
        completedMissions.includes(prereq)
      );
      if (allPrereqsMet) {
        return 'unlocked';
      }
    } else if (!mission?.prerequisites || mission.prerequisites.length === 0) {
      // Tutorial is always unlocked
      return 'unlocked';
    }
    
    return 'locked';
  };

  const isUnlocked = (missionId: string) => {
    return getMissionStatus(missionId) !== 'locked';
  };

  const handleMissionClick = (missionId: string) => {
    if (!isUnlocked(missionId)) {
      return; // Don't allow interaction with locked missions
    }
    
    const status = getMissionStatus(missionId);
    
    if (status === 'completed') {
      // Allow expanding completed missions for review
      toggleMission(missionId);
    } else if (status === 'unlocked' || status === 'active') {
      // Expand/unlock missions
      toggleMission(missionId);
    }
  };

  return (
    <div className="mission-panel">
      <div className="mission-panel-header">
        <Icon name="book-open" size={20} className="mission-panel-icon" aria-hidden={true} />
        <h3 className="mission-panel-title">Missions</h3>
      </div>
      
      <div className="mission-list">
        {categories.map((category) => {
          const categoryMissions = missionsByCategory[category];
          if (categoryMissions.length === 0) return null;

          return (
            <div 
              key={category} 
              className="mission-category"
              style={{ '--category-color': getCategoryColor(category) } as React.CSSProperties}
            >
              <div className="mission-category-header">
                <span 
                  className="mission-category-icon"
                  style={{ color: getCategoryColor(category) }}
                >
                  <Icon 
                    name={category === 'training' ? 'book-open' : category === 'script-kiddie' ? 'terminal' : category === 'cyber-warrior' ? 'shield' : 'code'} 
                    size={18} 
                    aria-hidden={true} 
                  />
                </span>
                <h4 
                  className="mission-category-title"
                  style={{ color: getCategoryColor(category) }}
                >
                  {getCategoryDisplayName(category)}
                </h4>
                <div className="mission-category-stars">
                  {Array.from({ length: 4 }, (_, i) => (
                    <span
                      key={i}
                      style={{ 
                        color: i < getCategoryStars(category) ? getCategoryColor(category) : '#444',
                        opacity: i < getCategoryStars(category) ? 1 : 0.3
                      }}
                    >
                      <Icon
                        name={i < getCategoryStars(category) ? 'award' : 'circle'}
                        size={14}
                        aria-hidden={true}
                      />
                    </span>
                  ))}
                </div>
              </div>
              <div className="mission-category-missions">
                {categoryMissions.map((mission) => {
          const status = getMissionStatus(mission.id);
          const isExpanded = isMissionExpanded(mission.id);
          const isActive = currentMission?.id === mission.id;
          const isCompleted = isMissionCompleted(mission.id);
          const progress = getMissionProgress(mission.id);
          const unlocked = isUnlocked(mission.id);

          return (
            <div
              key={mission.id}
              className={`mission-item mission-item--${status} ${isExpanded ? 'mission-item--expanded' : ''} ${isActive ? 'mission-item--active' : ''}`}
            >
              <div
                className="mission-item-header"
                onClick={() => handleMissionClick(mission.id)}
                role="button"
                tabIndex={unlocked ? 0 : -1}
                aria-expanded={isExpanded}
                aria-disabled={!unlocked}
              >
                <div className="mission-item-header-content">
                  <div className="mission-item-status">
                    {isCompleted && (
                      <Icon name="check-circle" size={16} className="mission-status-icon mission-status-icon--completed" aria-label="Completed" />
                    )}
                    {isActive && !isCompleted && (
                      <Icon name="play" size={16} className="mission-status-icon mission-status-icon--active" aria-label="Active" />
                    )}
                    {status === 'locked' && (
                      <Icon name="lock" size={16} className="mission-status-icon mission-status-icon--locked" aria-label="Locked" />
                    )}
                    {status === 'unlocked' && !isActive && !isCompleted && (
                      <Icon name="circle" size={16} className="mission-status-icon mission-status-icon--unlocked" aria-label="Available" />
                    )}
                  </div>
                  
                  <div className="mission-item-title-section">
                    <h4 className="mission-item-title">{mission.title}</h4>
                    {isActive && (
                      <span className="mission-item-progress">{progress}%</span>
                    )}
                  </div>
                </div>
                
                {unlocked && (
                  <Icon
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    className="mission-expand-icon"
                    aria-hidden={true}
                  />
                )}
              </div>

              {isExpanded && unlocked && (
                <div className="mission-item-content">
                  <p className="mission-description">{mission.description}</p>
                  
                  {isActive && (
                    <div className="mission-progress-bar">
                      <div
                        className="mission-progress-fill"
                        style={{ width: `${progress}%` }}
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  )}

                  <div className="mission-objectives">
                    <h5 className="mission-objectives-title">Objectives:</h5>
                    <ul className="mission-objectives-list">
                      {mission.tasks.map((task) => {
                        const taskCompleted = useMissionStore.getState().isTaskCompleted(mission.id, task.id);
                        const isActive = currentMission?.id === mission.id;
                        
                        // Show hints if task is not completed and mission is active
                        const showHints = isActive && !taskCompleted && task.hints && task.hints.length > 0;
                        
                        return (
                          <li
                            key={task.id}
                            className={`mission-objective ${taskCompleted ? 'mission-objective--completed' : ''}`}
                          >
                            <Icon
                              name={taskCompleted ? 'check-circle' : 'circle'}
                              size={14}
                              className={`mission-objective-icon ${taskCompleted ? 'mission-objective-icon--completed' : ''}`}
                              aria-hidden={true}
                            />
                            <span>{task.description}</span>
                            {showHints && (
                              <button
                                className="mission-hint-button"
                                onClick={() => {
                                  recordHintUsage(mission.id, task.id);
                                  // Show hints in a simple way (could be enhanced with a modal)
                                  alert(`Hints for "${task.description}":\n\n${task.hints.map((h, i) => `${i + 1}. ${h}`).join('\n')}`);
                                }}
                                aria-label={`Show hints for ${task.description}`}
                                title="Click to view hints"
                              >
                                <Icon name="help" size={14} aria-hidden={true} />
                                <span>Hints</span>
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {mission.learningObjectives && mission.learningObjectives.length > 0 && (
                    <div className="mission-learning-objectives">
                      <h5 className="mission-learning-objectives-title">Learning Objectives:</h5>
                      <ul className="mission-learning-objectives-list">
                        {mission.learningObjectives.map((objective, index) => (
                          <li key={index}>• {objective}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="mission-completed-badge">
                      <Icon name="award" size={16} className="mission-completed-icon" aria-hidden={true} />
                      <span>Mission Completed!</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
