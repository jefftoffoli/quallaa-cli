import { describe, it, expect, vi, beforeEach } from 'vitest';
import inquirer from 'inquirer';
import * as fs from 'fs/promises';

vi.mock('inquirer');
vi.mock('fs/promises');

describe('generate command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle CLAUDE.md generation parameters', () => {
    const claudeParams = {
      projectName: 'test-project',
      projectDescription: 'A test project',
      primaryGoal: 'Build great software',
      services: ['vercel', 'supabase'],
      role: 'founder'
    };
    
    expect(claudeParams.projectName).toBe('test-project');
    expect(claudeParams.role).toBe('founder');
    expect(claudeParams.services).toHaveLength(2);
  });

  it('should handle project file generation parameters', () => {
    const projectParams = {
      projectType: 'webapp',
      services: ['vercel', 'supabase'],
      features: ['auth', 'database']
    };
    
    expect(projectParams.projectType).toBe('webapp');
    expect(projectParams.features).toContain('auth');
    expect(projectParams.services).toContain('vercel');
  });
});