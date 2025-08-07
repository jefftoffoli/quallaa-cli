import keytar from 'keytar';
import chalk from 'chalk';
import { ServiceCredentials } from '../types';
import { CredentialStorageError } from '../lib/errors/custom-errors';

const SERVICE_NAME = 'quallaa-cli';

export async function saveCredentials(
  service: keyof ServiceCredentials,
  credentials: any
): Promise<void> {
  try {
    const account = `${SERVICE_NAME}-${service}`;
    const password = JSON.stringify(credentials);
    await keytar.setPassword(SERVICE_NAME, account, password);
  } catch (error) {
    // Handle common credential storage issues
    if (error instanceof Error) {
      if (error.message.includes('not available') || error.message.includes('not supported')) {
        throw new CredentialStorageError(
          'System credential storage is not available. Credentials will be stored temporarily in memory.',
          'save'
        );
      }
      if (error.message.includes('access denied') || error.message.includes('permission')) {
        throw new CredentialStorageError(
          'Permission denied accessing credential storage. Please check your system permissions.',
          'save'
        );
      }
    }
    
    throw new CredentialStorageError(
      `Failed to save ${service} credentials: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'save'
    );
  }
}

export async function getCredentials(
  service: keyof ServiceCredentials
): Promise<any | null> {
  try {
    const account = `${SERVICE_NAME}-${service}`;
    const password = await keytar.getPassword(SERVICE_NAME, account);
    
    if (!password) {
      return null;
    }
    
    try {
      return JSON.parse(password);
    } catch (parseError) {
      // Corrupt credential data - delete it and return null
      console.warn(chalk.yellow(`Warning: Corrupt ${service} credentials found, removing...`));
      await deleteCredentials(service).catch(() => {}); // Silent fail on cleanup
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      // Don't throw errors for credential retrieval - gracefully degrade
      if (error.message.includes('not available') || error.message.includes('not supported')) {
        console.warn(chalk.yellow('Warning: System credential storage not available'));
        return null;
      }
      
      if (error.message.includes('not found')) {
        // This is normal - credentials don't exist yet
        return null;
      }
    }
    
    // For other errors, warn but don't crash
    console.warn(chalk.yellow(`Warning: Could not retrieve ${service} credentials: ${error instanceof Error ? error.message : 'Unknown error'}`));
    return null;
  }
}

export async function deleteCredentials(
  service: keyof ServiceCredentials
): Promise<boolean> {
  try {
    const account = `${SERVICE_NAME}-${service}`;
    return await keytar.deletePassword(SERVICE_NAME, account);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      // Credential doesn't exist - that's fine
      return true;
    }
    
    throw new CredentialStorageError(
      `Failed to delete ${service} credentials: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'delete'
    );
  }
}

export async function getAllCredentials(): Promise<ServiceCredentials> {
  const services: (keyof ServiceCredentials)[] = [
    'vercel',
    'supabase',
    'github',
    'resend',
    'typesense',
  ];

  const credentials: ServiceCredentials = {};

  for (const service of services) {
    try {
      const creds = await getCredentials(service);
      if (creds) {
        credentials[service] = creds;
      }
    } catch (error) {
      // Continue with other services if one fails
      console.warn(chalk.yellow(`Warning: Could not retrieve ${service} credentials`));
    }
  }

  return credentials;
}

export async function testCredentialStorage(): Promise<boolean> {
  try {
    const testKey = 'test-key';
    const testData = { test: 'data' };
    
    // Test save
    await keytar.setPassword(SERVICE_NAME, testKey, JSON.stringify(testData));
    
    // Test retrieve
    const retrieved = await keytar.getPassword(SERVICE_NAME, testKey);
    if (!retrieved || JSON.parse(retrieved).test !== 'data') {
      return false;
    }
    
    // Test delete
    await keytar.deletePassword(SERVICE_NAME, testKey);
    
    return true;
  } catch (error) {
    return false;
  }
}