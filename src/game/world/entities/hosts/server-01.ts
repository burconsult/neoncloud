/**
 * Server-01 Host
 * Training server for first hack mission (n00b-01)
 */

import { Host } from '../../types/Host';
import { FileSystem } from '@/types';
import { ExtendedFileSystem, DEFAULT_FILE_METADATA, USER_HOME_METADATA } from '../../../filesystem/types';

/**
 * Create file system for server-01
 * Realistic Linux-style tree structure with / as system root
 */
function createServer01FileSystem(): FileSystem {
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
                'data': {
                  type: 'directory',
                  name: 'data',
                  metadata: {
                    permissions: '0755',
                    owner: 'admin',
                    group: 'admin',
                    modified: now,
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
                        modified: now,
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
                        modified: now,
                      },
                    },
                  },
                },
                '.bash_history': {
                  type: 'file',
                  name: '.bash_history',
                  content: `cd /var/log
cat syslog
ls -la /home/admin/data
exit`,
                  metadata: {
                    ...DEFAULT_FILE_METADATA,
                    owner: 'admin',
                    group: 'admin',
                    permissions: '0600',
                    size: 45,
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
                    modified: now,
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
                    modified: now,
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
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin`,
              metadata: {
                ...DEFAULT_FILE_METADATA,
                owner: 'root',
                group: 'root',
                permissions: '0644',
                size: 156,
                modified: now,
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
                modified: now,
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
            'ls': {
              type: 'file',
              name: 'ls',
              content: '#!/bin/bash\n# List directory contents',
              metadata: {
                ...DEFAULT_FILE_METADATA,
                owner: 'root',
                group: 'root',
                permissions: '0755',
                size: 32,
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

export const server01Host: Host = {
  id: 'server-01',
  name: 'server-01',
  displayName: 'Server-01',
  
  // Network Identity
  ipAddress: '192.168.1.100',
  domainName: 'server-01.megacorp.local',
  macAddress: '00:1B:44:11:3A:B7',
  
  // DNS Records
  dnsRecords: {
    A: ['192.168.1.100'],
    AAAA: [],
    CNAME: [],
    MX: [],
    TXT: ['v=spf1 include:_spf.megacorp.local'],
  },
  
  // Organization Relationship
  organizationId: 'megacorp',
  role: 'web-server',
  
  // Security Configuration
  security: {
    sshPort: 22,
    sshEnabled: true,
    firewallRules: ['allow-ssh-from-internal'],
    encryptionLevel: 'standard',
    hasIntrusionDetection: false,
    passwordPolicy: 'basic',
    allowedProtocols: ['ssh', 'http', 'https'],
    requiresFirewallBypass: false, // Firewall disabled for training
  },
  
  // Credentials (for missions)
  credentials: {
    username: 'admin',
    password: 'cyberpass123',
    requiresCracking: true,
  },
  
  // File System - Defined directly in host entity
  fileSystemId: 'server-01',
  fileSystemFactory: createServer01FileSystem,
  
  // Network Topology
  networkConnections: [
    { hostId: 'megacorp-gateway', protocol: 'ssh', port: 22 },
  ],
  networkSegment: 'megacorp-internal',
  
  // Discovery
  discoveryMethods: ['mission'], // Discovered through mission briefing
  discoveryDifficulty: 'easy',
  
  // Metadata
  description: 'Primary web server for Megacorp internal network - Training target',
  tags: ['web-server', 'linux', 'megacorp', 'training'],
  location: 'data-center-1',
  isOnline: true,
  baseLatency: 10, // 10ms base latency for ping
};
