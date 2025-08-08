import chalk from 'chalk';

export function displayBanner(): void {
  const banner = `
${chalk.blue('   █████╗  ██╗   ██╗  █████╗  ██╗     ██╗      █████╗   █████╗')}
${chalk.blue('  ██╔══██╗ ██║   ██║ ██╔══██╗ ██║     ██║     ██╔══██╗ ██╔══██╗')}
${chalk.blue('  ██║  ██║ ██║   ██║ ███████║ ██║     ██║     ███████║ ███████║')}
${chalk.blue('  ██║▄▄██║ ██║   ██║ ██╔══██║ ██║     ██║     ██╔══██║ ██╔══██║')}
${chalk.blue('  ╚██████║ ╚██████╔╝ ██║  ██║ ███████╗███████╗██║  ██║ ██║  ██║')}
${chalk.blue('   ╚══▀▀═╝  ╚═════╝  ╚═╝  ╚═╝ ╚══════╝╚══════╝╚═╝  ╚═╝ ╚═╝  ╚═╝')}

${chalk.bold('Domain Engineering Revolution')}
${chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}

${chalk.cyan('🚀 Join the 0.37% → Empower the 99.63%')}
${chalk.gray('Transform from GUI-constrained workflows to AI-native development')}
`;

  console.log(banner);
}

export function displayWelcome(): void {
  // Display the full banner first
  displayBanner();
  
  console.log(`
${chalk.bold('Welcome to Quallaa CLI!')}

${chalk.gray('This tool will help you set up a modern, AI-native development stack')}
${chalk.gray('that liberates you from expensive SaaS subscriptions and GUI bottlenecks.')}

${chalk.yellow('⚡ What you\'ll get:')}
  • ${chalk.green('Vercel')} - Hosting and deployment
  • ${chalk.green('Supabase')} - Database and authentication  
  • ${chalk.green('GitHub')} - Version control
  • ${chalk.green('Resend')} - Email infrastructure
  • ${chalk.green('Claude')} - AI coding assistant with custom context

${chalk.gray('Let\'s build exactly what you need, right now.')}
`);
}