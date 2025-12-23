/**
 * Server-01 Host
 * Training server for first hack mission (n00b-01)
 */

import { Host } from '../../types/Host';
import { FileSystem } from '@/types';
import { ExtendedFileSystem, DEFAULT_FILE_METADATA, USER_HOME_METADATA } from '../../../filesystem/types';

/**
 * Create file system for server-01
 * Realistic Linux-style structure with user home directories
 */
function createServer01FileSystem(): FileSystem {
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
            size: 250,
          },
        },
        'config.ini': {
          type: 'file',
          name: 'config.ini',
          content: `[server]
host=server-01
port=22
protocol=ssh
status=active`,
          metadata: {
            ...DEFAULT_FILE_METADATA,
            owner: 'admin',
            group: 'admin',
            permissions: '0644',
            size: 180,
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
            group: 'syslog',
          },
          children: {
            'syslog': {
              type: 'file',
              name: 'syslog',
              content: `[2024-01-15] System startup
[2024-01-15] SSH service started
[2024-01-15] Web server started on port 80`,
              metadata: {
                ...DEFAULT_FILE_METADATA,
                owner: 'root',
                group: 'adm',
                permissions: '0640',
                size: 1024,
              },
            },
            'auth.log': {
              type: 'file',
              name: 'auth.log',
              content: `[2024-01-15] SSH login attempt from 192.168.1.50
[2024-01-15] User admin logged in successfully`,
              metadata: {
                ...DEFAULT_FILE_METADATA,
                owner: 'root',
                group: 'adm',
                permissions: '0640',
                size: 512,
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

