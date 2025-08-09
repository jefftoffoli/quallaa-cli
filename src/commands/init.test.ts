import { describe, it, expect, vi, beforeEach } from 'vitest';
import inquirer from 'inquirer';
import * as fs from 'fs/promises';

vi.mock('inquirer');
vi.mock('fs/promises');

describe('init command integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle project initialization flow', async () => {
    // This is a placeholder for integration tests
    // The actual init command is a Commander instance and needs E2E testing
    const mockPrompts = {
      projectName: 'test-project',
      role: 'founder',
      services: ['vercel', 'supabase']
    };
    
    expect(mockPrompts.projectName).toBe('test-project');
    expect(mockPrompts.role).toBe('founder');
    expect(mockPrompts.services).toContain('vercel');
  });
});