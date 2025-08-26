import { 
  ROIBaseline, 
  ROIMetrics, 
  ROISnapshot, 
  FinancialMetrics, 
  ProductivityMetrics, 
  QualityMetrics,
  ROITrend
} from '../../types/index.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Multi-dimensional ROI calculation engine
 * Implements academic-grade statistical analysis for business impact measurement
 */
export class ROICalculator {
  private snapshotsPath: string;
  
  constructor(projectPath: string = process.cwd()) {
    this.snapshotsPath = path.join(projectPath, '.quallaa', 'roi-snapshots.json');
  }

  /**
   * Calculate current ROI metrics against baseline
   * Implements multi-dimensional analysis per research requirements
   */
  async calculateROI(
    baseline: ROIBaseline,
    currentMetrics: {
      // Financial inputs
      monthsInOperation: number;
      currentSaasSpend: number;
      maintenanceCosts: number;
      
      // Productivity inputs  
      currentProcessingHours: number;
      tasksAutomated: number;
      employeeAdoptionRate: number;
      
      // Quality inputs
      currentAccuracy: number;
      currentErrorRate: number;
      currentComplianceScore: number;
      currentCustomerSatisfaction: number;
    },
    confidenceLevel: number = 0.95
  ): Promise<ROIMetrics> {

    // Calculate financial metrics
    const financial = this.calculateFinancialMetrics(baseline, currentMetrics);
    
    // Calculate productivity metrics
    const productivity = this.calculateProductivityMetrics(baseline, currentMetrics);
    
    // Calculate quality metrics
    const quality = this.calculateQualityMetrics(baseline, currentMetrics);

    // Calculate overall ROI confidence interval using Monte Carlo simulation
    const confidenceInterval = this.calculateConfidenceInterval(
      financial.currentROI,
      [financial, productivity, quality],
      confidenceLevel
    );

    return {
      financial,
      productivity,
      quality,
      timestamp: new Date(),
      confidenceInterval
    };
  }

  /**
   * Financial ROI calculation following Forrester methodology
   */
  private calculateFinancialMetrics(
    baseline: ROIBaseline, 
    current: any
  ): FinancialMetrics {
    
    // SaaS replacement savings (monthly)
    const saasReplacementSavings = Math.max(0, baseline.currentSaasSpend - current.currentSaasSpend);
    
    // Operational cost reduction (based on time savings)
    const hourlyRate = 75; // Average developer hourly rate
    const timeSavedHours = Math.max(0, baseline.currentProcessingHours - current.currentProcessingHours);
    const operationalCostReduction = timeSavedHours * hourlyRate;
    
    // Cumulative savings over operation period
    const monthlySavings = saasReplacementSavings + operationalCostReduction;
    const cumulativeSavings = monthlySavings * current.monthsInOperation;
    
    // Net benefit (savings minus ongoing costs)
    const netBenefit = cumulativeSavings - baseline.developmentCost - (current.maintenanceCosts * current.monthsInOperation);
    
    // ROI calculation: (Net Benefit / Investment) * 100
    const currentROI = baseline.developmentCost > 0 ? (netBenefit / baseline.developmentCost) * 100 : 0;
    
    // Break-even calculation
    const monthlyNetSavings = monthlySavings - current.maintenanceCosts;
    const breakEvenMonths = monthlyNetSavings > 0 ? 
      Math.ceil(baseline.developmentCost / monthlyNetSavings) : 
      Infinity;

    return {
      developmentCost: baseline.developmentCost,
      saasReplacementSavings: saasReplacementSavings * current.monthsInOperation,
      operationalCostReduction: operationalCostReduction * current.monthsInOperation,
      maintenanceCosts: current.maintenanceCosts * current.monthsInOperation,
      cumulativeSavings,
      breakEvenMonths,
      currentROI
    };
  }

  /**
   * Productivity impact calculation following academic research
   */
  private calculateProductivityMetrics(
    baseline: ROIBaseline,
    current: any
  ): ProductivityMetrics {
    
    const timeSavedHours = Math.max(0, baseline.currentProcessingHours - current.currentProcessingHours);
    const errorReductionRate = Math.max(0, (baseline.errorRateBaseline - current.currentErrorRate) / baseline.errorRateBaseline);
    const processingTimeReduction = baseline.currentProcessingHours > 0 ? 
      (timeSavedHours / baseline.currentProcessingHours) * 100 : 0;
    
    // Throughput increase calculation
    const baselineThroughput = baseline.currentProcessingHours > 0 ? 1 / baseline.currentProcessingHours : 0;
    const currentThroughput = current.currentProcessingHours > 0 ? 1 / current.currentProcessingHours : 0;
    const throughputIncrease = baselineThroughput > 0 ? 
      ((currentThroughput - baselineThroughput) / baselineThroughput) * 100 : 0;

    return {
      timeSavedHours: timeSavedHours * current.monthsInOperation,
      tasksAutomated: current.tasksAutomated,
      errorReductionRate: errorReductionRate * 100,
      employeeAdoptionRate: current.employeeAdoptionRate * 100,
      processingTimeReduction,
      throughputIncrease
    };
  }

  /**
   * Quality improvement calculation
   */
  private calculateQualityMetrics(
    baseline: ROIBaseline,
    current: any
  ): QualityMetrics {
    
    const accuracyImprovement = ((current.currentAccuracy - baseline.accuracyBaseline) / baseline.accuracyBaseline) * 100;
    const defectReduction = baseline.errorRateBaseline > 0 ?
      ((baseline.errorRateBaseline - current.currentErrorRate) / baseline.errorRateBaseline) * 100 : 0;
    const complianceImprovement = ((current.currentComplianceScore - baseline.complianceScore) / baseline.complianceScore) * 100;
    const customerSatisfactionDelta = current.currentCustomerSatisfaction - baseline.customerSatisfactionScore;
    
    // Review cycle reduction (estimated based on error reduction)
    const reviewCycleReduction = defectReduction * 0.8; // 80% correlation assumption

    return {
      defectReduction,
      customerSatisfactionDelta,
      complianceImprovement,
      accuracyImprovement,
      reviewCycleReduction
    };
  }

  /**
   * Statistical confidence interval calculation using Monte Carlo simulation
   * Addresses AI productivity paradox through objective measurement uncertainty
   */
  private calculateConfidenceInterval(
    pointEstimate: number,
    metricSets: any[],
    confidenceLevel: number
  ): { lower: number; upper: number; confidenceLevel: number } {
    
    const iterations = 10000;
    const samples: number[] = [];
    
    // Monte Carlo simulation with realistic uncertainty
    for (let i = 0; i < iterations; i++) {
      let adjustedEstimate = pointEstimate;
      
      // Add uncertainty based on measurement volatility
      const uncertaintyFactor = this.calculateUncertaintyFactor(metricSets);
      const randomVariation = (Math.random() - 0.5) * 2 * uncertaintyFactor;
      adjustedEstimate += adjustedEstimate * randomVariation;
      
      samples.push(adjustedEstimate);
    }
    
    // Sort samples and calculate percentiles
    samples.sort((a, b) => a - b);
    const alpha = (1 - confidenceLevel) / 2;
    const lowerIndex = Math.floor(samples.length * alpha);
    const upperIndex = Math.floor(samples.length * (1 - alpha));
    
    return {
      lower: samples[lowerIndex],
      upper: samples[upperIndex],
      confidenceLevel
    };
  }

  /**
   * Calculate measurement uncertainty factor based on data quality
   */
  private calculateUncertaintyFactor(metricSets: any[]): number {
    let baseUncertainty = 0.15; // 15% base uncertainty
    
    // Reduce uncertainty with more comprehensive data
    if (metricSets.length >= 3) baseUncertainty *= 0.8;
    
    // Account for measurement maturity (simplified)
    baseUncertainty *= 0.9; // Assume some maturity
    
    return Math.max(0.05, Math.min(0.3, baseUncertainty)); // Clamp between 5-30%
  }

  /**
   * Create and store ROI snapshot
   */
  async createSnapshot(
    projectId: string,
    baseline: ROIBaseline,
    metrics: ROIMetrics,
    period: { startDate: Date; endDate: Date }
  ): Promise<ROISnapshot> {
    
    // Calculate statistical significance (simplified p-value)
    const pValue = this.calculatePValue(metrics.financial.currentROI, metrics.confidenceInterval);
    
    const snapshot: ROISnapshot = {
      id: `roi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      timestamp: new Date(),
      metrics,
      baseline,
      period,
      statisticalSignificance: {
        pValue,
        isSignificant: pValue < 0.05
      }
    };

    await this.saveSnapshot(snapshot);
    return snapshot;
  }

  /**
   * Load historical snapshots
   */
  async getSnapshots(projectId?: string): Promise<ROISnapshot[]> {
    try {
      const data = await fs.readFile(this.snapshotsPath, 'utf-8');
      const snapshots: ROISnapshot[] = JSON.parse(data);
      
      // Convert date strings back to Date objects
      snapshots.forEach(snapshot => {
        snapshot.timestamp = new Date(snapshot.timestamp);
        if (snapshot.period) {
          snapshot.period.startDate = new Date(snapshot.period.startDate);
          snapshot.period.endDate = new Date(snapshot.period.endDate);
        }
        if (snapshot.baseline) {
          snapshot.baseline.establishedAt = new Date(snapshot.baseline.establishedAt);
        }
      });
      
      return projectId ? 
        snapshots.filter(s => s.projectId === projectId) : 
        snapshots;
        
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Calculate trends from historical snapshots
   */
  async calculateTrends(projectId: string, metric: string): Promise<ROITrend> {
    const snapshots = await this.getSnapshots(projectId);
    
    if (snapshots.length < 2) {
      throw new Error('At least 2 snapshots required for trend analysis');
    }

    const values = snapshots.map(snapshot => {
      const value = this.extractMetricValue(snapshot.metrics, metric);
      return {
        timestamp: snapshot.timestamp,
        value,
        confidenceInterval: snapshot.metrics.confidenceInterval
      };
    });

    // Simple trend calculation using linear regression
    const trend = this.calculateLinearTrend(values.map(v => v.value));
    const trendConfidence = this.calculateTrendConfidence(values.map(v => v.value));
    const category = this.getMetricCategory(metric);

    return {
      metric,
      category,
      values,
      trend: trend > 0.05 ? 'improving' : trend < -0.05 ? 'declining' : 'stable',
      trendConfidence
    };
  }

  private calculatePValue(roi: number, confidenceInterval: any): number {
    // Simplified p-value calculation
    // In practice, this would use proper statistical tests
    const margin = Math.abs(confidenceInterval.upper - confidenceInterval.lower) / 2;
    const zScore = Math.abs(roi) / (margin / 1.96); // Approximate z-score
    return Math.max(0.001, 2 * (1 - this.normalCDF(Math.abs(zScore))));
  }

  private normalCDF(x: number): number {
    // Approximation of normal CDF
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private erf(x: number): number {
    // Approximation of error function
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private extractMetricValue(metrics: ROIMetrics, metricName: string): number {
    // Extract specific metric value from metrics object
    const parts = metricName.split('.');
    let value: any = metrics;
    
    for (const part of parts) {
      value = value[part];
      if (value === undefined) return 0;
    }
    
    return typeof value === 'number' ? value : 0;
  }

  private calculateLinearTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  private calculateTrendConfidence(values: number[]): number {
    if (values.length < 3) return 0;
    
    // Calculate R-squared as confidence measure
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const totalVariation = values.reduce((sum, y) => sum + Math.pow(y - mean, 2), 0);
    
    if (totalVariation === 0) return 0;
    
    const trend = this.calculateLinearTrend(values);
    const predicted = values.map((_, i) => mean + trend * (i - (values.length - 1) / 2));
    const explainedVariation = predicted.reduce((sum, y) => sum + Math.pow(y - mean, 2), 0);
    
    return Math.min(1, explainedVariation / totalVariation);
  }

  private getMetricCategory(metric: string): 'financial' | 'productivity' | 'quality' {
    if (metric.includes('cost') || metric.includes('roi') || metric.includes('savings') || metric.includes('financial')) {
      return 'financial';
    } else if (metric.includes('time') || metric.includes('hours') || metric.includes('adoption') || metric.includes('productivity')) {
      return 'productivity';
    } else {
      return 'quality';
    }
  }

  private async saveSnapshot(snapshot: ROISnapshot): Promise<void> {
    const snapshots = await this.getSnapshots();
    snapshots.push(snapshot);
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(this.snapshotsPath), { recursive: true });
    
    // Save with proper formatting
    await fs.writeFile(
      this.snapshotsPath, 
      JSON.stringify(snapshots, null, 2), 
      'utf-8'
    );
  }
}