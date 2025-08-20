# Quallaa CLI

> Domain Engineering infrastructure for AI-assisted development - Ship outcomes, not code

[![npm version](https://badge.fury.io/js/quallaa-cli.svg)](https://www.npmjs.com/package/quallaa-cli)
[![Node.js Version](https://img.shields.io/node/v/quallaa-cli.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Release](https://img.shields.io/github/v/release/jefftoffoli/quallaa-cli)](https://github.com/jefftoffoli/quallaa-cli/releases)

## TL;DR in 90 seconds

```bash
# Install the CLI
npm i -g quallaa-cli

# Create a professional services billing system
quallaa outcome --template project-invoice-guardrails

# Or choose from 5 outcome pack templates
quallaa outcome  # Interactive selection

# Run evaluation harness
quallaa evaluators run --format html
open evaluators/scorecard.html

# Check system health
quallaa doctor --audit-secrets
```

This generates a production-ready project with business workflow scaffolding, JSON schema data contracts, API integrations, gold datasets for testing, and evaluation harnesses measuring accuracy, efficiency, and cost.

## 🎯 What is Quallaa CLI?

**Quallaa CLI** helps domain experts (founders, product managers, marketers, operations managers) ship production-ready business outcomes using AI-assisted development. Instead of starting with a blank canvas, you get:

- **🏗️ 5 Outcome Templates**: Pre-built workflows for professional services, nonprofits, e-commerce, CRM, and financial operations
- **🤖 AI Context**: Rich CLAUDE.md files that give AI assistants deep understanding of your domain
- **📊 Evaluation Harness**: Measure what matters - accuracy, rework, time, and cost
- **🔒 Security Built-in**: Secrets auditing, credential rotation reminders, secure storage
- **⚡ Two Architectures**: Choose between full web apps or headless workers

## 📦 Outcome Pack Templates

### 1. Project → Invoice Guardrails
**Professional Services Billing Automation**
```bash
quallaa outcome --template project-invoice-guardrails
```
Generates complete time-to-cash workflow:
```
/contracts       # TimeEntry, Project, SOW, Invoice, RevRecPolicy schemas
/integrations    # Harvest time tracking, QuickBooks Online connectors
/jobs            # Time ingestion, invoice generation, revenue recognition
/evaluators      # Billing accuracy, realization rates, ASC 606 compliance
/gold-data       # Sample projects, invoices, time entries for testing
```
**Perfect for:** Consultancies, agencies, law firms, professional services

### 2. Donor & Member Rollups  
**Nonprofit Management & Compliance**
```bash
quallaa outcome --template donor-member-rollups
```
Generates comprehensive nonprofit operations:
```
/contracts       # Donation, Member, Fund, JournalEntry schemas
/integrations    # Stripe payments, NeonCRM, QuickBooks connectors
/jobs            # Donation processing, membership renewals, fund tracking
/evaluators      # Donation conversion, member retention, compliance metrics
/gold-data       # Sample donors, campaigns, restricted funds for testing
```
**Perfect for:** Nonprofits, foundations, membership organizations

### 3. Inventory & Pricing Sync
**E-commerce Multi-Channel Operations**
```bash
quallaa outcome --template inventory-pricing-sync
```
Generates unified commerce operations:
```
/contracts       # SKU, Inventory, Price schemas with multi-channel support
/integrations    # Shopify, Amazon, POS system connectors
/jobs            # Real-time sync, pricing updates, overselling prevention
/evaluators      # Stock accuracy, pricing consistency, exception rates
/gold-data       # Sample products, pricing tiers, inventory levels
```
**Perfect for:** E-commerce retailers, multi-channel sellers, inventory-heavy businesses

### 4. Lead Lifecycle Core
**CRM Lead Management & Attribution**  
```bash
quallaa outcome --template lead-lifecycle-core
```
Generates complete lead operations:
```
/contracts       # Lead, Activity, RoutingRule, SLATarget schemas
/integrations    # HubSpot CRM, Google Analytics 4 connectors
/jobs            # Lead scoring, deduplication, SLA monitoring
/evaluators      # Response times, conversion rates, attribution accuracy
/gold-data       # Sample leads, activities, conversion funnels
```
**Perfect for:** SaaS companies, marketing teams, sales operations

### 5. Order-to-Cash Reconciliation
**Financial Reconciliation & Accounting**
```bash
quallaa outcome --template order-cash-reco  
```
Generates automated financial workflows:
```
/contracts       # Order, Payment, AccountingEntry schemas
/integrations    # Shopify, Stripe, Xero/QuickBooks connectors
/jobs            # Daily reconciliation, exception handling, audit trails
/evaluators      # Match rates, timing accuracy, manual intervention metrics  
/gold-data       # Sample orders, payments, accounting entries
```
**Perfect for:** E-commerce finance teams, accounting departments, CFO operations

## 🚀 Installation & Commands

```bash
# Install globally
npm install -g quallaa-cli

# Or use npx (no install)
npx quallaa-cli@latest init
```

### Core Commands

#### `quallaa init`
Initialize a new project with infrastructure services
```bash
quallaa init --name my-startup --role founder
quallaa init --minimal  # Headless worker variant (no UI)
```

#### `quallaa outcome`
Create a project from business workflow templates
```bash
# Interactive selection from all 5 templates
quallaa outcome

# Or specify directly
quallaa outcome --template project-invoice-guardrails
quallaa outcome --template donor-member-rollups
quallaa outcome --template inventory-pricing-sync
quallaa outcome --template lead-lifecycle-core
quallaa outcome --template order-cash-reco
```

#### `quallaa doctor`
Check system health and configuration
```bash
quallaa doctor                  # Basic health check
quallaa doctor --audit-secrets  # Security audit
quallaa doctor --verbose        # Detailed output
```

#### `quallaa evaluators run`
Measure outcome performance metrics
```bash
quallaa evaluators run --format html   # Visual scorecard
quallaa evaluators run --format json   # Machine-readable
quallaa evaluators run --format text   # Terminal output
```

#### `quallaa generate`
Generate or enhance AI context files
```bash
quallaa generate claude           # Basic CLAUDE.md
quallaa generate claude --augment # Enhanced with project analysis
```

## 🏗️ Architecture Choices

### Web + Jobs (Default)
Full-stack Next.js application with background processing
- **Stack**: Next.js, Vercel, Supabase, Resend
- **Use for**: Customer-facing apps, dashboards, CRMs
- **Deploy to**: Vercel

### Headless Worker-Only (`--minimal`)
Minimal Node.js workers for batch processing
- **Stack**: Node.js, TypeScript, cron jobs
- **Use for**: ETL, reconciliation, automation
- **Deploy to**: Fly.io, Railway

## 📊 What Gets Measured

Every outcome template includes evaluators that measure:

- **Accuracy**: How often do we get the right answer? (target: ≥90%)
- **Rework Ratio**: How often does someone intervene? (target: ≤5%)
- **Processing Time**: How fast per item? (target: ≤5s)
- **Unit Cost**: What does each operation cost? (target: ≤$0.10)

Run `quallaa evaluators run` to generate scorecards in HTML, JSON, or text format.

## 🎭 Role-Based Configuration

Choose your role for customized setup and AI context:

### Technical Co-Founder
- Architecture decisions and scaling
- Technical debt management
- Team processes and tooling

### Product Manager
- User stories and requirements
- Analytics and A/B testing
- Feature flags and rollouts

### Marketing Lead
- Attribution and campaign tracking
- Conversion optimization
- Marketing automation

### Operations Manager
- Process automation
- Data pipeline management
- Reporting and dashboards

## 🔧 Supported Services

### Infrastructure Services
All infrastructure services have generous free tiers:

- **[Vercel](https://vercel.com)** - Hosting and deployment
- **[Supabase](https://supabase.com)** - Database and authentication
- **[GitHub](https://github.com)** - Version control
- **[Resend](https://resend.com)** - Transactional email
- **[Typesense](https://typesense.org)** - Search (optional)
- **[Neon](https://neon.tech)** - Serverless Postgres (alternative to Supabase)

### Business System Integrations
Production-ready connectors for major business systems:

- **[HubSpot CRM](https://hubspot.com)** - Lead management and sales pipeline
- **[Google Analytics 4](https://analytics.google.com)** - Web analytics and attribution
- **[Harvest](https://getharvest.com)** - Time tracking and project billing
- **[QuickBooks Online](https://quickbooks.com)** - Accounting and financial reporting
- **[Stripe](https://stripe.com)** - Payment processing and payouts
- **[Shopify](https://shopify.com)** - E-commerce platform integration
- **[NeonCRM](https://neoncrm.com)** - Nonprofit donor management

## 🔒 Security & Credentials

### Local Development
- Credentials stored securely in OS keychain (macOS Keychain, Windows Credential Vault, Linux Secret Service)
- Never committed to code
- Automatic rotation reminders

### Team Mode & CI/CD
For team collaboration and CI/CD:
1. Export credentials to GitHub Secrets or Vercel Environment Variables
2. Use restricted API keys with minimum required scopes
3. Rotate keys quarterly (doctor command reminds you)

```bash
# Audit your security posture
quallaa doctor --audit-secrets
```

## 📚 Documentation & Support

- **Documentation** - See this README for complete usage guide
- **[Changelog](CHANGELOG.md)** - Version history and updates
- **[Issues](https://github.com/jefftoffoli/quallaa-cli/issues)** - Report bugs or request features
- **Examples** - Coming soon at github.com/jefftoffoli/quallaa-examples

## 🛠️ Troubleshooting

```bash
# Check everything is working
quallaa doctor

# Verify service authentication
quallaa doctor --verbose

# Audit for security issues
quallaa doctor --audit-secrets

# Update to latest version
npm update -g quallaa-cli

# Or with npx (always latest)
npx quallaa-cli@latest doctor
```

## 🎯 Philosophy

**Domain Engineering**: Bridge the gap between business expertise and technical implementation

- **Ship Outcomes, Not Code**: Focus on business results, not technology
- **Minimalist & Disposable**: Build simple systems meant to be replaced
- **Measure What Matters**: Track business metrics, not technical metrics
- **AI-Ready Context**: Give AI assistants deep domain understanding

## 📦 What's in the Box?

After running `quallaa outcome`, your project includes:

```
project-name/
├── contracts/          # JSON schemas for data structures
├── connectors/         # Service integrations (or /integrations for minimal)
├── jobs/              # Background workers and cron jobs
├── evaluators/        # Gold datasets and scoring scripts
├── exceptions/        # Error handling and manual review queues
├── lib/               # Domain logic and utilities
├── app/               # Next.js pages (web variant only)
├── api/               # API endpoints
├── CLAUDE.md          # AI context file
├── .env.example       # Environment variables template
└── package.json       # Dependencies and scripts
```

## 🚢 Deployment

Both architectures are production-ready:

### Web + Jobs → Vercel
```bash
vercel deploy
```

### Headless Worker → Fly.io
```bash
fly launch
fly deploy
```

## 🤝 Contributing

This is a living tool that improves with community feedback. Contributions welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

Built for domain experts who ship real business value. Special thanks to the early adopters testing outcome templates in production.

---

**Ready to ship an outcome?** Start with `quallaa outcome --template order-cash-reco` and have a working system in 90 seconds.