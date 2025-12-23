# World Graph Future-Proofing Plan

## Overview

This document outlines how to prepare the world graph for future features like phishing emails, social engineering, credential extraction, and other advanced gameplay mechanics.

## Current State Analysis

### ✅ Well-Prepared For
- Adding new organizations
- Adding new hosts
- Adding new missions
- Adding new tools
- Basic email receiving

### ⚠️ Needs Extension For
- Email sending
- Phishing/social engineering
- Credential extraction
- Contact interaction
- Dynamic content generation
- Multi-step social engineering chains

## Required Extensions

### 1. Contact Type Extensions

```typescript
// src/game/world/types/Contact.ts
export interface Contact {
  // ... existing fields
  
  // Communication Capabilities
  canReceiveEmails?: boolean;        // Can player send emails to this contact?
  canBePhished?: boolean;            // Vulnerable to phishing?
  canBeSocialEngineered?: boolean;   // Vulnerable to social engineering?
  securityAwareness?: 'low' | 'medium' | 'high';
  
  // Response Behavior
  responseTime?: number;              // Hours to respond (default: 24)
  responseChance?: number;            // 0-1 probability of responding
  responseQuality?: 'helpful' | 'neutral' | 'suspicious';
  
  // Relationship Tracking
  emailsReceived?: string[];         // Email IDs sent to this contact
  emailsSent?: string[];             // Email IDs sent by this contact
  credentialsExtracted?: string[];   // Credential IDs extracted from this contact
  trustLevel?: number;                // 0-1, how much contact trusts player
}
```

### 2. Email Type Extensions

```typescript
// src/types/email.ts
export interface Email {
  // ... existing fields
  
  // Email Direction
  direction: 'incoming' | 'outgoing'; // NEW
  to?: string;                         // Contact ID (for outgoing)
  from?: string;                       // Contact ID or 'player' (for incoming)
  
  // Email Type
  type?: 'normal' | 'phishing' | 'social-engineering' | 'malware';
  quality?: number;                    // 0-1, how convincing (for phishing)
  templateId?: string;                 // Template used to generate email
  
  // Response Tracking
  responseReceived?: boolean;
  responseTime?: number;               // Hours until response
  responseEmailId?: string;            // ID of response email
  
  // Credential Extraction
  extractedCredentials?: {
    username?: string;
    password?: string;
    apiKey?: string;
    other?: Record<string, string>;
  };
  
  // Attachments (extend existing)
  attachments?: EmailAttachment[];
  attachmentType?: 'credential-file' | 'malware' | 'document';
}
```

### 3. New Systems Needed

#### A. Email Sending System
```typescript
// src/game/emails/emailSendingSystem.ts
export class EmailSendingSystem {
  async sendEmail(
    templateId: string,
    toContactId: string,
    context?: Record<string, any>
  ): Promise<Email> {
    // 1. Validate contact can receive emails
    // 2. Load template
    // 3. Render template with context
    // 4. Create email
    // 5. Add to contact's inbox
    // 6. Emit event
    // 7. Schedule response (if applicable)
  }
}
```

#### B. Email Response System
```typescript
// src/game/emails/emailResponseSystem.ts
export class EmailResponseSystem {
  async scheduleResponse(
    email: Email,
    contact: Contact
  ): Promise<void> {
    // Calculate response time
    // Determine response type
    // Schedule response email
    // Update contact trust level
  }
  
  async processPhishingResponse(
    email: Email,
    contact: Contact
  ): Promise<EmailResponse> {
    // Calculate success based on:
    // - Contact security awareness
    // - Email quality
    // - Contact trust level
    // - Mission difficulty
  }
}
```

#### C. Credential Extraction System
```typescript
// src/game/credentials/credentialSystem.ts
export interface Credential {
  id: string;
  type: 'username-password' | 'api-key' | 'ssh-key' | 'token';
  username?: string;
  password?: string;
  value?: string; // For API keys, tokens, etc.
  extractedFrom: string; // Contact ID
  extractedVia: 'phishing' | 'social-engineering' | 'malware' | 'mission';
  extractedAt: number; // Timestamp
  validFor?: string[]; // Host IDs this credential works for
}

export class CredentialSystem {
  extractCredentials(
    email: Email,
    contact: Contact
  ): Credential[] {
    // Parse email response
    // Extract credentials based on email type
    // Create credential objects
    // Store in credential store
    // Update contact relationship
  }
}
```

### 4. Relationship Type Extensions

```typescript
// src/game/world/graph/WorldGraph.ts
export type RelationshipType =
  // Existing
  | 'owns'
  | 'employs'
  | 'targets'
  | 'requires'
  | 'unlocks'
  | 'sells'
  | 'connects'
  | 'sends'
  | 'mentions'
  
  // NEW: Communication
  | 'sends-email-to'      // Player/Contact → Contact
  | 'receives-email-from'  // Contact ← Player/Contact
  | 'phishes'              // Player → Contact (phishing attempt)
  | 'social-engineers'      // Player → Contact (social engineering)
  
  // NEW: Credentials
  | 'extracts-credentials-from' // Player → Contact
  | 'credentials-valid-for'      // Credential → Host
  
  // NEW: Trust/Reputation
  | 'trusts'               // Contact → Player (trust level)
  | 'has-reputation-with'  // Player → Organization
```

### 5. Mission Task Type Extensions

```typescript
// src/types/index.ts
export type TaskType =
  | 'command'      // Execute a command
  | 'learn'        // Learn something
  | 'wait'         // NEW: Wait for something (email response, etc.)
  | 'extract'      // NEW: Extract credentials/data
  | 'social-engineer'; // NEW: Social engineering task

export interface Task {
  // ... existing fields
  
  // NEW: For wait tasks
  waitFor?: 'email-response' | 'time' | 'event';
  waitDuration?: number; // Hours or seconds
  
  // NEW: For extract tasks
  extractType?: 'credentials' | 'data' | 'file';
  extractSource?: string; // Contact ID, Host ID, etc.
}
```

## Example: Phishing Mission Implementation

### Mission Definition

```typescript
// src/game/missions/modules/02_03_phishing.ts
export const phishingMissionModule: MissionModule = {
  missionId: 'n00b-03',
  
  mission: {
    id: 'n00b-03',
    title: 'Social Engineering: Phishing Attack',
    description: 'Use social engineering to extract credentials from a Megacorp executive',
    category: 'script-kiddie',
    tasks: [
      {
        id: 'task-1',
        description: 'Research Megacorp CEO contact information',
        type: 'command',
        objective: 'Use "whois megacorp.com" or check email headers',
        solution: 'whois megacorp.com',
      },
      {
        id: 'task-2',
        description: 'Craft phishing email',
        type: 'command',
        objective: 'Use "compose phishing-ceo megacorp-ceo"',
        solution: 'compose phishing-ceo megacorp-ceo',
      },
      {
        id: 'task-3',
        description: 'Send phishing email',
        type: 'command',
        objective: 'Send the crafted email',
        solution: 'send megacorp-ceo phishing-ceo',
      },
      {
        id: 'task-4',
        description: 'Wait for response',
        type: 'wait',
        waitFor: 'email-response',
        waitDuration: 24, // 24 hours
        objective: 'Wait for the CEO to respond to your phishing email',
      },
      {
        id: 'task-5',
        description: 'Extract credentials from response',
        type: 'extract',
        extractType: 'credentials',
        extractSource: 'megacorp-ceo',
        objective: 'Read the response email and extract credentials',
        solution: 'mail read <response-email-id>',
      },
      {
        id: 'task-6',
        description: 'Use extracted credentials',
        type: 'command',
        objective: 'Connect to server using extracted credentials',
        solution: 'connect server-03',
      },
    ],
  },
  
  // World Graph Relationships
  targetOrganizationIds: ['megacorp'],
  involvedContactIds: ['megacorp-ceo'], // Contact targeted for phishing
  requiredSoftware: ['email-composer'], // Future: tool for crafting emails
};
```

### New Contact Entity

```typescript
// src/game/world/entities/contacts/megacorp-ceo.ts
export const megacorpCEOContact: Contact = {
  id: 'megacorp-ceo',
  name: 'John Megacorp',
  displayName: 'John Megacorp',
  organizationId: 'megacorp',
  role: 'ceo',
  email: 'john.megacorp@megacorp.com',
  
  // Communication
  canContactPlayer: false,
  canReceiveEmails: true,
  canBePhished: true,
  canBeSocialEngineered: true,
  securityAwareness: 'low', // CEO is busy, less security-aware
  
  // Response behavior
  responseTime: 12, // Responds within 12 hours
  responseChance: 0.8, // 80% chance of responding
  responseQuality: 'helpful', // Tends to be helpful
  
  // Initial state
  trustLevel: 0.5, // Neutral trust
  emailsReceived: [],
  credentialsExtracted: [],
  
  missionIds: ['n00b-03'],
  discoveryMethod: 'dns-lookup', // Can discover via whois
  initialVisibility: 'hidden',
};
```

## Impact on Existing Systems

### Minimal Impact ✅

- **World Registry**: No changes needed
- **World Graph**: Just add new query methods
- **Mission System**: Add new task types
- **Email Store**: Add sendEmail method

### New Systems Needed ⚠️

1. **Email Sending System** (new)
2. **Email Response System** (new)
3. **Credential System** (new)
4. **Email Template Engine** (new)
5. **Social Engineering System** (new, for future)

## Streamlining Recommendations

### 1. Unified Relationship Management

Instead of scattered relationship properties, use a central registry:

```typescript
// src/game/world/graph/RelationshipRegistry.ts
export class RelationshipRegistry {
  addRelationship(
    from: string,
    type: RelationshipType,
    to: string,
    properties?: Record<string, any>
  ): void {
    // Store relationship
    // Update indexes
    // Emit event
  }
  
  getRelationships(
    from?: string,
    to?: string,
    type?: RelationshipType
  ): Relationship[] {
    // Query with filters
  }
}
```

### 2. Event-Driven Architecture

All entity changes emit events, relationships update automatically:

```typescript
// When email sent
eventBus.on('email:sent', ({ emailId, from, to }) => {
  relationshipRegistry.addRelationship(from, 'sends-email-to', to, { emailId });
});

// When credentials extracted
eventBus.on('credentials:extracted', ({ contactId, credentialId }) => {
  relationshipRegistry.addRelationship('player', 'extracts-credentials-from', contactId, { credentialId });
});
```

### 3. Template System

Dynamic content generation from templates:

```typescript
// src/game/emails/emailTemplates.ts
export interface EmailTemplate {
  id: string;
  type: 'phishing' | 'normal' | 'social-engineering';
  targetContactRole?: string;
  quality: number;
  content: (context: EmailContext) => string;
  attachments?: (context: EmailContext) => EmailAttachment[];
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'phishing-ceo',
    type: 'phishing',
    targetContactRole: 'ceo',
    quality: 0.7,
    content: (ctx) => `
Subject: Urgent: Account Verification Required

Dear ${ctx.contact.name},

We need to verify your account credentials immediately.
Please reply with your username and password.

IT Support
${ctx.organization.displayName}
    `,
  },
];
```

## Migration Path

### Phase 1: Extend Types (No Breaking Changes)
1. Add optional fields to Contact type
2. Add optional fields to Email type
3. Add new relationship types

### Phase 2: Add New Systems
1. Implement Email Sending System
2. Implement Email Response System
3. Implement Credential System

### Phase 3: Add Commands
1. Add `send` command
2. Add `compose` command
3. Update `mail` command to show sent emails

### Phase 4: Add Mission Support
1. Add new task types (`wait`, `extract`)
2. Add phishing mission
3. Add event handlers

## Benefits of This Approach

1. ✅ **Backward Compatible**: All new fields are optional
2. ✅ **Extensible**: Easy to add new email types, contact capabilities
3. ✅ **Maintainable**: Clear separation of concerns
4. ✅ **Testable**: Each system can be tested independently
5. ✅ **Scalable**: Can handle complex social engineering chains

## Conclusion

The current graph structure is **well-designed** and can handle phishing emails with **minimal changes**. The key is:

1. **Extend, don't replace** - Add optional fields
2. **Event-driven** - Let events update relationships
3. **Template-based** - Dynamic content generation
4. **Modular systems** - Separate concerns

All changes are **additive** - no breaking changes to existing code.

