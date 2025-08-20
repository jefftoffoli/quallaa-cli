import { OutcomeConfig, OutcomeTemplateDefinition } from '../../types';

export async function generateOutcomeProject(config: OutcomeConfig, template: OutcomeTemplateDefinition): Promise<void> {
  
  // Create outcome-specific directory structure
  await generateOutcomeStructure();
  
  // Generate data contracts
  await generateDataContracts(template);
  
  // Generate service connectors
  await generateServiceConnectors(template);
  
  // Generate evaluator framework
  await generateEvaluatorFramework(template);
  
  // Generate exception handling
  await generateExceptionQueue(template);
  
  // Generate API routes for connectors
  await generateConnectorRoutes(template);
  
  // Generate outcome-specific components
  await generateOutcomeComponents(config, template);
  
  // Update package.json with outcome-specific dependencies
  await updatePackageJsonForOutcome(config, template);
}

async function generateOutcomeStructure(): Promise<void> {
  const directories = [
    'contracts',
    'connectors',
    'evaluators',
    'exceptions',
    'lib/workflows',
    'lib/processors',
    'app/api/connectors',
    'app/api/webhooks',
    'app/api/evaluators',
    'app/dashboard',
    'components/outcome',
  ];

  const fs = await import('fs/promises');
  for (const dir of directories) {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function generateDataContracts(template: OutcomeTemplateDefinition): Promise<void> {
  const fs = await import('fs/promises');
  
  for (const contract of template.dataContracts) {
    const contractContent = `/**
 * ${contract.name} Data Contract
 * ${contract.description}
 * 
 * This schema defines the structure for ${contract.name.toLowerCase()} data
 * used throughout the ${template.name} system.
 */

export const ${toCamelCase(contract.name)}Schema = ${JSON.stringify(contract.schema, null, 2)} as const;

export type ${contract.name.replace(/\s+/g, '')} = {
${generateTypeFromSchema(contract.schema)}
};

/**
 * Validates ${contract.name.toLowerCase()} data against the schema
 */
export function validate${contract.name.replace(/\s+/g, '')}(data: unknown): data is ${contract.name.replace(/\s+/g, '')} {
  // TODO: Implement validation logic using Zod or similar
  return true;
}

/**
 * Example ${contract.name.toLowerCase()} data for testing
 */
export const example${contract.name.replace(/\s+/g, '')}: ${contract.name.replace(/\s+/g, '')} = {
${generateExampleFromSchema(contract.schema)}
};
`;

    await fs.writeFile(`contracts/${contract.name.toLowerCase().replace(/\s+/g, '-')}.ts`, contractContent);
  }
  
  // Generate contracts index
  const contractIndexContent = `// Data Contracts for ${template.name}
// Auto-generated - do not modify

${template.dataContracts.map(contract => 
  `export * from './${contract.name.toLowerCase().replace(/\s+/g, '-')}';`
).join('\n')}
`;

  await fs.writeFile('contracts/index.ts', contractIndexContent);
}

async function generateServiceConnectors(template: OutcomeTemplateDefinition): Promise<void> {
  const fs = await import('fs/promises');
  
  for (const connector of template.connectors) {
    const connectorContent = `/**
 * ${connector.name}
 * ${connector.description}
 * 
 * Type: ${connector.type}
 * Service: ${connector.service}
 */

import { NextRequest, NextResponse } from 'next/server';

export class ${toPascalCase(connector.name.replace(' Connector', ''))}Connector {
  private readonly config = ${JSON.stringify(connector.config, null, 4)};

  /**
   * Initialize the ${connector.name}
   */
  constructor() {
    // TODO: Initialize connector with credentials
  }

  ${connector.type === 'input' || connector.type === 'bidirectional' ? `
  /**
   * Fetch data from ${connector.service}
   */
  async fetchData(params?: Record<string, any>): Promise<any[]> {
    // TODO: Implement data fetching logic
    throw new Error('Not implemented');
  }

  /**
   * Handle webhook from ${connector.service}
   */
  async handleWebhook(request: NextRequest): Promise<NextResponse> {
    try {
      const payload = await request.json();
      
      // TODO: Validate webhook signature
      // TODO: Process webhook payload
      // TODO: Store/forward data as needed
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
  }` : ''}

  ${connector.type === 'output' || connector.type === 'bidirectional' ? `
  /**
   * Send data to ${connector.service}
   */
  async sendData(data: any): Promise<any> {
    // TODO: Implement data sending logic
    throw new Error('Not implemented');
  }` : ''}

  /**
   * Test connection to ${connector.service}
   */
  async testConnection(): Promise<boolean> {
    try {
      // TODO: Implement connection test
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const ${toCamelCase(connector.name.replace(' Connector', ''))}Connector = new ${toPascalCase(connector.name.replace(' Connector', ''))}Connector();
`;

    await fs.writeFile(`connectors/${connector.name.toLowerCase().replace(/\s+/g, '-').replace('-connector', '')}.ts`, connectorContent);
  }
  
  // Generate connectors index
  const connectorsIndexContent = `// Service Connectors for ${template.name}
// Auto-generated - do not modify

${template.connectors.map(connector => 
  `export * from './${connector.name.toLowerCase().replace(/\s+/g, '-').replace('-connector', '')}';`
).join('\n')}
`;

  await fs.writeFile('connectors/index.ts', connectorsIndexContent);
}

async function generateEvaluatorFramework(template: OutcomeTemplateDefinition): Promise<void> {
  const fs = await import('fs/promises');
  
  const evaluatorContent = `/**
 * ${template.name} Evaluator
 * 
 * Provides evaluation metrics and test harness for the outcome system.
 */

export interface EvaluationResult {
  metric: string;
  value: number;
  threshold: number;
  passed: boolean;
  details?: string;
}

export interface EvaluationSuite {
  name: string;
  description: string;
  results: EvaluationResult[];
  overallScore: number;
  passed: boolean;
  timestamp: Date;
}

export class ${toPascalCase(template.name.replace(/\s+/g, ''))}Evaluator {
  private readonly metrics = [
${template.evaluatorMetrics.map(metric => `    '${metric}'`).join(',\n')}
  ];

  /**
   * Run complete evaluation suite
   */
  async runEvaluation(): Promise<EvaluationSuite> {
    const results: EvaluationResult[] = [];
    
    for (const metric of this.metrics) {
      const result = await this.evaluateMetric(metric);
      results.push(result);
    }
    
    const overallScore = this.calculateOverallScore(results);
    const passed = results.every(r => r.passed);
    
    return {
      name: '${template.name} Evaluation',
      description: 'Comprehensive evaluation of ${template.name.toLowerCase()} system',
      results,
      overallScore,
      passed,
      timestamp: new Date(),
    };
  }

  /**
   * Evaluate a specific metric
   */
  private async evaluateMetric(metric: string): Promise<EvaluationResult> {
    switch (metric) {
${template.evaluatorMetrics.map(metric => `      case '${metric}':
        return await this.evaluate${toPascalCase(metric)}();`).join('\n')}
      default:
        throw new Error(\`Unknown metric: \${metric}\`);
    }
  }

${template.evaluatorMetrics.map(metric => `
  /**
   * Evaluate ${metric.replace(/_/g, ' ')}
   */
  private async evaluate${toPascalCase(metric)}(): Promise<EvaluationResult> {
    // TODO: Implement ${metric} evaluation logic
    return {
      metric: '${metric}',
      value: 0,
      threshold: 0.8,
      passed: false,
      details: 'Not implemented',
    };
  }`).join('')}

  /**
   * Calculate overall score from individual results
   */
  private calculateOverallScore(results: EvaluationResult[]): number {
    if (results.length === 0) return 0;
    return results.reduce((sum, result) => sum + result.value, 0) / results.length;
  }

  /**
   * Generate evaluation report
   */
  generateReport(suite: EvaluationSuite): string {
    let report = \`# \${suite.name} Report\\n\\n\`;
    report += \`**Date:** \${suite.timestamp.toISOString()}\\n\`;
    report += \`**Overall Score:** \${(suite.overallScore * 100).toFixed(2)}%\\n\`;
    report += \`**Status:** \${suite.passed ? '✅ PASSED' : '❌ FAILED'}\\n\\n\`;
    
    report += \`## Metrics\\n\\n\`;
    for (const result of suite.results) {
      const status = result.passed ? '✅' : '❌';
      report += \`- \${status} **\${result.metric}**: \${(result.value * 100).toFixed(2)}% (threshold: \${(result.threshold * 100).toFixed(2)}%)\\n\`;
      if (result.details) {
        report += \`  - \${result.details}\\n\`;
      }
    }
    
    return report;
  }
}

// Export singleton instance
export const evaluator = new ${toPascalCase(template.name.replace(/\s+/g, ''))}Evaluator();
`;

  await fs.writeFile('evaluators/index.ts', evaluatorContent);
  
  // Generate evaluation CLI script
  const cliScript = `#!/usr/bin/env node
/**
 * CLI script for running ${template.name} evaluations
 */

import { evaluator } from './index';

async function main() {
  console.log('🔍 Running ${template.name} evaluation...');
  
  try {
    const suite = await evaluator.runEvaluation();
    const report = evaluator.generateReport(suite);
    
    console.log(report);
    
    if (!suite.passed) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Evaluation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
`;

  await fs.writeFile('evaluators/cli.ts', cliScript);
}

async function generateExceptionQueue(template: OutcomeTemplateDefinition): Promise<void> {
  const fs = await import('fs/promises');
  
  const exceptionContent = `/**
 * Exception Queue for ${template.name}
 * 
 * Handles exceptions, retries, and manual interventions.
 */

export interface Exception {
  id: string;
  type: 'data_validation' | 'connector_error' | 'processing_error' | 'business_rule';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data: any;
  source: string;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ExceptionQueue {
  /**
   * Add an exception to the queue
   */
  async addException(exception: Omit<Exception, 'id' | 'retryCount' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = this.generateId();
    const now = new Date();
    
    const fullException: Exception = {
      ...exception,
      id,
      retryCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    
    // TODO: Store exception in database
    console.error(\`Exception added: \${exception.type} - \${exception.message}\`);
    
    return id;
  }

  /**
   * Retry an exception
   */
  async retryException(id: string): Promise<boolean> {
    // TODO: Implement retry logic
    return false;
  }

  /**
   * Resolve an exception manually
   */
  async resolveException(id: string, resolvedBy: string, resolution: string): Promise<void> {
    // TODO: Implement resolution logic
  }

  /**
   * Get pending exceptions
   */
  async getPendingExceptions(): Promise<Exception[]> {
    // TODO: Implement database query
    return [];
  }

  /**
   * Get exceptions ready for retry
   */
  async getRetryableExceptions(): Promise<Exception[]> {
    // TODO: Implement database query
    return [];
  }

  private generateId(): string {
    return \`exc_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  }
}

// Export singleton instance
export const exceptionQueue = new ExceptionQueue();
`;

  await fs.writeFile('exceptions/index.ts', exceptionContent);
}

async function generateConnectorRoutes(template: OutcomeTemplateDefinition): Promise<void> {
  const fs = await import('fs/promises');
  
  for (const connector of template.connectors) {
    if (connector.config.webhookEndpoints) {
      for (const endpoint of connector.config.webhookEndpoints) {
        const routePath = endpoint.replace('/api/', '');
        const routeDir = `app/api/${routePath}`;
        
        await fs.mkdir(routeDir, { recursive: true });
        
        const routeContent = `import { NextRequest, NextResponse } from 'next/server';
import { ${toCamelCase(connector.name.replace(' Connector', ''))}Connector } from '../../../../connectors/${connector.name.toLowerCase().replace(/\s+/g, '-').replace('-connector', '')}';

export async function POST(request: NextRequest) {
  return await ${toCamelCase(connector.name.replace(' Connector', ''))}Connector.handleWebhook(request);
}
`;
        
        await fs.writeFile(`${routeDir}/route.ts`, routeContent);
      }
    }
  }
}

async function generateOutcomeComponents(_config: OutcomeConfig, template: OutcomeTemplateDefinition): Promise<void> {
  const fs = await import('fs/promises');
  
  // Generate dashboard component
  const dashboardContent = `'use client';

import { useState, useEffect } from 'react';

interface DashboardData {
  totalRecords: number;
  processedToday: number;
  errorRate: number;
  avgProcessingTime: number;
}

export default function ${toPascalCase(template.name.replace(/\s+/g, ''))}Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch dashboard data
    setTimeout(() => {
      setData({
        totalRecords: 1234,
        processedToday: 56,
        errorRate: 0.02,
        avgProcessingTime: 2.5,
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">${template.name} Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Records</h3>
          <p className="text-3xl font-bold text-blue-600">{data?.totalRecords.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Processed Today</h3>
          <p className="text-3xl font-bold text-green-600">{data?.processedToday}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Error Rate</h3>
          <p className="text-3xl font-bold text-red-600">{((data?.errorRate || 0) * 100).toFixed(2)}%</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Avg Processing Time</h3>
          <p className="text-3xl font-bold text-purple-600">{data?.avgProcessingTime}s</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-2">
            <p className="text-gray-600">No recent activity</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="space-y-2">
            ${template.connectors.map(connector => `
            <div className="flex justify-between">
              <span>${connector.name}</span>
              <span className="text-green-600">✓ Connected</span>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  );
}
`;

  await fs.writeFile('app/dashboard/page.tsx', dashboardContent);
}

async function updatePackageJsonForOutcome(_config: OutcomeConfig, _template: OutcomeTemplateDefinition): Promise<void> {
  const fs = await import('fs/promises');
  
  try {
    const packageJsonContent = await fs.readFile('package.json', 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);
    
    // Add outcome-specific dependencies
    packageJson.dependencies = {
      ...packageJson.dependencies,
      zod: '^3.22.4', // For schema validation
      'date-fns': '^2.30.0', // For date handling
      'uuid': '^9.0.0', // For ID generation
    };
    
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      '@types/uuid': '^9.0.0',
    };
    
    // Add outcome-specific scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'evaluate': 'node -r ts-node/register evaluators/cli.ts',
      'test:evaluators': 'npm run evaluate',
    };
    
    await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
  } catch (error) {
    console.error('Failed to update package.json:', error);
  }
}

// Utility functions
function toCamelCase(str: string): string {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

function toPascalCase(str: string): string {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
    return word.toUpperCase();
  }).replace(/\s+/g, '');
}

function generateTypeFromSchema(schema: any, indent = '  '): string {
  if (schema.type === 'object' && schema.properties) {
    const props = Object.entries(schema.properties).map(([key, prop]: [string, any]) => {
      const optional = !schema.required?.includes(key) ? '?' : '';
      const type = getTypeFromProperty(prop);
      return `${indent}${key}${optional}: ${type};`;
    });
    return props.join('\n');
  }
  return `${indent}[key: string]: any;`;
}

function getTypeFromProperty(prop: any): string {
  switch (prop.type) {
    case 'string':
      if (prop.enum) {
        return prop.enum.map((v: string) => `'${v}'`).join(' | ');
      }
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      return `${getTypeFromProperty(prop.items)}[]`;
    case 'object':
      return 'Record<string, any>';
    default:
      return 'any';
  }
}

function generateExampleFromSchema(schema: any, indent = '  '): string {
  if (schema.type === 'object' && schema.properties) {
    const props = Object.entries(schema.properties).map(([key, prop]: [string, any]) => {
      const value = getExampleValue(prop);
      return `${indent}${key}: ${value},`;
    });
    return props.join('\n');
  }
  return `${indent}// Example data`;
}

function getExampleValue(prop: any): string {
  switch (prop.type) {
    case 'string':
      if (prop.enum) {
        return `'${prop.enum[0]}'`;
      }
      if (prop.format === 'email') {
        return "'user@example.com'";
      }
      if (prop.format === 'date-time') {
        return "'2024-01-01T00:00:00Z'";
      }
      return "'example'";
    case 'number':
      return '0';
    case 'boolean':
      return 'false';
    case 'array':
      return '[]';
    case 'object':
      return '{}';
    default:
      return 'null';
  }
}