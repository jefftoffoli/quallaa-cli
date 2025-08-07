import { version } from '../../../package.json';

export class QuallaaError extends Error {
  public readonly code: string;
  public readonly version: string;
  public readonly timestamp: string;

  constructor(message: string, code: string = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'QuallaaError';
    this.code = code;
    this.version = version;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, QuallaaError);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      version: this.version,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

export class AuthenticationError extends QuallaaError {
  constructor(message: string, service?: string) {
    super(
      service ? `${service} authentication failed: ${message}` : message,
      'AUTH_ERROR'
    );
    this.name = 'AuthenticationError';
  }
}

export class ServiceError extends QuallaaError {
  public readonly service: string;
  public readonly statusCode?: number;

  constructor(message: string, service: string, statusCode?: number) {
    super(`${service} service error: ${message}`, 'SERVICE_ERROR');
    this.name = 'ServiceError';
    this.service = service;
    this.statusCode = statusCode;
  }
}

export class ValidationError extends QuallaaError {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(field ? `Validation error for ${field}: ${message}` : message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class ConfigurationError extends QuallaaError {
  constructor(message: string) {
    super(`Configuration error: ${message}`, 'CONFIG_ERROR');
    this.name = 'ConfigurationError';
  }
}

export class CredentialStorageError extends QuallaaError {
  public readonly operation: string;

  constructor(message: string, operation: 'save' | 'retrieve' | 'delete') {
    super(`Credential storage error (${operation}): ${message}`, 'CREDENTIAL_ERROR');
    this.name = 'CredentialStorageError';
    this.operation = operation;
  }
}