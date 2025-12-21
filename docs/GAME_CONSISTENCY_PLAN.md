# NeonCloud Game Consistency Plan

This document tracks the relationships between game elements to ensure consistency across missions, tools, servers, and lore.

## Purpose

As the game grows more complex, it's crucial that:
- Server configurations match available tools
- Mission requirements align with tool availability
- Lore entries match gameplay mechanics
- Tool descriptions accurately reflect their usage
- Mission progression makes logical sense

## Tool Catalog & Requirements

### Network Tools
| Tool ID | Name | Price | Mission Unlock | Purpose |
|---------|------|-------|----------------|---------|
| `vpn-basic` | Basic VPN | 200 NC | tutorial-01 | Encrypt connection, hide IP |
| `vpn-premium` | Premium VPN | 500 NC | network-01 | Advanced VPN with faster speeds |
| `network-analyzer` | Network Analyzer | 1000 NC | network-02 | Deep packet inspection |

### Security Tools
| Tool ID | Name | Price | Mission Unlock | Purpose |
|---------|------|-------|----------------|---------|
| `password-cracker-basic` | Basic Password Cracker | 300 NC | tutorial-01 | Brute-force password cracking |
| `password-cracker-advanced` | Advanced Password Cracker | 750 NC | network-01 | Fast dictionary/rainbow table attacks |
| `firewall-bypass` | Firewall Bypass Tool | 1500 NC | network-02 | Bypass network firewalls |
| `encryption-suite` | Encryption Suite | 2500 NC | network-03 | Professional encryption/decryption |

### Analysis Tools
| Tool ID | Name | Price | Mission Unlock | Purpose |
|---------|------|-------|----------------|---------|
| `log-analyzer` | Log Analyzer | 600 NC | network-01 | Analyze system logs for vulnerabilities |
| `vulnerability-scanner` | Vulnerability Scanner | 1800 NC | network-02 | Scan systems for security holes |

### Utility Tools
| Tool ID | Name | Price | Mission Unlock | Purpose |
|---------|------|-------|----------------|---------|
| `auto-script` | Automation Script | 250 NC | tutorial-01 | Automate repetitive tasks |
| `multi-tool` | Multi-Tool Suite | 550 NC | network-01 | Collection of utilities |
| `log-shredder` | Log Shredder | 450 NC | n00b-01 | Securely delete log files |

### Storage
| Tool ID | Name | Price | Mission Unlock | Purpose |
|---------|------|-------|----------------|---------|
| `storage-upgrade-1` | Storage Upgrade I | 150 NC | - | +50% storage capacity |
| `storage-upgrade-2` | Storage Upgrade II | 400 NC | tutorial-01 | +100% storage capacity |
| `storage-upgrade-3` | Storage Upgrade III | 1200 NC | network-01 | +500% storage capacity |

## Server Configurations

### server-01 (Training Server - n00b-01 Mission)
```
Security Level: Basic
Firewall: disabled (training purposes)
Encryption: AES-256
Purpose: First real hack mission
Required Tools: VPN, Password Cracker
Optional Tools: Log Shredder (to cover tracks)
```

**Files:**
- `/home/data/secret.txt` - Mission objective file
- `/home/data/config.ini` - Server configuration (shows firewall=disabled)
- `/home/logs/access.log` - Access logs (can be shredded if player has tool)
- `/home/README.txt` - System information

**Notes:**
- Firewall is disabled because it's a beginner mission
- Players learn about server access without firewall complications
- Future servers will require firewall-bypass tool

### Future Servers (To Be Defined)

#### server-02 (Planned)
```
Security Level: Medium
Firewall: enabled (requires firewall-bypass tool)
Encryption: AES-256
Required Tools: VPN, Password Cracker, Firewall Bypass
Optional Tools: Log Shredder, Vulnerability Scanner
```

## Mission-Tool Consistency Matrix

| Mission | Required Tools | Optional Tools | Server Features |
|---------|---------------|----------------|-----------------|
| welcome-00 | - | - | - |
| tutorial-01 | - | - | Local system only |
| terminal-navigation | - | - | Local system only |
| network-01 | - | VPN (Basic) | Network simulation |
| network-02 | - | Network Analyzer | Network topology |
| network-03 | - | Encryption Suite | DNS exploration |
| n00b-01 | VPN, Password Cracker | Log Shredder | server-01 (firewall=disabled) |

## Consistency Checklist

When adding new content, verify:

### For New Servers:
- [ ] Server security level matches mission difficulty
- [ ] Firewall status matches available tools at mission unlock
- [ ] Encryption type is consistent with mission requirements
- [ ] Required tools are available at mission unlock
- [ ] Config files match actual server behavior
- [ ] Log files exist if Log Shredder is available

### For New Tools:
- [ ] Mission unlock requirement makes sense
- [ ] Price is appropriate for tool category/rarity
- [ ] Description matches actual functionality
- [ ] Unlocked commands match tool purpose
- [ ] Tool is actually usable in relevant missions

### For New Missions:
- [ ] Required tools are available at unlock
- [ ] Mission difficulty matches available tools
- [ ] Server configurations are consistent
- [ ] Lore entries match mission content
- [ ] Reward amount is appropriate

## Future Enhancements

### Planned Tools
- **Keylogger** - Capture keyboard input on target systems
- **Rootkit** - Maintain persistent access to compromised systems
- **Backdoor** - Create hidden access points
- **Traffic Analyzer** - Analyze network traffic patterns
- **File Encryptor** - Encrypt files on target systems

### Planned Server Features
- **Firewall Rules** - Different firewall configurations
- **Intrusion Detection** - IDS that detects suspicious activity
- **Backup Systems** - Automated backups that can be restored
- **Multi-factor Authentication** - Servers requiring additional auth
- **Encrypted Partitions** - Encrypted file systems requiring keys

## Maintenance Notes

- **Last Updated**: 2024-01-XX
- **Maintainer**: Development Team
- **Update Frequency**: After each major content addition
- **Review Before**: Adding new missions, tools, or servers

## Quick Reference: Command-Tool Mapping

| Command | Required Tool | Purpose |
|---------|--------------|---------|
| `vpn connect` | VPN (Basic/Premium) | Connect to VPN |
| `crack` | Password Cracker (Basic/Advanced) | Crack encrypted files/passwords |
| `connect` / `ssh` | - | Connect to remote servers |
| `shred` | Log Shredder | Delete log files securely |
| `analyze-logs` | Log Analyzer | Analyze system logs |
| `bypass-firewall` | Firewall Bypass | Bypass firewall protections |
| `scan-vuln` | Vulnerability Scanner | Scan for vulnerabilities |

## Consistency Issues Found & Fixed

1. **Firewall Inconsistency (Fixed 2024-01-XX)**
   - Issue: server-01 config showed `firewall=enabled` but it's a beginner mission
   - Fix: Changed to `firewall=disabled` with comment explaining it's for training
   - Impact: Future servers will properly require firewall-bypass tool

2. **Log Shredder Missing (Added 2024-01-XX)**
   - Issue: Logs exist on servers but no tool to delete them
   - Fix: Added Log Shredder tool unlocked after n00b-01
   - Impact: Players can now cover their tracks in future missions

