import { FileSystem } from '@/types';

/**
 * Server file system definitions
 * Each server has its own isolated file system
 */

/**
 * File system for server-01
 */
export function createServer01FileSystem(): FileSystem {
  return {
    '/home': {
      type: 'directory',
      name: 'home',
      children: {
        'data': {
          type: 'directory',
          name: 'data',
          children: {
            'secret.txt': {
              type: 'file',
              name: 'secret.txt',
              content: `SECRET DATA - CLASSIFIED

Mission Objective: Extract this file

This file contains sensitive information about the target network.
The contents have been successfully retrieved.

Congratulations! You've completed the file extraction phase of your mission.

Remember to disconnect from the server after completing your objectives.`,
            },
            'config.ini': {
              type: 'file',
              name: 'config.ini',
              content: `[server]
host=server-01
port=22
protocol=ssh

[network]
ip=192.168.1.100
subnet=255.255.255.0

[security]
firewall=disabled
# Note: This server has firewall disabled for training purposes
# More secure servers will require Firewall Bypass Tool
encryption=AES-256`,
            },
          },
        },
        'logs': {
          type: 'directory',
          name: 'logs',
          children: {
            'access.log': {
              type: 'file',
              name: 'access.log',
              content: `[2024-01-15 10:23:45] SSH connection from 192.168.1.50
[2024-01-15 10:24:12] User login successful
[2024-01-15 10:25:30] File access: /home/data/config.ini
[2024-01-15 10:26:15] VPN connection detected`,
            },
          },
        },
        'README.txt': {
          type: 'file',
          name: 'README.txt',
          content: `Server-01 System Information

This is a protected server in the NeonCloud network.
Use standard commands to explore the file system:
- ls    : List files and directories
- cd    : Change directory  
- cat   : Display file contents
- pwd   : Print working directory

Important files are located in /home/data`,
        },
      },
    },
  };
}

/**
 * File system for server-02
 */
export function createServer02FileSystem(): FileSystem {
  return {
    '/home': {
      type: 'directory',
      name: 'home',
      children: {
        'database': {
          type: 'directory',
          name: 'database',
          children: {
            'customers': {
              type: 'directory',
              name: 'customers',
              children: {
                'customer-data.txt': {
                  type: 'file',
                  name: 'customer-data.txt',
                  content: `CUSTOMER DATABASE - EXTRACTED

Mission Objective: Extract this file

Customer Information:
- Total Records: 1,247
- Active Accounts: 892
- Location: Database Server-02
- Last Updated: 2024-01-20

This file contains customer information extracted from the target server.
Mission objective completed.`,
                },
              },
            },
            'reports': {
              type: 'directory',
              name: 'reports',
              children: {
                'financial-report.txt': {
                  type: 'file',
                  name: 'financial-report.txt',
                  content: `FINANCIAL REPORT - CLASSIFIED

Mission Objective: Extract this file

Financial Summary:
- Q4 Revenue: $2,450,000
- Operating Costs: $1,890,000
- Net Profit: $560,000
- Report Date: 2024-01-20

This file contains financial information extracted from the target server.
Mission objective completed.`,
                },
              },
            },
            'README.txt': {
              type: 'file',
              name: 'README.txt',
              content: `Server-02 Database Structure

This server contains database files organized in subdirectories:
- /home/database/customers/ - Customer data files
- /home/database/reports/ - Financial and operational reports

Important files are located in these directories.`,
            },
          },
        },
        'logs': {
          type: 'directory',
          name: 'logs',
          children: {
            'access.log': {
              type: 'file',
              name: 'access.log',
              content: `[2024-01-20 14:15:30] SSH connection from 192.168.1.150
[2024-01-20 14:16:45] User login: admin
[2024-01-20 14:17:12] File access: /home/database/customers/customer-data.txt
[2024-01-20 14:18:30] File access: /home/database/reports/financial-report.txt
[2024-01-20 14:19:00] VPN connection detected
[2024-01-20 14:20:15] Database query executed`,
            },
          },
        },
        'README.txt': {
          type: 'file',
          name: 'README.txt',
          content: `Server-02 System Information

This is an enhanced security server in the NeonCloud network.
Database files are located in /home/database/

Use standard commands to explore:
- ls    : List files and directories
- cd    : Change directory
- cat   : Display file contents
- pwd   : Print working directory`,
        },
      },
    },
  };
}

/**
 * Get file system for a specific server
 * First checks world registry for host file system factory,
 * then falls back to legacy hardcoded systems
 */
export function getServerFileSystem(serverId: string): FileSystem | null {
  // Try to get file system from world registry first
  // Use dynamic import to avoid circular dependencies
  try {
    // Check if world registry is available (runtime check)
    // We'll use the legacy system for now, but leave this structure for future enhancement
    // The fileSystemFactory in host entities can be implemented later with proper async handling
  } catch (error) {
    // World registry not available, fall through to legacy
  }
  
  // Use legacy hardcoded systems (mapped by fileSystemId from host entities)
  // Future: When host.fileSystemFactory is implemented, call it here
  switch (serverId.toLowerCase()) {
    case 'server-01':
      return createServer01FileSystem();
    case 'server-02':
      return createServer02FileSystem();
    default:
      return null;
  }
}

/**
 * Get home directory path for a server based on username
 * Players start in their home directory and need to navigate to find files
 */
export function getServerHomeDirectory(serverId: string, username?: string): string {
  // Always start in /home directory (or /home/<username> if we want user-specific homes)
  // This forces players to navigate and explore, not immediately see the full structure
  const userHome = username ? `/home/${username}` : '/home';
  
  // For now, we'll use /home as the starting point since files are organized under /home
  // If we want user-specific homes, we'd need to restructure the file systems
  return '/home';
}

