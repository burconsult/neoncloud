# Contributing to NeonCloud

Thank you for your interest in contributing to NeonCloud! This document provides guidelines and information for contributors.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd neoncloud
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## Development Workflow

### Branch Naming

- `feature/US-XX-description` - New features
- `fix/US-XX-description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages

Follow conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(terminal): add command history navigation`
- `fix(parser): handle empty command input`
- `docs(readme): update installation instructions`

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write self-documenting code with clear variable names
- Add comments for complex logic
- Keep functions small and focused

### Testing

- Write tests for new features
- Maintain or improve test coverage
- Tests should be clear and descriptive
- Use descriptive test names: `describe('CommandParser', () => { it('should parse command with arguments', ...) })`

### Pull Request Process

1. Create a feature branch from `develop`
2. Make your changes
3. Write/update tests
4. Ensure all tests pass
5. Run linter and formatter
6. Update documentation if needed
7. Create pull request with description
8. Address review feedback

### PR Checklist

- [ ] Code follows style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No console.logs or debug code
- [ ] Accessibility considered
- [ ] Browser compatibility tested

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Respect different viewpoints

## Questions?

Feel free to open an issue for questions or discussions.

