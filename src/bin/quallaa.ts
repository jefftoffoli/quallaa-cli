#!/usr/bin/env node

import { setupGlobalErrorHandler, handleError } from '../lib/errors/error-handler';
import { checkForUpdates } from '../lib/utils/update-checker';
import { testCredentialStorage } from '../storage/credentials';
import { cli } from '../index';
import chalk from 'chalk';

async function main() {
  // Set up global error handling
  setupGlobalErrorHandler();
  
  // Test credential storage availability (warn but don't fail)
  const credentialsAvailable = await testCredentialStorage();
  if (!credentialsAvailable) {
    console.warn(chalk.yellow('⚠️  Warning: System credential storage may not be available'));
    console.warn(chalk.gray('   Some features may require re-authentication more frequently\n'));
  }
  
  // Check for updates
  await checkForUpdates();
  
  // Start the CLI
  cli.parse(process.argv);
}

main().catch((error) => {
  handleError(error, { operation: 'main' });
});