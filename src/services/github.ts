import chalk from 'chalk';
import inquirer from 'inquirer';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ServiceSetupResult } from '../types';
import { saveCredentials, getCredentials } from '../storage/credentials';

const execAsync = promisify(exec);
const GITHUB_API_BASE = 'https://api.github.com';

export async function setupGitHub(): Promise<ServiceSetupResult> {
  try {
    console.log(chalk.gray('\nGitHub provides version control and repository hosting.'));
    console.log(chalk.gray('You\'ll need a GitHub account (free tier available).\n'));

    // Check for existing credentials
    const existing = await getCredentials('github');
    if (existing) {
      const { useExisting } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'useExisting',
          message: 'Existing GitHub credentials found. Use them?',
          default: true,
        },
      ]);
      if (useExisting) {
        return { success: true, service: 'github', message: 'Using existing credentials' };
      }
    }

    // Check if GitHub CLI is installed
    const cliInstalled = await checkGitHubCLI();
    const useMethod = cliInstalled ? await askAuthMethod() : 'token';

    let token: string;
    let username: string;

    if (useMethod === 'cli' && cliInstalled) {
      const result = await authWithCLI();
      token = result.token;
      username = result.username;
    } else {
      const result = await authWithToken();
      token = result.token;
      username = result.username;
    }

    // Save credentials
    await saveCredentials('github', { token, username });

    // Configure git
    await configureGit(username);

    return {
      success: true,
      service: 'github',
      credentials: { github: { token, username } },
    };

  } catch (error) {
    return {
      success: false,
      service: 'github',
      message: error instanceof Error ? error.message : 'Setup failed',
      error: error as Error,
    };
  }
}

async function checkGitHubCLI(): Promise<boolean> {
  try {
    await execAsync('gh --version');
    return true;
  } catch {
    return false;
  }
}

async function askAuthMethod(): Promise<string> {
  const { method } = await inquirer.prompt([
    {
      type: 'list',
      name: 'method',
      message: 'How would you like to authenticate with GitHub?',
      choices: [
        { name: 'GitHub CLI (recommended)', value: 'cli' },
        { name: 'Personal Access Token', value: 'token' },
      ],
    },
  ]);
  return method;
}

async function authWithCLI(): Promise<{ token: string; username: string }> {
  console.log(chalk.yellow('\n🔐 Authenticating with GitHub CLI...'));
  
  // Check if already authenticated
  try {
    const { stdout: authStatus } = await execAsync('gh auth status');
    if (authStatus.includes('Logged in')) {
      // Get token from existing auth
      const { stdout: token } = await execAsync('gh auth token');
      const { stdout: userJson } = await execAsync('gh api user');
      const user = JSON.parse(userJson);
      
      return { token: token.trim(), username: user.login };
    }
  } catch {
    // Not authenticated, proceed with login
  }

  // Login with GitHub CLI
  await execAsync('gh auth login --web --scopes repo,user,workflow');
  
  // Get token and username
  const { stdout: token } = await execAsync('gh auth token');
  const { stdout: userJson } = await execAsync('gh api user');
  const user = JSON.parse(userJson);
  
  return { token: token.trim(), username: user.login };
}

async function authWithToken(): Promise<{ token: string; username: string }> {
  console.log(chalk.yellow('\n📝 Personal Access Token authentication'));
  console.log(chalk.gray('1. Go to: https://github.com/settings/tokens/new'));
  console.log(chalk.gray('2. Create a token with these scopes: repo, user, workflow'));
  console.log(chalk.gray('3. Copy the token and paste it below\n'));

  const { token } = await inquirer.prompt([
    {
      type: 'password',
      name: 'token',
      message: 'GitHub Personal Access Token:',
      validate: (input: string) => input.length > 0 || 'Token is required',
    },
  ]);

  // Verify token and get username
  const user = await verifyToken(token);
  
  return { token, username: user.login };
}

async function verifyToken(token: string): Promise<any> {
  const response = await axios.get(`${GITHUB_API_BASE}/user`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  return response.data;
}

async function configureGit(_username: string): Promise<void> {
  console.log(chalk.yellow('\n⚙️  Configuring Git...'));
  
  // Get user details
  const credentials = await getCredentials('github');
  const response = await axios.get(`${GITHUB_API_BASE}/user`, {
    headers: {
      Authorization: `token ${credentials.token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  
  const { name, email } = response.data;
  
  // Configure git user
  if (name) {
    await execAsync(`git config --global user.name "${name}"`);
  }
  if (email) {
    await execAsync(`git config --global user.email "${email}"`);
  }
  
  console.log(chalk.green('✓ Git configured'));
}

export async function createGitHubRepo(
  name: string,
  description: string,
  isPrivate = false
): Promise<any> {
  const credentials = await getCredentials('github');
  if (!credentials?.token) {
    throw new Error('GitHub not configured. Run "quallaa setup github" first.');
  }

  const response = await axios.post(
    `${GITHUB_API_BASE}/user/repos`,
    {
      name,
      description,
      private: isPrivate,
      auto_init: true,
      gitignore_template: 'Node',
      license_template: 'mit',
    },
    {
      headers: {
        Authorization: `token ${credentials.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  return response.data;
}

export async function initializeGitRepo(projectPath: string): Promise<void> {
  const credentials = await getCredentials('github');
  if (!credentials?.token || !credentials?.username) {
    throw new Error('GitHub not configured. Run "quallaa setup github" first.');
  }

  // Initialize git repo
  await execAsync('git init', { cwd: projectPath });
  
  // Create initial commit
  await execAsync('git add .', { cwd: projectPath });
  await execAsync('git commit -m "Initial commit from Quallaa CLI"', { cwd: projectPath });
  
  console.log(chalk.green('✓ Git repository initialized'));
}

export async function pushToGitHub(
  projectPath: string,
  repoUrl: string
): Promise<void> {
  // Add remote
  await execAsync(`git remote add origin ${repoUrl}`, { cwd: projectPath });
  
  // Push to GitHub
  await execAsync('git push -u origin main', { cwd: projectPath });
  
  console.log(chalk.green('✓ Code pushed to GitHub'));
}

export async function verifyGitHubCredentials(): Promise<boolean> {
  try {
    const credentials = await getCredentials('github');
    if (!credentials?.token) {
      return false;
    }
    
    // Check if token is valid by making a simple API call
    const response = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${credentials.token}` },
    });
    return response.status === 200;
  } catch {
    return false;
  }
}