import chalk from 'chalk';

export function displayBanner(): void {
  const banner = `
${chalk.blue('   █████╗  ██╗   ██╗  █████╗  ██╗     ██╗      █████╗   █████╗')}
${chalk.blue('  ██╔══██╗ ██║   ██║ ██╔══██╗ ██║     ██║     ██╔══██╗ ██╔══██╗')}
${chalk.blue('  ██║  ██║ ██║   ██║ ███████║ ██║     ██║     ███████║ ███████║')}
${chalk.blue('  ██║▄▄██║ ██║   ██║ ██╔══██║ ██║     ██║     ██╔══██║ ██╔══██║')}
${chalk.blue('  ╚██████║ ╚██████╔╝ ██║  ██║ ███████╗███████╗██║  ██║ ██║  ██║')}
${chalk.blue('   ╚══▀▀═╝  ╚═════╝  ╚═╝  ╚═╝ ╚══════╝╚══════╝╚═╝  ╚═╝ ╚═╝  ╚═╝')}

${chalk.bold('Quallaa CLI')}
${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}

${chalk.gray('Domain Engineering infrastructure for AI-assisted development')}
`;

  console.log(banner);
}

export function displayWelcome(): void {
  // Display the full banner first
  displayBanner();
  
  console.log(`
${chalk.bold('Welcome to Quallaa CLI!')}

${chalk.gray('This tool helps you set up core infrastructure services for your development projects.')}

${chalk.yellow('Available services:')}
  • ${chalk.green('Vercel')} - Hosting and deployment
  • ${chalk.green('Supabase')} - Database and authentication  
  • ${chalk.green('GitHub')} - Version control
  • ${chalk.green('Resend')} - Email infrastructure
  • ${chalk.green('Typesense')} - Search (optional)

${chalk.gray('Choose your role to get customized setup guidance and AI context files.')}
`);
}