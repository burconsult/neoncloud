# Technical Architecture - NeonCloud

## System Overview

NeonCloud is a client-side web application built with React and TypeScript. The game runs entirely in the browser with no backend server, ensuring privacy and offline capability.

## Architecture Layers

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  (React Components, UI, Terminal)  │
├─────────────────────────────────────┤
│         Application Layer           │
│  (Game Logic, State Management)    │
├─────────────────────────────────────┤
│          Domain Layer               │
│  (Commands, Missions, Content)      │
├─────────────────────────────────────┤
│          Data Layer                 │
│  (Local Storage, State Persistence) │
└─────────────────────────────────────┘
```

## Technology Stack

### Core Framework
- **React 18+**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server

### State Management
- **Zustand** or **Jotai**: Lightweight state management
- **React Context**: For terminal state and command execution

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **CSS Modules**: Component-scoped styles
- **Framer Motion**: Animations (optional)

### Testing
- **Vitest**: Unit and integration tests
- **React Testing Library**: Component tests
- **Playwright**: E2E tests (future)

### Code Quality
- **ESLint**: Linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Husky**: Git hooks
- **lint-staged**: Pre-commit checks

## Project Structure

```
neoncloud/
├── public/                 # Static assets
│   ├── fonts/            # Custom fonts
│   └── images/           # Images and icons
├── src/
│   ├── components/       # React components
│   │   ├── terminal/    # Terminal components
│   │   ├── ui/          # Reusable UI components
│   │   └── mission/     # Mission-related components
│   ├── game/            # Game logic
│   │   ├── commands/    # Command implementations
│   │   ├── missions/    # Mission definitions
│   │   ├── state/       # State management
│   │   └── parser/      # Command parser
│   ├── content/         # Educational content
│   │   ├── modules/     # Learning modules
│   │   ├── explanations/ # Concept explanations
│   │   └── hints/       # Hint system
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── styles/          # Global styles
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
├── tests/               # Test files
├── docs/                # Documentation
├── .github/            # GitHub workflows
└── config files        # Various config files
```

## Component Architecture

### Terminal Component Hierarchy

```
TerminalContainer
├── TerminalWindow
│   ├── TerminalOutput (scrollable)
│   │   └── OutputLine[]
│   └── TerminalInput
│       ├── CommandPrompt
│       └── InputField
├── TerminalSidebar
│   ├── MissionPanel
│   ├── NotesPanel
│   └── HelpPanel
└── ModalContainer
    ├── EducationalModal
    ├── HintModal
    └── AchievementModal
```

### State Management

**Global State** (Zustand store):
```typescript
interface GameState {
  // Mission state
  currentMission: Mission | null;
  completedMissions: string[];
  missionProgress: Record<string, number>;
  
  // Player state
  level: number;
  xp: number;
  unlockedCommands: string[];
  badges: Badge[];
  
  // Terminal state
  commandHistory: string[];
  currentDirectory: string;
  fileSystem: FileSystem;
}
```

**Command Execution Flow**:
```
User Input → Command Parser → Command Router → Command Handler → State Update → UI Update
```

## Command System Design

### Command Interface

```typescript
interface Command {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  execute: (args: string[], context: GameContext) => CommandResult;
  validate?: (args: string[]) => ValidationResult;
  requiresUnlock?: boolean;
  educationalNote?: string;
}
```

### Command Registry

Commands are registered in a central registry:
```typescript
const commandRegistry = new Map<string, Command>();
```

### Command Execution

1. Parse input into command + arguments
2. Lookup command in registry
3. Check if command is unlocked
4. Validate arguments
5. Execute command
6. Update game state
7. Return result for display

## Mission System

### Mission Structure

```typescript
interface Mission {
  id: string;
  title: string;
  description: string;
  learningObjectives: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tasks: Task[];
  prerequisites: string[]; // Mission IDs
  unlocks: string[]; // Command names or mission IDs
}
```

### Mission State Machine

```
LOCKED → AVAILABLE → IN_PROGRESS → COMPLETED
                ↓
            FAILED (retry)
```

## Educational Content System

### Content Structure

```typescript
interface EducationalContent {
  id: string;
  title: string;
  content: string;
  type: 'concept' | 'example' | 'diagram' | 'interactive';
  relatedCommands: string[];
  relatedMissions: string[];
  difficulty: number;
}
```

### Content Delivery

- **Triggered**: Appears when command is first used
- **On-demand**: Available in notes panel
- **Contextual**: Related to current mission
- **Progressive**: Unlocks as player progresses

## Data Persistence

### Local Storage Schema

```typescript
interface SavedGame {
  version: string;
  player: {
    level: number;
    xp: number;
    badges: string[];
  };
  progress: {
    completedMissions: string[];
    unlockedCommands: string[];
    notes: string[];
  };
  settings: {
    theme: string;
    fontSize: number;
    soundEnabled: boolean;
  };
}
```

### Save/Load System

- Auto-save on significant events
- Manual save option
- Export/import functionality
- Version migration support

## Performance Considerations

### Optimization Strategies

1. **Code Splitting**: Lazy load mission content
2. **Memoization**: Memoize expensive computations
3. **Virtual Scrolling**: For long terminal output
4. **Debouncing**: Command history search
5. **Lazy Loading**: Educational content loaded on demand

### Bundle Size Targets

- Initial load: < 200KB (gzipped)
- Total bundle: < 1MB (gzipped)
- Code splitting: Mission content separate

## Security Considerations

### Client-Side Security

- No real network access
- No real file system access
- Simulated commands only
- Input sanitization
- XSS prevention

### Privacy

- No data collection
- No analytics (or opt-in only)
- Local storage only
- No external API calls
- No user tracking

## Accessibility

### WCAG 2.1 AA Compliance

- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus indicators
- ARIA labels
- Semantic HTML

## Browser Support

### Target Browsers

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

### Progressive Enhancement

- Core functionality works without JavaScript
- Enhanced experience with JavaScript
- Graceful degradation

## Deployment

### Build Process

1. TypeScript compilation
2. React build
3. Asset optimization
4. Code splitting
5. Bundle analysis

### Hosting Options

- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: Cloudflare, AWS CloudFront
- **Domain**: Custom domain support

## Future Architecture Considerations

### Potential Enhancements

1. **Backend Integration** (optional):
   - User accounts (opt-in)
   - Cloud saves
   - Leaderboards
   - Custom missions

2. **PWA Support**:
   - Offline capability
   - Installable
   - Service worker

3. **Multiplayer** (future):
   - WebSocket connection
   - Collaborative missions
   - Real-time sync

## Development Workflow

### Git Workflow

- **Main Branch**: Production-ready code
- **Develop Branch**: Integration branch
- **Feature Branches**: `feature/US-XX-description`
- **Hotfix Branches**: `hotfix/description`

### Commit Convention

```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### CI/CD Pipeline

1. Lint and format check
2. Type checking
3. Unit tests
4. Build verification
5. Deploy to staging (on develop)
6. Deploy to production (on main)

## Monitoring & Analytics

### Error Tracking

- Error boundary components
- Error logging (client-side only)
- User feedback mechanism

### Performance Monitoring

- Core Web Vitals
- Load time tracking
- Runtime performance

### Privacy-First Analytics

- Opt-in only
- No personal data
- Aggregate statistics only

