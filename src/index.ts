import { Command } from 'commander';
import chalk from 'chalk';
import { displayBanner } from './ui/brand/banner';
import { initCommand } from './commands/init';
import { setupCommand } from './commands/setup';
import { generateCommand } from './commands/generate';
const packageJson = require('../package.json');
const { version } = packageJson;

export const cli = new Command();

cli
  .name('quallaa')
  .description(chalk.blue('AI-native development stack setup for domain experts'))
  .version(version, '-v, --version', 'display version number')
  .helpOption('-h, --help', 'display help for command')
  .addHelpText('before', () => {
    displayBanner();
    return '';
  });

// Add commands
cli.addCommand(initCommand);
cli.addCommand(setupCommand);
cli.addCommand(generateCommand);

// Global error handling
cli.exitOverride();

cli.on('command:*', () => {
  console.error('\nInvalid command: %s\n', cli.args.join(' '));
  console.log('See --help for a list of available commands.\n');
  process.exit(1);
});

// Show help if no command provided
if (!process.argv.slice(2).length) {
  cli.outputHelp();
}