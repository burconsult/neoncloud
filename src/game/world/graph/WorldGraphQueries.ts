/**
 * World Graph Query Helpers
 * High-level query functions that abstract graph traversal
 * These make it easy to find related assets without hardcoding IDs
 */

import { worldGraph } from './WorldGraph';
import { worldRegistry } from '../registry/WorldRegistry';
import { missionRegistry } from '../../missions/MissionModule';
import { MissionModule } from '../../missions/MissionModule';
import { Email } from '@/types/email';
import { ToolModule } from '../../tools/ToolModule';
import { toolRegistry } from '../../tools/ToolModule';

/**
 * Get all hosts targeted by a mission
 * Queries the world graph through mission's worldGraph.targetHostIds
 */
export function getMissionTargetHosts(missionId: string): string[] {
  const mission = missionRegistry.get(missionId);
  if (!mission?.worldGraph?.targetHostIds) {
    return [];
  }
  return mission.worldGraph.targetHostIds;
}

/**
 * Get the client organization for a mission
 * Returns the organization that provides/contracts the mission
 */
export function getMissionClientOrganization(missionId: string): string | null {
  const mission = missionRegistry.get(missionId);
  return mission?.worldGraph?.clientOrganizationId || null;
}

/**
 * Get all organizations targeted by a mission
 */
export function getMissionTargetOrganizations(missionId: string): string[] {
  const mission = missionRegistry.get(missionId);
  if (!mission?.worldGraph?.targetOrganizationIds) {
    return [];
  }
  return mission.worldGraph.targetOrganizationIds;
}

/**
 * Get the contact who briefs the player for a mission
 */
export function getMissionContact(missionId: string): string | null {
  const mission = missionRegistry.get(missionId);
  return mission?.worldGraph?.contactId || null;
}

/**
 * Get all missions that target a specific host
 */
export function getMissionsByHost(hostId: string): MissionModule[] {
  return missionRegistry.getAll().filter(mission => 
    mission.worldGraph?.targetHostIds?.includes(hostId)
  );
}

/**
 * Get all missions that target a specific organization
 */
export function getMissionsByOrganization(orgId: string): MissionModule[] {
  return missionRegistry.getAll().filter(mission => 
    mission.worldGraph?.targetOrganizationIds?.includes(orgId) ||
    mission.worldGraph?.clientOrganizationId === orgId
  );
}

/**
 * Get all missions that require a specific tool
 */
export function getMissionsByTool(toolId: string): MissionModule[] {
  return missionRegistry.getAll().filter(mission => 
    mission.requiredSoftware?.includes(toolId)
  );
}

/**
 * Get all emails related to a mission
 * Currently emails are stored in MissionModule.startEmails/completionEmails
 * Future: emails could be registered in world registry
 */
export function getEmailsByMission(missionId: string): Email[] {
  const mission = missionRegistry.get(missionId);
  if (!mission) return [];
  
  const emails: Email[] = [];
  if (mission.startEmails) emails.push(...mission.startEmails);
  if (mission.completionEmails) emails.push(...mission.completionEmails);
  
  return emails;
}

/**
 * Get all emails that mention a specific host
 */
export function getEmailsByHost(hostId: string): Email[] {
  const allMissions = missionRegistry.getAll();
  const emails: Email[] = [];
  
  allMissions.forEach(mission => {
    if (mission.worldGraph?.targetHostIds?.includes(hostId)) {
      if (mission.startEmails) emails.push(...mission.startEmails);
      if (mission.completionEmails) emails.push(...mission.completionEmails);
    }
  });
  
  // Also check email worldGraph relationships
  allMissions.forEach(mission => {
    [...(mission.startEmails || []), ...(mission.completionEmails || [])].forEach(email => {
      if (email.worldGraph?.relatedHostIds?.includes(hostId)) {
        if (!emails.find(e => e.id === email.id)) {
          emails.push(email);
        }
      }
    });
  });
  
  return emails;
}

/**
 * Get all emails from a specific contact
 */
export function getEmailsByContact(contactId: string): Email[] {
  const allMissions = missionRegistry.getAll();
  const emails: Email[] = [];
  
  allMissions.forEach(mission => {
    [...(mission.startEmails || []), ...(mission.completionEmails || [])].forEach(email => {
      if (email.worldGraph?.fromContactId === contactId) {
        if (!emails.find(e => e.id === email.id)) {
          emails.push(email);
        }
      }
    });
  });
  
  return emails;
}

/**
 * Get all tools sold by a vendor
 * Queries through Organization.vendorInfo.toolIds
 */
export function getToolsByVendor(vendorId: string): ToolModule[] {
  const org = worldRegistry.getOrganization(vendorId);
  if (!org?.vendorInfo?.toolIds) {
    return [];
  }
  
  return org.vendorInfo.toolIds
    .map(toolId => toolRegistry.get(toolId))
    .filter((tool): tool is ToolModule => tool !== undefined);
}

/**
 * Get the vendor that sells a specific tool
 */
export function getVendorByTool(toolId: string): string | null {
  const tool = toolRegistry.get(toolId);
  return tool?.vendorId || null;
}

/**
 * Get all tools required by a mission
 */
export function getToolsByMission(missionId: string): ToolModule[] {
  const mission = missionRegistry.get(missionId);
  if (!mission?.requiredSoftware) {
    return [];
  }
  
  return mission.requiredSoftware
    .map(softwareId => {
      // Find tool module by software ID
      return toolRegistry.getBySoftwareId(softwareId);
    })
    .filter((tool): tool is ToolModule => tool !== undefined);
}

/**
 * Get display name for a host (with fallback)
 */
export function getHostDisplayName(hostId: string): string {
  const host = worldRegistry.getHost(hostId);
  return host?.displayName || hostId;
}

/**
 * Get display name for an organization (with fallback)
 */
export function getOrganizationDisplayName(orgId: string): string {
  const org = worldRegistry.getOrganization(orgId);
  return org?.displayName || orgId;
}

/**
 * Get display name for a contact (with fallback)
 */
export function getContactDisplayName(contactId: string): string {
  const contact = worldRegistry.getContact(contactId);
  return contact?.displayName || contactId;
}

