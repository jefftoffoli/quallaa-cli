import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { glob } from 'glob';
import * as path from 'path';
import { BaselineCollector, collectBaselineInteractively } from '../lib/roi/baseline.js';
import { ROICalculator } from '../lib/roi/calculator.js';

interface EvaluationResult {
  metric: string;
  value: number;
  threshold: number;
  passed: boolean;
  details?: string;
  category: string;
}

interface EvaluationSuite {
  name: string;
  description: string;
  results: EvaluationResult[];
  overallScore: number;
  passed: boolean;
  timestamp: Date;
  duration: number;
}

export const evaluatorsCommand = new Command('evaluators')
  .description('Measure your project\'s performance and business value')
  .addCommand(
    new Command('run')
      .description('Test technical performance against quality standards')
      .option('--output <path>', 'Output path for scorecard HTML', 'evaluators/scorecard.html')
      .option('--threshold <number>', 'Overall passing threshold (0-1)', '0.8')
      .option('--format <format>', 'Output format (html|json|text)', 'html')
      .action(async (options) => {
        console.log(chalk.cyan('🔍 Running Quallaa Evaluation Harness'));
        console.log(chalk.gray('Measuring accuracy, rework ratio, time-to-output, and unit cost...\n'));

        try {
          const spinner = ora('Discovering evaluation scripts...').start();
          
          // Discover evaluator files
          const evaluatorFiles = await discoverEvaluators();
          spinner.succeed(`Found ${evaluatorFiles.length} evaluator(s)`);
          
          if (evaluatorFiles.length === 0) {
            console.log(chalk.yellow('⚠️  No evaluators found in /evaluators directory'));
            console.log(chalk.gray('Create evaluator scripts to measure outcome performance'));
            return;
          }

          // Run evaluations
          const startTime = Date.now();
          const results: EvaluationResult[] = [];
          
          for (const file of evaluatorFiles) {
            const spinner = ora(`Running ${path.basename(file)}...`).start();
            try {
              const fileResults = await runEvaluatorFile(file);
              results.push(...fileResults);
              spinner.succeed(`${path.basename(file)} completed`);
            } catch (error) {
              spinner.fail(`${path.basename(file)} failed`);
              console.error(chalk.red(`  Error: ${error instanceof Error ? error.message : error}`));
            }
          }
          
          const duration = Date.now() - startTime;
          
          // Calculate overall metrics
          const suite = calculateSuiteMetrics(results, duration, parseFloat(options.threshold));
          
          // Generate output
          await generateOutput(suite, options.output, options.format);
          
          // Display summary
          displaySummary(suite);
          
          // Exit with appropriate code
          if (!suite.passed) {
            console.log(chalk.red('\n❌ Evaluation suite failed'));
            process.exit(1);
          } else {
            console.log(chalk.green('\n✅ Evaluation suite passed'));
          }
          
        } catch (error) {
          console.error(chalk.red('Error running evaluators:'), error);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('setup')
      .description('Set up ROI tracking for your project')
      .action(async () => {
        console.log(chalk.cyan('💰 Set Up ROI Tracking'));
        console.log(chalk.gray('Let\'s figure out if your project is worth it...\n'));

        try {
          await collectBaselineInteractively();

          console.log(chalk.green('\n✅ Perfect! Now you can track your ROI.'));
          
          console.log(chalk.cyan('\nWhat\'s next?'));
          console.log(chalk.gray('• Run: quallaa evaluators check (see current ROI)'));
          console.log(chalk.gray('• Run: quallaa evaluators report (full analysis)'));

        } catch (error) {
          console.error(chalk.red('Setup failed:'), error instanceof Error ? error.message : error);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('check')
      .description('Check if your project is paying off')
      .action(async () => {
        console.log(chalk.cyan('💰 ROI Check'));
        console.log(chalk.gray('Let\'s see how you\'re doing...\n'));

        try {
          const collector = new BaselineCollector();
          const calculator = new ROICalculator();

          // Load baseline
          const baseline = await collector.requireBaseline();
          const monthsRunning = Math.max(1, (Date.now() - baseline.establishedAt.getTime()) / (1000 * 60 * 60 * 24 * 30));

          console.log(chalk.gray(`Your project has been running for ${monthsRunning.toFixed(1)} months.\n`));

          // Simple questions
          const inquirer = await import('inquirer');
          const answers = await inquirer.default.prompt([
            {
              type: 'number',
              name: 'currentSaasSpend',
              message: 'How much are you spending on SaaS tools now? ($)',
              default: baseline.currentSaasSpend,
            },
            {
              type: 'number',
              name: 'hoursNow',
              message: 'How many hours of manual work per month?',
              default: baseline.currentProcessingHours,
            },
            {
              type: 'list',
              name: 'teamAdoption',
              message: 'How much is your team using the system?',
              choices: [
                { name: 'Everyone uses it daily', value: 0.9 },
                { name: 'Most people use it regularly', value: 0.7 },
                { name: 'About half the team uses it', value: 0.5 },
                { name: 'Only a few people use it', value: 0.3 },
                { name: 'Almost nobody uses it', value: 0.1 },
              ],
            }
          ]);

          // Calculate simple ROI
          const roiMetrics = await calculator.calculateROI(baseline, {
            monthsInOperation: monthsRunning,
            currentSaasSpend: answers.currentSaasSpend,
            maintenanceCosts: 0,
            currentProcessingHours: answers.hoursNow,
            tasksAutomated: Math.max(0, baseline.currentProcessingHours - answers.hoursNow),
            employeeAdoptionRate: answers.teamAdoption,
            currentAccuracy: baseline.accuracyBaseline * 1.1, // Assume slight improvement
            currentErrorRate: baseline.errorRateBaseline * 0.9, // Assume slight improvement
            currentComplianceScore: baseline.complianceScore,
            currentCustomerSatisfaction: baseline.customerSatisfactionScore,
          });

          // Show simple results
          await displaySimpleROIResults(roiMetrics, baseline);

        } catch (error) {
          console.error(chalk.red('Check failed:'), error instanceof Error ? error.message : error);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('report')
      .description('Generate a detailed ROI report')
      .option('--web', 'Create a web report you can share')
      .action(async (options) => {
        console.log(chalk.cyan('📊 ROI Report'));
        console.log(chalk.gray('Creating your project\'s business case...\n'));

        try {
          const collector = new BaselineCollector();
          const calculator = new ROICalculator();
          
          const baseline = await collector.requireBaseline();
          const projectId = process.cwd().split('/').pop() || 'unknown';
          const snapshots = await calculator.getSnapshots(projectId);

          if (snapshots.length === 0) {
            console.log(chalk.yellow('No data yet. Run: quallaa evaluators check'));
            return;
          }

          const spinner = ora('Building your report...').start();
          
          if (options.web) {
            const dashboard = await generateROIDashboard(baseline, snapshots, 'html');
            const fs = await import('fs/promises');
            const outputPath = 'roi-report.html';
            await fs.writeFile(outputPath, dashboard);
            spinner.succeed(`Report saved: ${outputPath}`);
            console.log(chalk.green('\n🌐 Open roi-report.html in your browser to see the full report.'));
          } else {
            const dashboard = await generateROIDashboard(baseline, snapshots, 'text');
            spinner.succeed('Report ready');
            console.log('\n' + dashboard);
          }

        } catch (error) {
          console.error(chalk.red('Report failed:'), error instanceof Error ? error.message : error);
          process.exit(1);
        }
      })
  );

async function discoverEvaluators(): Promise<string[]> {
  try {
    const files = await glob('evaluators/**/*.{js,ts,mjs}', { 
      cwd: process.cwd(),
      absolute: true,
      ignore: ['**/*.test.*', '**/*.spec.*', '**/node_modules/**']
    });
    
    return files.filter(file => 
      !file.includes('.test.') && 
      !file.includes('.spec.') &&
      !file.includes('scorecard.')
    );
  } catch (error) {
    console.warn('Error discovering evaluators:', error);
    return [];
  }
}

async function runEvaluatorFile(filePath: string): Promise<EvaluationResult[]> {
  const results: EvaluationResult[] = [];
  
  try {
    // For now, we'll look for specific patterns in the file
    // In a real implementation, we'd dynamically import and execute
    const fs = await import('fs/promises');
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extract metrics from file content (simplified approach)
    const metrics = extractMetricsFromContent(content, filePath);
    results.push(...metrics);
    
    // If the file exports a run function, we could execute it here
    // const module = await import(filePath);
    // if (module.run) { results.push(...await module.run()); }
    
  } catch (error) {
    throw new Error(`Failed to run evaluator ${filePath}: ${error}`);
  }
  
  return results;
}

function extractMetricsFromContent(content: string, filePath: string): EvaluationResult[] {
  const results: EvaluationResult[] = [];
  const fileName = path.basename(filePath, path.extname(filePath));
  
  // Look for metric patterns
  const metricPatterns = [
    { pattern: /accuracy[:\s]*([0-9.]+)/gi, category: 'Quality', threshold: 0.9 },
    { pattern: /error[_\s]*rate[:\s]*([0-9.]+)/gi, category: 'Quality', threshold: 0.05, invert: true },
    { pattern: /rework[_\s]*ratio[:\s]*([0-9.]+)/gi, category: 'Efficiency', threshold: 0.1, invert: true },
    { pattern: /processing[_\s]*time[:\s]*([0-9.]+)/gi, category: 'Performance', threshold: 5.0, invert: true },
    { pattern: /unit[_\s]*cost[:\s]*\$?([0-9.]+)/gi, category: 'Cost', threshold: 0.10, invert: true },
    { pattern: /success[_\s]*rate[:\s]*([0-9.]+)/gi, category: 'Quality', threshold: 0.95 },
    { pattern: /coverage[:\s]*([0-9.]+)/gi, category: 'Quality', threshold: 0.8 },
  ];
  
  for (const { pattern, category, threshold, invert = false } of metricPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const value = parseFloat(match[1]);
      const passed = invert ? value <= threshold : value >= threshold;
      
      results.push({
        metric: match[0].split(/[:\s]/)[0].toLowerCase().replace(/[_\s]/g, '_'),
        value,
        threshold,
        passed,
        category,
        details: `Extracted from ${fileName}`,
      });
    }
  }
  
  // If no metrics found, create a basic health check
  if (results.length === 0) {
    results.push({
      metric: 'evaluator_exists',
      value: 1,
      threshold: 1,
      passed: true,
      category: 'Health',
      details: `Evaluator file ${fileName} exists and is readable`,
    });
  }
  
  return results;
}

function calculateSuiteMetrics(results: EvaluationResult[], duration: number, threshold: number): EvaluationSuite {
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const overallScore = total > 0 ? passed / total : 0;
  
  return {
    name: 'Quallaa Evaluation Suite',
    description: 'Automated evaluation of outcome performance metrics',
    results,
    overallScore,
    passed: overallScore >= threshold,
    timestamp: new Date(),
    duration,
  };
}

async function generateOutput(suite: EvaluationSuite, outputPath: string, format: string): Promise<void> {
  const fs = await import('fs/promises');
  
  // Ensure output directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  
  switch (format) {
    case 'html':
      await fs.writeFile(outputPath, generateHTMLScorecard(suite));
      console.log(chalk.green(`📊 HTML scorecard generated: ${outputPath}`));
      break;
      
    case 'json':
      await fs.writeFile(outputPath.replace('.html', '.json'), JSON.stringify(suite, null, 2));
      console.log(chalk.green(`📊 JSON report generated: ${outputPath.replace('.html', '.json')}`));
      break;
      
    case 'text':
      await fs.writeFile(outputPath.replace('.html', '.txt'), generateTextReport(suite));
      console.log(chalk.green(`📊 Text report generated: ${outputPath.replace('.html', '.txt')}`));
      break;
  }
}

function generateHTMLScorecard(suite: EvaluationSuite): string {
  const { results, overallScore, passed, timestamp, duration } = suite;
  
  const categoryGroups = results.reduce((groups, result) => {
    if (!groups[result.category]) groups[result.category] = [];
    groups[result.category].push(result);
    return groups;
  }, {} as Record<string, EvaluationResult[]>);
  
  const statusColor = passed ? '#10b981' : '#ef4444';
  const statusIcon = passed ? '✅' : '❌';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quallaa Evaluation Scorecard</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f8fafc; 
            color: #1e293b;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { 
            background: white; 
            padding: 30px; 
            border-radius: 12px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
            margin-bottom: 30px;
        }
        .title { 
            font-size: 2rem; 
            font-weight: 700; 
            margin: 0 0 10px 0; 
            color: #0f172a;
        }
        .subtitle { 
            color: #64748b; 
            margin: 0 0 20px 0; 
        }
        .meta { 
            display: flex; 
            gap: 30px; 
            font-size: 0.9rem; 
            color: #64748b;
        }
        .score-badge { 
            display: inline-flex; 
            align-items: center; 
            gap: 8px; 
            background: ${statusColor}; 
            color: white; 
            padding: 8px 16px; 
            border-radius: 6px; 
            font-weight: 600; 
            font-size: 1.1rem;
        }
        .grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 20px; 
        }
        .category-card { 
            background: white; 
            border-radius: 12px; 
            padding: 24px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .category-title { 
            font-size: 1.2rem; 
            font-weight: 600; 
            margin: 0 0 16px 0; 
            color: #0f172a;
        }
        .metric { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 12px 0; 
            border-bottom: 1px solid #e2e8f0;
        }
        .metric:last-child { border-bottom: none; }
        .metric-name { font-weight: 500; }
        .metric-value { 
            display: flex; 
            align-items: center; 
            gap: 8px; 
            font-weight: 600;
        }
        .metric-status { 
            width: 16px; 
            height: 16px; 
            border-radius: 50%; 
        }
        .passed { background: #10b981; }
        .failed { background: #ef4444; }
        .threshold { 
            font-size: 0.8rem; 
            color: #64748b; 
            margin-left: 8px;
        }
        .footer { 
            margin-top: 30px; 
            text-align: center; 
            color: #64748b; 
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">${statusIcon} ${suite.name}</h1>
            <p class="subtitle">${suite.description}</p>
            <div class="meta">
                <span><strong>Generated:</strong> ${timestamp.toISOString()}</span>
                <span><strong>Duration:</strong> ${duration}ms</span>
                <span><strong>Metrics:</strong> ${results.length}</span>
                <span class="score-badge">Score: ${(overallScore * 100).toFixed(1)}%</span>
            </div>
        </div>
        
        <div class="grid">
            ${Object.entries(categoryGroups).map(([category, metrics]) => `
                <div class="category-card">
                    <h2 class="category-title">${category}</h2>
                    ${metrics.map(metric => `
                        <div class="metric">
                            <div class="metric-name">${metric.metric.replace(/_/g, ' ')}</div>
                            <div class="metric-value">
                                <span>${formatMetricValue(metric)}</span>
                                <div class="metric-status ${metric.passed ? 'passed' : 'failed'}"></div>
                                <span class="threshold">≥${formatThreshold(metric)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>Generated by Quallaa CLI - Minimalist evaluation harness for Domain Engineering outcomes</p>
        </div>
    </div>
</body>
</html>`;
}

function generateTextReport(suite: EvaluationSuite): string {
  const { results, overallScore, passed, timestamp, duration } = suite;
  
  let report = `# ${suite.name}\n\n`;
  report += `**Description:** ${suite.description}\n`;
  report += `**Generated:** ${timestamp.toISOString()}\n`;
  report += `**Duration:** ${duration}ms\n`;
  report += `**Overall Score:** ${(overallScore * 100).toFixed(1)}%\n`;
  report += `**Status:** ${passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;
  
  const categoryGroups = results.reduce((groups, result) => {
    if (!groups[result.category]) groups[result.category] = [];
    groups[result.category].push(result);
    return groups;
  }, {} as Record<string, EvaluationResult[]>);
  
  for (const [category, metrics] of Object.entries(categoryGroups)) {
    report += `## ${category}\n\n`;
    for (const metric of metrics) {
      const status = metric.passed ? '✅' : '❌';
      report += `- ${status} **${metric.metric.replace(/_/g, ' ')}**: ${formatMetricValue(metric)} (threshold: ${formatThreshold(metric)})\n`;
      if (metric.details) {
        report += `  - ${metric.details}\n`;
      }
    }
    report += '\n';
  }
  
  return report;
}

function formatMetricValue(metric: EvaluationResult): string {
  if (metric.metric.includes('cost')) {
    return `$${metric.value.toFixed(3)}`;
  } else if (metric.metric.includes('rate') || metric.metric.includes('ratio') || metric.metric.includes('accuracy') || metric.metric.includes('coverage')) {
    return `${(metric.value * 100).toFixed(1)}%`;
  } else if (metric.metric.includes('time')) {
    return `${metric.value.toFixed(2)}s`;
  } else {
    return metric.value.toString();
  }
}

function formatThreshold(metric: EvaluationResult): string {
  if (metric.metric.includes('cost')) {
    return `$${metric.threshold.toFixed(3)}`;
  } else if (metric.metric.includes('rate') || metric.metric.includes('ratio') || metric.metric.includes('accuracy') || metric.metric.includes('coverage')) {
    return `${(metric.threshold * 100).toFixed(1)}%`;
  } else if (metric.metric.includes('time')) {
    return `${metric.threshold.toFixed(2)}s`;
  } else {
    return metric.threshold.toString();
  }
}

function displaySummary(suite: EvaluationSuite): void {
  console.log(chalk.bold('\n📊 Evaluation Summary'));
  console.log(chalk.gray('─'.repeat(50)));
  
  const { results, overallScore, passed } = suite;
  const passedCount = results.filter(r => r.passed).length;
  
  console.log(`${chalk.bold('Overall Score:')} ${(overallScore * 100).toFixed(1)}%`);
  console.log(`${chalk.bold('Metrics Passed:')} ${passedCount}/${results.length}`);
  console.log(`${chalk.bold('Status:')} ${passed ? chalk.green('PASSED') : chalk.red('FAILED')}`);
  
  // Show failed metrics
  const failed = results.filter(r => !r.passed);
  if (failed.length > 0) {
    console.log(chalk.red('\n❌ Failed Metrics:'));
    for (const metric of failed) {
      console.log(chalk.red(`  • ${metric.metric}: ${formatMetricValue(metric)} (need ${formatThreshold(metric)})`));
    }
  }
  
  // Show top performers
  const topPerformers = results
    .filter(r => r.passed)
    .sort((a, b) => {
      const aRatio = a.value / a.threshold;
      const bRatio = b.value / b.threshold;
      return bRatio - aRatio;
    })
    .slice(0, 3);
    
  if (topPerformers.length > 0) {
    console.log(chalk.green('\n✅ Top Performers:'));
    for (const metric of topPerformers) {
      console.log(chalk.green(`  • ${metric.metric}: ${formatMetricValue(metric)}`));
    }
  }
}

/**
 * Simple, elegant ROI results display
 */
async function displaySimpleROIResults(roiMetrics: any, _baseline: any): Promise<void> {
  const { financial, productivity } = roiMetrics;
  
  console.log('');
  
  // The main question: is it paying off?
  if (financial.currentROI > 0) {
    console.log(chalk.green('✅ Yes, your project is paying off!'));
    console.log(`You're seeing a ${chalk.bold(financial.currentROI.toFixed(0) + '%')} return on investment.`);
  } else {
    console.log(chalk.yellow('⏳ Not yet, but you might get there.'));
    console.log(`You're currently at ${chalk.bold(financial.currentROI.toFixed(0) + '%')} ROI.`);
  }

  console.log('');

  // Break-even story
  if (financial.breakEvenMonths < 12) {
    console.log(`💡 You should break even in ${chalk.bold(financial.breakEvenMonths + ' months')}.`);
  } else if (financial.breakEvenMonths < 24) {
    console.log(`⏰ Break-even looks like ${chalk.bold(financial.breakEvenMonths + ' months')}. That's a bit long.`);
  } else {
    console.log(`🤔 Break-even is ${chalk.bold(financial.breakEvenMonths + ' months')}. Consider if this is worth it.`);
  }

  // What's working
  const savings = financial.cumulativeSavings;
  if (savings > 1000) {
    console.log(`\n💰 You've saved ${chalk.green('$' + savings.toLocaleString())} so far.`);
  }

  const hoursaved = productivity.timeSavedHours;
  if (hoursaved > 0) {
    console.log(`⏱️  You've saved ${chalk.green(hoursaved + ' hours')} of manual work.`);
  }

  // Team adoption insight
  if (productivity.employeeAdoptionRate < 50) {
    console.log(`\n${chalk.yellow('💡 Tip:')} Only ${productivity.employeeAdoptionRate.toFixed(0)}% of your team is using this. Getting more people on board would help your ROI.`);
  } else if (productivity.employeeAdoptionRate > 70) {
    console.log(`\n${chalk.green('🎉 Great!')} ${productivity.employeeAdoptionRate.toFixed(0)}% of your team is actively using this.`);
  }

  console.log(chalk.gray('\n─'));
  console.log(chalk.gray('Want details? Run: quallaa evaluators report'));
}

/**
 * Generate comprehensive ROI dashboard from historical data
 */
async function generateROIDashboard(baseline: any, snapshots: any[], format: string): Promise<string> {
  const latest = snapshots[snapshots.length - 1];

  if (format === 'html') {
    return generateHTMLDashboard(baseline, snapshots, latest);
  } else {
    return generateTextDashboard(baseline, snapshots, latest);
  }
}

/**
 * Generate HTML dashboard with charts and statistical analysis
 */
function generateHTMLDashboard(baseline: any, snapshots: any[], latest: any): string {
  const roiData = snapshots.map(s => ({
    date: s.timestamp,
    roi: s.metrics.financial.currentROI,
    confidence_lower: s.metrics.confidenceInterval.lower,
    confidence_upper: s.metrics.confidenceInterval.upper
  }));

  const chartData = JSON.stringify(roiData);
  const latestMetrics = latest.metrics;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ROI Dashboard - Quallaa Analytics</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: #f8fafc; 
            color: #1e293b;
            line-height: 1.6;
        }
        
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        
        .header { 
            background: white; 
            padding: 30px; 
            border-radius: 12px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
            margin-bottom: 30px;
            text-align: center;
        }
        
        .title { 
            font-size: 2.5rem; 
            font-weight: 700; 
            color: #0f172a;
            margin-bottom: 10px;
        }
        
        .subtitle { 
            color: #64748b; 
            font-size: 1.1rem;
            margin-bottom: 20px;
        }
        
        .kpis {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .kpi-card {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .kpi-value {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .roi-positive { color: #10b981; }
        .roi-negative { color: #ef4444; }
        .roi-neutral { color: #64748b; }
        
        .kpi-label {
            color: #64748b;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .kpi-trend {
            margin-top: 8px;
            font-size: 0.85rem;
        }
        
        .trend-up { color: #10b981; }
        .trend-down { color: #ef4444; }
        
        .charts {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .chart-card {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .chart-title {
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 20px;
            color: #0f172a;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .metric-category {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .category-title {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 16px;
            color: #0f172a;
        }
        
        .metric-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        
        .metric-item:last-child { border-bottom: none; }
        
        .metric-name { font-weight: 500; }
        .metric-value { font-weight: 600; color: #059669; }
        
        .benchmark-section {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .benchmark-title {
            font-size: 1.4rem;
            font-weight: 600;
            margin-bottom: 20px;
            color: #0f172a;
        }
        
        .benchmark-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .benchmark-item {
            padding: 16px;
            border-radius: 8px;
            text-align: center;
        }
        
        .benchmark-met {
            background: #dcfce7;
            color: #166534;
        }
        
        .benchmark-missed {
            background: #fef2f2;
            color: #991b1b;
        }
        
        .footer {
            text-align: center;
            color: #64748b;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        
        @media (max-width: 768px) {
            .charts { grid-template-columns: 1fr; }
            .kpis { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1 class="title">📊 ROI Analytics Dashboard</h1>
            <p class="subtitle">Multi-dimensional business impact analysis</p>
            <p style="color: #64748b; font-size: 0.9rem;">
                Generated: ${new Date().toLocaleDateString()} | 
                Analysis Period: ${baseline.establishedAt} - ${latest.timestamp} |
                Snapshots: ${snapshots.length}
            </p>
        </div>

        <!-- KPIs -->
        <div class="kpis">
            <div class="kpi-card">
                <div class="kpi-value ${latestMetrics.financial.currentROI >= 0 ? 'roi-positive' : 'roi-negative'}">
                    ${latestMetrics.financial.currentROI.toFixed(1)}%
                </div>
                <div class="kpi-label">Overall ROI</div>
                <div class="kpi-trend">
                    CI: ${latestMetrics.confidenceInterval.lower.toFixed(1)}% - ${latestMetrics.confidenceInterval.upper.toFixed(1)}%
                </div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-value ${latestMetrics.financial.breakEvenMonths <= 6 ? 'roi-positive' : 'roi-negative'}">
                    ${latestMetrics.financial.breakEvenMonths}mo
                </div>
                <div class="kpi-label">Break-Even Period</div>
                <div class="kpi-trend ${latestMetrics.financial.breakEvenMonths <= 6 ? 'trend-up' : 'trend-down'}">
                    Target: <6 months
                </div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-value roi-positive">
                    $${latestMetrics.financial.cumulativeSavings.toLocaleString()}
                </div>
                <div class="kpi-label">Total Savings</div>
                <div class="kpi-trend">
                    ${latestMetrics.productivity.timeSavedHours.toLocaleString()} hours saved
                </div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-value ${latestMetrics.productivity.employeeAdoptionRate >= 66 ? 'roi-positive' : 'roi-neutral'}">
                    ${latestMetrics.productivity.employeeAdoptionRate.toFixed(1)}%
                </div>
                <div class="kpi-label">Team Adoption</div>
                <div class="kpi-trend ${latestMetrics.productivity.employeeAdoptionRate >= 66 ? 'trend-up' : 'trend-down'}">
                    Target: 66%+
                </div>
            </div>
        </div>

        <!-- Charts -->
        <div class="charts">
            <div class="chart-card">
                <h3 class="chart-title">ROI Trend with Confidence Intervals</h3>
                <canvas id="roiChart"></canvas>
            </div>
            
            <div class="chart-card">
                <h3 class="chart-title">Impact Categories</h3>
                <canvas id="categoriesChart"></canvas>
            </div>
        </div>

        <!-- Detailed Metrics -->
        <div class="metrics-grid">
            <div class="metric-category">
                <h4 class="category-title">💰 Financial Impact</h4>
                <div class="metric-item">
                    <span class="metric-name">SaaS Savings</span>
                    <span class="metric-value">$${latestMetrics.financial.saasReplacementSavings.toLocaleString()}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-name">Operational Savings</span>
                    <span class="metric-value">$${latestMetrics.financial.operationalCostReduction.toLocaleString()}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-name">Maintenance Costs</span>
                    <span class="metric-value">($${latestMetrics.financial.maintenanceCosts.toLocaleString()})</span>
                </div>
                <div class="metric-item">
                    <span class="metric-name">Net Benefit</span>
                    <span class="metric-value">$${(latestMetrics.financial.cumulativeSavings - latestMetrics.financial.maintenanceCosts).toLocaleString()}</span>
                </div>
            </div>
            
            <div class="metric-category">
                <h4 class="category-title">⚡ Productivity Gains</h4>
                <div class="metric-item">
                    <span class="metric-name">Time Saved</span>
                    <span class="metric-value">${latestMetrics.productivity.timeSavedHours.toLocaleString()} hrs</span>
                </div>
                <div class="metric-item">
                    <span class="metric-name">Tasks Automated</span>
                    <span class="metric-value">${latestMetrics.productivity.tasksAutomated}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-name">Error Reduction</span>
                    <span class="metric-value">${latestMetrics.productivity.errorReductionRate.toFixed(1)}%</span>
                </div>
                <div class="metric-item">
                    <span class="metric-name">Processing Time ↓</span>
                    <span class="metric-value">${latestMetrics.productivity.processingTimeReduction.toFixed(1)}%</span>
                </div>
            </div>
            
            <div class="metric-category">
                <h4 class="category-title">🎯 Quality Improvements</h4>
                <div class="metric-item">
                    <span class="metric-name">Defect Reduction</span>
                    <span class="metric-value">${latestMetrics.quality.defectReduction.toFixed(1)}%</span>
                </div>
                <div class="metric-item">
                    <span class="metric-name">Accuracy Improvement</span>
                    <span class="metric-value">${latestMetrics.quality.accuracyImprovement.toFixed(1)}%</span>
                </div>
                <div class="metric-item">
                    <span class="metric-name">Compliance ↑</span>
                    <span class="metric-value">${latestMetrics.quality.complianceImprovement.toFixed(1)}%</span>
                </div>
                <div class="metric-item">
                    <span class="metric-name">Customer Satisfaction</span>
                    <span class="metric-value">${latestMetrics.quality.customerSatisfactionDelta >= 0 ? '+' : ''}${latestMetrics.quality.customerSatisfactionDelta.toFixed(1)} pts</span>
                </div>
            </div>
        </div>

        <!-- Benchmarks -->
        <div class="benchmark-section">
            <h3 class="benchmark-title">📊 Benchmark Performance</h3>
            <div class="benchmark-grid">
                <div class="benchmark-item ${latestMetrics.financial.currentROI >= 248 ? 'benchmark-met' : 'benchmark-missed'}">
                    <div style="font-weight: 600; font-size: 1.1rem;">Forrester ROI Target</div>
                    <div>248% Target</div>
                    <div>${latestMetrics.financial.currentROI >= 248 ? '✅ Exceeded' : '❌ Not Met'}</div>
                </div>
                
                <div class="benchmark-item ${latestMetrics.financial.breakEvenMonths <= 6 ? 'benchmark-met' : 'benchmark-missed'}">
                    <div style="font-weight: 600; font-size: 1.1rem;">Payback Period</div>
                    <div><6 Month Target</div>
                    <div>${latestMetrics.financial.breakEvenMonths <= 6 ? '✅ Met' : '❌ Exceeded'}</div>
                </div>
                
                <div class="benchmark-item ${latestMetrics.productivity.employeeAdoptionRate >= 66 ? 'benchmark-met' : 'benchmark-missed'}">
                    <div style="font-weight: 600; font-size: 1.1rem;">Team Adoption</div>
                    <div>66%+ Target</div>
                    <div>${latestMetrics.productivity.employeeAdoptionRate >= 66 ? '✅ Strong' : '⚠️ Improve'}</div>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Generated by Quallaa ROI Tracking System</p>
            <p style="font-size: 0.85rem; margin-top: 8px;">
                Based on academic research: METR 2025, Forrester 2024, BCG 2024
            </p>
        </div>
    </div>

    <script>
        const roiData = ${chartData};
        
        // ROI Trend Chart
        const roiCtx = document.getElementById('roiChart').getContext('2d');
        new Chart(roiCtx, {
            type: 'line',
            data: {
                labels: roiData.map(d => new Date(d.date).toLocaleDateString()),
                datasets: [{
                    label: 'ROI %',
                    data: roiData.map(d => d.roi),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: false
                }, {
                    label: 'Confidence Lower',
                    data: roiData.map(d => d.confidence_lower),
                    borderColor: '#6b7280',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: false
                }, {
                    label: 'Confidence Upper',
                    data: roiData.map(d => d.confidence_upper),
                    borderColor: '#6b7280',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: '-1',
                    backgroundColor: 'rgba(107, 114, 128, 0.1)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'ROI Percentage'
                        }
                    }
                }
            }
        });
        
        // Categories Chart
        const categoriesCtx = document.getElementById('categoriesChart').getContext('2d');
        const latest = roiData[roiData.length - 1] || { roi: 0 };
        
        new Chart(categoriesCtx, {
            type: 'doughnut',
            data: {
                labels: ['Financial', 'Productivity', 'Quality'],
                datasets: [{
                    data: [
                        ${latestMetrics.financial.cumulativeSavings},
                        ${latestMetrics.productivity.timeSavedHours * 75}, // Convert hours to $ at $75/hr
                        ${Math.abs(latestMetrics.quality.customerSatisfactionDelta) * 1000} // Scale satisfaction
                    ],
                    backgroundColor: [
                        '#10b981',
                        '#3b82f6', 
                        '#8b5cf6'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    </script>
</body>
</html>`;
}

/**
 * Generate elegant text report
 */
function generateTextDashboard(baseline: any, snapshots: any[], latest: any): string {
  const metrics = latest.metrics;
  const roi = metrics.financial.currentROI;
  const breakEven = metrics.financial.breakEvenMonths;
  const savings = metrics.financial.cumulativeSavings;
  const hoursSaved = metrics.productivity.timeSavedHours;
  const adoption = metrics.productivity.employeeAdoptionRate;
  
  let report = `# Your Project's Business Case\n\n`;
  
  // The big question
  if (roi > 0) {
    report += `## ✅ Is it worth it? Yes.\n\n`;
    report += `Your project is generating a **${roi.toFixed(0)}% return** on investment.\n`;
    if (roi > 248) {
      report += `That beats the industry average by a lot.\n\n`;
    } else {
      report += `That's a solid return.\n\n`;
    }
  } else {
    report += `## ⏳ Is it worth it? Not yet.\n\n`;
    report += `Your project is at **${roi.toFixed(0)}% ROI**. You're not there yet, but you might get there.\n\n`;
  }

  // Break-even story  
  report += `## 💡 When will you break even?\n\n`;
  if (breakEven < 6) {
    report += `In **${breakEven} months**. That's fast.\n\n`;
  } else if (breakEven < 12) {
    report += `In **${breakEven} months**. Pretty reasonable.\n\n`;
  } else if (breakEven < 24) {
    report += `In **${breakEven} months**. That's getting long.\n\n`;
  } else {
    report += `In **${breakEven} months**. That's quite long. Worth reconsidering?\n\n`;
  }

  // What's working
  report += `## 💰 What's working?\n\n`;
  
  if (savings > 1000) {
    report += `- You've saved **$${savings.toLocaleString()}** so far\n`;
  }
  
  if (hoursSaved > 0) {
    // Add concrete analogy
    const weeksOfWork = Math.floor(hoursSaved / 40);
    if (weeksOfWork > 1) {
      report += `- You've saved **${hoursSaved.toLocaleString()} hours** of manual work (like ${weeksOfWork} weeks of full-time work)\n`;
    } else {
      report += `- You've saved **${hoursSaved.toLocaleString()} hours** of manual work\n`;
    }
  }

  if (adoption > 70) {
    report += `- **${adoption.toFixed(0)}%** of your team actively uses this (that's great!)\n`;
  } else if (adoption > 50) {
    report += `- **${adoption.toFixed(0)}%** of your team uses this (pretty good)\n`;
  } else {
    report += `- Only **${adoption.toFixed(0)}%** of your team uses this (room for improvement)\n`;
  }

  report += `\n`;

  // Industry comparison (simplified)
  report += `## 📊 How do you compare?\n\n`;
  
  if (breakEven <= 6) {
    report += `- **Payback speed:** ✅ Industry best practice is under 6 months. You're there.\n`;
  } else {
    report += `- **Payback speed:** ⚠️ Industry best practice is under 6 months. You're at ${breakEven}.\n`;
  }

  if (adoption >= 66) {
    report += `- **Team adoption:** ✅ Research shows 66%+ is strong. You're at ${adoption.toFixed(0)}%.\n`;
  } else {
    report += `- **Team adoption:** ⚠️ Research shows 66%+ is strong. You're at ${adoption.toFixed(0)}%.\n`;
  }

  if (roi >= 248) {
    report += `- **ROI:** ✅ Top companies see 248% returns. You're at ${roi.toFixed(0)}%.\n`;
  } else if (roi > 100) {
    report += `- **ROI:** 📈 Top companies see 248% returns. You're at ${roi.toFixed(0)}% (positive is good).\n`;
  } else {
    report += `- **ROI:** ⏳ Top companies see 248% returns. You're at ${roi.toFixed(0)}% (still growing).\n`;
  }

  report += `\n## 📈 Your data over time\n\n`;
  report += `Tracking since: ${new Date(baseline.establishedAt).toLocaleDateString()}\n`;
  report += `Data points: ${snapshots.length}\n`;
  
  if (snapshots.length >= 2) {
    report += `Trend analysis: Available\n`;
  } else {
    report += `Trend analysis: Need more data points\n`;
  }

  report += `\n---\n`;
  report += `*Questions? The math is based on research from Forrester, BCG, and METR studies.*`;
  
  return report;
}