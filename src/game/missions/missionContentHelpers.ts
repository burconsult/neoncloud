/**
 * Mission Content Helpers
 * Functions to generate dynamic mission content from world graph
 * These helpers ensure mission descriptions, objectives, and hints use graph data
 */

import { getHostDisplayName, getOrganizationDisplayName, getMissionTargetHosts, getMissionTargetOrganizations } from '../world/graph/WorldGraphQueries';
import { worldRegistry } from '../world/registry/WorldRegistry';

/**
 * Get dynamic mission title using target host display name
 */
export function getMissionTitle(missionId: string, baseTitle: string): string {
  const targetHosts = getMissionTargetHosts(missionId);
  if (targetHosts.length > 0) {
    const hostName = getHostDisplayName(targetHosts[0]);
    // Replace hardcoded host IDs with display names
    return baseTitle
      .replace(/server-01/gi, hostName)
      .replace(/server-02/gi, hostName)
      .replace(/Server-01/gi, hostName)
      .replace(/Server-02/gi, hostName);
  }
  return baseTitle;
}

/**
 * Get dynamic mission description using graph data
 */
export function getMissionDescription(missionId: string, baseDescription: string): string {
  const targetHosts = getMissionTargetHosts(missionId);
  const targetOrgs = getMissionTargetOrganizations(missionId);
  
  let description = baseDescription;
  
  // Replace host IDs with display names
  targetHosts.forEach(hostId => {
    const hostName = getHostDisplayName(hostId);
    description = description.replace(new RegExp(hostId, 'gi'), hostName);
  });
  
  // Replace organization IDs with display names
  targetOrgs.forEach(orgId => {
    const orgName = getOrganizationDisplayName(orgId);
    description = description.replace(new RegExp(orgId, 'gi'), orgName);
    
    // Also replace common variations
    if (orgId === 'megacorp') {
      description = description.replace(/Megacorp/gi, orgName);
    }
  });
  
  return description;
}

/**
 * Get dynamic task objective using graph data
 */
export function getTaskObjective(missionId: string, baseObjective: string): string {
  const targetHosts = getMissionTargetHosts(missionId);
  const targetOrgs = getMissionTargetOrganizations(missionId);
  
  let objective = baseObjective;
  
  // Replace host IDs with display names
  targetHosts.forEach(hostId => {
    const hostName = getHostDisplayName(hostId);
    objective = objective.replace(new RegExp(hostId, 'gi'), hostName);
  });
  
  // Replace organization IDs with display names
  targetOrgs.forEach(orgId => {
    const orgName = getOrganizationDisplayName(orgId);
    objective = objective.replace(new RegExp(orgId, 'gi'), orgName);
    
    // Also replace common variations
    if (orgId === 'megacorp') {
      objective = objective.replace(/Megacorp/gi, orgName);
    }
  });
  
  // Replace IP ranges dynamically
  targetOrgs.forEach(orgId => {
    const org = worldRegistry.getOrganization(orgId);
    if (org?.ipRange) {
      objective = objective.replace(/192\.168\.1\.0\/24/gi, org.ipRange);
    }
  });
  
  return objective;
}

/**
 * Get dynamic task hints using graph data
 */
export function getTaskHints(missionId: string, baseHints: string[]): string[] {
  const targetHosts = getMissionTargetHosts(missionId);
  const targetOrgs = getMissionTargetOrganizations(missionId);
  
  return baseHints.map(hint => {
    let dynamicHint = hint;
    
    // Replace host IDs with display names
    targetHosts.forEach(hostId => {
      const hostName = getHostDisplayName(hostId);
      dynamicHint = dynamicHint.replace(new RegExp(hostId, 'gi'), hostName);
    });
    
    // Replace organization IDs with display names
    targetOrgs.forEach(orgId => {
      const orgName = getOrganizationDisplayName(orgId);
      dynamicHint = dynamicHint.replace(new RegExp(orgId, 'gi'), orgName);
      
      // Also replace common variations
      if (orgId === 'megacorp') {
        dynamicHint = dynamicHint.replace(/Megacorp/gi, orgName);
      }
      
      // Replace IP ranges dynamically
      const org = worldRegistry.getOrganization(orgId);
      if (org?.ipRange) {
        dynamicHint = dynamicHint.replace(/192\.168\.1\.0\/24/gi, org.ipRange);
      }
    });
    
    return dynamicHint;
  });
}

/**
 * Get dynamic task description using graph data
 */
export function getTaskDescription(missionId: string, baseDescription: string): string {
  const targetHosts = getMissionTargetHosts(missionId);
  const targetOrgs = getMissionTargetOrganizations(missionId);
  
  let description = baseDescription;
  
  // Replace host IDs with display names
  targetHosts.forEach(hostId => {
    const hostName = getHostDisplayName(hostId);
    description = description.replace(new RegExp(hostId, 'gi'), hostName);
  });
  
  // Replace organization IDs with display names
  targetOrgs.forEach(orgId => {
    const orgName = getOrganizationDisplayName(orgId);
    description = description.replace(new RegExp(orgId, 'gi'), orgName);
    
    // Also replace common variations
    if (orgId === 'megacorp') {
      description = description.replace(/Megacorp/gi, orgName);
    }
  });
  
  return description;
}

