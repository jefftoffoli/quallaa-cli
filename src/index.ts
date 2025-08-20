import { Command } from 'commander';
import { displayBanner } from './ui/brand/banner';
import { initCommand } from './commands/init';
import { setupCommand } from './commands/setup';
import { generateCommand } from './commands/generate';
import { doctorCommand } from './commands/doctor';
import { outcomeCommand } from './commands/outcome';
import { evaluatorsCommand } from './commands/evaluators';
const packageJson = require('../package.json');
const { version } = packageJson;

export const cli = new Command();

cli
  .name('quallaa')
  .description('')
  .version(version, '-v, --version', 'display version number')
  .helpOption('-h, --help', 'display help for command');

// Add commands
cli.addCommand(initCommand);
cli.addCommand(setupCommand);
cli.addCommand(generateCommand);
cli.addCommand(doctorCommand);
cli.addCommand(outcomeCommand);
cli.addCommand(evaluatorsCommand);

// Global error handling
cli.exitOverride();

cli.on('command:*', () => {
  console.error('\nInvalid command: %s\n', cli.args.join(' '));
  console.log('See --help for a list of available commands.\n');
  process.exit(1);
});

// Show help if no command provided
if (!process.argv.slice(2).length) {
  displayBanner();
  console.log(cli.helpInformation());
  process.exit(0);
}