# Changelog

All notable changes to the Quallaa CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.2] - 2025-08-20

### Added
- **Enhanced Discoverability** - Added comprehensive business-focused keywords to package.json
- **Complete CHANGELOG** - Comprehensive changelog with all v1.2.x features documented

### Changed
- **Package Description** - Updated to highlight 5 outcome pack templates and business focus
- **CLI Help Text** - Now shows all 5 available outcome templates in help output
- **Banner Messaging** - Updated to reflect "Domain Engineering infrastructure" focus

### Fixed
- **Repository URLs** - Corrected package.json URLs to match actual GitHub repository
- **Test Failures** - Fixed CLI and banner tests that were failing due to naming changes
- **Generated Files** - Removed accidentally committed template files from repository
- **CLI Description** - Added proper CLI description that was missing from help output

### Removed
- **Generated Template Files** - Cleaned up my-app/ and coverage/ directories from repo
- **Test Coverage Files** - Coverage reports are now properly gitignored

## [1.2.1] - 2025-08-20

### Added
- **Comprehensive README Documentation** - Complete documentation for all 5 outcome pack templates
- **Enhanced Package Metadata** - Improved keywords, description, and discoverability on npm
- **Business System Integration Documentation** - Full coverage of HubSpot, GA4, Harvest, QuickBooks, Stripe, Shopify, NeonCRM

### Changed
- README completely rewritten to showcase all outcome pack templates with business use cases
- Package.json enhanced with business-focused keywords and updated repository URLs
- CLI help text now lists all 5 available outcome templates

### Fixed
- Repository URLs corrected to match actual GitHub repository
- Generated template files removed from source repository
- .gitignore updated to prevent accidental commits of generated projects

## [1.2.0] - 2025-08-20

### Added
- **5 Complete Outcome Pack Templates** - Production-ready business workflow automation:
  - **Project → Invoice Guardrails** - Professional services billing with Harvest and QuickBooks
  - **Donor & Member Rollups** - Nonprofit management with Stripe, NeonCRM, and QuickBooks
  - **Inventory & Pricing Sync** - E-commerce operations with Shopify, Amazon, POS systems
  - **Lead Lifecycle Core** - Enhanced CRM management with HubSpot and Google Analytics 4
  - **Order-to-Cash Reconciliation** - Financial reconciliation (enhanced from v1.1.0)
- **15 JSON Schema Data Contracts** - Type-safe business data validation across all templates
- **Production-Ready API Integrations** - Complete connectors for major business systems
- **Gold Dataset Framework** - Pre-configured demo data and expected results for testing
- **Enhanced TypeScript Architecture** - Comprehensive type safety and IntelliSense support
- **Compliance Features** - Built-in support for ASC 606, IFRS 15, GAAP revenue recognition
- **Multi-Architecture Support** - Flexible deployment options (Web+Jobs vs Headless Worker)

### Business System Integrations Added
- **HubSpot CRM** - Lead/contact synchronization with advanced querying and data transformation
- **Google Analytics 4** - Behavioral tracking, conversion analysis, and attribution modeling
- **Harvest** - Time tracking integration with project billing and cost calculations  
- **QuickBooks Online** - Complete accounting system integration with invoice and customer management
- **Stripe** - Enhanced payment processing with payout reconciliation and fee analysis
- **Shopify** - E-commerce platform integration with order and inventory management
- **NeonCRM** - Nonprofit donor management with campaign and fundraising tracking

### Enhanced Features
- **Outcome-Specific Project Generation** - Automated scaffolding with data contracts and integrations
- **Demo Mode Support** - Gold datasets enable rapid prototyping and stakeholder demos
- **Exception Handling Workflows** - Automated detection and correction of data discrepancies
- **Real-Time Monitoring** - Built-in alerting and performance tracking capabilities
- **Board-Ready Reporting** - Executive dashboards with key performance indicators

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