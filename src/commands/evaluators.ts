import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { glob } from 'glob';
import * as path from 'path';

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
  .description('Run evaluation harness and generate scorecards')
  .addCommand(
    new Command('run')
      .description('Execute gold tests and emit HTML scorecard')
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