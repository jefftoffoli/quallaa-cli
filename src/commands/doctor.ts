import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { testCredentialStorage, getAllCredentials } from '../storage/credentials';
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
  .option('--audit-secrets', 'Audit secrets for security issues')
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
    
    // Audit secrets if requested
    if (options.auditSecrets) {
      const secretsResults = await auditSecrets();
      results.push(...secretsResults);
    }
    
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

async function auditSecrets(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  
  try {
    // Check environment files for exposed secrets
    const envResults = await auditEnvironmentFiles();
    results.push(...envResults);
    
    // Check for hardcoded secrets in code
    const codeResults = await auditCodeForSecrets();
    results.push(...codeResults);
    
    // Check credential rotation schedule
    const rotationResults = await auditCredentialRotation();
    results.push(...rotationResults);
    
    // Check least privilege principles
    const privilegeResults = await auditPrivileges();
    results.push(...privilegeResults);
    
  } catch (error) {
    results.push({
      name: 'Secrets Audit',
      status: 'fail',
      message: 'Failed to run secrets audit',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
  
  return results;
}

async function auditEnvironmentFiles(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  const fs = await import('fs/promises');
  
  try {
    // Check if .env files are in .gitignore
    const gitignoreContent = await fs.readFile('.gitignore', 'utf-8');
    const hasEnvIgnore = gitignoreContent.includes('.env');
    
    results.push({
      name: 'Environment Files Protection',
      status: hasEnvIgnore ? 'pass' : 'fail',
      message: hasEnvIgnore ? '.env files are properly ignored by git' : '.env files not found in .gitignore',
      details: hasEnvIgnore ? undefined : 'Add .env* to your .gitignore to prevent secret exposure',
    });
    
    // Check for .env files in the repository
    try {
      await fs.access('.env');
      results.push({
        name: 'Environment File Exposure',
        status: 'warn',
        message: '.env file found in working directory',
        details: 'Ensure .env files are never committed to version control',
      });
    } catch {
      // .env file doesn't exist, which is good for security
    }
    
  } catch (error) {
    results.push({
      name: 'Environment Files Audit',
      status: 'warn',
      message: 'Could not audit environment files',
      details: 'Ensure .env files are properly protected',
    });
  }
  
  return results;
}

async function auditCodeForSecrets(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  
  try {
    const { glob } = await import('glob');
    const fs = await import('fs/promises');
    
    // Look for potential secrets in code files
    const codeFiles = await glob('{src,app,lib,jobs,integrations}/**/*.{ts,js,tsx,jsx}', {
      cwd: process.cwd(),
      absolute: true,
    });
    
    const secretPatterns = [
      /sk_live_[a-zA-Z0-9]{24,}/g, // Stripe live keys
      /pk_live_[a-zA-Z0-9]{24,}/g, // Stripe live public keys
      /rk_live_[a-zA-Z0-9]{24,}/g, // Stripe restricted keys
      /AIza[0-9A-Za-z\\-_]{35}/g, // Google API keys
      /ya29\\.[0-9A-Za-z\\-_]+/g, // Google OAuth tokens
      /ghp_[a-zA-Z0-9]{36}/g, // GitHub personal access tokens
      /gho_[a-zA-Z0-9]{36}/g, // GitHub OAuth tokens
      /password\s*[:=]\s*["'][^"']+["']/gi, // Hardcoded passwords
      /secret\s*[:=]\s*["'][^"']+["']/gi, // Hardcoded secrets
    ];
    
    let hardcodedSecretsFound = 0;
    
    for (const file of codeFiles.slice(0, 50)) { // Limit to first 50 files for performance
      try {
        const content = await fs.readFile(file, 'utf-8');
        
        for (const pattern of secretPatterns) {
          if (pattern.test(content)) {
            hardcodedSecretsFound++;
            break; // One finding per file is enough
          }
        }
      } catch {
        // Skip files we can't read
      }
    }
    
    results.push({
      name: 'Hardcoded Secrets Scan',
      status: hardcodedSecretsFound === 0 ? 'pass' : 'fail',
      message: hardcodedSecretsFound === 0 
        ? 'No hardcoded secrets detected in code' 
        : `Found ${hardcodedSecretsFound} potential hardcoded secret(s)`,
      details: hardcodedSecretsFound > 0 
        ? 'Move secrets to environment variables and use .env files' 
        : undefined,
    });
    
  } catch (error) {
    results.push({
      name: 'Code Secrets Audit',
      status: 'warn',
      message: 'Could not scan code for secrets',
      details: 'Manually review code for hardcoded credentials',
    });
  }
  
  return results;
}

async function auditCredentialRotation(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  
  // Check when credentials were last stored (basic rotation check)
  try {
    const credentials = await getAllCredentials();
    
    if (Object.keys(credentials).length === 0) {
      results.push({
        name: 'Credential Rotation',
        status: 'pass',
        message: 'No stored credentials to rotate',
      });
    } else {
      results.push({
        name: 'Credential Rotation',
        status: 'warn',
        message: `${Object.keys(credentials).length} service(s) have stored credentials`,
        details: 'Review and rotate API keys quarterly for security',
      });
    }
    
  } catch (error) {
    results.push({
      name: 'Credential Rotation Audit',
      status: 'warn',
      message: 'Could not check credential rotation status',
      details: 'Manually verify API keys are rotated regularly',
    });
  }
  
  return results;
}

async function auditPrivileges(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  
  // Check if we can detect overprivileged API keys
  const credentials = await getAllCredentials();
  
  for (const [service, creds] of Object.entries(credentials)) {
    if (creds) {
      results.push({
        name: `${service} Privileges`,
        status: 'warn',
        message: 'Manual review required',
        details: 'Verify API key has minimum required permissions',
      });
    }
  }
  
  if (Object.keys(credentials).length === 0) {
    results.push({
      name: 'API Key Privileges',
      status: 'pass',
      message: 'No API keys to audit',
    });
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