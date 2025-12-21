import { FileSystem } from '@/types';
import { ExtendedFile, ExtendedDirectory, ExtendedFileSystem, DEFAULT_FILE_METADATA, EXECUTABLE_FILE_METADATA, USER_HOME_METADATA } from './types';

/**
 * Server file system definitions
 * Each server has its own isolated file system with realistic Linux structure
 * 
 * File systems include:
 * - / (root) - Standard Linux root directory
 * - /home/<username> - User home directories (starting location when SSH'ing in)
 * - /var - Variable data files
 * - /etc - Configuration files
 * - /tmp - Temporary files
 * - /usr - User programs and data
 * - /root - Root user home directory
 */

/**
 * File system for server-01
 * Realistic Linux-style structure with user home directories
 */
export function createServer01FileSystem(): FileSystem {
  const fs: ExtendedFileSystem = {
    '/': {
      type: 'directory',
      name: 'root',
      metadata: {
        permissions: '0755',
        owner: 'root',
        group: 'root',
      },
    },
    '/home': {
      type: 'directory',
      name: 'home',
      metadata: {
        permissions: '0755',
        owner: 'root',
        group: 'root',
      },
      children: {
        'admin': {
          type: 'directory',
          name: 'admin',
          metadata: USER_HOME_METADATA,
          children: {
            '.bash_history': {
              type: 'file',
              name: '.bash_history',
              content: `cd /var/log
cat syslog
ls -la /home/data
exit`,
              metadata: {
                ...DEFAULT_FILE_METADATA,
                owner: 'admin',
                group: 'admin',
                permissions: '0600',
                size: 45,
              },
            },
            'Desktop': {
              type: 'directory',
              name: 'Desktop',
              metadata: {
                ...USER_HOME_METADATA,
                permissions: '0755',
              },
              children: {},
            },
          },
        },
      },
    },
    '/home/admin/data': {
      type: 'directory',
      name: 'data',
      metadata: {
        permissions: '0755',
        owner: 'admin',
        group: 'admin',
      },
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
          metadata: {
            ...DEFAULT_FILE_METADATA,
            owner: 'admin',
            group: 'admin',
            permissions: '0644',
            size: 312,
          },
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
          metadata: {
            ...DEFAULT_FILE_METADATA,
            owner: 'admin',
            group: 'admin',
            permissions: '0644',
            size: 248,
          },
        },
      },
    },
    '/var': {
      type: 'directory',
      name: 'var',
      metadata: {
        permissions: '0755',
        owner: 'root',
        group: 'root',
      },
      children: {
        'log': {
          type: 'directory',
          name: 'log',
          metadata: {
            permissions: '0755',
            owner: 'root',
            group: 'root',
          },
          children: {
            'syslog': {
              type: 'file',
              name: 'syslog',
              content: `[2024-01-15 09:00:00] System startup
[2024-01-15 10:23:45] SSH connection from 192.168.1.50
[2024-01-15 10:24:12] User login successful: admin
[2024-01-15 10:25:30] File access: /home/admin/data/config.ini
[2024-01-15 10:26:15] VPN connection detected
[2024-01-15 10:27:00] System running normally`,
              metadata: {
                ...DEFAULT_FILE_METADATA,
                owner: 'syslog',
                group: 'adm',
                permissions: '0640',
                size: 325,
              },
            },
            'auth.log': {
              type: 'file',
              name: 'auth.log',
              content: `[2024-01-15 10:23:45] sshd: Accepted password for admin from 192.168.1.50
[2024-01-15 10:24:12] sshd: session opened for user admin
[2024-01-15 10:30:00] sshd: session closed for user admin`,
              metadata: {
                ...DEFAULT_FILE_METADATA,
                owner: 'root',
                group: 'adm',
                permissions: '0640',
                size: 198,
              },
            },
          },
        },
      },
    },
    '/etc': {
      type: 'directory',
      name: 'etc',
      metadata: {
        permissions: '0755',
        owner: 'root',
        group: 'root',
      },
      children: {
        'passwd': {
          type: 'file',
          name: 'passwd',
          content: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
admin:x:1000:1000:Administrator:/home/admin:/bin/bash
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin`,
          metadata: {
            ...DEFAULT_FILE_METADATA,
            owner: 'root',
            group: 'root',
            permissions: '0644',
            size: 156,
          },
        },
        'hostname': {
          type: 'file',
          name: 'hostname',
          content: `server-01`,
          metadata: {
            ...DEFAULT_FILE_METADATA,
            owner: 'root',
            group: 'root',
            permissions: '0644',
            size: 9,
          },
        },
      },
    },
    '/tmp': {
      type: 'directory',
      name: 'tmp',
      metadata: {
        permissions: '1777',
        owner: 'root',
        group: 'root',
      },
      children: {},
    },
    '/root': {
      type: 'directory',
      name: 'root',
      metadata: {
        permissions: '0700',
        owner: 'root',
        group: 'root',
      },
      children: {
        '.bash_history': {
          type: 'file',
          name: '.bash_history',
          content: `whoami
hostname
ifconfig
exit`,
          metadata: {
            ...DEFAULT_FILE_METADATA,
            owner: 'root',
            group: 'root',
            permissions: '0600',
            size: 32,
          },
        },
      },
    },
  };
  
  return fs as FileSystem;
}

/**
 * File system for server-02
 * Database server with realistic Linux structure
 */
export function createServer02FileSystem(): FileSystem {
  const fs: ExtendedFileSystem = {
    '/': {
      type: 'directory',
      name: 'root',
      metadata: {
        permissions: '0755',
        owner: 'root',
        group: 'root',
      },
    },
    '/home': {
      type: 'directory',
      name: 'home',
      metadata: {
        permissions: '0755',
        owner: 'root',
        group: 'root',
      },
      children: {
        'admin': {
          type: 'directory',
          name: 'admin',
          metadata: USER_HOME_METADATA,
          children: {
            '.bash_history': {
              type: 'file',
              name: '.bash_history',
              content: `cd /var/lib/mysql
mysql -u admin
show databases;
exit`,
              metadata: {
                ...DEFAULT_FILE_METADATA,
                owner: 'admin',
                group: 'admin',
                permissions: '0600',
                size: 52,
              },
            },
            'Desktop': {
              type: 'directory',
              name: 'Desktop',
              metadata: {
                ...USER_HOME_METADATA,
                permissions: '0755',
              },
              children: {},
            },
          },
        },
      },
    },
    '/home/admin/database': {
      type: 'directory',
      name: 'database',
      metadata: {
        permissions: '0750',
        owner: 'admin',
        group: 'admin',
      },
      children: {
        'customers': {
          type: 'directory',
          name: 'customers',
          metadata: {
            permissions: '0750',
            owner: 'admin',
            group: 'admin',
          },
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
              metadata: {
                ...DEFAULT_FILE_METADATA,
                owner: 'admin',
                group: 'admin',
                permissions: '0640',
                size: 356,
              },
            },
          },
        },
        'reports': {
          type: 'directory',
          name: 'reports',
          metadata: {
            permissions: '0750',
            owner: 'admin',
            group: 'admin',
          },
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
              metadata: {
                ...DEFAULT_FILE_METADATA,
                owner: 'admin',
                group: 'admin',
                permissions: '0640',
                size: 387,
              },
            },
          },
        },
        'README.txt': {
          type: 'file',
          name: 'README.txt',
          content: `Server-02 Database Structure

This server contains database files organized in subdirectories:
- /home/admin/database/customers/ - Customer data files
- /home/admin/database/reports/ - Financial and operational reports

Important files are located in these directories.`,
          metadata: {
            ...DEFAULT_FILE_METADATA,
            owner: 'admin',
            group: 'admin',
            permissions: '0644',
            size: 289,
          },
        },
      },
    },
    '/var': {
      type: 'directory',
      name: 'var',
      metadata: {
        permissions: '0755',
        owner: 'root',
        group: 'root',
      },
      children: {
        'lib': {
          type: 'directory',
          name: 'lib',
          metadata: {
            permissions: '0755',
            owner: 'root',
            group: 'root',
          },
          children: {
            'mysql': {
              type: 'directory',
              name: 'mysql',
              metadata: {
                permissions: '0755',
                owner: 'mysql',
                group: 'mysql',
              },
              children: {},
            },
          },
        },
        'log': {
          type: 'directory',
          name: 'log',
          metadata: {
            permissions: '0755',
            owner: 'root',
            group: 'root',
          },
          children: {
            'mysql': {
              type: 'directory',
              name: 'mysql',
              metadata: {
                permissions: '0755',
                owner: 'mysql',
                group: 'mysql',
              },
              children: {
                'error.log': {
                  type: 'file',
                  name: 'error.log',
                  content: `[2024-01-20 00:00:00] MySQL started
[2024-01-20 14:16:45] Connection from admin@localhost
[2024-01-20 14:17:12] Query: SELECT * FROM customers LIMIT 10
[2024-01-20 14:18:30] Query: SELECT * FROM financial_reports WHERE quarter='Q4'`,
                  metadata: {
                    ...DEFAULT_FILE_METADATA,
                    owner: 'mysql',
                    group: 'mysql',
                    permissions: '0640',
                    size: 287,
                  },
                },
              },
            },
            'auth.log': {
              type: 'file',
              name: 'auth.log',
              content: `[2024-01-20 14:15:30] sshd: Accepted password for admin from 192.168.1.150
[2024-01-20 14:16:45] sshd: session opened for user admin
[2024-01-20 14:30:00] sshd: session closed for user admin`,
              metadata: {
                ...DEFAULT_FILE_METADATA,
                owner: 'root',
                group: 'adm',
                permissions: '0640',
                size: 205,
              },
            },
          },
        },
      },
    },
    '/etc': {
      type: 'directory',
      name: 'etc',
      metadata: {
        permissions: '0755',
        owner: 'root',
        group: 'root',
      },
      children: {
        'passwd': {
          type: 'file',
          name: 'passwd',
          content: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
admin:x:1000:1000:Administrator:/home/admin:/bin/bash
mysql:x:103:106:MySQL Server:/var/lib/mysql:/bin/false`,
          metadata: {
            ...DEFAULT_FILE_METADATA,
            owner: 'root',
            group: 'root',
            permissions: '0644',
            size: 185,
          },
        },
        'hostname': {
          type: 'file',
          name: 'hostname',
          content: `server-02`,
          metadata: {
            ...DEFAULT_FILE_METADATA,
            owner: 'root',
            group: 'root',
            permissions: '0644',
            size: 9,
          },
        },
      },
    },
    '/tmp': {
      type: 'directory',
      name: 'tmp',
      metadata: {
        permissions: '1777',
        owner: 'root',
        group: 'root',
      },
      children: {},
    },
    '/root': {
      type: 'directory',
      name: 'root',
      metadata: {
        permissions: '0700',
        owner: 'root',
        group: 'root',
      },
      children: {},
    },
  };
  
  return fs as FileSystem;
}

/**
 * Get file system for a specific server
 * First checks world registry for host file system factory,
 * then falls back to hardcoded systems
 */
export function getServerFileSystem(serverId: string): FileSystem | null {
  // Try to get file system from world registry first
  // Note: Dynamic import is handled in host entities' fileSystemFactory
  // For now, we fall through to hardcoded systems which are called via fileSystemFactory
  
  // Fall back to hardcoded systems (mapped by serverId or fileSystemId)
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
 * Players start in their home directory (/home/<username>) when SSH'ing in
 * This forces realistic navigation - they must explore to find files
 * 
 * @param serverId Server identifier
 * @param username Username (from credentials)
 * @returns Home directory path
 */
export function getServerHomeDirectory(serverId: string, username?: string): string {
  // Realistic behavior: SSH users start in their home directory
  // Default to 'admin' if username not provided (most servers use admin account)
  const actualUsername = username || 'admin';
  return `/home/${actualUsername}`;
}

