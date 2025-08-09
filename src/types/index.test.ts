import { describe, it, expect } from 'vitest';
import type { ServiceSetupResult, Role, ProjectConfig, RoleContext } from './index';

describe('Types', () => {
  it('should define ServiceSetupResult interface correctly', () => {
    const successResult: ServiceSetupResult = {
      success: true,
      service: 'test-service'
    };
    
    const failureResult: ServiceSetupResult = {
      success: false,
      service: 'test-service',
      error: new Error('Test error'),
      message: 'Setup failed'
    };
    
    expect(successResult.success).toBe(true);
    expect(successResult.service).toBe('test-service');
    expect(failureResult.success).toBe(false);
    expect(failureResult.error).toBeInstanceOf(Error);
  });

  it('should define Role type correctly', () => {
    const roles: Role[] = ['founder', 'product', 'marketing', 'operations'];
    
    roles.forEach(role => {
      expect(typeof role).toBe('string');
      expect(['founder', 'product', 'marketing', 'operations']).toContain(role);
    });
  });

  it('should define ProjectConfig interface correctly', () => {
    const config: ProjectConfig = {
      name: 'test-project',
      description: 'A test project',
      role: 'founder',
      services: ['vercel', 'supabase'],
      primaryGoal: 'Build awesome software'
    };
    
    expect(config.name).toBe('test-project');
    expect(config.role).toBe('founder');
    expect(Array.isArray(config.services)).toBe(true);
    expect(config.services).toContain('vercel');
  });

  it('should define RoleContext interface correctly', () => {
    const context: RoleContext = {
      title: 'Test Context',
      description: 'Test description',
      specificSections: ['Section 1', 'Section 2'],
      commonTasks: ['Task 1', 'Task 2'],
      libraries: ['Library 1', 'Library 2']
    };
    
    expect(context.title).toBe('Test Context');
    expect(Array.isArray(context.specificSections)).toBe(true);
    expect(Array.isArray(context.commonTasks)).toBe(true);
    expect(Array.isArray(context.libraries)).toBe(true);
  });
});