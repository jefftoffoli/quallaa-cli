import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectAnalyzer } from './project-analyzer';
import * as path from 'path';

// Mock dependencies
vi.mock('glob', () => ({
  glob: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

describe('ProjectAnalyzer', () => {
  let analyzer: ProjectAnalyzer;
  const mockProjectRoot = '/test/project';
  
  const mockGlob = vi.mocked((await import('glob')).glob);
  const mockReadFile = vi.mocked((await import('fs/promises')).readFile);

  beforeEach(() => {
    vi.clearAllMocks();
    analyzer = new ProjectAnalyzer(mockProjectRoot);
  });

  describe('analyzeContracts', () => {
    it('should analyze contract files in contracts directory', async () => {
      const contractContent = `/**
 * Order Data Contract
 * Order data structure for e-commerce
 */
export const OrderSchema = {
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "amount": { "type": "number" }
  },
  "required": ["id", "amount"]
} as const;

export type Order = {
  id: string;
  amount: number;
};`;

      mockGlob.mockResolvedValueOnce(['/test/project/contracts/order.ts']);
      mockReadFile.mockResolvedValueOnce(contractContent);

      const contracts = await analyzer.analyzeContracts();

      expect(contracts).toHaveLength(1);
      expect(contracts[0]).toMatchObject({
        name: 'Order',
        file: 'contracts/order.ts',
        description: 'Order data structure for e-commerce',
        types: ['Order'],
      });
    });

    it('should handle files without contracts gracefully', async () => {
      mockGlob.mockResolvedValueOnce(['/test/project/contracts/empty.ts']);
      mockReadFile.mockResolvedValueOnce('// Empty file');

      const contracts = await analyzer.analyzeContracts();

      expect(contracts).toHaveLength(0);
    });

    it('should extract interface definitions from type files', async () => {
      const typeContent = `export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
}`;

      mockGlob
        .mockResolvedValueOnce([]) // No contract files
        .mockResolvedValueOnce(['/test/project/types/index.ts']); // Type files
      
      mockReadFile.mockResolvedValueOnce(typeContent);

      const contracts = await analyzer.analyzeContracts();

      expect(contracts).toHaveLength(2);
      expect(contracts[0].name).toBe('User');
      expect(contracts[1].name).toBe('Product');
    });
  });

  describe('analyzeApis', () => {
    it('should analyze Next.js API routes', async () => {
      const routeContent = `import { NextRequest, NextResponse } from 'next/server';

/**
 * Get all users
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({ users: [] });
}

/**
 * Create a new user
 */
export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'User created' });
}`;

      mockGlob
        .mockResolvedValueOnce(['/test/project/app/api/users/route.ts']) // API routes
        .mockResolvedValueOnce([]); // Integration files
      
      mockReadFile.mockResolvedValueOnce(routeContent);

      const apis = await analyzer.analyzeApis();

      expect(apis).toHaveLength(1);
      expect(apis[0].name).toBe('Internal API');
      expect(apis[0].type).toBe('internal');
      expect(apis[0].endpoints).toHaveLength(2);
      expect(apis[0].endpoints[0]).toMatchObject({
        path: '/users',
        method: 'get',
        description: 'Get all users',
      });
    });

    it('should extract external API configurations', async () => {
      const integrationContent = `const STRIPE_API_URL = 'https://api.stripe.com/v1';

export class StripeConnector {
  private baseURL = STRIPE_API_URL;
  
  async getCustomers() {
    // Implementation
  }
}`;

      mockGlob
        .mockResolvedValueOnce([]) // No API routes
        .mockResolvedValueOnce(['/test/project/connectors/stripe.ts']); // Integration files
      
      mockReadFile.mockResolvedValueOnce(integrationContent);

      const apis = await analyzer.analyzeApis();

      expect(apis).toHaveLength(1);
      expect(apis[0].name).toBe('Stripe API');
      expect(apis[0].type).toBe('external');
      expect(apis[0].baseUrl).toBe('https://api.stripe.com/v1');
    });
  });

  describe('analyzeMetrics', () => {
    it('should extract metrics from evaluator files', async () => {
      const evaluatorContent = `export const reconciliationRate = 0.95;
export const processingTime = 2.5;
export const errorCount = 0;

export function trackConversion(event: string) {
  analytics.track('conversion', { event });
}`;

      mockGlob
        .mockResolvedValueOnce(['/test/project/evaluators/metrics.ts']) // Metric files
        .mockResolvedValueOnce([]); // Tracking files
      
      mockReadFile.mockResolvedValueOnce(evaluatorContent);

      const metrics = await analyzer.analyzeMetrics();

      expect(metrics.length).toBeGreaterThanOrEqual(3);
      expect(metrics.find(m => m.name === 'reconciliationRate')).toMatchObject({
        name: 'reconciliationRate',
        type: 'kpi',
        file: 'evaluators/metrics.ts',
      });
      expect(metrics.find(m => m.name === 'errorCount')).toMatchObject({
        name: 'errorCount',
        type: 'counter',
        file: 'evaluators/metrics.ts',
      });
    });

    it('should extract tracking events from components', async () => {
      const componentContent = `import { analytics } from '@/lib/analytics';

export function Button() {
  const handleClick = () => {
    analytics.track('button_clicked');
    gtag('event', 'button_interaction');
  };
  
  return <button onClick={handleClick}>Click me</button>;
}`;

      mockGlob
        .mockResolvedValueOnce([]) // No metric files
        .mockResolvedValueOnce(['/test/project/components/Button.tsx']); // Tracking files
      
      mockReadFile.mockResolvedValueOnce(componentContent);

      const metrics = await analyzer.analyzeMetrics();

      expect(metrics).toHaveLength(2);
      expect(metrics.find(m => m.name === 'button_clicked')).toMatchObject({
        name: 'button_clicked',
        type: 'event',
        category: 'tracking',
      });
      expect(metrics.find(m => m.name === 'button_interaction')).toMatchObject({
        name: 'button_interaction',
        type: 'event',
        category: 'tracking',
      });
    });
  });

  describe('analyzeIntegrations', () => {
    it('should detect service integrations from package.json', async () => {
      const packageJson = {
        dependencies: {
          '@supabase/supabase-js': '^2.45.0',
          'resend': '^4.0.0',
          'stripe': '^14.0.0',
        },
        devDependencies: {
          '@types/node': '^20.0.0',
        },
      };

      mockReadFile.mockResolvedValueOnce(JSON.stringify(packageJson));
      mockGlob
        .mockResolvedValueOnce(['/test/project/lib/supabase.ts']) // Supabase files
        .mockResolvedValueOnce(['/test/project/lib/resend.ts']) // Resend files
        .mockResolvedValueOnce(['/test/project/connectors/stripe.ts']); // Stripe files

      const integrations = await analyzer.analyzeIntegrations();

      expect(integrations).toHaveLength(3);
      expect(integrations.find(i => i.service === 'Supabase')).toMatchObject({
        service: 'Supabase',
        type: 'sdk',
        files: ['lib/supabase.ts'],
      });
      expect(integrations.find(i => i.service === 'Resend')).toMatchObject({
        service: 'Resend',
        type: 'sdk',
        files: ['lib/resend.ts'],
      });
      expect(integrations.find(i => i.service === 'Stripe')).toMatchObject({
        service: 'Stripe',
        type: 'sdk',
        files: ['connectors/stripe.ts'],
      });
    });
  });

  describe('analyzeProject', () => {
    it('should analyze all aspects of the project', async () => {
      // Mock all the individual analyze methods
      vi.spyOn(analyzer, 'analyzeContracts').mockResolvedValueOnce([
        {
          name: 'Order',
          file: 'contracts/order.ts',
          schema: { type: 'object' },
          types: ['Order'],
        },
      ]);

      vi.spyOn(analyzer, 'analyzeApis').mockResolvedValueOnce([
        {
          name: 'Internal API',
          type: 'internal',
          endpoints: [],
          file: 'app/api',
        },
      ]);

      vi.spyOn(analyzer, 'analyzeMetrics').mockResolvedValueOnce([
        {
          name: 'conversionRate',
          type: 'kpi',
          file: 'evaluators/metrics.ts',
        },
      ]);

      vi.spyOn(analyzer, 'analyzeIntegrations').mockResolvedValueOnce([
        {
          service: 'Supabase',
          type: 'sdk',
          files: ['lib/supabase.ts'],
        },
      ]);

      const analysis = await analyzer.analyzeProject();

      expect(analysis.contracts).toHaveLength(1);
      expect(analysis.apis).toHaveLength(1);
      expect(analysis.metrics).toHaveLength(1);
      expect(analysis.integrations).toHaveLength(1);
    });
  });
});