import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { displayWelcome } from '../ui/brand/banner';
import { captureLeadInfo } from '../capture/leads';
import { generateProject } from './generate/project';
import { generateClaudeMd } from './generate/claude';
import { setupAllServices } from './setup';
import { OutcomeConfig, OutcomeTemplate, Role, StackVariant, OutcomeTemplateDefinition } from '../types';
import { getOutcomeTemplate, listOutcomeTemplates } from '../templates/outcomes';
import { generateOutcomeProject } from './generate/outcome-project';

export const outcomeCommand = new Command('outcome')
  .description('Initialize a project with pre-configured outcome templates')
  .option('-t, --template <template>', 'Outcome template (order-cash-reco, lead-lifecycle-core)')
  .option('-n, --name <name>', 'Project name')
  .option('-r, --role <role>', 'Your role (founder, product, marketing, operations)')
  .option('--demo', 'Generate with demo data and sample configurations')
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

      // Template selection
      console.log(chalk.cyan('\n🎯 Outcome Template Selection'));
      
      const template = options.template || await askTemplate();
      const templateDef = getOutcomeTemplate(template);
      
      console.log(chalk.green(`\n✨ Selected: ${templateDef.name}`));
      console.log(chalk.gray(templateDef.description));
      console.log(chalk.gray(`Domain: ${templateDef.domain}\n`));

      // Stack variant selection
      console.log(chalk.cyan('⚙️ Architecture Selection'));
      
      const stackVariant = await askStackVariant(templateDef);
      console.log(chalk.green(`\n🔧 Selected: ${stackVariant.name}`));
      console.log(chalk.gray(stackVariant.description));
      console.log(chalk.gray(`Architecture: ${stackVariant.architecture} | Deployment: ${stackVariant.deployment}\n`));

      // Project configuration
      console.log(chalk.cyan('📝 Project Configuration'));
      
      const projectName = options.name || await askProjectName(template);
      const role = options.role || await askRole();
      
      // Services are automatically selected based on stack variant
      const services = [...stackVariant.requiredServices];
      const optionalServices = await askOptionalServices(stackVariant.optionalServices);
      services.push(...optionalServices);

      // Initialize outcome config
      const config: OutcomeConfig = {
        name: projectName,
        role: role as Role,
        services,
        leadInfo,
        template,
        stackVariant,
        demo: options.demo,
      };

      // Create base project structure
      const spinner = ora(`Creating ${stackVariant.isMinimal ? 'minimal worker' : 'project'} structure...`).start();
      if (stackVariant.isMinimal) {
        const { generateMinimalProject } = await import('./generate/minimal-project');
        await generateMinimalProject(config);
      } else {
        await generateProject(config);
      }
      spinner.succeed(`${stackVariant.isMinimal ? 'Minimal worker' : 'Project'} structure created`);

      // Generate outcome-specific structure
      spinner.start('Generating outcome-specific components...');
      await generateOutcomeProject(config, templateDef);
      spinner.succeed('Outcome components generated');

      // Generate enhanced CLAUDE.md with outcome context
      spinner.start('Generating CLAUDE.md with outcome-specific context...');
      await generateClaudeMd(config);
      spinner.succeed('CLAUDE.md generated');

      // Setup services
      if (await confirmServiceSetup()) {
        await setupAllServices(config);
      }

      // Success message with outcome-specific guidance
      console.log(chalk.green(`\n✅ ${templateDef.name} ${stackVariant.isMinimal ? 'worker' : 'project'} initialized successfully!`));
      console.log(chalk.gray(`\nArchitecture: ${stackVariant.architecture}`));
      console.log(chalk.gray(`Deployment: ${stackVariant.deployment}`));
      console.log(chalk.gray(`\nYour ${templateDef.name} system includes:`));
      console.log(chalk.gray(`  • ${templateDef.dataContracts.length} data contracts in /${stackVariant.isMinimal ? 'contracts' : 'contracts'}`));
      console.log(chalk.gray(`  • ${templateDef.connectors.length} service connectors in /${stackVariant.isMinimal ? 'integrations' : 'connectors'}`));
      console.log(chalk.gray(`  • Evaluator framework in /evaluators`));
      if (!stackVariant.isMinimal) {
        console.log(chalk.gray(`  • Exception handling in /exceptions`));
      } else {
        console.log(chalk.gray(`  • Job templates in /jobs`));
      }
      
      console.log(chalk.gray(`\nNext steps:`));
      console.log(chalk.gray(`  1. cd ${projectName}`));
      console.log(chalk.gray(`  2. npm install`));
      console.log(chalk.gray(`  3. Configure your service credentials in ${stackVariant.isMinimal ? '.env' : '.env.local'}`));
      console.log(chalk.gray(`  4. npm run dev`));
      if (stackVariant.isMinimal) {
        console.log(chalk.gray(`  5. npm run evaluate  # Test outcome metrics`));
      }
      console.log(chalk.gray(`\nCheck the generated CLAUDE.md for detailed domain context and implementation guidance!`));

      // Feedback CTA
      if (leadInfo) {
        console.log(chalk.yellow('\n📣 We\'re testing outcome templates and would love your feedback!'));
        console.log(chalk.gray('We\'ll reach out in a few days to hear about your experience.\n'));
      }

    } catch (error) {
      console.error(chalk.red('\nError:'), error);
      process.exit(1);
    }
  });

async function askTemplate(): Promise<OutcomeTemplate> {
  const templates = listOutcomeTemplates();
  
  const { template } = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'Which outcome template would you like to use?',
      choices: templates.map(t => ({
        name: `${t.name} - ${t.description}`,
        value: t.value,
      })),
    },
  ]);
  
  return template;
}

async function askProjectName(template: OutcomeTemplate): Promise<string> {
  const defaultNames = {
    'order-cash-reco': 'order-cash-reconciliation',
    'lead-lifecycle-core': 'lead-lifecycle-system',
  };

  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: defaultNames[template],
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

async function askOptionalServices(optionalServices: string[]): Promise<string[]> {
  if (optionalServices.length === 0) {
    return [];
  }

  const { services } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'services',
      message: 'Which optional services would you like to include?',
      choices: optionalServices.map(service => ({
        name: getServiceDisplayName(service),
        value: service,
        checked: service === 'resend', // Default to including email
      })),
    },
  ]);
  
  return services;
}

function getServiceDisplayName(service: string): string {
  const displayNames = {
    vercel: 'Vercel (Hosting & Deployment)',
    supabase: 'Supabase (Database & Auth)',
    github: 'GitHub (Version Control)',
    resend: 'Resend (Email)',
    typesense: 'Typesense (Search)',
  };
  
  return displayNames[service as keyof typeof displayNames] || service;
}

async function askStackVariant(templateDef: OutcomeTemplateDefinition): Promise<StackVariant> {
  const { variant } = await inquirer.prompt([
    {
      type: 'list',
      name: 'variant',
      message: 'Which architecture would you like to use?',
      choices: templateDef.stackVariants.map(variant => ({
        name: `${variant.name} - ${variant.description}`,
        value: variant,
      })),
    },
  ]);
  
  return variant;
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