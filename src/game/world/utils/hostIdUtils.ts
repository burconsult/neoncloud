/**
 * Host ID Utilities
 * Helper functions for working with hierarchical host IDs
 * 
 * Host ID Format: {org-id}-{host-name}
 * Examples: megacorp-server-01, neoncloud-dns-server
 */

/**
 * Extract organization ID from a hierarchical host ID
 * @param hostId - Host ID in format {org-id}-{host-name}
 * @returns Organization ID or null if invalid format
 */
export function extractOrgFromHostId(hostId: string): string | null {
  if (!hostId || !hostId.includes('-')) {
    return null;
  }
  const parts = hostId.split('-');
  return parts[0] || null;
}

/**
 * Extract host name from a hierarchical host ID
 * @param hostId - Host ID in format {org-id}-{host-name}
 * @returns Host name (everything after first hyphen) or null if invalid
 */
export function extractHostNameFromId(hostId: string): string | null {
  if (!hostId || !hostId.includes('-')) {
    return hostId; // Return as-is if no hyphen (e.g., 'localhost')
  }
  const firstHyphenIndex = hostId.indexOf('-');
  return hostId.substring(firstHyphenIndex + 1) || null;
}

/**
 * Build hierarchical host ID from organization and host name
 * @param orgId - Organization ID
 * @param hostName - Host name
 * @returns Hierarchical host ID
 */
export function buildHostId(orgId: string, hostName: string): string {
  return `${orgId}-${hostName}`;
}

/**
 * Extract host ID from credential filename
 * Supports both old format (server-01-credentials.enc) and new format (megacorp-server-01-credentials.enc)
 * @param filename - Credential filename
 * @returns Host ID or null if not found
 */
export function extractHostIdFromCredentialFilename(filename: string): string | null {
  // Pattern: {host-id}-credentials.enc
  // Matches: server-01-credentials.enc OR megacorp-server-01-credentials.enc
  const match = filename.match(/^(.+?)-credentials\.enc$/i);
  if (match && match[1]) {
    return match[1];
  }
  
  // Fallback: try to match any pattern with credentials in filename
  // Extract everything before "-credentials"
  const credentialsIndex = filename.toLowerCase().indexOf('-credentials');
  if (credentialsIndex > 0) {
    return filename.substring(0, credentialsIndex);
  }
  
  return null;
}

/**
 * Legacy ID mapping for backwards compatibility
 * Maps old host IDs to new hierarchical IDs
 */
const LEGACY_ID_MAP: Record<string, string> = {
  'server-01': 'megacorp-server-01',
  'server-02': 'megacorp-database-01',
};

/**
 * Resolve host ID - converts legacy IDs to new format if needed
 * @param hostId - Host ID (may be legacy or new format)
 * @returns Resolved host ID in new format
 */
export function resolveHostId(hostId: string): string {
  // If it's already in new format (contains org prefix), return as-is
  if (hostId.includes('-') && !LEGACY_ID_MAP[hostId]) {
    return hostId;
  }
  
  // Check legacy map
  if (LEGACY_ID_MAP[hostId]) {
    return LEGACY_ID_MAP[hostId];
  }
  
  // Return as-is (e.g., 'localhost')
  return hostId;
}

/**
 * Generate credential filename from host ID
 * @param hostId - Host ID
 * @returns Credential filename (e.g., megacorp-server-01-credentials.enc)
 */
export function generateCredentialFilename(hostId: string): string {
  return `${hostId}-credentials.enc`;
}

