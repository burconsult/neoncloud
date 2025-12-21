# Graphics Quick Reference

## Icon Usage

```tsx
import { Icon } from '@/components/ui/Icon';

// Basic icon
<Icon name="help" size={24} />

// With color
<Icon name="success" color="#00ff41" size={16} />

// With accessibility
<Icon name="settings" aria-label="Settings" />
```

## Diagram Usage

```tsx
import { Diagram } from '@/components/ui/Diagram';

// Basic diagram
<Diagram type="dns-resolution" />

// With title and description
<Diagram 
  type="network-topology"
  title="Network Topology"
  description="Shows network structure"
  width={800}
  height={400}
/>
```

## Available Diagram Types

- `network-topology` - Network nodes and connections
- `dns-resolution` - DNS query/response flow
- `tcpip-stack` - Protocol layers
- `packet-structure` - Packet components
- `firewall` - Firewall function

## Common Icons

**Commands**: `help`, `echo`, `clear`, `ls`, `cd`, `cat`, `ping`, `whoami`, `pwd`  
**Status**: `success`, `error`, `warning`, `info`  
**Navigation**: `arrow-up`, `arrow-down`, `arrow-left`, `arrow-right`  
**UI**: `settings`, `book`, `trophy`, `search`, `download`

See `docs/graphics-implementation.md` for full details.

