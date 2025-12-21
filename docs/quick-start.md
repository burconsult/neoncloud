# Quick Start Guide

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher (comes with Node.js)
- **Git**: For version control

## Initial Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:3000`

3. **Run tests**
   ```bash
   npm test
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run tests in watch mode |
| `npm test:ui` | Run tests with UI |
| `npm test:coverage` | Run tests with coverage report |
| `npm run lint` | Check code for linting errors |
| `npm run lint:fix` | Auto-fix linting errors |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run type-check` | Type check without building |

## Project Structure Overview

```
neoncloud/
├── docs/              # Documentation
│   ├── game-design.md
│   ├── agile-planning.md
│   ├── architecture.md
│   └── quick-start.md
├── src/
│   ├── components/    # React components (to be created)
│   ├── game/         # Game logic (to be created)
│   ├── types/        # TypeScript types
│   ├── styles/       # Global styles
│   ├── test/         # Test utilities
│   ├── App.tsx       # Root component
│   └── main.tsx      # Entry point
├── public/           # Static assets
└── [config files]    # Various configuration files
```

## Next Steps

### Sprint 1 Tasks (Current Sprint)

1. ✅ Project setup and configuration
2. ⏳ Create basic terminal UI component
3. ⏳ Implement command input system
4. ⏳ Add terminal styling

### Getting Started with Development

1. **Read the documentation**
   - Start with `docs/game-design.md` for game concepts
   - Review `docs/architecture.md` for technical details
   - Check `docs/agile-planning.md` for sprint planning

2. **Pick a user story**
   - See `docs/agile-planning.md` for Sprint 1 backlog
   - Choose a story to work on
   - Create a feature branch: `git checkout -b feature/US-XX-description`

3. **Write code**
   - Follow TypeScript best practices
   - Write tests alongside code
   - Keep components small and focused

4. **Test your changes**
   - Run `npm test` to ensure tests pass
   - Manually test in browser
   - Check accessibility (keyboard navigation, screen reader)

5. **Submit for review**
   - Commit with conventional commit message
   - Push branch and create pull request
   - Address feedback

## IDE Setup

### VS Code (Recommended)

1. Install recommended extensions (prompted on first open)
2. Settings are configured in `.vscode/settings.json`
3. Format on save is enabled
4. ESLint auto-fix on save is enabled

### Other IDEs

- Ensure TypeScript support
- Configure ESLint and Prettier
- Enable format on save

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Or change port in vite.config.ts
```

### Module resolution errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Type errors
```bash
# Run type check
npm run type-check

# Restart TypeScript server in IDE
```

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest Documentation](https://vitest.dev/)

## Getting Help

- Check existing documentation in `docs/`
- Review code comments
- Open an issue for bugs or questions
- Check GitHub discussions for community help

