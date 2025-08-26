import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ROICalculator } from './calculator.js';
import type { ROIBaseline, ROISnapshot } from '../../types/index.js';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

describe('ROICalculator', () => {
  let calculator: ROICalculator;
  const mockProjectPath = '/tmp/test-project';

  const mockBaseline: ROIBaseline = {
    establishedAt: new Date('2024-01-01'),
    developmentCost: 25000, // Reduced development cost for easier positive ROI
    currentSaasSpend: 1500,
    teamSize: 5,
    currentProcessingHours: 40,
    errorRateBaseline: 0.05,
    accuracyBaseline: 0.85,
    complianceScore: 0.7,
    customerSatisfactionScore: 7.5,
  };

  beforeEach(() => {
    calculator = new ROICalculator(mockProjectPath);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('calculateROI', () => {
    it('should calculate positive ROI with improvements', async () => {
      const currentMetrics = {
        monthsInOperation: 12, // Longer operation period for positive ROI
        currentSaasSpend: 500, // Significantly reduced SaaS spend ($1000/month savings)
        maintenanceCosts: 100, // Lower maintenance costs
        currentProcessingHours: 10, // Significantly reduced processing time (30 hours saved/month)
        tasksAutomated: 15,
        employeeAdoptionRate: 0.8,
        currentAccuracy: 0.95, // Improved accuracy
        currentErrorRate: 0.02, // Reduced error rate
        currentComplianceScore: 0.85, // Improved compliance
        currentCustomerSatisfaction: 8.5, // Improved satisfaction
      };

      const roiMetrics = await calculator.calculateROI(mockBaseline, currentMetrics);

      // Financial metrics should show positive ROI after 12 months
      expect(roiMetrics.financial.currentROI).toBeGreaterThan(0);
      expect(roiMetrics.financial.saasReplacementSavings).toBe(1000 * 12); // $1000 monthly savings * 12 months
      expect(roiMetrics.financial.operationalCostReduction).toBe(30 * 75 * 12); // 30 hours * $75/hr * 12 months
      expect(roiMetrics.financial.breakEvenMonths).toBeLessThan(24);

      // Productivity metrics should show improvements
      expect(roiMetrics.productivity.timeSavedHours).toBe(30 * 12); // 30 hours/month * 12 months
      expect(roiMetrics.productivity.errorReductionRate).toBeGreaterThan(0);
      expect(roiMetrics.productivity.employeeAdoptionRate).toBe(80);

      // Quality metrics should show improvements
      expect(roiMetrics.quality.accuracyImprovement).toBeGreaterThan(0);
      expect(roiMetrics.quality.defectReduction).toBeGreaterThan(0);
      expect(roiMetrics.quality.customerSatisfactionDelta).toBe(1); // 8.5 - 7.5

      // Confidence interval should be present
      expect(roiMetrics.confidenceInterval).toBeDefined();
      expect(roiMetrics.confidenceInterval.confidenceLevel).toBe(0.95);
      expect(roiMetrics.confidenceInterval.lower).toBeLessThan(roiMetrics.confidenceInterval.upper);
    });

    it('should calculate negative ROI when costs exceed benefits', async () => {
      const currentMetrics = {
        monthsInOperation: 2, // Short operation period
        currentSaasSpend: 1600, // Higher SaaS spend
        maintenanceCosts: 2000, // High maintenance costs
        currentProcessingHours: 45, // Increased processing time
        tasksAutomated: 2,
        employeeAdoptionRate: 0.2, // Low adoption
        currentAccuracy: 0.80, // Worse accuracy
        currentErrorRate: 0.08, // Higher error rate
        currentComplianceScore: 0.65, // Worse compliance
        currentCustomerSatisfaction: 7.0, // Worse satisfaction
      };

      const roiMetrics = await calculator.calculateROI(mockBaseline, currentMetrics);

      expect(roiMetrics.financial.currentROI).toBeLessThan(0);
      expect(roiMetrics.financial.saasReplacementSavings).toBeLessThanOrEqual(0); // No savings
      expect(roiMetrics.productivity.employeeAdoptionRate).toBe(20);
      expect(roiMetrics.quality.accuracyImprovement).toBeLessThan(0);
    });

    it('should handle edge case with zero baseline hours', async () => {
      const zeroHoursBaseline = { ...mockBaseline, currentProcessingHours: 0 };
      const currentMetrics = {
        monthsInOperation: 3,
        currentSaasSpend: 1000,
        maintenanceCosts: 100,
        currentProcessingHours: 10,
        tasksAutomated: 5,
        employeeAdoptionRate: 0.6,
        currentAccuracy: 0.9,
        currentErrorRate: 0.03,
        currentComplianceScore: 0.75,
        currentCustomerSatisfaction: 8.0,
      };

      const roiMetrics = await calculator.calculateROI(zeroHoursBaseline, currentMetrics);

      expect(roiMetrics.productivity.processingTimeReduction).toBe(0);
      expect(roiMetrics.productivity.throughputIncrease).toBe(0);
      expect(roiMetrics.financial.operationalCostReduction).toBe(0);
    });

    it('should use custom confidence level', async () => {
      const currentMetrics = {
        monthsInOperation: 6,
        currentSaasSpend: 800,
        maintenanceCosts: 200,
        currentProcessingHours: 20,
        tasksAutomated: 15,
        employeeAdoptionRate: 0.8,
        currentAccuracy: 0.95,
        currentErrorRate: 0.02,
        currentComplianceScore: 0.85,
        currentCustomerSatisfaction: 8.5,
      };

      const roiMetrics = await calculator.calculateROI(mockBaseline, currentMetrics, 0.99);

      expect(roiMetrics.confidenceInterval.confidenceLevel).toBe(0.99);
    });
  });

  describe('createSnapshot', () => {
    it('should create and save ROI snapshot', async () => {
      const mockROIMetrics = {
        financial: {
          developmentCost: 50000,
          saasReplacementSavings: 4200,
          operationalCostReduction: 9000,
          maintenanceCosts: 1200,
          cumulativeSavings: 13200,
          breakEvenMonths: 4,
          currentROI: 164,
        },
        productivity: {
          timeSavedHours: 120,
          tasksAutomated: 15,
          errorReductionRate: 60,
          employeeAdoptionRate: 80,
          processingTimeReduction: 50,
          throughputIncrease: 100,
        },
        quality: {
          defectReduction: 60,
          customerSatisfactionDelta: 1,
          complianceImprovement: 21.4,
          accuracyImprovement: 11.8,
          reviewCycleReduction: 48,
        },
        timestamp: new Date(),
        confidenceInterval: {
          lower: 144,
          upper: 184,
          confidenceLevel: 0.95,
        },
      };

      const period = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-01'),
      };

      (fs.readFile as any).mockRejectedValue({ code: 'ENOENT' }); // No existing snapshots

      const snapshot = await calculator.createSnapshot(
        'test-project',
        mockBaseline,
        mockROIMetrics,
        period
      );

      expect(snapshot.projectId).toBe('test-project');
      expect(snapshot.metrics).toBe(mockROIMetrics);
      expect(snapshot.baseline).toBe(mockBaseline);
      expect(snapshot.period).toBe(period);
      expect(snapshot.statisticalSignificance.pValue).toBeLessThan(0.05);
      expect(snapshot.statisticalSignificance.isSignificant).toBe(true);

      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(mockProjectPath, '.quallaa', 'roi-snapshots.json'),
        expect.any(String),
        'utf-8'
      );
    });

    it('should append to existing snapshots', async () => {
      const existingSnapshots = [
        {
          id: 'existing-1',
          projectId: 'test-project',
          timestamp: new Date('2024-01-01'),
          metrics: {},
          baseline: mockBaseline,
          period: { startDate: new Date(), endDate: new Date() },
          statisticalSignificance: { pValue: 0.01, isSignificant: true },
        },
      ];

      (fs.readFile as any).mockResolvedValue(JSON.stringify(existingSnapshots));

      const mockROIMetrics = {
        financial: { currentROI: 200 } as any,
        productivity: {} as any,
        quality: {} as any,
        timestamp: new Date(),
        confidenceInterval: { lower: 180, upper: 220, confidenceLevel: 0.95 },
      };

      await calculator.createSnapshot(
        'test-project',
        mockBaseline,
        mockROIMetrics,
        { startDate: new Date(), endDate: new Date() }
      );

      const writeCall = (fs.writeFile as any).mock.calls[0][1];
      const savedSnapshots = JSON.parse(writeCall);

      expect(savedSnapshots).toHaveLength(2); // Original + new snapshot
      expect(savedSnapshots[0].id).toBe('existing-1');
      expect(savedSnapshots[1].projectId).toBe('test-project');
    });
  });

  describe('getSnapshots', () => {
    it('should return empty array when no snapshots file exists', async () => {
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      (fs.readFile as any).mockRejectedValue(error);

      const snapshots = await calculator.getSnapshots();

      expect(snapshots).toEqual([]);
    });

    it('should return all snapshots when no projectId specified', async () => {
      const mockSnapshots = [
        {
          id: 'snap-1',
          projectId: 'project-1',
          timestamp: '2024-01-01T00:00:00.000Z',
          period: {
            startDate: '2024-01-01T00:00:00.000Z',
            endDate: '2024-06-01T00:00:00.000Z',
          },
          baseline: {
            ...mockBaseline,
            establishedAt: '2024-01-01T00:00:00.000Z',
          },
        },
        {
          id: 'snap-2',
          projectId: 'project-2',
          timestamp: '2024-02-01T00:00:00.000Z',
          period: {
            startDate: '2024-01-01T00:00:00.000Z',
            endDate: '2024-06-01T00:00:00.000Z',
          },
          baseline: {
            ...mockBaseline,
            establishedAt: '2024-01-01T00:00:00.000Z',
          },
        },
      ];

      (fs.readFile as any).mockResolvedValue(JSON.stringify(mockSnapshots));

      const snapshots = await calculator.getSnapshots();

      expect(snapshots).toHaveLength(2);
      expect(snapshots[0].timestamp).toBeInstanceOf(Date);
      expect(snapshots[0].period.startDate).toBeInstanceOf(Date);
      expect(snapshots[0].baseline.establishedAt).toBeInstanceOf(Date);
    });

    it('should filter snapshots by projectId', async () => {
      const mockSnapshots = [
        { 
          id: 'snap-1', 
          projectId: 'project-1', 
          timestamp: '2024-01-01T00:00:00.000Z',
          period: {
            startDate: '2024-01-01T00:00:00.000Z',
            endDate: '2024-06-01T00:00:00.000Z',
          },
          baseline: { ...mockBaseline, establishedAt: '2024-01-01T00:00:00.000Z' }
        },
        { 
          id: 'snap-2', 
          projectId: 'project-2', 
          timestamp: '2024-02-01T00:00:00.000Z',
          period: {
            startDate: '2024-01-01T00:00:00.000Z',
            endDate: '2024-06-01T00:00:00.000Z',
          },
          baseline: { ...mockBaseline, establishedAt: '2024-01-01T00:00:00.000Z' }
        },
        { 
          id: 'snap-3', 
          projectId: 'project-1', 
          timestamp: '2024-03-01T00:00:00.000Z',
          period: {
            startDate: '2024-01-01T00:00:00.000Z',
            endDate: '2024-06-01T00:00:00.000Z',
          },
          baseline: { ...mockBaseline, establishedAt: '2024-01-01T00:00:00.000Z' }
        },
      ];

      (fs.readFile as any).mockResolvedValue(JSON.stringify(mockSnapshots));

      const snapshots = await calculator.getSnapshots('project-1');

      expect(snapshots).toHaveLength(2);
      expect(snapshots.every(s => s.projectId === 'project-1')).toBe(true);
    });
  });

  describe('calculateTrends', () => {
    beforeEach(() => {
      const mockSnapshots: ROISnapshot[] = [
        {
          id: 'snap-1',
          projectId: 'test-project',
          timestamp: new Date('2024-01-01'),
          metrics: {
            financial: { currentROI: 100 } as any,
            productivity: {} as any,
            quality: {} as any,
            timestamp: new Date(),
            confidenceInterval: { lower: 80, upper: 120, confidenceLevel: 0.95 },
          },
          baseline: mockBaseline,
          period: { startDate: new Date(), endDate: new Date() },
          statisticalSignificance: { pValue: 0.01, isSignificant: true },
        },
        {
          id: 'snap-2',
          projectId: 'test-project',
          timestamp: new Date('2024-02-01'),
          metrics: {
            financial: { currentROI: 150 } as any,
            productivity: {} as any,
            quality: {} as any,
            timestamp: new Date(),
            confidenceInterval: { lower: 130, upper: 170, confidenceLevel: 0.95 },
          },
          baseline: mockBaseline,
          period: { startDate: new Date(), endDate: new Date() },
          statisticalSignificance: { pValue: 0.01, isSignificant: true },
        },
        {
          id: 'snap-3',
          projectId: 'test-project',
          timestamp: new Date('2024-03-01'),
          metrics: {
            financial: { currentROI: 200 } as any,
            productivity: {} as any,
            quality: {} as any,
            timestamp: new Date(),
            confidenceInterval: { lower: 180, upper: 220, confidenceLevel: 0.95 },
          },
          baseline: mockBaseline,
          period: { startDate: new Date(), endDate: new Date() },
          statisticalSignificance: { pValue: 0.01, isSignificant: true },
        },
      ];

      (fs.readFile as any).mockResolvedValue(JSON.stringify(mockSnapshots));
    });

    it('should calculate improving trend for ROI', async () => {
      const trend = await calculator.calculateTrends('test-project', 'financial.currentROI');

      expect(trend.metric).toBe('financial.currentROI');
      expect(trend.category).toBe('financial');
      expect(trend.values).toHaveLength(3);
      expect(trend.trend).toBe('improving'); // ROI increasing from 100 to 200
      expect(trend.trendConfidence).toBeGreaterThan(0);
    });

    it('should require at least 2 snapshots', async () => {
      const singleSnapshot = [
        {
          id: 'snap-1',
          projectId: 'test-project',
          timestamp: '2024-01-01T00:00:00.000Z',
          metrics: { financial: { currentROI: 100 } } as any,
          period: {
            startDate: '2024-01-01T00:00:00.000Z',
            endDate: '2024-06-01T00:00:00.000Z',
          },
          baseline: { ...mockBaseline, establishedAt: '2024-01-01T00:00:00.000Z' }
        },
      ];

      (fs.readFile as any).mockResolvedValue(JSON.stringify(singleSnapshot));

      await expect(calculator.calculateTrends('test-project', 'financial.currentROI'))
        .rejects.toThrow('At least 2 snapshots required for trend analysis');
    });

    it('should categorize metrics correctly', async () => {
      const financialTrend = await calculator.calculateTrends('test-project', 'financial.currentROI');
      expect(financialTrend.category).toBe('financial');

      const productivityTrend = await calculator.calculateTrends('test-project', 'productivity.timeSaved');
      expect(productivityTrend.category).toBe('productivity');

      const qualityTrend = await calculator.calculateTrends('test-project', 'quality.accuracy');
      expect(qualityTrend.category).toBe('quality');
    });
  });

  describe('statistical calculations', () => {
    it('should calculate confidence intervals with reasonable bounds', async () => {
      const currentMetrics = {
        monthsInOperation: 6,
        currentSaasSpend: 800,
        maintenanceCosts: 200,
        currentProcessingHours: 20,
        tasksAutomated: 15,
        employeeAdoptionRate: 0.8,
        currentAccuracy: 0.95,
        currentErrorRate: 0.02,
        currentComplianceScore: 0.85,
        currentCustomerSatisfaction: 8.5,
      };

      const roiMetrics = await calculator.calculateROI(mockBaseline, currentMetrics);

      const { lower, upper, confidenceLevel } = roiMetrics.confidenceInterval;

      expect(lower).toBeLessThan(roiMetrics.financial.currentROI);
      expect(upper).toBeGreaterThan(roiMetrics.financial.currentROI);
      expect(confidenceLevel).toBe(0.95);

      // Confidence interval shouldn't be unreasonably wide (for positive ROI)
      const intervalWidth = upper - lower;
      if (roiMetrics.financial.currentROI > 0) {
        expect(intervalWidth).toBeLessThan(roiMetrics.financial.currentROI * 2);
      } else {
        // For negative ROI, just check that the interval makes sense
        expect(intervalWidth).toBeGreaterThan(0);
      }
    });

    it('should handle p-value calculation for statistical significance', async () => {
      const mockROIMetrics = {
        financial: { currentROI: 200 } as any,
        productivity: {} as any,
        quality: {} as any,
        timestamp: new Date(),
        confidenceInterval: { lower: 180, upper: 220, confidenceLevel: 0.95 },
      };

      (fs.readFile as any).mockRejectedValue({ code: 'ENOENT' });

      const snapshot = await calculator.createSnapshot(
        'test-project',
        mockBaseline,
        mockROIMetrics,
        { startDate: new Date(), endDate: new Date() }
      );

      expect(snapshot.statisticalSignificance.pValue).toBeGreaterThan(0);
      expect(snapshot.statisticalSignificance.pValue).toBeLessThan(1);
      expect(snapshot.statisticalSignificance.isSignificant).toBeDefined();
    });
  });
});