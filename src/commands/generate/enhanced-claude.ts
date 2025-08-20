import { ProjectConfig, Role } from '../../types';
import { founderContext, founderSections } from '../../contexts/role-contexts/founder';
import { productContext, productSections } from '../../contexts/role-contexts/product';
import { marketingContext, marketingSections } from '../../contexts/role-contexts/marketing';
import { operationsContext, operationsSections } from '../../contexts/role-contexts/operations';
import { getAllCredentials } from '../../storage/credentials';
import { projectAnalyzer, ProjectAnalysis } from '../../lib/analyzers/project-analyzer';

const roleContexts = {
  founder: { context: founderContext, sections: founderSections },
  product: { context: productContext, sections: productSections },
  marketing: { context: marketingContext, sections: marketingSections },
  operations: { context: operationsContext, sections: operationsSections },
};

export interface AugmentationOptions {
  contracts?: boolean;
  apis?: boolean;
  metrics?: boolean;
  integrations?: boolean;
}

export async function generateEnhancedClaudeMd(
  config: ProjectConfig, 
  augmentations: AugmentationOptions = {}
): Promise<void> {
  const roleData = roleContexts[config.role];
  const credentials = await getAllCredentials();
  
  // Analyze project if any augmentations are requested
  let analysis: ProjectAnalysis | null = null;
  if (Object.values(augmentations).some(Boolean)) {
    console.log('🔍 Analyzing project structure...');
    analysis = await projectAnalyzer.analyzeProject();
  }
  
  const claudeContent = await generateEnhancedContent(config, roleData, credentials, analysis, augmentations);
  
  const fs = await import('fs/promises');
  await fs.writeFile('CLAUDE.md', claudeContent);
}

async function generateEnhancedContent(
  config: ProjectConfig,
  roleData: any,
  credentials: any,
  analysis: ProjectAnalysis | null,
  augmentations: AugmentationOptions
): Promise<string> {
  const services = config.services.join(', ');
  const timestamp = new Date().toISOString();
  
  let content = `# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**Project Name:** ${config.name}
**Role:** ${roleData.context.title}
**Services:** ${services}
**Generated:** ${timestamp}
${analysis ? `**Project Analysis:** Augmented with codebase analysis\n` : ''}

${roleData.context.description}

## Development Commands

- \`npm run dev\` - Start development server with Turbopack (http://localhost:3000)
- \`npm run build\` - Build production application  
- \`npm run start\` - Start production server
- \`npm run lint\` - Run ESLint for code quality checks
- \`npm run type-check\` - Run TypeScript type checking

${generateSupabaseCommands(config.services)}
${generateVercelCommands(config.services)}
${generateOutcomeCommands(analysis)}

## Environment Variables

${generateEnvironmentVariables(credentials)}

## Project Purpose

${generateProjectPurpose(config.role)}

## Architecture

This is a Next.js 15 application using the App Router architecture with TypeScript and modern tooling.

### Key Structure
- **App Router**: Uses Next.js App Router with \`app/\` directory structure
- **Styling**: TailwindCSS with CSS custom properties for theming
- **Database**: ${config.services.includes('supabase') ? 'Supabase PostgreSQL with Row Level Security' : 'To be configured'}
- **Authentication**: ${config.services.includes('supabase') ? 'Supabase Auth with user management' : 'To be configured'}
- **Email**: ${config.services.includes('resend') ? 'Resend for transactional emails' : 'To be configured'}
- **Search**: ${generateSearchConfig(config.services)}
- **Hosting**: ${config.services.includes('vercel') ? 'Vercel with edge functions' : 'To be configured'}

### Directory Structure
- \`app/\` - App Router pages and layouts
  - \`layout.tsx\` - Root layout with configuration
  - \`page.tsx\` - Home page component
  - \`globals.css\` - Global styles with design system
  - \`api/\` - API routes for server-side functionality
- \`components/\` - Reusable UI components
  - \`ui/\` - Base UI components (buttons, forms, etc.)
  - \`sections/\` - Page section components
- \`lib/\` - Utility libraries and configurations
  - \`supabase.ts\` - Database client configuration
  - \`types.ts\` - TypeScript type definitions
- \`middleware.ts\` - Authentication and routing middleware
${analysis && augmentations.contracts ? generateContractsSection(analysis) : ''}
${analysis && augmentations.integrations ? generateIntegrationsSection(analysis) : ''}

${roleData.sections}

${analysis && augmentations.contracts ? generateDataContractsSection(analysis) : ''}
${analysis && augmentations.apis ? generateApiDocumentationSection(analysis) : ''}
${analysis && augmentations.metrics ? generateMetricsSection(analysis) : ''}

## Libraries & Dependencies

### Core Framework
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type safety and developer experience
- **TailwindCSS**: Utility-first styling system

### ${roleData.context.title} Libraries
${roleData.context.libraries.map((lib: string) => `- **${lib.split(' - ')[0]}** - ${lib.split(' - ')[1]}`).join('\n')}

### Database & Backend
${generateDatabaseSection(config.services)}

### Authentication & Security
${generateAuthSection(config.services)}

### Email & Communications  
${generateEmailSection(config.services)}

### Analytics & Monitoring
${generateAnalyticsSection(config.services)}

## Common ${roleData.context.title} Tasks

${roleData.context.commonTasks.map((task: string) => `- ${task}`).join('\n')}

## Development Guidelines

### Code Organization
- Follow Next.js App Router conventions
- Use TypeScript for all components and utilities
- Implement proper error handling and loading states
- Create reusable components with consistent props

### Database Guidelines
${generateDatabaseGuidelines(config.services)}

### Authentication Guidelines  
${generateAuthGuidelines(config.services)}

### Performance Guidelines
- Optimize images with Next.js Image component
- Implement proper caching strategies
- Use React Suspense for loading states
- Minimize bundle size with code splitting

${analysis && augmentations.contracts ? generateContractGuidelines(analysis) : ''}
${analysis && augmentations.apis ? generateApiGuidelines(analysis) : ''}
${analysis && augmentations.metrics ? generateMetricsGuidelines(analysis) : ''}

## Getting Started

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set Up Environment Variables**
   Copy \`.env.example\` to \`.env.local\` and fill in your service credentials.

3. **${config.services.includes('supabase') ? 'Initialize Database' : 'Set Up Database'}**
   ${config.services.includes('supabase') ? 
     '```bash\n   supabase start\n   supabase db push\n   ```' : 
     'Configure your chosen database solution.'}

4. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open Application**
   Visit [http://localhost:3000](http://localhost:3000) to see your application.

## Support & Resources

- **Quallaa Documentation**: [https://docs.quallaa.com](https://docs.quallaa.com)
- **Next.js Documentation**: [https://nextjs.org/docs](https://nextjs.org/docs)
${config.services.includes('supabase') ? '- **Supabase Documentation**: [https://supabase.com/docs](https://supabase.com/docs)' : ''}
${config.services.includes('vercel') ? '- **Vercel Documentation**: [https://vercel.com/docs](https://vercel.com/docs)' : ''}
${config.services.includes('resend') ? '- **Resend Documentation**: [https://resend.com/docs](https://resend.com/docs)' : ''}

---

*Generated by Quallaa CLI - AI-native development for domain experts*
${analysis ? `*Enhanced with project analysis - ${analysis.contracts.length} contracts, ${analysis.apis.length} APIs, ${analysis.metrics.length} metrics analyzed*` : ''}
`;

  return content;
}

function generateOutcomeCommands(analysis: ProjectAnalysis | null): string {
  if (!analysis || analysis.metrics.length === 0) return '';
  
  return `
### Outcome & Evaluation Commands
- \`npm run evaluate\` - Run outcome evaluation metrics
- \`npm run test:evaluators\` - Test evaluation framework
- \`npm run metrics\` - Generate metrics report
`;
}

function generateContractsSection(analysis: ProjectAnalysis): string {
  if (analysis.contracts.length === 0) return '';
  
  return `
- \`contracts/\` - Data contract definitions and schemas
${analysis.contracts.map(contract => `  - \`${contract.file}\` - ${contract.name} contract`).join('\n')}`;
}

function generateIntegrationsSection(analysis: ProjectAnalysis): string {
  if (analysis.integrations.length === 0) return '';
  
  return `
- \`connectors/\` - External service integrations
${analysis.integrations.map(integration => `  - ${integration.service} integration (${integration.type})`).join('\n')}`;
}

function generateDataContractsSection(analysis: ProjectAnalysis): string {
  if (analysis.contracts.length === 0) return '';
  
  return `
## Data Contracts

This project uses structured data contracts to ensure data consistency and type safety across the application.

### Contract Overview
${analysis.contracts.map(contract => `
#### ${contract.name}
- **File**: \`${contract.file}\`
- **Types**: ${contract.types.join(', ')}
${contract.description ? `- **Description**: ${contract.description}` : ''}
${contract.schema.type === 'object' ? generateSchemaOverview(contract.schema) : ''}`).join('\n')}

### Working with Contracts
- All contracts include TypeScript type definitions
- Validation functions are provided for runtime checking
- Example data is available for testing and development
- Contracts serve as the single source of truth for data structure
`;
}

function generateApiDocumentationSection(analysis: ProjectAnalysis): string {
  if (analysis.apis.length === 0) return '';
  
  return `
## API Documentation

### Internal APIs
${analysis.apis.filter(api => api.type === 'internal').map(api => `
#### ${api.name}
${api.endpoints.map(endpoint => `- **${endpoint.method.toUpperCase()}** \`${endpoint.path}\`${endpoint.description ? ` - ${endpoint.description}` : ''}`).join('\n')}`).join('\n')}

### External API Integrations
${analysis.apis.filter(api => api.type === 'external').map(api => `
#### ${api.name}
- **Base URL**: ${api.baseUrl || 'Configuration required'}
- **File**: \`${api.file}\`
${api.authentication ? `- **Authentication**: ${api.authentication}` : ''}`).join('\n')}

### API Guidelines
- All internal APIs follow RESTful conventions
- Use proper HTTP status codes for responses
- Implement request validation and error handling
- Document all endpoints with OpenAPI/Swagger when possible
`;
}

function generateMetricsSection(analysis: ProjectAnalysis): string {
  if (analysis.metrics.length === 0) return '';
  
  const kpis = analysis.metrics.filter(m => m.type === 'kpi');
  const events = analysis.metrics.filter(m => m.type === 'event');
  const counters = analysis.metrics.filter(m => m.type === 'counter');
  const gauges = analysis.metrics.filter(m => m.type === 'gauge');
  
  return `
## Metrics & Analytics

### Key Performance Indicators (KPIs)
${kpis.length > 0 ? kpis.map(kpi => `- **${kpi.name}**${kpi.description ? ` - ${kpi.description}` : ''}`).join('\n') : '- No KPIs defined yet'}

### Tracking Events
${events.length > 0 ? events.map(event => `- **${event.name}**${event.description ? ` - ${event.description}` : ''}`).join('\n') : '- No tracking events defined yet'}

### Counters & Gauges
${[...counters, ...gauges].length > 0 ? [...counters, ...gauges].map(metric => `- **${metric.name}** (${metric.type})${metric.description ? ` - ${metric.description}` : ''}`).join('\n') : '- No counters or gauges defined yet'}

### Metrics Collection
- Metrics are collected throughout the application lifecycle
- Data is stored and can be queried for analysis
- Dashboard visualizations are available for key metrics
- Automated alerts can be configured for threshold breaches
`;
}

function generateContractGuidelines(analysis: ProjectAnalysis): string {
  if (analysis.contracts.length === 0) return '';
  
  return `
### Data Contract Guidelines
- Always validate data against contracts before processing
- Use provided TypeScript types for compile-time safety
- Update contracts when data structure changes
- Generate types after contract modifications
- Include example data for testing purposes
`;
}

function generateApiGuidelines(analysis: ProjectAnalysis): string {
  if (analysis.apis.length === 0) return '';
  
  return `
### API Integration Guidelines
- Use environment variables for API configuration
- Implement proper error handling and retry logic
- Add authentication headers for external APIs
- Log API calls for debugging and monitoring
- Use TypeScript types for request/response data
`;
}

function generateMetricsGuidelines(analysis: ProjectAnalysis): string {
  if (analysis.metrics.length === 0) return '';
  
  return `
### Metrics & Analytics Guidelines
- Track user actions for product insights
- Monitor system performance and health
- Use consistent naming conventions for events
- Implement privacy-conscious analytics
- Set up alerts for critical metric thresholds
`;
}

function generateSchemaOverview(schema: any): string {
  if (schema.properties) {
    const requiredFields = schema.required || [];
    const properties = Object.entries(schema.properties).slice(0, 5); // Show first 5 properties
    
    return `
- **Properties**: ${properties.map(([key, prop]: [string, any]) => `${key}${requiredFields.includes(key) ? '*' : ''} (${prop.type || 'any'})`).join(', ')}
${properties.length < Object.keys(schema.properties).length ? `- **...and ${Object.keys(schema.properties).length - properties.length} more properties**` : ''}`;
  }
  return '';
}

// Re-use existing helper functions from claude.ts
function generateSupabaseCommands(services: string[]): string {
  if (!services.includes('supabase')) return '';
  
  return `
### Supabase Commands
- \`supabase start\` - Start local Supabase development environment
- \`supabase db push\` - Push schema changes to database
- \`supabase db pull\` - Pull schema changes from remote database
- \`supabase migration new <name>\` - Create new migration file
- \`supabase gen types typescript --local\` - Generate TypeScript types
`;
}

function generateVercelCommands(services: string[]): string {
  if (!services.includes('vercel')) return '';
  
  return `
### Vercel Commands
- \`vercel dev\` - Start Vercel development server locally
- \`vercel\` - Deploy to preview environment
- \`vercel --prod\` - Deploy to production
- \`vercel env pull\` - Pull environment variables from Vercel
`;
}

function generateEnvironmentVariables(credentials: any): string {
  const envVars = [];
  
  if (credentials.supabase) {
    envVars.push(`
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`);
  }
  
  if (credentials.resend) {
    envVars.push(`
# Resend
RESEND_API_KEY=your_resend_api_key`);
  }
  
  if (credentials.typesense) {
    envVars.push(`
# Typesense (Optional)
TYPESENSE_HOST=your_typesense_host
TYPESENSE_PORT=443
TYPESENSE_PROTOCOL=https
TYPESENSE_API_KEY=your_typesense_api_key`);
  }
  
  return envVars.join('\n') || '# Configure environment variables based on your services';
}

function generateProjectPurpose(role: Role): string {
  const purposes = {
    founder: `This application serves as the technical foundation for scaling your startup with AI-native infrastructure. Instead of paying for multiple SaaS subscriptions, you own your entire stack and can customize it exactly to your business needs.`,
    product: `This application enables data-driven product decisions through custom analytics and user tracking. Build exactly the product metrics you need without expensive third-party analytics tools.`,
    marketing: `This application powers your marketing operations with customer segmentation, campaign tracking, and automated email sequences. Own your customer data and marketing automation without vendor lock-in.`,
    operations: `This application streamlines your business operations through custom workflows, data pipelines, and reporting dashboards. Automate processes specific to your business without generic workflow tools.`,
  };
  
  return purposes[role];
}

function generateSearchConfig(services: string[]): string {
  const searchOptions = [];
  
  if (services.includes('supabase')) {
    searchOptions.push('pgvector for semantic search');
  }
  
  if (services.includes('typesense')) {
    searchOptions.push('Typesense for keyword search');
  }
  
  return searchOptions.length > 0 ? searchOptions.join(', ') : 'To be configured';
}

function generateDatabaseSection(services: string[]): string {
  if (services.includes('supabase')) {
    return `- **Supabase**: PostgreSQL with Row Level Security
- **pgvector**: Vector embeddings for AI-powered search
- **Real-time**: Live data updates with WebSocket subscriptions
- **Migrations**: Version-controlled schema changes`;
  }
  
  return '- Configure your chosen database solution';
}

function generateAuthSection(services: string[]): string {
  if (services.includes('supabase')) {
    return `- **Supabase Auth**: Built-in authentication with multiple providers
- **Row Level Security**: Database-level access control
- **JWT Sessions**: Secure token-based session management
- **User Management**: Built-in user registration and management`;
  }
  
  return '- Configure your chosen authentication solution';
}

function generateEmailSection(services: string[]): string {
  if (services.includes('resend')) {
    return `- **Resend**: Transactional email delivery
- **Email Templates**: HTML email template system
- **Delivery Tracking**: Open and click tracking
- **Domain Authentication**: DKIM and SPF configuration`;
  }
  
  return '- Configure your chosen email solution';
}

function generateAnalyticsSection(services: string[]): string {
  const analytics = ['- **Vercel Analytics**: Performance and user analytics (zero-config)'];
  
  if (services.includes('supabase')) {
    analytics.push('- **Custom Analytics**: Track user behavior in your database');
  }
  
  return analytics.join('\n');
}

function generateDatabaseGuidelines(services: string[]): string {
  if (services.includes('supabase')) {
    return `- Use Row Level Security policies for all tables
- Create migrations for schema changes
- Generate TypeScript types from database schema
- Use real-time subscriptions for live data
- Implement proper indexing for performance`;
  }
  
  return '- Follow best practices for your chosen database solution';
}

function generateAuthGuidelines(services: string[]): string {
  if (services.includes('supabase')) {
    return `- Use Supabase Auth for user management
- Implement proper session handling in middleware
- Use RLS policies for data access control
- Handle authentication state in React components
- Implement proper error handling for auth flows`;
  }
  
  return '- Follow best practices for your chosen authentication solution';
}