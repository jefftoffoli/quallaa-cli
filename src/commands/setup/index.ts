import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { setupVercel } from '../../services/vercel';
import { setupSupabase } from '../../services/supabase';
import { setupGitHub } from '../../services/github';
import { setupResend } from '../../services/resend';
import { setupTypesense } from '../../services/typesense';
import { ProjectConfig, ServiceSetupResult } from '../../types';

export const setupCommand = new Command('setup')
  .description('Set up individual services')
  .addCommand(
    new Command('vercel')
      .description('Set up Vercel hosting and deployment')
      .action(async () => {
        const spinner = ora('Setting up Vercel...').start();
        try {
          const result = await setupVercel();
          if (result.success) {
            spinner.succeed('Vercel setup complete');
          } else {
            spinner.fail(`Vercel setup failed: ${result.message}`);
          }
        } catch (error) {
          spinner.fail('Vercel setup failed');
          console.error(error);
        }
      })
  )
  .addCommand(
    new Command('supabase')
      .description('Set up Supabase database and authentication')
      .action(async () => {
        const spinner = ora('Setting up Supabase...').start();
        try {
          const result = await setupSupabase();
          if (result.success) {
            spinner.succeed('Supabase setup complete');
          } else {
            spinner.fail(`Supabase setup failed: ${result.message}`);
          }
        } catch (error) {
          spinner.fail('Supabase setup failed');
          console.error(error);
        }
      })
  )
  .addCommand(
    new Command('github')
      .description('Set up GitHub repository')
      .action(async () => {
        const spinner = ora('Setting up GitHub...').start();
        try {
          const result = await setupGitHub();
          if (result.success) {
            spinner.succeed('GitHub setup complete');
          } else {
            spinner.fail(`GitHub setup failed: ${result.message}`);
          }
        } catch (error) {
          spinner.fail('GitHub setup failed');
          console.error(error);
        }
      })
  )
  .addCommand(
    new Command('resend')
      .description('Set up Resend email service')
      .action(async () => {
        const spinner = ora('Setting up Resend...').start();
        try {
          const result = await setupResend();
          if (result.success) {
            spinner.succeed('Resend setup complete');
          } else {
            spinner.fail(`Resend setup failed: ${result.message}`);
          }
        } catch (error) {
          spinner.fail('Resend setup failed');
          console.error(error);
        }
      })
  )
  .addCommand(
    new Command('typesense')
      .description('Set up Typesense search service')
      .action(async () => {
        const spinner = ora('Setting up Typesense...').start();
        try {
          const result = await setupTypesense();
          if (result.success) {
            spinner.succeed('Typesense setup complete');
          } else {
            spinner.fail(`Typesense setup failed: ${result.message}`);
          }
        } catch (error) {
          spinner.fail('Typesense setup failed');
          console.error(error);
        }
      })
  );

export async function setupAllServices(config: ProjectConfig): Promise<void> {
  console.log(chalk.cyan('\n🔧 Setting up services...\n'));
  
  const results: ServiceSetupResult[] = [];
  
  for (const service of config.services) {
    const spinner = ora(`Setting up ${service}...`).start();
    
    try {
      let result: ServiceSetupResult;
      
      switch (service) {
        case 'vercel':
          result = await setupVercel();
          break;
        case 'supabase':
          result = await setupSupabase();
          break;
        case 'github':
          result = await setupGitHub();
          break;
        case 'resend':
          result = await setupResend();
          break;
        case 'typesense':
          result = await setupTypesense();
          break;
        default:
          result = { success: false, service, message: 'Unknown service' };
      }
      
      results.push(result);
      
      if (result.success) {
        spinner.succeed(`${service} setup complete`);
      } else {
        spinner.warn(`${service} setup skipped: ${result.message}`);
      }
    } catch (error) {
      spinner.fail(`${service} setup failed`);
      results.push({
        success: false,
        service,
        error: error as Error,
      });
    }
  }
  
  // Summary
  console.log(chalk.cyan('\n📊 Setup Summary:'));
  results.forEach((result) => {
    if (result.success) {
      console.log(chalk.green(`  ✓ ${result.service}`));
    } else {
      console.log(chalk.yellow(`  ⚠ ${result.service}: ${result.message || result.error?.message}`));
    }
  });
}