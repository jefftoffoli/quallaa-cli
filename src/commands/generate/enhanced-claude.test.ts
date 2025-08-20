import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateEnhancedClaudeMd } from './enhanced-claude';
import { ProjectConfig } from '../../types';

// Mock dependencies
vi.mock('../../storage/credentials');
vi.mock('../../lib/analyzers/project-analyzer');
vi.mock('fs/promises');

const mockGetAllCredentials = vi.mocked((await import('../../storage/credentials')).getAllCredentials);
const mockProjectAnalyzer = vi.mocked((await import('../../lib/analyzers/project-analyzer')).projectAnalyzer);
const mockFs = vi.mocked(await import('fs/promises'));

describe('generateEnhancedClaudeMd', () => {
  const mockConfig: ProjectConfig = {
    name: 'test-project',
    role: 'founder',
    services: ['supabase', 'vercel', 'resend'],
    leadInfo: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockGetAllCredentials.mockResolvedValue({
      supabase: { projectRef: 'test-ref' },
      resend: { apiKey: 'test-key' },
    });

    mockProjectAnalyzer.analyzeProject.mockResolvedValue({
      contracts: [
        {
          name: 'Order',
          file: 'contracts/order.ts',
          schema: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              amount: { type: 'number' },
            },
            required: ['id', 'amount'],
          },
          description: 'Order data contract',
          types: ['Order'],
        },
      ],
      apis: [
        {
          name: 'Internal API',
          type: 'internal',
          endpoints: [
            {
              path: '/api/orders',
              method: 'get',
              description: 'Get all orders',
            },
            {
              path: '/api/orders',
              method: 'post',
              description: 'Create new order',
            },
          ],
          file: 'app/api',
        },
        {
          name: 'Stripe API',
          type: 'external',
          baseUrl: 'https://api.stripe.com/v1',
          endpoints: [],
          file: 'connectors/stripe.ts',
        },
      ],
      metrics: [
        {
          name: 'conversionRate',
          type: 'kpi',
          file: 'evaluators/metrics.ts',
          description: 'User conversion rate',
        },
        {
          name: 'button_clicked',
          type: 'event',
          file: 'components/Button.tsx',
          category: 'tracking',
        },
      ],
      integrations: [
        {
          service: 'Supabase',
          type: 'sdk',
          files: ['lib/supabase.ts'],
          description: 'Database integration',
        },
        {
          service: 'Stripe',
          type: 'api',
          files: ['connectors/stripe.ts'],
          description: 'Payment processing',
        },
      ],
    });
  });

  it('should generate enhanced CLAUDE.md with all augmentations', async () => {
    const augmentations = {
      contracts: true,
      apis: true,
      metrics: true,
      integrations: true,
    };

    await generateEnhancedClaudeMd(mockConfig, augmentations);

    expect(mockProjectAnalyzer.analyzeProject).toHaveBeenCalled();
    expect(mockFs.writeFile).toHaveBeenCalledWith('CLAUDE.md', expect.stringContaining('Project Analysis'));
    
    const writtenContent = mockFs.writeFile.mock.calls[0][1] as string;
    
    // Check that all sections are included
    expect(writtenContent).toContain('## Data Contracts');
    expect(writtenContent).toContain('## API Documentation');
    expect(writtenContent).toContain('## Metrics & Analytics');
    expect(writtenContent).toContain('Order data contract');
    expect(writtenContent).toContain('/api/orders');
    expect(writtenContent).toContain('conversionRate');
    expect(writtenContent).toContain('Stripe API');
    expect(writtenContent).toContain('Supabase integration');
  });

  it('should generate enhanced CLAUDE.md with selective augmentations', async () => {
    const augmentations = {
      contracts: true,
      apis: false,
      metrics: true,
      integrations: false,
    };

    await generateEnhancedClaudeMd(mockConfig, augmentations);

    const writtenContent = mockFs.writeFile.mock.calls[0][1] as string;
    
    // Check that only selected sections are included
    expect(writtenContent).toContain('## Data Contracts');
    expect(writtenContent).toContain('## Metrics & Analytics');
    expect(writtenContent).not.toContain('## API Documentation');
    expect(writtenContent).toContain('Order data contract');
    expect(writtenContent).toContain('conversionRate');
  });

  it('should generate standard CLAUDE.md when no augmentations are specified', async () => {
    const augmentations = {};

    await generateEnhancedClaudeMd(mockConfig, augmentations);

    expect(mockProjectAnalyzer.analyzeProject).not.toHaveBeenCalled();
    
    const writtenContent = mockFs.writeFile.mock.calls[0][1] as string;
    
    // Check that enhanced sections are not included
    expect(writtenContent).not.toContain('## Data Contracts');
    expect(writtenContent).not.toContain('## API Documentation');
    expect(writtenContent).not.toContain('## Metrics & Analytics');
    expect(writtenContent).not.toContain('Project Analysis');
  });

  it('should include outcome commands when metrics are present', async () => {
    const augmentations = { metrics: true };

    await generateEnhancedClaudeMd(mockConfig, augmentations);

    const writtenContent = mockFs.writeFile.mock.calls[0][1] as string;
    
    expect(writtenContent).toContain('### Outcome & Evaluation Commands');
    expect(writtenContent).toContain('npm run evaluate');
    expect(writtenContent).toContain('npm run test:evaluators');
  });

  it('should include proper project analysis summary', async () => {
    const augmentations = {
      contracts: true,
      apis: true,
      metrics: true,
      integrations: true,
    };

    await generateEnhancedClaudeMd(mockConfig, augmentations);

    const writtenContent = mockFs.writeFile.mock.calls[0][1] as string;
    
    expect(writtenContent).toContain('Enhanced with project analysis - 1 contracts, 2 APIs, 2 metrics analyzed');
  });

  it('should handle empty analysis results gracefully', async () => {
    mockProjectAnalyzer.analyzeProject.mockResolvedValue({
      contracts: [],
      apis: [],
      metrics: [],
      integrations: [],
    });

    const augmentations = {
      contracts: true,
      apis: true,
      metrics: true,
      integrations: true,
    };

    await generateEnhancedClaudeMd(mockConfig, augmentations);

    const writtenContent = mockFs.writeFile.mock.calls[0][1] as string;
    
    // Should still include sections but with "not defined yet" messages
    expect(writtenContent).toContain('## Data Contracts');
    expect(writtenContent).toContain('## API Documentation');
    expect(writtenContent).toContain('## Metrics & Analytics');
    expect(writtenContent).toContain('No KPIs defined yet');
    expect(writtenContent).toContain('No tracking events defined yet');
  });
});