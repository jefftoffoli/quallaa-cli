import chalk from 'chalk';
import { QuallaaError, AuthenticationError, ServiceError, ValidationError, ConfigurationError } from './custom-errors';

export interface ErrorContext {
  command?: string;
  service?: string;
  operation?: string;
  userId?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public handleError(error: Error | QuallaaError, context?: ErrorContext): never {
    // Handle Commander.js special cases (help, version, etc.)
    if (this.isCommanderHelperError(error)) {
      // These are normal operations, exit cleanly
      process.exit(0);
    }

    // Log error for debugging (in production, this would go to a logging service)
    this.logError(error, context);

    // Display user-friendly error message
    this.displayUserError(error, context);

    // Exit with appropriate code
    const exitCode = this.getExitCode(error);
    process.exit(exitCode);
  }

  private isCommanderHelperError(error: Error): boolean {
    // Commander.js throws these errors for normal operations like --help
    const commanderErrors = [
      '(outputHelp)',
      '(version)',
      'commander.helpDisplayed',
      'commander.version'
    ];
    
    return commanderErrors.some(errType => 
      error.message.includes(errType) || 
      (error as any).code === errType
    );
  }

  private logError(error: Error | QuallaaError, context?: ErrorContext): void {
    const logData = {
      error: error instanceof QuallaaError ? error.toJSON() : {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      timestamp: new Date().toISOString(),
    };

    // In development, log to console. In production, send to logging service
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      console.debug('Error details:', JSON.stringify(logData, null, 2));
    }
  }

  private displayUserError(error: Error | QuallaaError, context?: ErrorContext): void {
    console.log(); // Empty line for spacing

    if (error instanceof AuthenticationError) {
      this.displayAuthError(error, context);
    } else if (error instanceof ServiceError) {
      this.displayServiceError(error, context);
    } else if (error instanceof ValidationError) {
      this.displayValidationError(error, context);
    } else if (error instanceof ConfigurationError) {
      this.displayConfigError(error, context);
    } else if (error instanceof QuallaaError) {
      this.displayQuallaaError(error, context);
    } else {
      this.displayGenericError(error, context);
    }

    // Always show support information
    this.displaySupportInfo(error);
  }

  private displayAuthError(error: AuthenticationError, context?: ErrorContext): void {
    console.log(chalk.red('🔐 Authentication Error'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.red(error.message));
    console.log();
    
    // Provide specific help based on context
    if (context?.service) {
      console.log(chalk.yellow('💡 Try these solutions:'));
      console.log(chalk.gray(`   1. Run: ${chalk.cyan(`quallaa setup ${context.service}`)}`));
      console.log(chalk.gray('   2. Check your API keys/tokens are correct'));
      console.log(chalk.gray('   3. Verify your account permissions'));
    }
  }

  private displayServiceError(error: ServiceError, _context?: ErrorContext): void {
    console.log(chalk.red(`🌐 ${error.service} Service Error`));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.red(error.message));
    
    if (error.statusCode) {
      console.log(chalk.gray(`Status Code: ${error.statusCode}`));
    }
    
    console.log();
    console.log(chalk.yellow('💡 Possible solutions:'));
    console.log(chalk.gray('   1. Check your internet connection'));
    console.log(chalk.gray('   2. Verify service is not experiencing downtime'));
    console.log(chalk.gray('   3. Check rate limits for your account'));
  }

  private displayValidationError(error: ValidationError, _context?: ErrorContext): void {
    console.log(chalk.red('✏️  Input Validation Error'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.red(error.message));
    
    if (error.field) {
      console.log(chalk.gray(`Field: ${error.field}`));
    }
    
    console.log();
    console.log(chalk.yellow('💡 Please check your input and try again.'));
  }

  private displayConfigError(error: ConfigurationError, _context?: ErrorContext): void {
    console.log(chalk.red('⚙️  Configuration Error'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.red(error.message));
    console.log();
    
    console.log(chalk.yellow('💡 Try these solutions:'));
    console.log(chalk.gray('   1. Run: ' + chalk.cyan('quallaa init') + ' to reinitialize'));
    console.log(chalk.gray('   2. Check your .env.local file'));
    console.log(chalk.gray('   3. Verify all required services are set up'));
  }

  private displayQuallaaError(error: QuallaaError, _context?: ErrorContext): void {
    console.log(chalk.red('❌ Quallaa CLI Error'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.red(error.message));
    console.log(chalk.gray(`Error Code: ${error.code}`));
    console.log();
  }

  private displayGenericError(error: Error, _context?: ErrorContext): void {
    console.log(chalk.red('💥 Unexpected Error'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.red(error.message));
    console.log();
    
    console.log(chalk.yellow('This appears to be an unexpected error.'));
    console.log(chalk.gray('Please report this issue with the details below.'));
  }

  private displaySupportInfo(error: Error | QuallaaError): void {
    console.log();
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.cyan('🆘 Need help?'));
    
    if (error instanceof QuallaaError) {
      console.log(chalk.gray(`Version: ${error.version}`));
      console.log(chalk.gray(`Error ID: ${error.code}-${error.timestamp.slice(-8)}`));
    }
    
    console.log(chalk.gray('Documentation: https://docs.quallaa.com'));
    console.log(chalk.gray('Support: https://github.com/quallaa/quallaa-cli/issues'));
    console.log(chalk.gray('Email: support@quallaa.com'));
    console.log();
  }

  private getExitCode(error: Error | QuallaaError): number {
    if (error instanceof AuthenticationError) return 1;
    if (error instanceof ServiceError) return 2;
    if (error instanceof ValidationError) return 3;
    if (error instanceof ConfigurationError) return 4;
    if (error instanceof QuallaaError) return 5;
    return 1; // Generic error
  }
}

// Global error handler setup
export function setupGlobalErrorHandler(): void {
  const errorHandler = ErrorHandler.getInstance();

  process.on('uncaughtException', (error: Error) => {
    console.log(chalk.red('\n💥 Uncaught Exception:'));
    errorHandler.handleError(error, { operation: 'uncaught-exception' });
  });

  process.on('unhandledRejection', (reason: unknown) => {
    const error = reason instanceof Error 
      ? reason 
      : new Error(`Unhandled promise rejection: ${String(reason)}`);
    
    console.log(chalk.red('\n💥 Unhandled Promise Rejection:'));
    errorHandler.handleError(error, { operation: 'unhandled-rejection' });
  });
}

// Convenience function to handle errors consistently
export function handleError(error: Error | QuallaaError, context?: ErrorContext): never {
  const errorHandler = ErrorHandler.getInstance();
  return errorHandler.handleError(error, context);
}