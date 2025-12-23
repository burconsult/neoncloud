import { useState, ReactNode } from 'react';
import { Icon } from '../ui/Icon';
import './Drawer.css';

export type DrawerTab = 'missions' | 'store' | 'inventory' | 'stats' | 'network';

export interface DrawerTabInfo {
  id: DrawerTab;
  label: string;
  icon: string;
  component: ReactNode;
}

interface DrawerProps {
  tabs: DrawerTabInfo[];
  defaultTab?: DrawerTab;
}

export function Drawer({ tabs, defaultTab = 'missions' }: DrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>(defaultTab);

  const activeTabInfo = tabs.find(tab => tab.id === activeTab);

  // Define colors for each tab
  const getTabColor = (tabId: DrawerTab): string => {
    switch (tabId) {
      case 'missions':
        return '#00ff41'; // Neon green
      case 'store':
        return '#ff6b35'; // Orange
      case 'inventory':
        return '#4ecdc4'; // Cyan
      case 'stats':
        return '#95e1d3'; // Light green
      case 'network':
        return '#f38181'; // Pink/Red
      default:
        return '#00ff41';
    }
  };

  return (
    <div className="drawer">
      <div className="drawer-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`drawer-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-label={tab.label}
            title={tab.label}
            style={{
              '--tab-color': getTabColor(tab.id),
            } as React.CSSProperties}
          >
            <Icon name={tab.icon} size={22} aria-hidden={true} />
          </button>
        ))}
      </div>
      <div className="drawer-content">
        {activeTabInfo?.component}
      </div>
    </div>
  );
}

