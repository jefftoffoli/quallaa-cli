import chalk from 'chalk';
import inquirer from 'inquirer';
import axios from 'axios';
import { ServiceSetupResult } from '../types';
import { saveCredentials, getCredentials } from '../storage/credentials';

export async function setupTypesense(): Promise<ServiceSetupResult> {
  try {
    console.log(chalk.gray('\nTypesense provides fast, typo-tolerant search.'));
    console.log(chalk.gray('This is optional but recommended for content-heavy applications.\n'));

    // Check for existing credentials
    const existing = await getCredentials('typesense');
    if (existing) {
      const { useExisting } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'useExisting',
          message: 'Existing Typesense credentials found. Use them?',
          default: true,
        },
      ]);
      if (useExisting) {
        return { success: true, service: 'typesense', message: 'Using existing credentials' };
      }
    }

    const { setupChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'setupChoice',
        message: 'How would you like to set up Typesense?',
        choices: [
          { name: 'Typesense Cloud (recommended)', value: 'cloud' },
          { name: 'Self-hosted instance', value: 'self-hosted' },
          { name: 'Skip Typesense setup', value: 'skip' },
        ],
      },
    ]);

    if (setupChoice === 'skip') {
      return {
        success: true,
        service: 'typesense',
        message: 'Skipped Typesense setup',
      };
    }

    let credentials: any;

    if (setupChoice === 'cloud') {
      credentials = await setupTypesenseCloud();
    } else {
      credentials = await setupSelfHosted();
    }

    // Save credentials
    await saveCredentials('typesense', credentials);

    // Add to .env.local
    await addToEnvFile(credentials);

    return {
      success: true,
      service: 'typesense',
      credentials: { typesense: credentials },
    };

  } catch (error) {
    return {
      success: false,
      service: 'typesense',
      message: error instanceof Error ? error.message : 'Setup failed',
      error: error as Error,
    };
  }
}

async function setupTypesenseCloud(): Promise<any> {
  console.log(chalk.yellow('\n☁️  Typesense Cloud Setup'));
  console.log(chalk.gray('Note: Typesense Cloud requires manual setup through their website.'));
  console.log(chalk.gray('1. Go to: https://cloud.typesense.org/'));
  console.log(chalk.gray('2. Create a cluster'));
  console.log(chalk.gray('3. Get your connection details\n'));

  const { host, port, protocol, apiKey } = await inquirer.prompt([
    {
      type: 'input',
      name: 'host',
      message: 'Cluster hostname (e.g., xxx-1.a1.typesense.net):',
      validate: (input: string) => input.length > 0 || 'Hostname is required',
    },
    {
      type: 'input',
      name: 'port',
      message: 'Port:',
      default: '443',
    },
    {
      type: 'list',
      name: 'protocol',
      message: 'Protocol:',
      choices: ['https', 'http'],
      default: 'https',
    },
    {
      type: 'password',
      name: 'apiKey',
      message: 'Admin API Key:',
      validate: (input: string) => input.length > 0 || 'API key is required',
    },
  ]);

  // Test connection
  await testConnection({ host, port, protocol, apiKey });

  return { host, port, protocol, apiKey };
}

async function setupSelfHosted(): Promise<any> {
  console.log(chalk.yellow('\n🏠 Self-hosted Typesense Setup'));
  
  const { host, port, protocol, apiKey } = await inquirer.prompt([
    {
      type: 'input',
      name: 'host',
      message: 'Typesense host:',
      default: 'localhost',
    },
    {
      type: 'input',
      name: 'port',
      message: 'Port:',
      default: '8108',
    },
    {
      type: 'list',
      name: 'protocol',
      message: 'Protocol:',
      choices: ['http', 'https'],
      default: 'http',
    },
    {
      type: 'input',
      name: 'apiKey',
      message: 'Admin API Key (from your Typesense config):',
      validate: (input: string) => input.length > 0 || 'API key is required',
    },
  ]);

  // Test connection
  await testConnection({ host, port, protocol, apiKey });

  return { host, port, protocol, apiKey };
}

async function testConnection(config: any): Promise<void> {
  try {
    console.log(chalk.gray('Testing connection...'));
    
    const response = await axios.get(
      `${config.protocol}://${config.host}:${config.port}/health`,
      {
        headers: {
          'X-TYPESENSE-API-KEY': config.apiKey,
        },
        timeout: 10000,
      }
    );

    if (response.data.ok === true) {
      console.log(chalk.green('✓ Connection successful'));
    } else {
      throw new Error('Health check failed');
    }
  } catch (error) {
    console.error(chalk.red('✗ Connection failed'));
    throw new Error('Could not connect to Typesense. Please check your settings.');
  }
}

async function addToEnvFile(credentials: any): Promise<void> {
  const envContent = `
# Typesense
TYPESENSE_HOST=${credentials.host}
TYPESENSE_PORT=${credentials.port}
TYPESENSE_PROTOCOL=${credentials.protocol}
TYPESENSE_API_KEY=${credentials.apiKey}
`;

  const fs = await import('fs/promises');
  
  try {
    await fs.access('.env.local');
    // File exists, append
    await fs.appendFile('.env.local', envContent);
  } catch {
    // File doesn't exist, create
    await fs.writeFile('.env.local', envContent);
  }
  
  console.log(chalk.green('✓ Environment variables added to .env.local'));
}

export async function createTypesenseCollection(
  collectionName: string,
  schema: any
): Promise<void> {
  const credentials = await getCredentials('typesense');
  if (!credentials) {
    throw new Error('Typesense not configured. Run "quallaa setup typesense" first.');
  }

  const url = `${credentials.protocol}://${credentials.host}:${credentials.port}/collections`;
  
  const response = await axios.post(
    url,
    {
      name: collectionName,
      ...schema,
    },
    {
      headers: {
        'X-TYPESENSE-API-KEY': credentials.apiKey,
        'Content-Type': 'application/json',
      },
    }
  );

  if (response.status === 201) {
    console.log(chalk.green(`✓ Collection '${collectionName}' created`));
  }
}

// Default collection schemas for common use cases
export const defaultSchemas = {
  contacts: {
    fields: [
      { name: 'name', type: 'string' },
      { name: 'email', type: 'string' },
      { name: 'company', type: 'string', optional: true },
      { name: 'role', type: 'string', optional: true },
      { name: 'created_at', type: 'int64' },
    ],
    default_sorting_field: 'created_at',
  },
  
  posts: {
    fields: [
      { name: 'title', type: 'string' },
      { name: 'content', type: 'string' },
      { name: 'author', type: 'string' },
      { name: 'tags', type: 'string[]', optional: true },
      { name: 'published_at', type: 'int64' },
    ],
    default_sorting_field: 'published_at',
  },

  products: {
    fields: [
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'price', type: 'float' },
      { name: 'category', type: 'string' },
      { name: 'tags', type: 'string[]', optional: true },
      { name: 'created_at', type: 'int64' },
    ],
    default_sorting_field: 'created_at',
  },
};