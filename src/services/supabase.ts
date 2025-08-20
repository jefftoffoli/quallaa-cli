import chalk from 'chalk';
import inquirer from 'inquirer';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { ServiceSetupResult } from '../types';
import { saveCredentials, getCredentials } from '../storage/credentials';

const execAsync = promisify(exec);

export async function setupSupabase(): Promise<ServiceSetupResult> {
  try {
    console.log(chalk.gray('\nSupabase provides database, authentication, and storage.'));
    console.log(chalk.gray('You\'ll need a Supabase account (free tier available).\n'));

    // Check if Supabase CLI is installed
    const cliInstalled = await checkSupabaseCLI();
    if (!cliInstalled) {
      await installSupabaseCLI();
    }

    // Check for existing credentials
    const existing = await getCredentials('supabase');
    if (existing) {
      const { useExisting } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'useExisting',
          message: 'Existing Supabase credentials found. Use them?',
          default: true,
        },
      ]);
      if (useExisting) {
        return { success: true, service: 'supabase', message: 'Using existing credentials' };
      }
    }

    // Login to Supabase
    console.log(chalk.yellow('\n🔐 Authenticating with Supabase...'));
    console.log(chalk.gray('This will open your browser for authentication.\n'));

    await loginSupabase();

    // Create or select project
    const { projectChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'projectChoice',
        message: 'Would you like to:',
        choices: [
          { name: 'Create a new Supabase project', value: 'new' },
          { name: 'Use an existing project', value: 'existing' },
        ],
      },
    ]);

    let projectRef: string;
    let projectDetails: any;

    if (projectChoice === 'new') {
      projectDetails = await createSupabaseProject();
      projectRef = projectDetails.ref;
    } else {
      projectRef = await selectExistingProject();
      projectDetails = await getProjectDetails(projectRef);
    }

    // Initialize local Supabase
    await initLocalSupabase();

    // Save credentials
    const credentials = {
      accessToken: projectDetails.access_token,
      projectRef,
      anonKey: projectDetails.anon_key,
      serviceRoleKey: projectDetails.service_role_key,
      dbUrl: projectDetails.db_url,
    };

    await saveCredentials('supabase', credentials);

    // Create .env.local file
    await createEnvFile(credentials);

    return {
      success: true,
      service: 'supabase',
      credentials: { supabase: credentials },
    };

  } catch (error) {
    return {
      success: false,
      service: 'supabase',
      message: error instanceof Error ? error.message : 'Setup failed',
      error: error as Error,
    };
  }
}

async function checkSupabaseCLI(): Promise<boolean> {
  try {
    await execAsync('supabase --version');
    return true;
  } catch {
    return false;
  }
}

async function installSupabaseCLI(): Promise<void> {
  console.log(chalk.yellow('📦 Installing Supabase CLI...'));
  
  const platform = process.platform;
  
  if (platform === 'darwin') {
    // Check if Homebrew is installed
    try {
      await execAsync('brew --version');
      await execAsync('brew install supabase/tap/supabase');
    } catch {
      // Fallback to npm
      await execAsync('npm install -g supabase');
    }
  } else if (platform === 'win32') {
    // Windows: Use npm
    await execAsync('npm install -g supabase');
  } else {
    // Linux: Use npm
    await execAsync('npm install -g supabase');
  }
  
  console.log(chalk.green('✓ Supabase CLI installed'));
}

async function loginSupabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const login = spawn('supabase', ['login'], {
      stdio: 'inherit',
      shell: true,
    });

    login.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error('Supabase login failed'));
      }
    });
  });
}

async function createSupabaseProject(): Promise<any> {
  const { projectName, orgId, region, planId } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      validate: (input: string) => input.length > 0 || 'Project name is required',
    },
    {
      type: 'input',
      name: 'orgId',
      message: 'Organization ID (leave empty for personal):',
    },
    {
      type: 'list',
      name: 'region',
      message: 'Region:',
      choices: [
        { name: 'US East (N. Virginia)', value: 'us-east-1' },
        { name: 'US West (Oregon)', value: 'us-west-1' },
        { name: 'EU (Frankfurt)', value: 'eu-central-1' },
        { name: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
        { name: 'Asia Pacific (Sydney)', value: 'ap-southeast-2' },
      ],
      default: 'us-east-1',
    },
    {
      type: 'list',
      name: 'planId',
      message: 'Plan:',
      choices: [
        { name: 'Free tier', value: 'free' },
        { name: 'Pro', value: 'pro' },
      ],
      default: 'free',
    },
  ]);

  // Create project using CLI
  const createCmd = [
    'supabase', 'projects', 'create',
    '--name', projectName,
  ];

  if (orgId) {
    createCmd.push('--org-id', orgId);
  }
  if (region) {
    createCmd.push('--region', region);
  }
  if (planId) {
    createCmd.push('--plan', planId);
  }

  const { stdout } = await execAsync(createCmd.join(' '));
  
  // Parse project details from output
  const projectRef = stdout.match(/Project ID: ([\w-]+)/)?.[1];
  
  if (!projectRef) {
    throw new Error('Failed to create project');
  }

  // Get full project details
  return await getProjectDetails(projectRef);
}

async function selectExistingProject(): Promise<string> {
  const { stdout } = await execAsync('supabase projects list --json');
  const projects = JSON.parse(stdout);

  if (projects.length === 0) {
    throw new Error('No existing projects found');
  }

  const { selectedProject } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedProject',
      message: 'Select a project:',
      choices: projects.map((p: any) => ({
        name: `${p.name} (${p.region})`,
        value: p.ref,
      })),
    },
  ]);

  return selectedProject;
}

async function getProjectDetails(projectRef: string): Promise<any> {
  const { stdout } = await execAsync(`supabase projects get ${projectRef} --json`);
  return JSON.parse(stdout);
}

async function initLocalSupabase(): Promise<void> {
  console.log(chalk.yellow('\n🔧 Initializing local Supabase...'));
  
  await execAsync('supabase init');
  console.log(chalk.green('✓ Local Supabase initialized'));
}

async function createEnvFile(credentials: any): Promise<void> {
  const envContent = `# Supabase
NEXT_PUBLIC_SUPABASE_URL=${credentials.dbUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${credentials.anonKey}
SUPABASE_SERVICE_ROLE_KEY=${credentials.serviceRoleKey}
`;

  const fs = await import('fs/promises');
  await fs.writeFile('.env.local', envContent, { flag: 'a' });
  
  console.log(chalk.green('✓ Environment variables added to .env.local'));
}

export async function createSupabaseTable(tableName: string, schema: string): Promise<void> {
  const credentials = await getCredentials('supabase');
  if (!credentials) {
    throw new Error('Supabase not configured. Run "quallaa setup supabase" first.');
  }

  // Create migration file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('-').slice(0, 4).join('');
  const migrationName = `${timestamp}_create_${tableName}`;
  
  await execAsync(`supabase migration new ${migrationName}`);
  
  // Write schema to migration file
  const fs = await import('fs/promises');
  const migrationPath = `./supabase/migrations/${migrationName}.sql`;
  await fs.writeFile(migrationPath, schema);
  
  // Apply migration
  await execAsync('supabase db push');
}

export async function verifySupabaseCredentials(): Promise<boolean> {
  try {
    const credentials = await getCredentials('supabase');
    if (!credentials) {
      return false;
    }
    
    // Check if Supabase CLI is installed and user is logged in
    await execAsync('supabase status');
    return true;
  } catch {
    return false;
  }
}