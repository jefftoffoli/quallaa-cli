import chalk from 'chalk';
import inquirer from 'inquirer';
import axios from 'axios';
import { ServiceSetupResult } from '../types';
import { saveCredentials, getCredentials } from '../storage/credentials';

const RESEND_API_BASE = 'https://api.resend.com';

export async function setupResend(): Promise<ServiceSetupResult> {
  try {
    console.log(chalk.gray('\nResend provides transactional email infrastructure.'));
    console.log(chalk.gray('You\'ll need a Resend account (free tier: 3,000 emails/month).\n'));

    // Check for existing credentials
    const existing = await getCredentials('resend');
    if (existing) {
      const { useExisting } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'useExisting',
          message: 'Existing Resend credentials found. Use them?',
          default: true,
        },
      ]);
      if (useExisting) {
        return { success: true, service: 'resend', message: 'Using existing credentials' };
      }
    }

    console.log(chalk.yellow('\n📝 Resend API Key Setup'));
    console.log(chalk.gray('1. Go to: https://resend.com/api-keys'));
    console.log(chalk.gray('2. Create a new API key with "Full Access" permission'));
    console.log(chalk.gray('3. Copy the key and paste it below\n'));

    const { apiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: 'Resend API key:',
        validate: (input: string) => {
          if (!input.startsWith('re_')) {
            return 'Invalid API key format. Should start with "re_"';
          }
          return true;
        },
      },
    ]);

    // Verify API key
    const isValid = await verifyApiKey(apiKey);
    if (!isValid) {
      throw new Error('Invalid API key');
    }

    console.log(chalk.green('✓ API key verified'));

    // Domain setup
    const { setupDomain } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'setupDomain',
        message: 'Would you like to set up a custom domain for sending?',
        default: false,
      },
    ]);

    let domain: string | undefined;
    if (setupDomain) {
      domain = await configureDomain(apiKey);
    }

    // Save credentials
    const credentials = { apiKey, domain };
    await saveCredentials('resend', credentials);

    // Add to .env.local
    await addToEnvFile(apiKey);

    return {
      success: true,
      service: 'resend',
      credentials: { resend: credentials },
    };

  } catch (error) {
    return {
      success: false,
      service: 'resend',
      message: error instanceof Error ? error.message : 'Setup failed',
      error: error as Error,
    };
  }
}

async function verifyApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await axios.get(`${RESEND_API_BASE}/api-keys`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

async function configureDomain(apiKey: string): Promise<string> {
  const { domainChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'domainChoice',
      message: 'Domain setup:',
      choices: [
        { name: 'Add a new domain', value: 'new' },
        { name: 'Use an existing domain', value: 'existing' },
      ],
    },
  ]);

  if (domainChoice === 'new') {
    return await addNewDomain(apiKey);
  } else {
    return await selectExistingDomain(apiKey);
  }
}

async function addNewDomain(apiKey: string): Promise<string> {
  const { domain } = await inquirer.prompt([
    {
      type: 'input',
      name: 'domain',
      message: 'Enter your domain (e.g., example.com):',
      validate: (input: string) => {
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
        if (!domainRegex.test(input)) {
          return 'Invalid domain format';
        }
        return true;
      },
    },
  ]);

  try {
    const response = await axios.post(
      `${RESEND_API_BASE}/domains`,
      { name: domain },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(chalk.yellow('\n📋 DNS Records to add:'));
    console.log(chalk.gray('Add these records to your domain\'s DNS settings:\n'));

    const records = response.data.records;
    records.forEach((record: any) => {
      console.log(chalk.cyan(`Type: ${record.type}`));
      console.log(chalk.gray(`Name: ${record.name}`));
      console.log(chalk.gray(`Value: ${record.value}`));
      console.log(chalk.gray('---'));
    });

    console.log(chalk.yellow('\nAfter adding these records, domain verification may take up to 72 hours.'));

    return domain;
  } catch (error) {
    console.error(chalk.red('Failed to add domain'));
    throw error;
  }
}

async function selectExistingDomain(apiKey: string): Promise<string> {
  try {
    const response = await axios.get(`${RESEND_API_BASE}/domains`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const domains = response.data.data.filter((d: any) => d.status === 'verified');

    if (domains.length === 0) {
      console.log(chalk.yellow('No verified domains found. Using default resend.dev domain.'));
      return 'resend.dev';
    }

    const { selectedDomain } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedDomain',
        message: 'Select a domain:',
        choices: domains.map((d: any) => ({
          name: `${d.name} (${d.status})`,
          value: d.name,
        })),
      },
    ]);

    return selectedDomain;
  } catch {
    return 'resend.dev';
  }
}

async function addToEnvFile(apiKey: string): Promise<void> {
  const envContent = `
# Resend
RESEND_API_KEY=${apiKey}
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
  
  console.log(chalk.green('✓ Environment variable added to .env.local'));
}

export async function sendTestEmail(to: string, from?: string): Promise<void> {
  const credentials = await getCredentials('resend');
  if (!credentials?.apiKey) {
    throw new Error('Resend not configured. Run "quallaa setup resend" first.');
  }

  const fromEmail = from || `onboarding@${credentials.domain || 'resend.dev'}`;

  const response = await axios.post(
    `${RESEND_API_BASE}/emails`,
    {
      from: fromEmail,
      to: [to],
      subject: 'Test Email from Quallaa CLI',
      html: `
        <h1>Welcome to Quallaa!</h1>
        <p>Your email service is configured correctly.</p>
        <p>You're ready to build AI-native applications!</p>
      `,
    },
    {
      headers: {
        Authorization: `Bearer ${credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (response.data.id) {
    console.log(chalk.green('✓ Test email sent successfully'));
  }
}