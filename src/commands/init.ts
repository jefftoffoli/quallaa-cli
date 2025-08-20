import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { displayWelcome } from '../ui/brand/banner';
import { captureLeadInfo } from '../capture/leads';
import { generateProject } from './generate/project';
import { generateMinimalProject } from './generate/minimal-project';
import { generateClaudeMd } from './generate/claude';
import { setupAllServices } from './setup';
import { Role, ProjectConfig } from '../types';

export const initCommand = new Command('init')
  .description('Initialize a new project with infrastructure services')
  .option('-n, --name <name>', 'Project name')
  .option('-r, --role <role>', 'Your role (founder, product, marketing, operations)')
  .option('--minimal', 'Create headless worker variant (no UI, just jobs + API)')
  .option('--skip-lead-capture', 'Skip lead capture (not recommended)')
  .action(async (options) => {
    displayWelcome();

    try {
      // Lead capture (unless skipped)
      let leadInfo = null;
      if (!options.skipLeadCapture) {
        console.log(chalk.cyan('\n📋 First, let\'s get to know you'));
        console.log(chalk.gray('This helps us improve your experience and provide support\n'));
        leadInfo = await captureLeadInfo();
      }

      // Project configuration
      console.log(chalk.cyan('\n🎯 Project Configuration'));
      
      const projectName = options.name || await askProjectName();
      const role = options.role || await askRole();
      const services = await askServices();

      // Initialize project config
      const config: ProjectConfig = {
        name: projectName,
        role: role as Role,
        services,
        leadInfo,
      };

      // Create project (minimal or full)
      const spinner = ora(`Creating ${options.minimal ? 'minimal worker' : 'project'} structure...`).start();
      if (options.minimal) {
        await generateMinimalProject(config);
        spinner.succeed('Minimal worker structure created');
      } else {
        await generateProject(config);
        spinner.succeed('Project structure created');
      }

      // Generate CLAUDE.md
      spinner.start('Generating CLAUDE.md with role-specific context...');
      await generateClaudeMd(config);
      spinner.succeed('CLAUDE.md generated');

      // Setup services
      if (await confirmServiceSetup()) {
        await setupAllServices(config);
      }

      // Success message
      console.log(chalk.green(`\n✅ ${options.minimal ? 'Minimal worker' : 'Project'} initialized successfully!`));
      console.log(chalk.gray(`\nNext steps:`));
      console.log(chalk.gray(`  1. cd ${projectName}`));
      console.log(chalk.gray(`  2. npm install`));
      console.log(chalk.gray(`  3. ${options.minimal ? 'npm run dev' : 'npm run dev'}`));
      if (options.minimal) {
        console.log(chalk.gray(`  4. npm run evaluate  # Run outcome metrics`));
      }
      console.log(chalk.gray(`\n${options.minimal ? 'Headless worker' : 'Project'} ready for AI-assisted development!`));

      // Feedback CTA
      if (leadInfo) {
        console.log(chalk.yellow('\n📣 We\'re testing this system and would love your feedback!'));
        console.log(chalk.gray('We\'ll reach out in a few days to hear about your experience.\n'));
      }

    } catch (error) {
      console.error(chalk.red('\nError:'), error);
      process.exit(1);
    }
  });

async function askProjectName(): Promise<string> {
  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: 'my-quallaa-app',
      validate: (input: string) => {
        if (!/^[a-z0-9-]+$/.test(input)) {
          return 'Project name must contain only lowercase letters, numbers, and hyphens';
        }
        return true;
      },
    },
  ]);
  return projectName;
}

async function askRole(): Promise<Role> {
  const { role } = await inquirer.prompt([
    {
      type: 'list',
      name: 'role',
      message: 'What\'s your role?',
      choices: [
        { name: 'Technical Co-Founder / First Engineer', value: 'founder' },
        { name: 'Product Manager / Product Owner', value: 'product' },
        { name: 'Marketing Lead / Growth Hacker', value: 'marketing' },
        { name: 'Operations Manager / Business Manager', value: 'operations' },
      ],
    },
  ]);
  return role;
}

async function askServices(): Promise<string[]> {
  const { services } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'services',
      message: 'Which services do you want to set up?',
      choices: [
        { name: 'Vercel (Hosting & Deployment)', value: 'vercel', checked: true },
        { name: 'Supabase (Database & Auth)', value: 'supabase', checked: true },
        { name: 'GitHub (Version Control)', value: 'github', checked: true },
        { name: 'Resend (Email)', value: 'resend', checked: true },
        { name: 'Typesense (Search) - Optional', value: 'typesense', checked: false },
      ],
      validate: (input: string[]) => {
        if (input.length === 0) {
          return 'Please select at least one service';
        }
        return true;
      },
    },
  ]);
  return services;
}

async function confirmServiceSetup(): Promise<boolean> {
  const { proceed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Would you like to set up these services now?',
      default: true,
    },
  ]);
  return proceed;
}