# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quallaa CLI sets up core infrastructure services for development projects. It's designed to help domain experts (founders, product managers, marketers, operations managers) work with AI development assistants by providing detailed project context and pre-configured service integrations.

## Development Commands

### Essential Commands
```bash
# Development
npm run dev          # Watch mode - compiles TypeScript on changes
npm run build        # Production build - outputs to dist/

# Testing
npm test             # Run all tests with Vitest
npm run test:ui      # Launch Vitest UI for visual test debugging
npm run test:coverage # Generate coverage report (requires 70% minimum)

# Code Quality
npm run lint         # Run ESLint for code quality checks

# Running the CLI locally
npm link             # Create global symlink for testing
quallaa --version    # Verify CLI is working
```

### Testing Individual Components
```bash
# Run specific test file
npm test src/commands/init.test.ts

# Run tests in watch mode
npm test -- --watch

# Debug specific test
npm test -- -t "should initialize project successfully"
```

## Architecture & Code Organization

### Service Integration Pattern
Each external service (Vercel, Supabase, GitHub, Resend, Typesense) follows a consistent pattern:
- Located in `src/services/<service-name>.ts`
- Exports `setup<Service>()` and `verify<Service>Credentials()` functions
- Uses OS-level credential storage via keytar
- Handles authentication, validation, and error recovery

### Command Structure
Commands in `src/commands/` follow Commander.js patterns:
- Each command exports a function that configures the command
- Uses inquirer for interactive prompts
- Implements error handling with custom error types
- Shows progress with ora spinners

### Role-Based Context System
The CLI generates different contexts based on user role (src/contexts/):
- Technical Co-Founder: Architecture, scaling, infrastructure
- Product Manager: Analytics, testing, user feedback
- Marketing Lead: Attribution, automation, campaigns
- Operations Manager: Process automation, data pipelines

### Credential Management
- Credentials stored securely using keytar (OS keychain)
- Service name: 'quallaa-cli'
- Account format: '<service>-<credential-type>'
- Graceful fallback when keytar unavailable

## Key Implementation Details

### TypeScript Configuration
- Strict mode enabled with comprehensive type checking
- Target: ES2020, Module: Node16
- All imports must use .js extensions in runtime code
- Type definitions in src/types/

### Testing Strategy
- Mock all external dependencies (keytar, inquirer, axios)
- Test files co-located with source files (.test.ts)
- Coverage thresholds: 70% for all metrics
- Node test environment with 30-second timeout

### Error Handling
- Custom error types in src/lib/errors.ts
- Consistent error messages and recovery strategies
- User-friendly error output with actionable suggestions

### External Service Authentication
- **Vercel**: OAuth flow or API token
- **Supabase**: Built-in CLI authentication
- **GitHub**: Personal Access Token or gh CLI
- **Resend**: API key authentication
- **Typesense**: API key (optional service)

## Common Development Tasks

### Adding a New Service Integration
1. Create `src/services/<service-name>.ts`
2. Implement `setup<Service>()` and `verify<Service>Credentials()`
3. Add to service selection in `src/commands/init.ts`
4. Create tests in `src/services/<service-name>.test.ts`
5. Update types in `src/types/services.ts`

### Modifying Role Contexts
1. Edit relevant file in `src/contexts/`
2. Update `generateClaudeMd()` in `src/commands/generate.ts`
3. Test with different role selections

### Updating CLI Commands
1. Modify command in `src/commands/`
2. Update help text and descriptions
3. Add/update tests for new functionality
4. Ensure backward compatibility

## Project-Specific Considerations

### AI-Assisted Development Philosophy
- Provide comprehensive context in generated CLAUDE.md files
- Configure services to work well with AI development assistants
- Minimize manual setup steps through automation

### Security Requirements
- Never log or expose API keys/tokens
- Use OS-level credential storage exclusively
- Validate all external service responses
- Sanitize user input before service calls

### Performance Guidelines
- Minimize external API calls
- Cache service verification results when appropriate
- Use async/await properly for all I/O operations
- Show progress indicators for long-running operations

### User Experience Principles
- Clear, actionable error messages
- Progressive disclosure of complexity
- Sensible defaults for all configurations
- Support both interactive and non-interactive modes