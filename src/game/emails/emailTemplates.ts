import { Email } from '@/types/email';

/**
 * Email templates for the game
 * These are sent automatically when missions start or conditions are met
 */

/**
 * Welcome email - sent when player starts the welcome mission
 */
export function createWelcomeEmail(): Email {
  return {
    id: 'email-welcome-001',
    from: 'recruitment@neoncloud-ops.org',
    to: 'agent@neoncloud.local',
    subject: 'Welcome to NeonCloud Special Cyberoperations Group',
    body: `Dear New Agent,

Welcome to NeonCloud Special Cyberoperations Group (NC-SCOG). We're excited to have you join our elite team of cybersecurity specialists.

You have been selected based on your exceptional potential and dedication to understanding network security. As a trainee agent, you will undertake a series of missions designed to hone your skills and prepare you for real-world operations.

**Your Mission:**
Your first task is to familiarize yourself with our systems and complete your basic training. Check your Documents folder for important files, and explore the terminal to get comfortable with our operations environment.

**What to Expect:**
- Training missions to build foundational skills
- Real-world scenarios to test your knowledge
- Access to tools and software as you progress
- Opportunities to earn NeonCoins (NC) for completed missions

**System Access:**
You now have access to:
- Terminal Interface (this system)
- Email System (type 'mail' to view emails)
- Software Store (type 'store' to browse)
- Mission Panel (left sidebar)

We've attached a welcome package to this email. Check your Documents folder after reading this message.

Welcome aboard, Agent. The digital world needs protectors like you.

Best regards,
NC-SCOG Recruitment Team
neoncloud-ops.org`,
    timestamp: Date.now(),
    read: false,
    attachments: [
      {
        filename: 'welcome-package.enc',
        encrypted: true,
        encryptedContent: `Xk9#mP2$vL8@qR4%tN7&wY3!jU6*eI1^zA5(bH9)cD0+dF8-gS2_hJ4=kM7{lK3}nB6|oC1~pQ9`,
        decryptedContent: `Welcome Package - NC-SCOG

This file contains no critical information, but you'll learn how to decrypt files in future missions.

Keep practicing your skills!`,
      },
    ],
    missionId: 'welcome-00',
  };
}

/**
 * First hack mission email - sent when n00b-01 mission starts
 */
export function createFirstHackEmail(): Email {
  return {
    id: 'email-first-hack-001',
    from: 'contracts@neoncloud-ops.org',
    to: 'agent@neoncloud.local',
    subject: 'Contract Assignment: Server-01 Penetration Test',
    body: `Agent,

We have a new contract assignment for you. A client has requested a penetration test on one of their internal servers. This is your first real operational mission.

**Target Information:**
- Server ID: server-01
- IP Address: 192.168.1.100
- Purpose: Internal file server
- Security Level: Basic

**Mission Objectives:**
1. Acquire necessary tools (VPN, Password Cracker) from the store
2. Connect to VPN for anonymity
3. Extract server credentials from the encrypted file attached to this email
4. Connect to server-01 using the extracted credentials
5. Access the target file located at /home/data/secret.txt
6. Disconnect and report back

**Important Notes:**
- Use VPN to protect your identity during this operation
- The attached file contains encrypted credentials - you'll need your password cracker tool
- Server access requires both username and password
- Always disconnect when your mission is complete

The encrypted credentials file is attached. Extract the password, then connect using:
  Username: admin
  Password: [extract from encrypted file]

Good luck, Agent. This is your chance to prove your capabilities.

NC-SCOG Operations
contracts@neoncloud-ops.org`,
    timestamp: Date.now(),
    read: false,
    attachments: [
      {
        filename: 'server-01-credentials.enc',
        encrypted: true,
        encryptedContent: `V7#kM9$pL2@qW4%rT6&yU8!iO1*zA3(eR5)fH7+gJ9-hK2_iN4=lO6{mP8}nQ1|sB3~tD5`,
        // decryptedContent is set after decryption, not before
        password: 'neonpass123',
      },
    ],
    missionId: 'n00b-01',
  };
}

/**
 * Data extraction mission email - sent when n00b-02 mission starts
 */
export function createDataExtractionEmail(): Email {
  return {
    id: 'email-data-extraction-001',
    from: 'contracts@neoncloud-ops.org',
    to: 'agent@neoncloud.local',
    subject: 'Contract Assignment: Server-02 Data Extraction',
    body: `Agent,

Excellent work on your previous mission. We have a more complex assignment for you.

**Target Information:**
- Server ID: server-02
- IP Address: 192.168.1.200
- Purpose: Database server
- Security Level: Enhanced

**Mission Objectives:**
1. Connect to VPN for anonymity
2. Extract server credentials from the encrypted file attached
3. Connect to server-02 using the extracted credentials
4. Locate and extract target data files:
   - customer-data.txt in /home/database/customers/
   - financial-report.txt in /home/database/reports/
5. Use Log Shredder to delete access logs and cover your tracks
6. Disconnect and report back

**Important Notes:**
- This server has enhanced security - be thorough
- Multiple files need to be extracted - check different directories
- Access logs are located in /home/logs/access.log - delete them after extraction
- You'll need a Log Shredder tool (available in store after completing n00b-01)

The encrypted credentials file is attached. Extract the password, then connect using:
  Username: admin
  Password: [extract from encrypted file]

This mission requires careful planning and multiple tools. Good luck.

NC-SCOG Operations
contracts@neoncloud-ops.org`,
    timestamp: Date.now(),
    read: false,
    attachments: [
      {
        filename: 'server-02-credentials.enc',
        encrypted: true,
        encryptedContent: `M8#nP4$wK9@rL2%tM6&xY1!jV7*oZ3^eB5(cF8)dH2+eI9-fJ4_gN6=hO7{kP3}qR8|sT1~uW4`,
        password: 'cyberpass456',
        // decryptedContent is set after decryption, not before
      },
    ],
    missionId: 'n00b-02',
  };
}

/**
 * Initialize default emails
 */
export function initializeDefaultEmails(): Email[] {
  return [
    createWelcomeEmail(),
  ];
}

