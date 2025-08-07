import updateNotifier from 'update-notifier';
import chalk from 'chalk';

export async function checkForUpdates(): Promise<void> {
  try {
    const pkg = require('../../../package.json');
    
    const notifier = updateNotifier({
      pkg,
      updateCheckInterval: 1000 * 60 * 60 * 24, // 1 day
    });

    if (notifier.update) {
      const message = `
${chalk.yellow('📦 Update available!')} ${chalk.gray(notifier.update.current)} → ${chalk.green(notifier.update.latest)}
Run ${chalk.cyan(`npm install -g ${pkg.name}`)} to update
`;
      console.log(chalk.bgYellow.black(' UPDATE ') + message);
    }
  } catch (error) {
    // Silently fail update check
    console.debug('Update check failed:', error);
  }
}