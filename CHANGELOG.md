# Changelog

All notable changes to the Quallaa CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-12-20

### Added
- **Outcome Templates** (`quallaa outcome`) - Pre-configured business workflow scaffolding
  - Order-to-Cash Reconciliation template with Shopify, Stripe, QuickBooks connectors
  - Lead Lifecycle Management template with CRM, enrichment, and routing
  - Stack variant selection (Web+Jobs vs Headless Worker)
- **Evaluation Harness** (`quallaa evaluators run`) - Measure business outcomes
  - HTML, JSON, and text scorecard generation
  - Metrics: accuracy, rework ratio, processing time, unit cost
  - Gold dataset support for regression testing
- **Health Monitoring** (`quallaa doctor`) - System diagnostics
  - Node.js version checking
  - Service authentication verification
  - Credential storage testing
  - Security audit with `--audit-secrets` flag
- **Minimalist Architecture** (`quallaa init --minimal`) - Headless worker variant
  - Node.js/TypeScript workers without UI
  - Job templates for cron and queue processing
  - Minimal API endpoints for health and webhooks
- **Enhanced Context Generation** (`quallaa generate --augment`)
  - Project analysis for contracts, APIs, and integrations
  - Automatic discovery of metrics and service configurations

### Changed
- README now showcases Outcome commands as primary workflow
- Improved error handling with custom error types
- Enhanced CLAUDE.md generation with richer domain context
- Package name changed from @quallaa/cli to quallaa-cli for npm compatibility

### Fixed
- Duplicate help output in CLI
- TypeScript compilation errors in test files
- Missing imports in project analyzer

## [1.0.3] - 2024-12-10

### Added
- Lead capture functionality for user feedback
- Role-based configuration improvements
- Service verification methods for all integrations
- Better error messages with recovery suggestions

### Changed
- Improved banner display with cleaner formatting
- Enhanced service setup workflow
- Better handling of missing credentials

### Fixed
- CLI initialization issues
- Service authentication flow bugs
- Windows compatibility improvements

## [1.0.2] - 2024-12-08

### Added
- Update notifier for new versions
- Credential storage using OS keychain
- Cross-platform support improvements

### Fixed
- Windows credential storage issues
- npm package configuration
- Missing dependencies

## [1.0.1] - 2024-12-07

### Fixed
- Initial npm publishing configuration
- Package.json metadata
- Binary executable permissions

## [1.0.0] - 2024-12-07

### Added
- Initial release of Quallaa CLI
- Complete project initialization with role-based customization
- Service integrations for Vercel, Supabase, GitHub, Resend, and Typesense
- Automatic CLAUDE.md generation with role-specific context
- Secure credential storage using OS-native credential managers
- Lead capture system with CRM integration
- Comprehensive documentation and help system

### Services Supported
- **Vercel**: Hosting, deployment, and environment management
- **Supabase**: Database, authentication, and real-time features
- **GitHub**: Version control and repository management
- **Resend**: Transactional email infrastructure
- **Typesense**: Fast, typo-tolerant search (optional)

### Roles Supported
- **Technical Co-Founder / First Engineer**: Full-stack development focus
- **Product Manager / Product Owner**: Analytics and user tracking focus
- **Marketing Lead / Growth Hacker**: Customer acquisition and campaigns focus
- **Operations Manager / Business Manager**: Process automation and efficiency focus

---

For complete documentation, see the [README](README.md).