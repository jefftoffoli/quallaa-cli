import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { generateClaudeMd } from './claude';
import { generateEnhancedClaudeMd, AugmentationOptions } from './enhanced-claude';
import { ProjectConfig, Role } from '../../types';

export const generateCommand = new Command('generate')
  .description('Generate context files for AI-assisted development')
  .addCommand(
    new Command('claude')
      .description('Generate CLAUDE.md context file for AI development assistant')
      .option('-r, --role <role>', 'Role for context generation')
      .option('--augment <types>', 'Augment with project analysis (contracts,apis,metrics,integrations)')
      .action(async (options) => {
        try {
          let role = options.role as Role;
          
          if (!role) {
            const { selectedRole } = await inquirer.prompt([
              {
                type: 'list',
                name: 'selectedRole',
                message: 'Select role for CLAUDE.md context:',
                choices: [
                  { name: 'Technical Co-Founder / First Engineer', value: 'founder' },
                  { name: 'Product Manager / Product Owner', value: 'product' },
                  { name: 'Marketing Lead / Growth Hacker', value: 'marketing' },
                  { name: 'Operations Manager / Business Manager', value: 'operations' },
                ],
              },
            ]);
            role = selectedRole;
          }
          
          // Detect services from package.json or ask user
          const services = await detectServices();
          
          const config: ProjectConfig = {
            name: process.cwd().split('/').pop() || 'project',
            role,
            services,
            leadInfo: null,
          };
          
          // Parse augmentation options
          const augmentations: AugmentationOptions = {};
          if (options.augment) {
            const types = options.augment.split(',').map((t: string) => t.trim());
            augmentations.contracts = types.includes('contracts');
            augmentations.apis = types.includes('apis');
            augmentations.metrics = types.includes('metrics');
            augmentations.integrations = types.includes('integrations');
          }
          
          console.log(chalk.yellow('Generating CLAUDE.md...'));
          
          if (Object.values(augmentations).some(Boolean)) {
            await generateEnhancedClaudeMd(config, augmentations);
            console.log(chalk.green('✓ Enhanced CLAUDE.md generated with project analysis!'));
          } else {
            await generateClaudeMd(config);
            console.log(chalk.green('✓ CLAUDE.md generated successfully!'));
          }
          
        } catch (error) {
          console.error(chalk.red('Error generating CLAUDE.md:'), error);
          process.exit(1);
        }
      })
  );

async function detectServices(): Promise<string[]> {
  try {
    const fs = await import('fs/promises');
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const services: string[] = [];
    
    if (dependencies['@supabase/supabase-js'] || dependencies['@supabase/ssr']) {
      services.push('supabase');
    }
    
    if (dependencies['resend']) {
      services.push('resend');
    }
    
    if (dependencies['typesense']) {
      services.push('typesense');
    }
    
    // Always include common services
    services.push('vercel', 'github');
    
    // Ask user to confirm/modify detected services
    const { confirmedServices } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'confirmedServices',
        message: 'Confirm services for CLAUDE.md context:',
        choices: [
          { name: 'Vercel (Hosting)', value: 'vercel', checked: services.includes('vercel') },
          { name: 'Supabase (Database)', value: 'supabase', checked: services.includes('supabase') },
          { name: 'GitHub (Version Control)', value: 'github', checked: services.includes('github') },
          { name: 'Resend (Email)', value: 'resend', checked: services.includes('resend') },
          { name: 'Typesense (Search)', value: 'typesense', checked: services.includes('typesense') },
        ],
      },
    ]);
    
    return confirmedServices;
  } catch (error) {
    // If we can't detect services, ask the user
    const { services } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'services',
        message: 'Select services for CLAUDE.md context:',
        choices: [
          { name: 'Vercel (Hosting)', value: 'vercel', checked: true },
          { name: 'Supabase (Database)', value: 'supabase', checked: true },
          { name: 'GitHub (Version Control)', value: 'github', checked: true },
          { name: 'Resend (Email)', value: 'resend', checked: true },
          { name: 'Typesense (Search)', value: 'typesense', checked: false },
        ],
      },
    ]);
    
    return services;
  }
}