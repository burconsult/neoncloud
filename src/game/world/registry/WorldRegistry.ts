/**
 * World Registry
 * Central registry for all world entities (hosts, organizations, contacts, vendors)
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

  // Host management
  registerHost(host: Host): void {
    if (this.hosts.has(host.id)) {
      console.warn(`Host ${host.id} is already registered. Overwriting...`);
    }
    this.hosts.set(host.id, host);
  }

  getHost(id: string): Host | undefined {
    return this.hosts.get(id);
  }

  getAllHosts(): Host[] {
    return Array.from(this.hosts.values());
  }

  findHostByIP(ip: string): Host | undefined {
    return Array.from(this.hosts.values()).find(h => h.ipAddress === ip);
  }

  findHostByDomain(domain: string): Host | undefined {
    return Array.from(this.hosts.values()).find(h => 
      h.domainName?.toLowerCase() === domain.toLowerCase()
    );
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
    if (this.contacts.has(contact.id)) {
      console.warn(`Contact ${contact.id} is already registered. Overwriting...`);
    }
    this.contacts.set(contact.id, contact);
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

  // Clear all (useful for hot reload in development)
  clear(): void {
    this.hosts.clear();
    this.organizations.clear();
    this.contacts.clear();
    this.vendors.clear();
  }
}

// Singleton instance
export const worldRegistry = new WorldRegistry();

