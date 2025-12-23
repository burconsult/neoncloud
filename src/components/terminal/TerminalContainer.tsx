import { TerminalWindow } from './TerminalWindow';
import { Drawer, DrawerTabInfo } from '../drawer/Drawer';
import { MissionPanel } from '../mission/MissionPanel';
import { SoftwareStore } from '../store/SoftwareStore';
import { InventoryPanel } from '../drawer/InventoryPanel';
import { PlayerStatsPanel } from '../drawer/PlayerStatsPanel';
import { NetworkTopologyPanel } from '../drawer/NetworkTopologyPanel';
import './TerminalContainer.css';

export function TerminalContainer() {
  const drawerTabs: DrawerTabInfo[] = [
    {
      id: 'missions',
      label: 'Missions',
      icon: 'book-open',
      component: <MissionPanel />,
    },
    {
      id: 'store',
      label: 'Store',
      icon: 'shopping-cart',
      component: <SoftwareStore />,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: 'server',
      component: <InventoryPanel />,
    },
    {
      id: 'stats',
      label: 'Stats',
      icon: 'user',
      component: <PlayerStatsPanel />,
    },
    {
      id: 'network',
      label: 'Network',
      icon: 'network',
      component: <NetworkTopologyPanel />,
    },
  ];

  return (
    <div className="terminal-container">
      <div className="terminal-sidebar">
        <Drawer tabs={drawerTabs} defaultTab="missions" />
      </div>
      <div className="terminal-main">
        <TerminalWindow />
      </div>
    </div>
  );
}
