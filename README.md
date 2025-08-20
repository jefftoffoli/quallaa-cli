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

# Create an Order-to-Cash reconciliation system
quallaa outcome --template order-cash-reco

# Run evaluation harness
quallaa evaluators run --format html
open evaluators/scorecard.html

# Check system health
quallaa doctor --audit-secrets
```

This generates a tiny Next.js+Jobs project with real business workflow scaffolding, data contracts, service connectors, and an HTML scorecard showing accuracy, rework ratio, processing time, and unit cost.

## 🎯 What is Quallaa CLI?

**Quallaa CLI** helps domain experts (founders, product managers, marketers, operations managers) ship production-ready business outcomes using AI-assisted development. Instead of starting with a blank canvas, you get:

- **🏗️ Outcome Templates**: Pre-built workflows for common business processes (reconciliation, lead management)
- **🤖 AI Context**: Rich CLAUDE.md files that give AI assistants deep understanding of your domain
- **📊 Evaluation Harness**: Measure what matters - accuracy, rework, time, and cost
- **🔒 Security Built-in**: Secrets auditing, credential rotation reminders, secure storage
- **⚡ Two Architectures**: Choose between full web apps or headless workers

## 📦 Outcome Pack Templates

### Order-to-Cash Reconciliation
```bash
quallaa outcome --template order-cash-reco
```
Generates:
```
/contracts       # Order, Payment, Invoice schemas
/connectors      # Shopify, Stripe, QuickBooks integrations  
/jobs            # Daily reconciliation, exception handling
/evaluators      # Match rate, timing accuracy metrics
/exceptions      # Mismatch queue with manual review UI
```

### Lead Lifecycle Management
```bash
quallaa outcome --template lead-lifecycle-core
```
Generates:
```
/contracts       # Lead, Company, Activity schemas
/connectors      # CRM, enrichment, email integrations
/jobs            # Deduplication, routing, SLA tracking
/evaluators      # Response time, conversion metrics
/workflows       # Lead scoring and assignment rules
```

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
quallaa outcome --template order-cash-reco
quallaa outcome --template lead-lifecycle-core
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

All services have generous free tiers:

- **[Vercel](https://vercel.com)** - Hosting and deployment
- **[Supabase](https://supabase.com)** - Database and authentication
- **[GitHub](https://github.com)** - Version control
- **[Resend](https://resend.com)** - Transactional email
- **[Typesense](https://typesense.org)** - Search (optional)
- **[Neon](https://neon.tech)** - Serverless Postgres (alternative to Supabase)

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