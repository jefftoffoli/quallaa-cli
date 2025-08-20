import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import * as semver from 'semver';
import { doctorCommand } from './doctor';
import { testCredentialStorage } from '../storage/credentials';
import { verifyVercelCredentials } from '../services/vercel';
import { verifySupabaseCredentials } from '../services/supabase';
import { verifyGitHubCredentials } from '../services/github';
import { verifyResendCredentials } from '../services/resend';
import { verifyTypesenseCredentials } from '../services/typesense';

// Mock dependencies
vi.mock('child_process');
vi.mock('../storage/credentials');
vi.mock('../services/vercel');
vi.mock('../services/supabase');
vi.mock('../services/github');
vi.mock('../services/resend');
vi.mock('../services/typesense');

const mockExecSync = vi.mocked(execSync);
const mockTestCredentialStorage = vi.mocked(testCredentialStorage);
const mockVerifyVercelCredentials = vi.mocked(verifyVercelCredentials);
const mockVerifySupabaseCredentials = vi.mocked(verifySupabaseCredentials);
const mockVerifyGitHubCredentials = vi.mocked(verifyGitHubCredentials);
const mockVerifyResendCredentials = vi.mocked(verifyResendCredentials);
const mockVerifyTypesenseCredentials = vi.mocked(verifyTypesenseCredentials);

describe('doctor command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods to avoid output during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Default mocks
    mockTestCredentialStorage.mockResolvedValue(true);
    mockVerifyVercelCredentials.mockResolvedValue(true);
    mockVerifySupabaseCredentials.mockResolvedValue(true);
    mockVerifyGitHubCredentials.mockResolvedValue(true);
    mockVerifyResendCredentials.mockResolvedValue(true);
    mockVerifyTypesenseCredentials.mockResolvedValue(true);
  });

  it('should be properly configured', () => {
    expect(doctorCommand.name()).toBe('doctor');
    expect(doctorCommand.description()).toBe('Check system health and configuration');
  });

  it('should check Node.js version successfully', async () => {
    // Mock Node.js version check
    const originalVersion = process.version;
    Object.defineProperty(process, 'version', {
      value: 'v18.0.0',
      configurable: true,
    });

    mockExecSync
      .mockReturnValueOnce('git version 2.30.0\n')
      .mockReturnValueOnce('8.19.0\n');

    const output: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((msg) => {
      output.push(msg);
    });

    await doctorCommand.parseAsync(['doctor'], { from: 'user' });

    expect(output.some(line => line.includes('✅') && line.includes('Node.js Version'))).toBe(true);

    // Restore original version
    Object.defineProperty(process, 'version', {
      value: originalVersion,
      configurable: true,
    });
  });

  it('should fail on old Node.js version', async () => {
    // Mock old Node.js version
    const originalVersion = process.version;
    Object.defineProperty(process, 'version', {
      value: 'v16.0.0',
      configurable: true,
    });

    mockExecSync
      .mockReturnValueOnce('git version 2.30.0\n')
      .mockReturnValueOnce('8.19.0\n');

    const output: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((msg) => {
      output.push(msg);
    });

    await doctorCommand.parseAsync(['doctor'], { from: 'user' });

    expect(output.some(line => line.includes('❌') && line.includes('Node.js Version'))).toBe(true);

    // Restore original version
    Object.defineProperty(process, 'version', {
      value: originalVersion,
      configurable: true,
    });
  });

  it('should check CLI dependencies successfully', async () => {
    mockExecSync
      .mockReturnValueOnce('git version 2.30.0\n')
      .mockReturnValueOnce('8.19.0\n');

    const output: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((msg) => {
      output.push(msg);
    });

    await doctorCommand.parseAsync(['doctor'], { from: 'user' });

    expect(output.some(line => line.includes('✅') && line.includes('CLI Dependencies'))).toBe(true);
  });

  it('should fail when CLI dependencies are missing', async () => {
    mockExecSync
      .mockImplementationOnce(() => { throw new Error('git not found'); })
      .mockReturnValueOnce('8.19.0\n');

    const output: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((msg) => {
      output.push(msg);
    });

    await doctorCommand.parseAsync(['doctor'], { from: 'user' });

    expect(output.some(line => line.includes('❌') && line.includes('CLI Dependencies'))).toBe(true);
  });

  it('should check credential storage successfully', async () => {
    mockTestCredentialStorage.mockResolvedValue(true);
    
    mockExecSync
      .mockReturnValueOnce('git version 2.30.0\n')
      .mockReturnValueOnce('8.19.0\n');

    const output: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((msg) => {
      output.push(msg);
    });

    await doctorCommand.parseAsync(['doctor'], { from: 'user' });

    expect(output.some(line => line.includes('✅') && line.includes('Credential Storage'))).toBe(true);
  });

  it('should warn when credential storage is unavailable', async () => {
    mockTestCredentialStorage.mockResolvedValue(false);
    
    mockExecSync
      .mockReturnValueOnce('git version 2.30.0\n')
      .mockReturnValueOnce('8.19.0\n');

    const output: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((msg) => {
      output.push(msg);
    });

    await doctorCommand.parseAsync(['doctor'], { from: 'user' });

    expect(output.some(line => line.includes('⚠️') && line.includes('Credential Storage'))).toBe(true);
  });

  it('should check service authentication status', async () => {
    mockVerifyVercelCredentials.mockResolvedValue(true);
    mockVerifySupabaseCredentials.mockResolvedValue(false);
    mockVerifyGitHubCredentials.mockRejectedValue(new Error('not implemented'));
    
    mockExecSync
      .mockReturnValueOnce('git version 2.30.0\n')
      .mockReturnValueOnce('8.19.0\n');

    const output: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((msg) => {
      output.push(msg);
    });

    await doctorCommand.parseAsync(['doctor'], { from: 'user' });

    expect(output.some(line => line.includes('✅') && line.includes('Vercel Authentication'))).toBe(true);
    expect(output.some(line => line.includes('⚠️') && line.includes('Supabase Authentication'))).toBe(true);
    expect(output.some(line => line.includes('⚠️') && line.includes('GitHub Authentication'))).toBe(true);
  });

  it('should display verbose output when requested', async () => {
    mockExecSync
      .mockReturnValueOnce('git version 2.30.0\n')
      .mockReturnValueOnce('8.19.0\n');

    const output: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((msg) => {
      output.push(msg);
    });

    await doctorCommand.parseAsync(['doctor', '--verbose'], { from: 'user' });

    // Should include detailed information in verbose mode
    expect(output.some(line => line.includes('git:') && line.includes('npm:'))).toBe(true);
  });

  it('should provide appropriate summary based on results', async () => {
    mockExecSync
      .mockReturnValueOnce('git version 2.30.0\n')
      .mockReturnValueOnce('8.19.0\n');

    const output: string[] = [];
    vi.spyOn(console, 'log').mockImplementation((msg) => {
      output.push(msg);
    });

    await doctorCommand.parseAsync(['doctor'], { from: 'user' });

    expect(output.some(line => line.includes('Summary:'))).toBe(true);
  });
});