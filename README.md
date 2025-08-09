# Quallaa CLI

> Sets up core infrastructure services for AI-assisted development

[![npm version](https://badge.fury.io/js/%40quallaa%2Fcli.svg)](https://badge.fury.io/js/%40quallaa%2Fcli)
[![Node.js Version](https://img.shields.io/node/v/@quallaa/cli.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What It Does

Quallaa CLI sets up common infrastructure services needed for development projects, configured to work well with AI development assistants.

### What You Get

- **Infrastructure Setup**: Automated configuration of database, hosting, email, and other services
- **AI Context Generation**: Creates detailed context files for AI development assistants
- **Role-Based Configuration**: Setup tailored to your role (founder, product manager, marketing, operations)
- **Service Integration**: Pre-configured connections between different services

## 📋 Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** or **yarn** package manager
- **Git** for version control
- Accounts with supported services (all have generous free tiers):
  - [Vercel](https://vercel.com) - Hosting and deployment
  - [Supabase](https://supabase.com) - Database and authentication
  - [GitHub](https://github.com) - Version control
  - [Resend](https://resend.com) - Email infrastructure
  - [Typesense](https://typesense.org) - Search (optional)

## 🔧 Installation

```bash
npm install -g @quallaa/cli
```

## 🎯 Quick Start

### 1. Initialize a New Project

```bash
quallaa init
```

This will:
- Collect your information for support and improvements
- Guide you through role selection (Technical Co-Founder, Product Manager, Marketing Lead, Operations Manager)
- Set up your preferred services
- Generate a complete Next.js application with role-specific configuration
- Create a custom `CLAUDE.md` file with detailed project context for AI assistants

### 2. Set Up Individual Services

You can also set up services individually:

```bash
quallaa setup vercel    # Hosting and deployment
quallaa setup supabase  # Database and authentication
quallaa setup github    # Version control
quallaa setup resend    # Email service
quallaa setup typesense # Search (optional)
```

### 3. Generate Additional Context

```bash
quallaa generate claude  # Generate/update CLAUDE.md with role-specific context
```

## 🎭 Role-Based Experience

### Technical Co-Founder / First Engineer
- **Focus**: Scalable architecture and team processes
- **Context**: Full-stack development, technical decisions, team scaling
- **Libraries**: Next.js, TypeScript, Supabase, performance optimization

### Product Manager / Product Owner  
- **Focus**: Data-driven product decisions
- **Context**: User analytics, A/B testing, feature tracking, customer feedback
- **Libraries**: Analytics, experimentation frameworks, dashboard tools

### Marketing Lead / Growth Hacker
- **Focus**: Customer acquisition and retention
- **Context**: Campaign tracking, segmentation, email automation, attribution
- **Libraries**: Marketing automation, CRM integration, performance tracking

### Operations Manager / Business Manager
- **Focus**: Process automation and efficiency
- **Context**: Workflow automation, data pipelines, reporting, integrations
- **Libraries**: Automation tools, data processing, dashboard creation

## 🛠 Services Integration

### Vercel (Hosting & Deployment)
- **Authentication**: OAuth browser flow or API token
- **Features**: Project creation, environment variables, deployments
- **Cost**: Generous free tier, pay for scale

### Supabase (Database & Auth)
- **Authentication**: Built-in CLI authentication
- **Features**: PostgreSQL, Row Level Security, real-time, pgvector for AI
- **Cost**: Generous free tier, pay for scale

### GitHub (Version Control)
- **Authentication**: GitHub CLI or Personal Access Token
- **Features**: Repository creation, branch protection, webhooks
- **Cost**: Free for public repos, paid for private/teams

### Resend (Email Infrastructure)
- **Authentication**: API key
- **Features**: Transactional emails, domain verification, delivery tracking
- **Cost**: 3,000 emails/month free, pay for scale

### Typesense (Search) - Optional
- **Authentication**: API key (cloud or self-hosted)
- **Features**: Fast, typo-tolerant search, collections, analytics
- **Cost**: Varies by hosting choice

## 📂 Generated Project Structure

```
your-project/
├── app/                    # Next.js 15 App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── api/               # API routes
├── components/            # React components
│   └── ui/               # Reusable UI components
├── lib/                  # Utilities and configurations
│   ├── supabase.ts       # Database client
│   ├── resend.ts         # Email client
│   └── types.ts          # TypeScript definitions
├── CLAUDE.md             # AI context and instructions
├── .env.example          # Environment variables template
├── .env.local            # Your actual environment variables
└── README.md             # Project documentation
```

## 🤖 The CLAUDE.md Advantage

The generated `CLAUDE.md` file gives Claude Code comprehensive context about your project:

- **Role-Specific Context**: Tailored instructions for your domain expertise
- **Service Configuration**: Details about your integrated services  
- **Development Commands**: All the commands you need for development
- **Architecture Overview**: Understanding of your tech stack and decisions
- **Common Tasks**: Role-specific tasks and workflows
- **Libraries & Dependencies**: What tools are available and how to use them

This means AI assistants can provide more specific and relevant help for your project.

## 🔒 Security & Privacy

### Data Collection
- **Required**: Name, email, role selection (for support and improvements)
- **Optional**: Company name, additional context
- **Usage Analytics**: Basic command usage (can be opted out)
- **No Sensitive Data**: We never collect API keys, passwords, or proprietary code

### Credential Storage
- **Local Only**: All service credentials stored securely on your machine
- **OS-Level Security**: Uses your operating system's credential manager
- **Encrypted**: Credentials encrypted at rest
- **No Transmission**: Credentials never sent to Quallaa servers

## 🆘 Support & Troubleshooting

### Common Issues

1. **Node.js Version**: Ensure you're using Node.js 18.0.0 or higher
2. **Service Authentication**: Check that your API keys and tokens are correct
3. **Network Issues**: Some operations require internet connectivity
4. **Permissions**: Ensure you have proper permissions for service operations

### Getting Help

- **Documentation**: [https://docs.quallaa.com](https://docs.quallaa.com)
- **Issues**: [https://github.com/quallaa/quallaa-cli/issues](https://github.com/quallaa/quallaa-cli/issues)
- **Email**: [support@quallaa.com](mailto:support@quallaa.com)

### Debug Mode

```bash
DEBUG=quallaa* quallaa init  # Enable debug logging
```

## 🔄 Updates

The CLI automatically checks for updates and will notify you when a new version is available:

```bash
npm update -g @quallaa/cli  # Update to latest version
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/quallaa/quallaa-cli.git
cd quallaa-cli
npm install
npm run dev     # Watch mode
npm run build   # Build for production
npm test        # Run tests
```

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## Why Use Quallaa CLI?

Quallaa CLI simplifies the process of setting up development infrastructure by:

1. **Automating Setup**: Handles the configuration of multiple services in one command
2. **Providing Context**: Generates detailed documentation for AI development assistants
3. **Role-Based Configuration**: Tailors setup to different team roles and needs
4. **Service Integration**: Pre-configures services to work well together
5. **Reducing Setup Time**: Gets you from zero to working infrastructure quickly

---

*Built with ❤️ by [Quallaa](https://quallaa.com) - Domain Engineering for the AI Era*