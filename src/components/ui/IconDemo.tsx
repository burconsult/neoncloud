/**
 * Demo component showing available icons
 * Useful for development and testing
 */

import { Icon, getAvailableIcons } from './Icon';

export function IconDemo() {
  const icons = getAvailableIcons();
  const categories: Record<string, string[]> = {
    'Commands': ['help', 'echo', 'clear', 'ls', 'cd', 'cat', 'ping', 'whoami', 'pwd'],
    'Status': ['success', 'error', 'warning', 'info'],
    'Navigation': ['arrow-up', 'arrow-down', 'arrow-left', 'arrow-right'],
    'UI': ['settings', 'book', 'trophy', 'download', 'search'],
  };

  return (
    <div style={{ padding: '20px', color: '#ffffff' }}>
      <h2 style={{ color: '#00ff41', marginBottom: '20px' }}>Available Icons</h2>
      
      {Object.entries(categories).map(([category, iconNames]) => (
        <div key={category} style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#00ffff', marginBottom: '10px' }}>{category}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {iconNames.map((iconName) => (
              <div
                key={iconName}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '10px',
                  border: '1px solid #00ff41',
                  borderRadius: '4px',
                  minWidth: '100px',
                }}
              >
                <Icon name={iconName} size={32} color="#00ff41" />
                <span style={{ marginTop: '8px', fontSize: '12px', color: '#b0b0b0' }}>
                  {iconName}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div style={{ marginTop: '30px', color: '#b0b0b0', fontSize: '14px' }}>
        <p>Total icons available: {icons.length}</p>
      </div>
    </div>
  );
}

