import chalk from 'chalk';
import inquirer from 'inquirer';
import axios from 'axios';
import { spawn } from 'child_process';
import { ServiceSetupResult } from '../types';
import { saveCredentials, getCredentials } from '../storage/credentials';

const VERCEL_API_BASE = 'https://api.vercel.com';
const VERCEL_OAUTH_URL = 'https://vercel.com/integrations/cli';

export async function setupVercel(): Promise<ServiceSetupResult> {
  try {
    console.log(chalk.gray('\nVercel provides hosting and deployment for your application.'));
    console.log(chalk.gray('You\'ll need a Vercel account (free tier available).\n'));

    // Check for existing credentials
    const existing = await getCredentials('vercel');
    if (existing) {
      const { useExisting } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'useExisting',
          message: 'Existing Vercel credentials found. Use them?',
          default: true,
        },
      ]);
      if (useExisting) {
        return { success: true, service: 'vercel', message: 'Using existing credentials' };
      }
    }

    // Authentication method selection
    const { authMethod } = await inquirer.prompt([
      {
        type: 'list',
        name: 'authMethod',
        message: 'How would you like to authenticate with Vercel?',
        choices: [
          { name: 'Browser login (recommended)', value: 'browser' },
          { name: 'API token', value: 'token' },
        ],
      },
    ]);

    let token: string;

    if (authMethod === 'browser') {
      token = await browserAuth();
    } else {
      token = await tokenAuth();
    }

    // Verify token
    const user = await verifyToken(token);
    console.log(chalk.green(`✓ Authenticated as ${user.username}`));

    // Select team if applicable
    let teamId: string | undefined;
    const teams = await getTeams(token);
    if (teams.length > 0) {
      const { selectedTeam } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedTeam',
          message: 'Select a team:',
          choices: [
            { name: 'Personal Account', value: undefined },
            ...teams.map(team => ({ name: team.name, value: team.id })),
          ],
        },
      ]);
      teamId = selectedTeam;
    }

    // Save credentials
    await saveCredentials('vercel', { token, teamId });

    return {
      success: true,
      service: 'vercel',
      credentials: { vercel: { token, teamId } },
    };

  } catch (error) {
    return {
      success: false,
      service: 'vercel',
      message: error instanceof Error ? error.message : 'Setup failed',
      error: error as Error,
    };
  }
}

async function browserAuth(): Promise<string> {
  console.log(chalk.yellow('\n🌐 Opening browser for authentication...'));
  console.log(chalk.gray('Please complete the authentication in your browser.\n'));

  // Generate CSRF state token for security
  const crypto = await import('crypto');
  const state = crypto.randomBytes(32).toString('hex');
  
  // Start local server to receive callback
  const { default: express } = await import('express');
  const app = express();
  let token: string | null = null;
  let authError: string | null = null;

  return new Promise((resolve, reject) => {
    const server = app.listen(3000, () => {
      // Open browser with state parameter
      const params = new URLSearchParams({
        redirect_uri: 'http://localhost:3000/callback',
        state,
      });
      const openUrl = `${VERCEL_OAUTH_URL}?${params.toString()}`;
      
      console.log(chalk.gray(`If browser doesn't open, visit: ${openUrl}`));
      
      // Attempt to open browser using child_process
      const platform = process.platform;
      const cmd = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
      spawn(cmd, [openUrl], { detached: true }).unref();
    });

    app.get('/callback', (req, res) => {
      const { token: receivedToken, state: receivedState, error } = req.query;

      // Handle OAuth errors
      if (error) {
        authError = `OAuth error: ${error}`;
        res.status(400).send(`
          <html>
            <body style="font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
              <div style="text-align: center;">
                <h1>❌ Authentication failed</h1>
                <p>Error: ${error}</p>
                <p>You can close this window and try again.</p>
              </div>
            </body>
          </html>
        `);
        server.close();
        return;
      }

      // Validate CSRF state token
      if (receivedState !== state) {
        authError = 'Invalid state parameter - possible CSRF attack';
        res.status(400).send(`
          <html>
            <body style="font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
              <div style="text-align: center;">
                <h1>❌ Security Error</h1>
                <p>Authentication state validation failed.</p>
                <p>Please try again.</p>
              </div>
            </body>
          </html>
        `);
        server.close();
        return;
      }

      // Validate token
      if (!receivedToken || typeof receivedToken !== 'string') {
        authError = 'No valid token received';
        res.status(400).send(`
          <html>
            <body style="font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
              <div style="text-align: center;">
                <h1>❌ Authentication Error</h1>
                <p>No valid authentication token received.</p>
                <p>Please try again.</p>
              </div>
            </body>
          </html>
        `);
        server.close();
        return;
      }

      // Success
      token = receivedToken;
      res.send(`
        <html>
          <body style="font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <div style="text-align: center;">
              <h1>✅ Authentication successful!</h1>
              <p>You can close this window and return to the terminal.</p>
            </div>
          </body>
        </html>
      `);
      server.close();
    });

    server.on('close', () => {
      if (authError) {
        reject(new Error(authError));
      } else if (token) {
        resolve(token);
      } else {
        reject(new Error('Authentication cancelled'));
      }
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      if (!token && !authError) {
        authError = 'Authentication timeout (5 minutes)';
      }
      server.close();
    }, 300000);

    // Handle server errors
    server.on('error', (serverError) => {
      if (serverError.message.includes('EADDRINUSE')) {
        reject(new Error('Port 3000 is already in use. Please close other applications and try again.'));
      } else {
        reject(new Error(`Server error: ${serverError.message}`));
      }
    });
  });
}

async function tokenAuth(): Promise<string> {
  console.log(chalk.yellow('\n📝 Manual token authentication'));
  console.log(chalk.gray('1. Go to: https://vercel.com/account/tokens'));
  console.log(chalk.gray('2. Create a new token with "Full Access" scope'));
  console.log(chalk.gray('3. Copy the token and paste it below\n'));

  const { token } = await inquirer.prompt([
    {
      type: 'password',
      name: 'token',
      message: 'Vercel API token:',
      validate: (input: string) => input.length > 0 || 'Token is required',
    },
  ]);

  return token;
}

async function verifyToken(token: string): Promise<any> {
  const response = await axios.get(`${VERCEL_API_BASE}/v2/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.user;
}

async function getTeams(token: string): Promise<any[]> {
  try {
    const response = await axios.get(`${VERCEL_API_BASE}/v2/teams`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.teams;
  } catch {
    return [];
  }
}

export async function createVercelProject(name: string, framework = 'nextjs'): Promise<any> {
  const credentials = await getCredentials('vercel');
  if (!credentials?.token) {
    throw new Error('Vercel not configured. Run "quallaa setup vercel" first.');
  }

  const response = await axios.post(
    `${VERCEL_API_BASE}/v10/projects`,
    {
      name,
      framework,
      publicSource: false,
      gitRepository: {
        type: 'github',
        repo: `${process.env.GITHUB_USERNAME}/${name}`,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${credentials.token}`,
        ...(credentials.teamId && { 'Team-Id': credentials.teamId }),
      },
    }
  );

  return response.data;
}

export async function setVercelEnvVars(projectId: string, envVars: Record<string, string>): Promise<void> {
  const credentials = await getCredentials('vercel');
  if (!credentials?.token) {
    throw new Error('Vercel not configured. Run "quallaa setup vercel" first.');
  }

  const promises = Object.entries(envVars).map(([key, value]) =>
    axios.post(
      `${VERCEL_API_BASE}/v9/projects/${projectId}/env`,
      {
        key,
        value,
        type: ['production', 'preview', 'development'],
        target: ['production', 'preview', 'development'],
      },
      {
        headers: {
          Authorization: `Bearer ${credentials.token}`,
          ...(credentials.teamId && { 'Team-Id': credentials.teamId }),
        },
      }
    )
  );

  await Promise.all(promises);
}

export async function verifyVercelCredentials(): Promise<boolean> {
  try {
    const credentials = await getCredentials('vercel');
    if (!credentials?.token) {
      return false;
    }
    
    await verifyToken(credentials.token);
    return true;
  } catch {
    return false;
  }
}