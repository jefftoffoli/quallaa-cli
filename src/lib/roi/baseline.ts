import { ROIBaseline, ROIConfig } from '../../types/index.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';

/**
 * ROI Baseline Collection System
 * Implements academic best practices for establishing measurement baselines
 */
export class BaselineCollector {
  private baselineFilePath: string;
  private config: ROIConfig;

  constructor(projectPath: string = process.cwd(), config?: Partial<ROIConfig>) {
    this.baselineFilePath = path.join(projectPath, '.quallaa', 'roi-baseline.json');
    this.config = {
      trackingEnabled: true,
      baselineRequired: true,
      confidenceLevel: 0.95,
      reportingFrequency: 'monthly',
      benchmarkTargets: {
        roiTarget: 2.48, // 248% ROI from Forrester research
        paybackMonths: 6,
        adoptionRate: 0.66
      },
      ...config
    };
  }

  /**
   * Establish comprehensive baseline metrics
   * Critical for accurate before/after ROI comparisons per academic research
   */
  async establishBaseline(inputs: {
    developmentCost: number;
    currentSaasSpend: number;
    teamSize: number;
    currentProcessingHours: number;
    errorRateBaseline?: number;
    accuracyBaseline?: number;
    complianceScore?: number;
    customerSatisfactionScore?: number;
  }): Promise<ROIBaseline> {
    
    // Validate required inputs
    this.validateBaselineInputs(inputs);

    const baseline: ROIBaseline = {
      establishedAt: new Date(),
      developmentCost: inputs.developmentCost,
      currentSaasSpend: inputs.currentSaasSpend,
      teamSize: inputs.teamSize,
      currentProcessingHours: inputs.currentProcessingHours,
      errorRateBaseline: inputs.errorRateBaseline ?? 0.05, // Default 5% error rate
      accuracyBaseline: inputs.accuracyBaseline ?? 0.85, // Default 85% accuracy
      complianceScore: inputs.complianceScore ?? 0.7, // Default 70% compliance
      customerSatisfactionScore: inputs.customerSatisfactionScore ?? 7.5 // Default 7.5/10
    };

    // Persist baseline data
    await this.saveBaseline(baseline);
    
    // Log establishment for audit trail
    console.log(`✅ ROI baseline established at ${baseline.establishedAt.toISOString()}`);
    console.log(`📊 Development cost: $${baseline.developmentCost.toLocaleString()}`);
    console.log(`💰 Current SaaS spend: $${baseline.currentSaasSpend.toLocaleString()}/month`);
    console.log(`👥 Team size: ${baseline.teamSize} members`);
    console.log(`⏱️  Processing hours: ${baseline.currentProcessingHours} hours/month`);

    return baseline;
  }

  /**
   * Load existing baseline data
   */
  async getBaseline(): Promise<ROIBaseline | null> {
    try {
      const data = await fs.readFile(this.baselineFilePath, 'utf-8');
      const baseline = JSON.parse(data);
      
      // Convert date strings back to Date objects
      baseline.establishedAt = new Date(baseline.establishedAt);
      
      return baseline;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null; // File doesn't exist
      }
      throw error;
    }
  }

  /**
   * Update baseline with new measurements
   * Supports iterative baseline refinement
   */
  async updateBaseline(updates: Partial<Omit<ROIBaseline, 'establishedAt'>>): Promise<ROIBaseline> {
    const existing = await this.getBaseline();
    if (!existing) {
      throw new Error('No baseline exists to update. Establish baseline first.');
    }

    const updated: ROIBaseline = {
      ...existing,
      ...updates
    };

    await this.saveBaseline(updated);
    return updated;
  }

  /**
   * Validate baseline has been established (required by research)
   */
  async requireBaseline(): Promise<ROIBaseline> {
    if (!this.config.baselineRequired) {
      throw new Error('Baseline validation disabled in config');
    }

    const baseline = await this.getBaseline();
    if (!baseline) {
      throw new Error(
        'ROI baseline required but not found. Run: quallaa evaluators baseline --help'
      );
    }

    // Validate baseline is recent (within 6 months)
    const monthsOld = (Date.now() - baseline.establishedAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsOld > 6) {
      console.warn(`⚠️  Baseline is ${monthsOld.toFixed(1)} months old. Consider refreshing.`);
    }

    return baseline;
  }

  /**
   * Calculate baseline health score
   * Validates data quality for accurate ROI measurement
   */
  calculateBaselineHealth(baseline: ROIBaseline): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Validate financial data completeness
    if (baseline.developmentCost <= 0) {
      issues.push('Development cost not specified');
      score -= 25;
      recommendations.push('Update baseline with actual development investment');
    }

    if (baseline.currentSaasSpend <= 0) {
      issues.push('Current SaaS spend not specified');
      score -= 20;
      recommendations.push('Document current tool subscriptions to measure savings');
    }

    // Validate operational metrics
    if (baseline.teamSize <= 0) {
      issues.push('Team size not specified');
      score -= 15;
      recommendations.push('Specify team size for productivity impact calculations');
    }

    if (baseline.currentProcessingHours <= 0) {
      issues.push('Current processing hours not measured');
      score -= 20;
      recommendations.push('Measure current manual processing time for automation impact');
    }

    // Validate quality baselines
    if (baseline.accuracyBaseline < 0.5) {
      issues.push('Accuracy baseline suspiciously low');
      score -= 10;
      recommendations.push('Verify accuracy baseline measurement methodology');
    }

    if (baseline.errorRateBaseline > 0.2) {
      issues.push('Error rate baseline high (>20%)');
      score -= 10;
      recommendations.push('High error rates indicate significant improvement opportunity');
    }

    return { score, issues, recommendations };
  }

  /**
   * Generate baseline report for stakeholders
   */
  async generateBaselineReport(): Promise<string> {
    const baseline = await this.getBaseline();
    if (!baseline) {
      return 'No baseline established. Run: quallaa evaluators baseline';
    }

    const health = this.calculateBaselineHealth(baseline);
    const monthsSinceBaseline = (Date.now() - baseline.establishedAt.getTime()) / (1000 * 60 * 60 * 24 * 30);

    return `# ROI Baseline Report

## Baseline Overview
- **Established:** ${baseline.establishedAt.toLocaleDateString()}
- **Age:** ${monthsSinceBaseline.toFixed(1)} months
- **Health Score:** ${health.score}/100

## Financial Baseline
- **Development Investment:** $${baseline.developmentCost.toLocaleString()}
- **Current SaaS Spending:** $${baseline.currentSaasSpend.toLocaleString()}/month
- **Annual SaaS Cost:** $${(baseline.currentSaasSpend * 12).toLocaleString()}

## Operational Baseline
- **Team Size:** ${baseline.teamSize} members
- **Processing Hours:** ${baseline.currentProcessingHours} hours/month
- **Hourly Processing Cost:** $${((baseline.currentSaasSpend / baseline.currentProcessingHours) || 0).toFixed(2)}

## Quality Baseline
- **Accuracy:** ${(baseline.accuracyBaseline * 100).toFixed(1)}%
- **Error Rate:** ${(baseline.errorRateBaseline * 100).toFixed(1)}%
- **Compliance Score:** ${(baseline.complianceScore * 100).toFixed(1)}%
- **Customer Satisfaction:** ${baseline.customerSatisfactionScore}/10

## Health Assessment
${health.issues.length > 0 ? `### Issues
${health.issues.map(issue => `- ⚠️ ${issue}`).join('\n')}` : '✅ No issues detected'}

${health.recommendations.length > 0 ? `### Recommendations
${health.recommendations.map(rec => `- 💡 ${rec}`).join('\n')}` : ''}

---
*Generated by Quallaa ROI Tracking System*
`;
  }

  private validateBaselineInputs(inputs: any): void {
    const required = ['developmentCost', 'currentSaasSpend', 'teamSize', 'currentProcessingHours'];
    
    for (const field of required) {
      if (typeof inputs[field] !== 'number' || inputs[field] < 0) {
        throw new Error(`Invalid ${field}: must be a positive number`);
      }
    }

    if (inputs.teamSize < 1) {
      throw new Error('Team size must be at least 1');
    }
  }

  private async saveBaseline(baseline: ROIBaseline): Promise<void> {
    // Ensure .quallaa directory exists
    await fs.mkdir(path.dirname(this.baselineFilePath), { recursive: true });
    
    // Save with proper formatting
    await fs.writeFile(
      this.baselineFilePath, 
      JSON.stringify(baseline, null, 2), 
      'utf-8'
    );
  }
}

/**
 * Interactive baseline collection - conversation style
 */
export async function collectBaselineInteractively(): Promise<ROIBaseline> {
  const inquirer = await import('inquirer');

  console.log('Let\'s start by getting a picture of where you are right now.');
  console.log(chalk.gray('This helps us figure out if your project will pay off.\n'));

  const answers = await inquirer.default.prompt([
    {
      type: 'number',
      name: 'developmentCost',
      message: 'How much did you spend building this? (total cost in $)',
      validate: (value) => value > 0 || 'Need a number greater than 0',
    },
    {
      type: 'number',
      name: 'currentSaasSpend',
      message: 'What do you spend monthly on tools like Slack, Notion, etc? ($)',
      default: 0,
      validate: (value) => value >= 0 || 'Must be 0 or more',
    },
    {
      type: 'number',
      name: 'teamSize',
      message: 'How many people will use this?',
      default: 1,
      validate: (value) => value >= 1 || 'Need at least 1 person',
    },
    {
      type: 'number',
      name: 'currentProcessingHours',
      message: 'How many hours per month do you spend on manual work this could replace?',
      default: 0,
      validate: (value) => value >= 0 || 'Must be 0 or more',
    },
    {
      type: 'confirm',
      name: 'includeQuality',
      message: 'Want to track quality improvements too?',
      default: false,
    }
  ]);

  let qualityMetrics = {};
  if (answers.includeQuality) {
    console.log(chalk.gray('\nGreat! A few quick quality questions...'));
    
    qualityMetrics = await inquirer.default.prompt([
      {
        type: 'list',
        name: 'accuracyBaseline',
        message: 'How accurate is your current process?',
        choices: [
          { name: 'Pretty good (90%+)', value: 0.9 },
          { name: 'Decent (80-90%)', value: 0.85 },
          { name: 'Not great (70-80%)', value: 0.75 },
          { name: 'Terrible (under 70%)', value: 0.6 },
        ],
      },
      {
        type: 'list',
        name: 'errorRateBaseline',
        message: 'How often do mistakes happen?',
        choices: [
          { name: 'Rarely (under 5%)', value: 0.03 },
          { name: 'Sometimes (5-10%)', value: 0.07 },
          { name: 'Often (10-20%)', value: 0.15 },
          { name: 'All the time (20%+)', value: 0.25 },
        ],
      },
      {
        type: 'number',
        name: 'customerSatisfactionScore',
        message: 'Customer satisfaction score (1-10)?',
        default: 7,
        validate: (value) => (value >= 1 && value <= 10) || 'Must be 1-10',
      }
    ]);
  }

  const collector = new BaselineCollector();
  return await collector.establishBaseline({ ...answers, ...qualityMetrics });
}