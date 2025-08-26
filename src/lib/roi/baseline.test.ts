import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { BaselineCollector, collectBaselineInteractively } from './baseline.js';
import type { ROIBaseline } from '../../types/index.js';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

// Mock inquirer
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
}));

describe('BaselineCollector', () => {
  let collector: BaselineCollector;
  const mockProjectPath = '/tmp/test-project';

  beforeEach(() => {
    collector = new BaselineCollector(mockProjectPath);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('establishBaseline', () => {
    it('should create valid baseline with all required fields', async () => {
      const inputs = {
        developmentCost: 50000,
        currentSaasSpend: 1500,
        teamSize: 5,
        currentProcessingHours: 40,
        accuracyBaseline: 0.85,
        errorRateBaseline: 0.05,
      };

      const baseline = await collector.establishBaseline(inputs);

      expect(baseline).toMatchObject({
        developmentCost: 50000,
        currentSaasSpend: 1500,
        teamSize: 5,
        currentProcessingHours: 40,
        accuracyBaseline: 0.85,
        errorRateBaseline: 0.05,
        complianceScore: 0.7, // default
        customerSatisfactionScore: 7.5, // default
      });

      expect(baseline.establishedAt).toBeInstanceOf(Date);
    });

    it('should use default values for optional quality metrics', async () => {
      const inputs = {
        developmentCost: 50000,
        currentSaasSpend: 1500,
        teamSize: 5,
        currentProcessingHours: 40,
      };

      const baseline = await collector.establishBaseline(inputs);

      expect(baseline.errorRateBaseline).toBe(0.05);
      expect(baseline.accuracyBaseline).toBe(0.85);
      expect(baseline.complianceScore).toBe(0.7);
      expect(baseline.customerSatisfactionScore).toBe(7.5);
    });

    it('should validate required inputs', async () => {
      const invalidInputs = {
        developmentCost: -1000, // Invalid: negative
        currentSaasSpend: 1500,
        teamSize: 0, // Invalid: zero
        currentProcessingHours: 40,
      };

      await expect(collector.establishBaseline(invalidInputs))
        .rejects.toThrow('Invalid developmentCost: must be a positive number');
    });

    it('should save baseline to correct file path', async () => {
      const inputs = {
        developmentCost: 50000,
        currentSaasSpend: 1500,
        teamSize: 5,
        currentProcessingHours: 40,
      };

      await collector.establishBaseline(inputs);

      expect(fs.mkdir).toHaveBeenCalledWith(
        path.join(mockProjectPath, '.quallaa'),
        { recursive: true }
      );

      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(mockProjectPath, '.quallaa', 'roi-baseline.json'),
        expect.any(String),
        'utf-8'
      );
    });
  });

  describe('getBaseline', () => {
    it('should return parsed baseline when file exists', async () => {
      const mockBaseline = {
        establishedAt: '2024-01-01T00:00:00.000Z',
        developmentCost: 50000,
        currentSaasSpend: 1500,
        teamSize: 5,
        currentProcessingHours: 40,
        errorRateBaseline: 0.05,
        accuracyBaseline: 0.85,
        complianceScore: 0.7,
        customerSatisfactionScore: 7.5,
      };

      (fs.readFile as any).mockResolvedValue(JSON.stringify(mockBaseline));

      const result = await collector.getBaseline();

      expect(result).toMatchObject({
        ...mockBaseline,
        establishedAt: new Date('2024-01-01T00:00:00.000Z'),
      });
    });

    it('should return null when file does not exist', async () => {
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      (fs.readFile as any).mockRejectedValue(error);

      const result = await collector.getBaseline();

      expect(result).toBeNull();
    });

    it('should throw error for other file system errors', async () => {
      const error = new Error('Permission denied');
      (fs.readFile as any).mockRejectedValue(error);

      await expect(collector.getBaseline()).rejects.toThrow('Permission denied');
    });
  });

  describe('updateBaseline', () => {
    it('should update existing baseline with new values', async () => {
      const existingBaseline = {
        establishedAt: new Date('2024-01-01'),
        developmentCost: 50000,
        currentSaasSpend: 1500,
        teamSize: 5,
        currentProcessingHours: 40,
        errorRateBaseline: 0.05,
        accuracyBaseline: 0.85,
        complianceScore: 0.7,
        customerSatisfactionScore: 7.5,
      };

      (fs.readFile as any).mockResolvedValue(JSON.stringify(existingBaseline));

      const updates = {
        currentSaasSpend: 1200,
        teamSize: 6,
      };

      const result = await collector.updateBaseline(updates);

      expect(result).toMatchObject({
        ...existingBaseline,
        currentSaasSpend: 1200,
        teamSize: 6,
      });
    });

    it('should throw error when no baseline exists', async () => {
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      (fs.readFile as any).mockRejectedValue(error);

      await expect(collector.updateBaseline({ teamSize: 6 }))
        .rejects.toThrow('No baseline exists to update. Establish baseline first.');
    });
  });

  describe('calculateBaselineHealth', () => {
    it('should return perfect score for complete baseline', () => {
      const goodBaseline: ROIBaseline = {
        establishedAt: new Date(),
        developmentCost: 50000,
        currentSaasSpend: 1500,
        teamSize: 5,
        currentProcessingHours: 40,
        errorRateBaseline: 0.05,
        accuracyBaseline: 0.85,
        complianceScore: 0.7,
        customerSatisfactionScore: 7.5,
      };

      const health = collector.calculateBaselineHealth(goodBaseline);

      expect(health.score).toBe(100);
      expect(health.issues).toHaveLength(0);
      expect(health.recommendations).toHaveLength(0);
    });

    it('should identify missing development cost', () => {
      const baseline: ROIBaseline = {
        establishedAt: new Date(),
        developmentCost: 0, // Missing
        currentSaasSpend: 1500,
        teamSize: 5,
        currentProcessingHours: 40,
        errorRateBaseline: 0.05,
        accuracyBaseline: 0.85,
        complianceScore: 0.7,
        customerSatisfactionScore: 7.5,
      };

      const health = collector.calculateBaselineHealth(baseline);

      expect(health.score).toBe(75); // 100 - 25
      expect(health.issues).toContain('Development cost not specified');
      expect(health.recommendations).toContain('Update baseline with actual development investment');
    });

    it('should flag high error rate as issue', () => {
      const baseline: ROIBaseline = {
        establishedAt: new Date(),
        developmentCost: 50000,
        currentSaasSpend: 1500,
        teamSize: 5,
        currentProcessingHours: 40,
        errorRateBaseline: 0.25, // High error rate
        accuracyBaseline: 0.85,
        complianceScore: 0.7,
        customerSatisfactionScore: 7.5,
      };

      const health = collector.calculateBaselineHealth(baseline);

      expect(health.score).toBe(90); // 100 - 10
      expect(health.issues).toContain('Error rate baseline high (>20%)');
      expect(health.recommendations).toContain('High error rates indicate significant improvement opportunity');
    });
  });

  describe('generateBaselineReport', () => {
    it('should generate comprehensive report when baseline exists', async () => {
      const mockBaseline = {
        establishedAt: new Date('2024-01-01').toISOString(),
        developmentCost: 50000,
        currentSaasSpend: 1500,
        teamSize: 5,
        currentProcessingHours: 40,
        errorRateBaseline: 0.05,
        accuracyBaseline: 0.85,
        complianceScore: 0.7,
        customerSatisfactionScore: 7.5,
      };

      (fs.readFile as any).mockResolvedValue(JSON.stringify(mockBaseline));

      const report = await collector.generateBaselineReport();

      expect(report).toContain('ROI Baseline Report');
      expect(report).toContain('**Development Investment:** $50,000');
      expect(report).toContain('**Current SaaS Spending:** $1,500/month');
      expect(report).toContain('**Team Size:** 5 members');
      expect(report).toContain('**Processing Hours:** 40 hours/month');
      expect(report).toContain('**Accuracy:** 85.0%');
      expect(report).toContain('**Error Rate:** 5.0%');
    });

    it('should return help message when no baseline exists', async () => {
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      (fs.readFile as any).mockRejectedValue(error);

      const report = await collector.generateBaselineReport();

      expect(report).toBe('No baseline established. Run: quallaa evaluators baseline');
    });
  });

  describe('requireBaseline', () => {
    it('should return baseline when it exists and is recent', async () => {
      const recentBaseline = {
        establishedAt: new Date().toISOString(),
        developmentCost: 50000,
        currentSaasSpend: 1500,
        teamSize: 5,
        currentProcessingHours: 40,
        errorRateBaseline: 0.05,
        accuracyBaseline: 0.85,
        complianceScore: 0.7,
        customerSatisfactionScore: 7.5,
      };

      (fs.readFile as any).mockResolvedValue(JSON.stringify(recentBaseline));

      const result = await collector.requireBaseline();

      expect(result).toMatchObject({
        ...recentBaseline,
        establishedAt: expect.any(Date),
      });
    });

    it('should throw error when no baseline exists', async () => {
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      (fs.readFile as any).mockRejectedValue(error);

      await expect(collector.requireBaseline())
        .rejects.toThrow('ROI baseline required but not found. Run: quallaa evaluators baseline --help');
    });

    it('should warn when baseline is old but still return it', async () => {
      const oldBaseline = {
        establishedAt: new Date('2023-01-01').toISOString(), // Over 6 months old
        developmentCost: 50000,
        currentSaasSpend: 1500,
        teamSize: 5,
        currentProcessingHours: 40,
        errorRateBaseline: 0.05,
        accuracyBaseline: 0.85,
        complianceScore: 0.7,
        customerSatisfactionScore: 7.5,
      };

      (fs.readFile as any).mockResolvedValue(JSON.stringify(oldBaseline));

      // Mock console.warn to verify warning
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await collector.requireBaseline();

      expect(result).toMatchObject({
        ...oldBaseline,
        establishedAt: expect.any(Date),
      });
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Baseline is') && expect.stringContaining('months old')
      );

      warnSpy.mockRestore();
    });
  });
});

describe('collectBaselineInteractively', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should collect baseline data interactively', async () => {
    const mockAnswers = {
      developmentCost: 50000,
      currentSaasSpend: 1500,
      teamSize: 5,
      currentProcessingHours: 40,
      includeQualityMetrics: true,
    };

    const mockQualityAnswers = {
      accuracyBaseline: 0.85,
      errorRateBaseline: 0.05,
      customerSatisfactionScore: 7.5,
    };

    const inquirer = await import('inquirer');
    (inquirer.default.prompt as any)
      .mockResolvedValueOnce(mockAnswers)
      .mockResolvedValueOnce(mockQualityAnswers);

    const result = await collectBaselineInteractively();

    expect(result).toMatchObject({
      developmentCost: 50000,
      currentSaasSpend: 1500,
      teamSize: 5,
      currentProcessingHours: 40,
      accuracyBaseline: 0.85,
      errorRateBaseline: 0.05,
      customerSatisfactionScore: 7.5,
    });
  });

  it('should skip quality metrics when user declines', async () => {
    const mockAnswers = {
      developmentCost: 50000,
      currentSaasSpend: 1500,
      teamSize: 5,
      currentProcessingHours: 40,
      includeQualityMetrics: false,
    };

    const inquirer = await import('inquirer');
    (inquirer.default.prompt as any).mockResolvedValueOnce(mockAnswers);

    const result = await collectBaselineInteractively();

    expect(result).toMatchObject({
      developmentCost: 50000,
      currentSaasSpend: 1500,
      teamSize: 5,
      currentProcessingHours: 40,
      errorRateBaseline: 0.05, // default
      accuracyBaseline: 0.85, // default
    });
  });
});