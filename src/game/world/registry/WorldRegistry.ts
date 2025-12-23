/**
 * World Registry
 * 
 * Central registry for all world entities (hosts, organizations, contacts, vendors).
 * 
 * Stores entity BLUEPRINTS (definitions). These should be treated as read-only.
 * Game state (connections, discovered entities, file system contents) is stored
 * in separate Zustand stores, not in the registry.
 * 
 * Uses reverse indexes for O(1) lookups instead of O(n) iterations.
 */

import { Host } from '../types/Host';
import { Organization } from '../types/Organization';
import { Contact } from '../types/Contact';
import { Vendor } from '../types/Vendor';

export type EntityType = 'host' | 'organization' | 'contact' | 'vendor';
export type Entity = Host | Organization | Contact | Vendor;

export class WorldRegistry {
  private hosts: Map<string, Host> = new Map();
  private organizations: Map<string, Organization> = new Map();
  private contacts: Map<string, Contact> = new Map();
  private vendors: Map<string, Vendor> = new Map();

  // Reverse indexes for O(1) lookups
  private hostsByOrg: Map<string, Set<string>> = new Map();      // orgId -> Set<hostId>
  private hostsByIP: Map<string, string> = new Map();            // ip -> hostId
  private hostsByDomain: Map<string, string> = new Map();        // domain (lowercase) -> hostId
  private contactsByOrg: Map<string, Set<string>> = new Map();   // orgId -> Set<contactId>

  // Host management
  registerHost(host: Host): void {
    // Validate organization exists
    if (!this.organizations.has(host.organizationId)) {
      throw new Error(
        `Cannot register host ${host.id}: Organization ${host.organizationId} does not exist. ` +
        `Available organizations: ${Array.from(this.organizations.keys()).join(', ')}`
      );
    }

    // Remove from old indexes if overwriting
    if (this.hosts.has(host.id)) {
      console.warn(`Host ${host.id} is already registered. Overwriting...`);
      this.removeHostFromIndexes(host.id);
    }

    this.hosts.set(host.id, host);
    this.updateHostIndexes(host);
  }

  /**
   * Update reverse indexes for a host
   */
  private updateHostIndexes(host: Host): void {
    // Index by organization
    if (!this.hostsByOrg.has(host.organizationId)) {
      this.hostsByOrg.set(host.organizationId, new Set());
    }
    this.hostsByOrg.get(host.organizationId)!.add(host.id);

    // Index by IP
    if (host.ipAddress) {
      // Handle case where IP might be used by multiple hosts (unlikely but possible)
      if (this.hostsByIP.has(host.ipAddress) && this.hostsByIP.get(host.ipAddress) !== host.id) {
        console.warn(`IP ${host.ipAddress} is already indexed to another host. Overwriting...`);
      }
      this.hostsByIP.set(host.ipAddress, host.id);
    }

    // Index by domain (lowercase for case-insensitive lookup)
    if (host.domainName) {
      const domainKey = host.domainName.toLowerCase();
      if (this.hostsByDomain.has(domainKey) && this.hostsByDomain.get(domainKey) !== host.id) {
        console.warn(`Domain ${host.domainName} is already indexed to another host. Overwriting...`);
      }
      this.hostsByDomain.set(domainKey, host.id);
    }
  }

  /**
   * Remove host from reverse indexes
   */
  private removeHostFromIndexes(hostId: string): void {
    const host = this.hosts.get(hostId);
    if (!host) return;

    // Remove from org index
    const orgSet = this.hostsByOrg.get(host.organizationId);
    if (orgSet) {
      orgSet.delete(hostId);
      if (orgSet.size === 0) {
        this.hostsByOrg.delete(host.organizationId);
      }
    }

    // Remove from IP index
    if (host.ipAddress && this.hostsByIP.get(host.ipAddress) === hostId) {
      this.hostsByIP.delete(host.ipAddress);
    }

    // Remove from domain index
    if (host.domainName) {
      this.hostsByDomain.delete(host.domainName.toLowerCase());
    }
  }

  /**
   * Get hosts by organization using index (O(1) lookup + O(k) where k = hosts in org)
   */
  getHostsByOrganization(orgId: string): Host[] {
    const hostIds = this.hostsByOrg.get(orgId);
    if (!hostIds) return [];

    return Array.from(hostIds)
      .map(id => this.hosts.get(id))
      .filter((host): host is Host => host !== undefined);
  }

  getHost(id: string): Host | undefined {
    return this.hosts.get(id);
  }

  getAllHosts(): Host[] {
    return Array.from(this.hosts.values());
  }

  /**
   * Find host by IP using index (O(1) lookup)
   */
  findHostByIP(ip: string): Host | undefined {
    const hostId = this.hostsByIP.get(ip);
    return hostId ? this.hosts.get(hostId) : undefined;
  }

  /**
   * Find host by domain using index (O(1) lookup)
   */
  findHostByDomain(domain: string): Host | undefined {
    const hostId = this.hostsByDomain.get(domain.toLowerCase());
    return hostId ? this.hosts.get(hostId) : undefined;
  }

  // Organization management
  registerOrganization(org: Organization): void {
    if (this.organizations.has(org.id)) {
      console.warn(`Organization ${org.id} is already registered. Overwriting...`);
    }
    this.organizations.set(org.id, org);
    
    // If it's a vendor, also register in vendors
    if (org.type === 'vendor' && 'category' in org) {
      this.vendors.set(org.id, org as Vendor);
    }
  }

  getOrganization(id: string): Organization | undefined {
    return this.organizations.get(id);
  }

  getAllOrganizations(): Organization[] {
    return Array.from(this.organizations.values());
  }

  findOrganizationByDomain(domain: string): Organization | undefined {
    return Array.from(this.organizations.values()).find(org =>
      org.domain?.toLowerCase() === domain.toLowerCase() ||
      org.publicDomain?.toLowerCase() === domain.toLowerCase() ||
      org.internalDomain?.toLowerCase() === domain.toLowerCase()
    );
  }

  // Contact management
  registerContact(contact: Contact): void {
    // Validate organization exists
    if (!this.organizations.has(contact.organizationId)) {
      throw new Error(
        `Cannot register contact ${contact.id}: Organization ${contact.organizationId} does not exist. ` +
        `Available organizations: ${Array.from(this.organizations.keys()).join(', ')}`
      );
    }

    // Remove from old indexes if overwriting
    if (this.contacts.has(contact.id)) {
      console.warn(`Contact ${contact.id} is already registered. Overwriting...`);
      this.removeContactFromIndexes(contact.id);
    }

    this.contacts.set(contact.id, contact);
    this.updateContactIndexes(contact);
  }

  /**
   * Update reverse indexes for a contact
   */
  private updateContactIndexes(contact: Contact): void {
    // Index by organization
    if (!this.contactsByOrg.has(contact.organizationId)) {
      this.contactsByOrg.set(contact.organizationId, new Set());
    }
    this.contactsByOrg.get(contact.organizationId)!.add(contact.id);
  }

  /**
   * Remove contact from reverse indexes
   */
  private removeContactFromIndexes(contactId: string): void {
    const contact = this.contacts.get(contactId);
    if (!contact) return;

    // Remove from org index
    const orgSet = this.contactsByOrg.get(contact.organizationId);
    if (orgSet) {
      orgSet.delete(contactId);
      if (orgSet.size === 0) {
        this.contactsByOrg.delete(contact.organizationId);
      }
    }
  }

  /**
   * Get contacts by organization using index (O(1) lookup + O(k) where k = contacts in org)
   */
  getContactsByOrganization(orgId: string): Contact[] {
    const contactIds = this.contactsByOrg.get(orgId);
    if (!contactIds) return [];

    return Array.from(contactIds)
      .map(id => this.contacts.get(id))
      .filter((contact): contact is Contact => contact !== undefined);
  }

  getContact(id: string): Contact | undefined {
    return this.contacts.get(id);
  }

  getAllContacts(): Contact[] {
    return Array.from(this.contacts.values());
  }

  findContactByEmail(email: string): Contact | undefined {
    return Array.from(this.contacts.values()).find(c => 
      c.email.toLowerCase() === email.toLowerCase()
    );
  }

  // Vendor management
  registerVendor(vendor: Vendor): void {
    // Register as organization first
    this.organizations.set(vendor.id, vendor);
    // Then register as vendor
    this.vendors.set(vendor.id, vendor);
  }

  getVendor(id: string): Vendor | undefined {
    return this.vendors.get(id);
  }

  getAllVendors(): Vendor[] {
    return Array.from(this.vendors.values());
  }

  // Generic entity lookup
  getEntity(id: string, type: EntityType): Entity | undefined {
    switch (type) {
      case 'host':
        return this.getHost(id);
      case 'organization':
        return this.getOrganization(id);
      case 'contact':
        return this.getContact(id);
      case 'vendor':
        return this.getVendor(id);
      default:
        return undefined;
    }
  }

  /**
   * Clear all entities and indexes (useful for hot reload in development)
   */
  clear(): void {
    this.hosts.clear();
    this.organizations.clear();
    this.contacts.clear();
    this.vendors.clear();
    
    // Clear indexes
    this.hostsByOrg.clear();
    this.hostsByIP.clear();
    this.hostsByDomain.clear();
    this.contactsByOrg.clear();
  }

  /**
   * Validate mission relationships
   * Checks that all referenced entities exist in the registry
   */
  validateMissionRelationships(
    targetHostIds: string[],
    targetOrganizationIds: string[],
    contactId?: string
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate hosts
    targetHostIds.forEach(hostId => {
      if (!this.hosts.has(hostId)) {
        errors.push(`Mission references non-existent host: ${hostId}`);
      }
    });

    // Validate organizations
    targetOrganizationIds.forEach(orgId => {
      if (!this.organizations.has(orgId)) {
        errors.push(`Mission references non-existent organization: ${orgId}`);
      }
    });

    // Validate contact
    if (contactId && !this.contacts.has(contactId)) {
      errors.push(`Mission references non-existent contact: ${contactId}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Singleton instance
export const worldRegistry = new WorldRegistry();

