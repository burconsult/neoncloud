# NeonCloud - Educational Network Security Game

An educational hacking simulation game inspired by Uplink, designed to teach young players about internet infrastructure, networking, and cybersecurity concepts in a safe, engaging environment.

## 🎯 Project Vision

NeonCloud transforms complex networking and cybersecurity concepts into an accessible, game-based learning experience. Players take on the role of a network security intern, learning through hands-on challenges that mirror real-world scenarios without the risks.

## 🎮 Game Concept

Players interact with a terminal-style interface to:
- Explore network topologies
- Understand routing and DNS
- Learn about security protocols (HTTPS, TLS, etc.)
- Practice ethical hacking concepts
- Build understanding of internet infrastructure layers

## 🛠 Technology Stack

- **Frontend**: React + TypeScript (for modern UI/UX)
- **Terminal Emulator**: Custom terminal component with command parsing
- **Game Engine**: Custom state management with educational content system
- **Styling**: CSS with retro-futuristic aesthetic
- **Icons**: Lucide React (programmatic icon library)
- **Diagrams**: Programmatically generated SVG diagrams
- **Build Tool**: Vite (fast development)
- **Testing**: Vitest + React Testing Library
- **Version Control**: Git with conventional commits

## 📁 Project Structure

```
neoncloud/
├── docs/                           # Documentation
│   ├── game-design.md              # Detailed game design document
│   ├── agile-planning.md           # Sprint planning and user stories
│   └── architecture.md             # Technical architecture
├── src/
│   ├── components/                 # React components
│   │   ├── terminal/              # Terminal emulator components
│   │   ├── mission/                # Mission panel and UI
│   │   ├── store/                  # Software store UI
│   │   ├── currency/               # Currency display
│   │   ├── educational/            # Educational popups
│   │   ├── intro/                  # Start screen
│   │   ├── end/                    # End screen
│   │   └── ui/                     # Reusable UI components
│   ├── game/                       # Core game logic
│   │   ├── world/                  # World graph system
│   │   │   ├── graph/              # Graph relationships and queries
│   │   │   ├── registry/           # Central entity registry
│   │   │   ├── entities/           # Entity definitions (hosts, orgs, contacts)
│   │   │   ├── discovery/          # Discovery system
│   │   │   └── types/              # Entity type definitions
│   │   ├── missions/               # Mission system
│   │   │   ├── modules/            # Individual mission definitions
│   │   │   └── ...                 # Mission loading, ordering, handlers
│   │   ├── tools/                  # Tool/software system
│   │   │   └── modules/            # Individual tool definitions
│   │   ├── commands/               # Command implementations
│   │   ├── state/                  # Zustand state stores
│   │   ├── events/                 # Event bus system
│   │   ├── filesystem/             # File system simulation
│   │   ├── network/                 # Network simulation
│   │   ├── time/                   # Time and duration system
│   │   └── ...                     # Other game systems
│   ├── types/                      # TypeScript type definitions
│   ├── utils/                      # Utility functions
│   └── styles/                     # Global styles
├── public/                         # Static assets
├── tests/                          # Test files
└── scripts/                         # Build and utility scripts
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📚 Educational Goals

1. **Internet Infrastructure**: Understanding how data travels across networks
2. **Networking Basics**: IP addresses, DNS, routing, protocols
3. **Cybersecurity Fundamentals**: Encryption, authentication, vulnerabilities
4. **Problem-Solving**: Logical thinking and systematic troubleshooting
5. **Ethical Awareness**: Understanding security in a responsible context

## 🎓 Target Audience

- Ages 12-18
- Students interested in technology
- Educational institutions
- Self-learners exploring cybersecurity

## 🌐 World Graph System

NeonCloud uses a sophisticated **World Graph System** to manage all game entities and their relationships. This graph-driven architecture enables:

### Core Components

- **World Registry**: Central registry for all entities (hosts, organizations, contacts, vendors)
- **World Graph**: Manages relationships between entities (ownership, connections, missions)
- **Discovery System**: Tracks player knowledge of the world (discovered hosts, organizations, etc.)
- **Entity Definitions**: Modular entity files that define hosts, organizations, and contacts with all their properties

### Entity Types

1. **Hosts**: Servers and network devices with:
   - IP addresses and domain names
   - File systems (defined per-host)
   - Security configurations
   - Network connections
   - Organization ownership

2. **Organizations**: Companies and entities with:
   - Domain names and IP ranges
   - Associated hosts and contacts
   - Classification (target, employer, vendor, neutral)
   - Mission relationships

3. **Contacts**: NPCs and characters with:
   - Organization affiliations
   - Email capabilities
   - Mission briefing roles

4. **Vendors**: Tool and software providers (future expansion)

### Benefits

- **Modularity**: Add new entities by creating a single file
- **Consistency**: Graph queries ensure consistent entity relationships
- **Extensibility**: Easy to add new entity types and relationships
- **Discovery**: Players discover entities through missions, scanning, DNS lookups
- **Dynamic Content**: Mission descriptions and hints use graph queries for dynamic content

### Example Usage

```typescript
// Query hosts targeted by a mission
const targetHosts = getMissionTargetHosts('n00b-01');

// Get organization for a host
const org = worldGraph.getOrganizationByHost('server-01');

// Check if entity is discovered
const isDiscovered = discoveryStore.isHostDiscovered('server-01');
```

## 📋 Development Methodology

- **AI-Assisted Development**: Built using [Cursor AI](https://cursor.sh) with agent auto mode for rapid iteration and code generation
- **Agile/Scrum**: 2-week sprints with feature-driven development
- **Modular Architecture**: Self-contained modules for missions, tools, and entities
- **Graph-Driven Design**: World graph system for managing entity relationships
- **Event-Driven Architecture**: Decoupled systems using event bus for communication
- **Continuous Integration**: Automated testing and builds
- **Documentation**: Living documentation approach with inline code documentation

## 👤 Author

**burconsult**

- X (Twitter): [@burconsult](https://x.com/burconsult)
- GitHub: [@burconsult](https://github.com/burconsult)

## 📄 License

[To be determined]

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

For more information, see [CONTRIBUTING.md](CONTRIBUTING.md)

## 🔗 Links

- **Live Demo**: [neoncloud-two.vercel.app](https://neoncloud-two.vercel.app)
- **GitHub Repository**: [github.com/burconsult/neoncloud](https://github.com/burconsult/neoncloud)

