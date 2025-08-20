import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { testCredentialStorage } from '../storage/credentials';
import { verifyVercelCredentials } from '../services/vercel';
import { verifySupabaseCredentials } from '../services/supabase';
import { verifyGitHubCredentials } from '../services/github';
import { verifyResendCredentials } from '../services/resend';
import { verifyTypesenseCredentials } from '../services/typesense';
import * as semver from 'semver';

interface DiagnosticResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string;
}

export const doctorCommand = new Command('doctor')
  .description('Check system health and configuration')
  .option('--verbose', 'Show detailed output')
  .action(async (options) => {
    console.log(chalk.cyan('\n🩺 Quallaa Health Check'));
    console.log(chalk.gray('Checking system requirements and service configurations...\n'));

    const results: DiagnosticResult[] = [];
    
    // Check Node.js version
    const nodeResult = await checkNodeVersion();
    results.push(nodeResult);
    
    // Check CLI dependencies
    const depsResult = await checkCLIDependencies();
    results.push(depsResult);
    
    // Check credential storage
    const credentialsResult = await checkCredentialStorage();
    results.push(credentialsResult);
    
    // Check service authentication
    const authResults = await checkServiceAuthentication();
    results.push(...authResults);
    
    // Display results
    displayResults(results, options.verbose);
    
    // Summary
    const failed = results.filter(r => r.status === 'fail').length;
    const warnings = results.filter(r => r.status === 'warn').length;
    
    console.log('\n' + chalk.bold('Summary:'));
    if (failed === 0 && warnings === 0) {
      console.log(chalk.green('✅ All checks passed! Your Quallaa CLI is ready to use.'));
    } else if (failed === 0) {
      console.log(chalk.yellow(`⚠️  ${warnings} warning(s) found. Your CLI should work but may have limitations.`));
    } else {
      console.log(chalk.red(`❌ ${failed} critical issue(s) found. Please address these before using the CLI.`));
      if (warnings > 0) {
        console.log(chalk.yellow(`⚠️  ${warnings} additional warning(s) found.`));
      }
    }
  });

async function checkNodeVersion(): Promise<DiagnosticResult> {
  try {
    const nodeVersion = process.version;
    const requiredVersion = '18.0.0';
    
    if (semver.gte(nodeVersion, requiredVersion)) {
      return {
        name: 'Node.js Version',
        status: 'pass',
        message: `Node.js ${nodeVersion} (>= ${requiredVersion} required)`,
      };
    } else {
      return {
        name: 'Node.js Version',
        status: 'fail',
        message: `Node.js ${nodeVersion} is too old`,
        details: `Please upgrade to Node.js ${requiredVersion} or later`,
      };
    }
  } catch (error) {
    return {
      name: 'Node.js Version',
      status: 'fail',
      message: 'Unable to determine Node.js version',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkCLIDependencies(): Promise<DiagnosticResult> {
  try {
    // Check if essential CLI tools are available
    const tools = [
      { name: 'git', command: 'git --version' },
      { name: 'npm', command: 'npm --version' },
    ];
    
    const missing: string[] = [];
    const versions: string[] = [];
    
    for (const tool of tools) {
      try {
        const output = execSync(tool.command, { encoding: 'utf8', stdio: 'pipe' });
        versions.push(`${tool.name}: ${output.trim()}`);
      } catch {
        missing.push(tool.name);
      }
    }
    
    if (missing.length === 0) {
      return {
        name: 'CLI Dependencies',
        status: 'pass',
        message: 'All required CLI tools are available',
        details: versions.join(', '),
      };
    } else {
      return {
        name: 'CLI Dependencies',
        status: 'fail',
        message: `Missing required tools: ${missing.join(', ')}`,
        details: 'Please install the missing tools and try again',
      };
    }
  } catch (error) {
    return {
      name: 'CLI Dependencies',
      status: 'fail',
      message: 'Unable to check CLI dependencies',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkCredentialStorage(): Promise<DiagnosticResult> {
  try {
    const isAvailable = await testCredentialStorage();
    
    if (isAvailable) {
      return {
        name: 'Credential Storage',
        status: 'pass',
        message: 'System credential storage is available',
      };
    } else {
      return {
        name: 'Credential Storage',
        status: 'warn',
        message: 'System credential storage is not available',
        details: 'You may need to re-authenticate more frequently',
      };
    }
  } catch (error) {
    return {
      name: 'Credential Storage',
      status: 'warn',
      message: 'Unable to test credential storage',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkServiceAuthentication(): Promise<DiagnosticResult[]> {
  const services = [
    { name: 'Vercel', check: verifyVercelCredentials },
    { name: 'Supabase', check: verifySupabaseCredentials },
    { name: 'GitHub', check: verifyGitHubCredentials },
    { name: 'Resend', check: verifyResendCredentials },
    { name: 'Typesense', check: verifyTypesenseCredentials },
  ];
  
  const results: DiagnosticResult[] = [];
  
  for (const service of services) {
    try {
      const isAuthenticated = await service.check();
      
      if (isAuthenticated) {
        results.push({
          name: `${service.name} Authentication`,
          status: 'pass',
          message: 'Authenticated and ready',
        });
      } else {
        results.push({
          name: `${service.name} Authentication`,
          status: 'warn',
          message: 'Not authenticated',
          details: `Run 'quallaa setup ${service.name.toLowerCase()}' to authenticate`,
        });
      }
    } catch (error) {
      // Some services might not have verification methods yet
      if (error instanceof Error && error.message.includes('not implemented')) {
        results.push({
          name: `${service.name} Authentication`,
          status: 'warn',
          message: 'Authentication check not available',
          details: 'Manual verification required',
        });
      } else {
        results.push({
          name: `${service.name} Authentication`,
          status: 'warn',
          message: 'Unable to verify authentication',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }
  
  return results;
}

function displayResults(results: DiagnosticResult[], verbose: boolean): void {
  for (const result of results) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
    const color = result.status === 'pass' ? chalk.green : result.status === 'warn' ? chalk.yellow : chalk.red;
    
    console.log(`${icon} ${chalk.bold(result.name)}: ${color(result.message)}`);
    
    if (verbose && result.details) {
      console.log(chalk.gray(`   ${result.details}`));
    }
  }
}