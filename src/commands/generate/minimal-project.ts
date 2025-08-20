import { ProjectConfig } from '../../types';

export async function generateMinimalProject(config: ProjectConfig): Promise<void> {
  const fs = await import('fs/promises');
  
  // Create minimal project directory
  await fs.mkdir(config.name, { recursive: true });
  process.chdir(config.name);
  
  // Generate minimal structure
  await generateMinimalStructure();
  
  // Generate minimal package.json (Node.js focused)
  await generateMinimalPackageJson(config);
  
  // Generate basic configuration files
  await generateMinimalTsConfig();
  await generateMinimalGitignore();
  
  // Generate evaluator framework
  await generateEvaluatorFramework();
  
  // Generate job templates
  await generateJobTemplates();
  
  // Generate basic API endpoints
  await generateMinimalApiEndpoints();
  
  // Generate environment file template
  await generateMinimalEnvExample(config);
  
  // Generate main index.ts
  await generateMainIndex(config);
  
  // Generate README.md
  await generateMinimalReadme(config);
}

async function generateMinimalStructure(): Promise<void> {
  const directories = [
    'jobs',           // Cron/queue workers
    'evaluators',     // Gold data + scoring scripts
    'contracts',      // JSON schemas
    'integrations',   // API clients
    'lib',           // Domain logic
    'api',           // Minimal API endpoints
  ];

  const fs = await import('fs/promises');
  for (const dir of directories) {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function generateMinimalPackageJson(config: ProjectConfig): Promise<void> {
  const packageJson = {
    name: config.name,
    version: '0.1.0',
    type: 'module',
    private: true,
    scripts: {
      start: 'node dist/index.js',
      dev: 'tsx watch src/index.ts',
      build: 'tsc',
      test: 'vitest',
      'test:run': 'vitest run',
      lint: 'eslint src --ext .ts',
      'type-check': 'tsc --noEmit',
      evaluate: 'node dist/evaluators/index.js',
      'cron:daily': 'node dist/jobs/daily.js',
      'cron:hourly': 'node dist/jobs/hourly.js',
    },
    dependencies: {
      'node-cron': '^3.0.3',
      'dotenv': '^16.4.5',
      axios: '^1.7.2',
      zod: '^3.22.4',
      ...(config.services.includes('supabase') && {
        '@supabase/supabase-js': '^2.45.0',
      }),
      ...(config.services.includes('resend') && {
        resend: '^4.0.0',
      }),
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      '@types/node-cron': '^3.0.11',
      typescript: '^5.3.3',
      tsx: '^4.0.0',
      vitest: '^1.6.0',
      eslint: '^8.57.0',
      '@typescript-eslint/eslint-plugin': '^7.18.0',
      '@typescript-eslint/parser': '^7.18.0',
    },
    engines: {
      node: '>=18.0.0',
    },
  };

  const fs = await import('fs/promises');
  await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
}

async function generateMinimalTsConfig(): Promise<void> {
  const tsConfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'node',
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      outDir: './dist',
      rootDir: './src',
      declaration: true,
      sourceMap: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };

  const fs = await import('fs/promises');
  await fs.writeFile('tsconfig.json', JSON.stringify(tsConfig, null, 2));
}

async function generateMinimalGitignore(): Promise<void> {
  const gitignore = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build output
dist/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# Logs
logs/
*.log

# Runtime
pids/
*.pid
*.seed
*.pid.lock

# Coverage
coverage/
.nyc_output

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Temporary
tmp/
temp/
`;

  const fs = await import('fs/promises');
  await fs.writeFile('.gitignore', gitignore);
}

async function generateEvaluatorFramework(): Promise<void> {
  const fs = await import('fs/promises');
  
  // Main evaluator
  const evaluatorContent = `/**
 * Outcome Evaluator
 * Minimalist evaluation harness for outcome metrics
 */

export interface Metric {
  name: string;
  value: number;
  threshold: number;
  unit: string;
}

export class OutcomeEvaluator {
  /**
   * Run evaluation and return key metrics
   */
  async evaluate(): Promise<Metric[]> {
    const metrics: Metric[] = [];
    
    // Accuracy: How often do we get the right answer?
    metrics.push(await this.measureAccuracy());
    
    // Rework ratio: How often do we need manual intervention?
    metrics.push(await this.measureReworkRatio());
    
    // Time to output: How fast do we process each item?
    metrics.push(await this.measureProcessingTime());
    
    // Unit cost: What does each processing run cost?
    metrics.push(await this.measureUnitCost());
    
    return metrics;
  }
  
  private async measureAccuracy(): Promise<Metric> {
    // TODO: Implement accuracy measurement against gold dataset
    return {
      name: 'accuracy',
      value: 0.95, // 95%
      threshold: 0.90,
      unit: 'ratio',
    };
  }
  
  private async measureReworkRatio(): Promise<Metric> {
    // TODO: Count items requiring manual intervention
    return {
      name: 'rework_ratio',
      value: 0.03, // 3%
      threshold: 0.05,
      unit: 'ratio',
    };
  }
  
  private async measureProcessingTime(): Promise<Metric> {
    // TODO: Measure average processing time per item
    return {
      name: 'processing_time',
      value: 2.1, // 2.1 seconds
      threshold: 5.0,
      unit: 'seconds',
    };
  }
  
  private async measureUnitCost(): Promise<Metric> {
    // TODO: Calculate cost per processed item
    return {
      name: 'unit_cost',
      value: 0.08, // $0.08
      threshold: 0.10,
      unit: 'usd',
    };
  }
}

// CLI runner
if (import.meta.url === \`file://\${process.argv[1]}\`) {
  const evaluator = new OutcomeEvaluator();
  const metrics = await evaluator.evaluate();
  
  console.log('📊 Outcome Evaluation Results');
  console.log('─'.repeat(40));
  
  for (const metric of metrics) {
    const passed = metric.value >= metric.threshold;
    const icon = passed ? '✅' : '❌';
    const formatted = formatMetric(metric);
    
    console.log(\`\${icon} \${metric.name}: \${formatted} (threshold: \${formatThreshold(metric)})\`);
  }
}

function formatMetric(metric: Metric): string {
  switch (metric.unit) {
    case 'ratio': return \`\${(metric.value * 100).toFixed(1)}%\`;
    case 'usd': return \`$\${metric.value.toFixed(3)}\`;
    case 'seconds': return \`\${metric.value.toFixed(2)}s\`;
    default: return metric.value.toString();
  }
}

function formatThreshold(metric: Metric): string {
  switch (metric.unit) {
    case 'ratio': return \`\${(metric.threshold * 100).toFixed(1)}%\`;
    case 'usd': return \`$\${metric.threshold.toFixed(3)}\`;
    case 'seconds': return \`\${metric.threshold.toFixed(2)}s\`;
    default: return metric.threshold.toString();
  }
}
`;

  await fs.writeFile('src/evaluators/index.ts', evaluatorContent);

  // Gold dataset template
  const goldDataContent = `/**
 * Gold dataset for evaluation
 * 
 * This file contains known good inputs and expected outputs
 * for measuring accuracy and regression testing.
 */

export interface GoldRecord {
  id: string;
  input: any;
  expectedOutput: any;
  metadata?: Record<string, any>;
}

export const goldDataset: GoldRecord[] = [
  {
    id: 'sample_001',
    input: {
      // TODO: Add sample input data
    },
    expectedOutput: {
      // TODO: Add expected output for this input
    },
    metadata: {
      category: 'basic',
      complexity: 'low',
    },
  },
  // TODO: Add more gold records
];

/**
 * Load gold dataset for testing
 */
export function loadGoldDataset(): GoldRecord[] {
  return goldDataset;
}
`;

  await fs.writeFile('src/evaluators/gold-data.ts', goldDataContent);
}

async function generateJobTemplates(): Promise<void> {
  const fs = await import('fs/promises');
  
  // Daily job template
  const dailyJobContent = `/**
 * Daily scheduled job
 * 
 * Runs once per day to process accumulated data
 */

import cron from 'node-cron';

export async function runDailyJob(): Promise<void> {
  console.log('🔄 Starting daily job...', new Date().toISOString());
  
  try {
    // TODO: Implement daily processing logic
    
    console.log('✅ Daily job completed successfully');
  } catch (error) {
    console.error('❌ Daily job failed:', error);
    throw error;
  }
}

// Schedule job (runs at 2 AM daily)
if (process.env.NODE_ENV === 'production') {
  cron.schedule('0 2 * * *', runDailyJob);
  console.log('📅 Daily job scheduled for 2:00 AM');
}

// CLI runner
if (import.meta.url === \`file://\${process.argv[1]}\`) {
  await runDailyJob();
}
`;

  await fs.writeFile('src/jobs/daily.ts', dailyJobContent);

  // Hourly job template
  const hourlyJobContent = `/**
 * Hourly scheduled job
 * 
 * Runs every hour for frequent processing tasks
 */

import cron from 'node-cron';

export async function runHourlyJob(): Promise<void> {
  console.log('🔄 Starting hourly job...', new Date().toISOString());
  
  try {
    // TODO: Implement hourly processing logic
    
    console.log('✅ Hourly job completed successfully');
  } catch (error) {
    console.error('❌ Hourly job failed:', error);
    throw error;
  }
}

// Schedule job (runs at the top of every hour)
if (process.env.NODE_ENV === 'production') {
  cron.schedule('0 * * * *', runHourlyJob);
  console.log('⏰ Hourly job scheduled for top of each hour');
}

// CLI runner
if (import.meta.url === \`file://\${process.argv[1]}\`) {
  await runHourlyJob();
}
`;

  await fs.writeFile('src/jobs/hourly.ts', hourlyJobContent);

  // Job queue template
  const queueJobContent = `/**
 * Queue-based job processor
 * 
 * Processes jobs from a queue (Redis, database, etc.)
 */

export interface Job {
  id: string;
  type: string;
  data: any;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
}

export class JobProcessor {
  /**
   * Process a single job
   */
  async processJob(job: Job): Promise<void> {
    console.log(\`🔄 Processing job \${job.id} (type: \${job.type})\`);
    
    try {
      switch (job.type) {
        case 'data_sync':
          await this.processDataSync(job.data);
          break;
          
        case 'reconciliation':
          await this.processReconciliation(job.data);
          break;
          
        default:
          throw new Error(\`Unknown job type: \${job.type}\`);
      }
      
      console.log(\`✅ Job \${job.id} completed successfully\`);
    } catch (error) {
      console.error(\`❌ Job \${job.id} failed:\`, error);
      
      if (job.attempts < job.maxAttempts) {
        // Retry logic would go here
        console.log(\`🔄 Will retry job \${job.id} (attempt \${job.attempts + 1}/\${job.maxAttempts})\`);
      } else {
        console.error(\`💀 Job \${job.id} exceeded max attempts, moving to dead letter queue\`);
      }
      
      throw error;
    }
  }
  
  private async processDataSync(data: any): Promise<void> {
    // TODO: Implement data synchronization logic
  }
  
  private async processReconciliation(data: any): Promise<void> {
    // TODO: Implement reconciliation logic
  }
}
`;

  await fs.writeFile('src/jobs/queue.ts', queueJobContent);
}

async function generateMinimalApiEndpoints(): Promise<void> {
  const fs = await import('fs/promises');
  
  // Health check endpoint
  const healthContent = `/**
 * Health check endpoint
 */

export async function handleHealth(): Promise<Response> {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };
  
  return new Response(JSON.stringify(health), {
    headers: { 'Content-Type': 'application/json' },
  });
}
`;

  await fs.writeFile('src/api/health.ts', healthContent);

  // Webhook endpoint template
  const webhookContent = `/**
 * Webhook endpoint for external service integrations
 */

export async function handleWebhook(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    
    // TODO: Validate webhook signature
    // TODO: Process webhook payload
    
    console.log('📨 Webhook received:', {
      timestamp: new Date().toISOString(),
      headers: Object.fromEntries(request.headers.entries()),
      body: body,
    });
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Webhook processing failed:', error);
    
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
`;

  await fs.writeFile('src/api/webhook.ts', webhookContent);
}

async function generateMainIndex(config: ProjectConfig): Promise<void> {
  const fs = await import('fs/promises');
  
  const indexContent = `/**
 * ${config.name} - Headless Worker
 * 
 * Minimalist compute micro-repo for Domain Engineering outcomes
 * Pattern: Pull → Compute → Push
 */

import 'dotenv/config';
import { handleHealth } from './api/health.js';
import { handleWebhook } from './api/webhook.js';

const PORT = process.env.PORT || 3000;

/**
 * Minimal HTTP server for health checks and webhooks
 */
async function startServer() {
  const server = Bun.serve({
    port: PORT,
    async fetch(request) {
      const url = new URL(request.url);
      
      switch (url.pathname) {
        case '/health':
          return await handleHealth();
          
        case '/webhook':
          if (request.method === 'POST') {
            return await handleWebhook(request);
          }
          return new Response('Method not allowed', { status: 405 });
          
        default:
          return new Response('Not found', { status: 404 });
      }
    },
  });
  
  console.log(\`🚀 Headless worker listening on port \${server.port}\`);
  console.log(\`📡 Health check: http://localhost:\${server.port}/health\`);
  console.log(\`🪝 Webhook endpoint: http://localhost:\${server.port}/webhook\`);
}

/**
 * Main entry point
 */
async function main() {
  console.log(\`🔄 Starting \${config.name} worker...\`);
  
  // Start minimal HTTP server
  await startServer();
  
  // Initialize scheduled jobs
  if (process.env.NODE_ENV === 'production') {
    console.log('📅 Initializing scheduled jobs...');
    await import('./jobs/daily.js');
    await import('./jobs/hourly.js');
  }
  
  console.log('✅ Worker initialized successfully');
}

// Start the worker
main().catch((error) => {
  console.error('❌ Worker failed to start:', error);
  process.exit(1);
});
`;

  await fs.writeFile('src/index.ts', indexContent);
}

async function generateMinimalEnvExample(config: ProjectConfig): Promise<void> {
  const envVars = ['# Environment Variables for Headless Worker'];
  
  envVars.push('', '# Application');
  envVars.push('NODE_ENV=development');
  envVars.push('PORT=3000');
  
  if (config.services.includes('supabase')) {
    envVars.push('', '# Supabase');
    envVars.push('SUPABASE_URL=your_supabase_url');
    envVars.push('SUPABASE_ANON_KEY=your_anon_key');
    envVars.push('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  }
  
  if (config.services.includes('resend')) {
    envVars.push('', '# Resend');
    envVars.push('RESEND_API_KEY=your_resend_api_key');
  }
  
  envVars.push('', '# External Services');
  envVars.push('# Add your API keys here');

  const fs = await import('fs/promises');
  await fs.writeFile('.env.example', envVars.join('\n'));
}

async function generateMinimalReadme(config: ProjectConfig): Promise<void> {
  const readme = `# ${config.name}

Headless worker built with Quallaa CLI - Minimalist compute micro-repo for Domain Engineering outcomes.

## Architecture

**Runtime**: Node.js/TypeScript  
**Pattern**: Pull → Compute → Push  
**Philosophy**: APIs > GUIs, stateless functions, disposable code

## Structure

\`\`\`
/jobs             # Cron/queue workers (pure functions)
/evaluators       # Gold data + scoring scripts  
/contracts        # JSON schemas for inputs/outputs
/integrations     # API clients for external services
/api              # Minimal endpoints (health, webhooks)
/lib              # Domain logic (stateless)
\`\`\`

## Getting Started

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment:**
   \`\`\`bash
   cp .env.example .env
   # Fill in your service credentials
   \`\`\`

3. **Run in development:**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Build and run:**
   \`\`\`bash
   npm run build
   npm start
   \`\`\`

## Available Scripts

- \`npm run dev\` - Development with hot reload
- \`npm run build\` - Build for production
- \`npm start\` - Run production build
- \`npm test\` - Run tests with Vitest
- \`npm run evaluate\` - Run outcome evaluation metrics
- \`npm run cron:daily\` - Run daily job manually
- \`npm run cron:hourly\` - Run hourly job manually

## Evaluation Metrics

This worker measures four key outcome metrics:

- **Accuracy**: How often we get the right answer (target: ≥90%)
- **Rework Ratio**: How often manual intervention is needed (target: ≤5%)
- **Processing Time**: Average time per item (target: ≤5s)
- **Unit Cost**: Cost per processed item (target: ≤$0.10)

Run \`npm run evaluate\` to measure current performance.

## Services

${config.services.map(service => `- **${service}**: ${getServiceDescription(service)}`).join('\n')}

## Deployment

This worker is designed for:
- **Fly.io** or **Railway** for hosting
- **GitHub Actions** for CI/CD
- **Upstash Redis** for queuing (optional)
- **Sentry** for error tracking

## Philosophy

- **Stateless**: Each function is pure and stateless
- **Disposable**: Treat this repo as temporary (3-6 month lifespan)
- **Measurable**: Every run produces metrics
- **Simple**: No unnecessary abstractions or frameworks

---

*Generated by Quallaa CLI - Minimalist infrastructure for Domain Engineering*
`;

  const fs = await import('fs/promises');
  await fs.writeFile('README.md', readme);
}

function getServiceDescription(service: string): string {
  const descriptions = {
    supabase: 'PostgreSQL database and auth',
    resend: 'Transactional email delivery',
    vercel: 'Hosting and deployment',
    github: 'Version control',
    typesense: 'Search engine',
  };
  
  return descriptions[service as keyof typeof descriptions] || 'Service integration';
}