/**
 * Server-02 Host
 * Second training server for data extraction mission (n00b-02)
 */

import { Host } from '../../types/Host';
import { FileSystem } from '@/types';
import { ExtendedFileSystem, DEFAULT_FILE_METADATA, USER_HOME_METADATA } from '../../../filesystem/types';

/**
 * Create file system for server-02
 * Database server with realistic Linux tree structure with / as system root
 */
function createServer02FileSystem(): FileSystem {
  const now = Date.now();
  const fs: ExtendedFileSystem = {
    '/': {
      type: 'directory',
      name: 'root',
      metadata: {
        permissions: '0755',
        owner: 'root',
        group: 'root',
        modified: now,
      },
      children: {
        'home': {
          type: 'directory',
          name: 'home',
          metadata: {
            permissions: '0755',
            owner: 'root',
            group: 'root',
            modified: now,
          },
          children: {
            'admin': {
              type: 'directory',
              name: 'admin',
              metadata: { ...USER_HOME_METADATA, owner: 'admin', group: 'admin', modified: now },
              children: {
                'database': {
                  type: 'directory',
                  name: 'database',
                  metadata: {
                    permissions: '0750',
                    owner: 'admin',
                    group: 'admin',
                    modified: now,
                  },
                  children: {
                    'customers': {
                      type: 'directory',
                      name: 'customers',
                      metadata: {
                        permissions: '0750',
                        owner: 'admin',
                        group: 'admin',
                        modified: now,
                      },
                      children: {
                        'customer-data.txt': {
                          type: 'file',
                          name: 'customer-data.txt',
                          content: `CUSTOMER DATABASE - EXTRACTED

Mission Objective: Extract this file

This file contains customer information from the Megacorp database.
The data has been successfully retrieved.

Customer Records:
- Total customers: 1,234
- Active subscriptions: 856
- Revenue data: Classified

Remember to cover your tracks after extraction.`,
                          metadata: {
                            ...DEFAULT_FILE_METADATA,
                            owner: 'admin',
                            group: 'admin',
                            permissions: '0640',
                            size: 356,
                            modified: now,
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
                        modified: now,
                      },
                      children: {
                        'financial-report.txt': {
                          type: 'file',
                          name: 'financial-report.txt',
                          content: `FINANCIAL REPORT - CLASSIFIED

Mission Objective: Extract this file

This file contains financial data from Megacorp's database.
The report has been successfully retrieved.

Financial Summary:
- Q1 Revenue: $2.5M
- Q2 Revenue: $3.1M
- Q3 Revenue: $3.8M
- Total Assets: $15.2M

This data is highly sensitive. Handle with care.`,
                          metadata: {
                            ...DEFAULT_FILE_METADATA,
                            owner: 'admin',
                            group: 'admin',
                            permissions: '0640',
                            size: 387,
                            modified: now,
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
                        modified: now,
                      },
                    },
                  },
                },
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
                    modified: now,
                  },
                },
                'Desktop': {
                  type: 'directory',
                  name: 'Desktop',
                  metadata: {
                    ...USER_HOME_METADATA,
                    permissions: '0755',
                    modified: now,
                  },
                  children: {},
                },
              },
            },
          },
        },
        'var': {
          type: 'directory',
          name: 'var',
          metadata: {
            permissions: '0755',
            owner: 'root',
            group: 'root',
            modified: now,
          },
          children: {
            'lib': {
              type: 'directory',
              name: 'lib',
              metadata: {
                permissions: '0755',
                owner: 'root',
                group: 'root',
                modified: now,
              },
              children: {
                'mysql': {
                  type: 'directory',
                  name: 'mysql',
                  metadata: {
                    permissions: '0755',
                    owner: 'mysql',
                    group: 'mysql',
                    modified: now,
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
                group: 'syslog',
                modified: now,
              },
              children: {
                'auth.log': {
                  type: 'file',
                  name: 'auth.log',
                  content: `[2024-01-20 14:15:30] sshd: Accepted password for admin from 192.168.1.150
[2024-01-20 14:16:45] sshd: session opened for user admin
[2024-01-20 14:17:12] sshd: File access: /home/admin/database/customers/customer-data.txt
[2024-01-20 14:18:30] sshd: File access: /home/admin/database/reports/financial-report.txt
[2024-01-20 14:30:00] sshd: session closed for user admin`,
                  metadata: {
                    ...DEFAULT_FILE_METADATA,
                    owner: 'root',
                    group: 'adm',
                    permissions: '0640',
                    size: 400,
                    modified: now,
                  },
                },
                'mysql': {
                  type: 'directory',
                  name: 'mysql',
                  metadata: {
                    permissions: '0750',
                    owner: 'mysql',
                    group: 'adm',
                    modified: now,
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
                        modified: now,
                      },
                    },
                    'access.log': {
                      type: 'file',
                      name: 'access.log',
                      content: `[2024-01-20 14:15:30] SSH connection from 192.168.1.150
[2024-01-20 14:16:45] User login: admin
[2024-01-20 14:17:12] Database query: SELECT * FROM customers
[2024-01-20 14:18:30] File access: /home/admin/database/customers/customer-data.txt
[2024-01-20 14:19:15] File access: /home/admin/database/reports/financial-report.txt`,
                      metadata: {
                        ...DEFAULT_FILE_METADATA,
                        owner: 'mysql',
                        group: 'mysql',
                        permissions: '0640',
                        size: 800,
                        modified: now,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        'etc': {
          type: 'directory',
          name: 'etc',
          metadata: {
            permissions: '0755',
            owner: 'root',
            group: 'root',
            modified: now,
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
                modified: now,
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
                modified: now,
              },
            },
            'mysql': {
              type: 'directory',
              name: 'mysql',
              metadata: {
                permissions: '0755',
                owner: 'root',
                group: 'root',
                modified: now,
              },
              children: {
                'my.cnf': {
                  type: 'file',
                  name: 'my.cnf',
                  content: `[mysqld]
port=3306
bind-address=127.0.0.1
datadir=/var/lib/mysql
log-error=/var/log/mysql/error.log`,
                  metadata: {
                    ...DEFAULT_FILE_METADATA,
                    owner: 'root',
                    group: 'root',
                    permissions: '0644',
                    size: 60,
                    modified: now,
                  },
                },
              },
            },
          },
        },
        'bin': {
          type: 'directory',
          name: 'bin',
          metadata: {
            permissions: '0755',
            owner: 'root',
            group: 'root',
            modified: now,
          },
          children: {
            'bash': {
              type: 'file',
              name: 'bash',
              content: '#!/bin/bash\n# Bash shell executable',
              metadata: {
                ...DEFAULT_FILE_METADATA,
                owner: 'root',
                group: 'root',
                permissions: '0755',
                size: 28,
                executable: true,
                modified: now,
              },
            },
            'mysql': {
              type: 'file',
              name: 'mysql',
              content: '#!/bin/bash\n# MySQL client executable',
              metadata: {
                ...DEFAULT_FILE_METADATA,
                owner: 'root',
                group: 'root',
                permissions: '0755',
                size: 35,
                executable: true,
                modified: now,
              },
            },
          },
        },
        'usr': {
          type: 'directory',
          name: 'usr',
          metadata: {
            permissions: '0755',
            owner: 'root',
            group: 'root',
            modified: now,
          },
          children: {
            'bin': {
              type: 'directory',
              name: 'bin',
              metadata: {
                permissions: '0755',
                owner: 'root',
                group: 'root',
                modified: now,
              },
              children: {},
            },
            'sbin': {
              type: 'directory',
              name: 'sbin',
              metadata: {
                permissions: '0755',
                owner: 'root',
                group: 'root',
                modified: now,
              },
              children: {},
            },
          },
        },
        'tmp': {
          type: 'directory',
          name: 'tmp',
          metadata: {
            permissions: '1777',
            owner: 'root',
            group: 'root',
            modified: now,
          },
          children: {},
        },
        'root': {
          type: 'directory',
          name: 'root',
          metadata: {
            permissions: '0700',
            owner: 'root',
            group: 'root',
            modified: now,
          },
          children: {
            'README.txt': {
              type: 'file',
              name: 'README.txt',
              content: 'This is the root directory. Access is restricted.',
              metadata: {
                ...DEFAULT_FILE_METADATA,
                owner: 'root',
                group: 'root',
                permissions: '0600',
                size: 50,
                modified: now,
              },
            },
          },
        },
      },
    },
  };
  
  return fs as FileSystem;
}

export const server02Host: Host = {
  id: 'server-02',
  name: 'server-02',
  displayName: 'Server-02',
  
  // Network Identity
  ipAddress: '192.168.1.101',
  domainName: 'server-02.megacorp.local',
  macAddress: '00:1B:44:11:3A:B8',
  
  // DNS Records
  dnsRecords: {
    A: ['192.168.1.101'],
    AAAA: [],
    CNAME: [],
    MX: [],
    TXT: ['v=spf1 include:_spf.megacorp.local'],
  },
  
  // Organization Relationship
  organizationId: 'megacorp',
  role: 'database-server',
  
  // Security Configuration
  security: {
    sshPort: 22,
    sshEnabled: true,
    firewallRules: ['allow-ssh-from-internal', 'restrict-external-access'],
    encryptionLevel: 'enhanced',
    hasIntrusionDetection: false,
    passwordPolicy: 'medium',
    allowedProtocols: ['ssh', 'https'],
    requiresFirewallBypass: false, // Can be enhanced in future missions
  },
  
  // Credentials (for missions)
  credentials: {
    username: 'admin',
    password: 'cyberpass456',
    requiresCracking: true,
  },
  
  // File System - Defined directly in host entity
  fileSystemId: 'server-02',
  fileSystemFactory: createServer02FileSystem,
  
  // Network Topology
  networkConnections: [
    { hostId: 'megacorp-gateway', protocol: 'ssh', port: 22 },
  ],
  networkSegment: 'megacorp-internal',
  
  // Discovery
  discoveryMethods: ['mission'], // Discovered through mission briefing
  discoveryDifficulty: 'easy',
  
  // Metadata
  description: 'Database server for Megacorp - Contains customer and financial data',
  tags: ['database-server', 'linux', 'megacorp', 'training'],
  location: 'data-center-1',
  isOnline: true,
  baseLatency: 12, // Slightly higher latency than server-01
};
