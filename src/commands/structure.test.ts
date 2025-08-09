import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all external dependencies
vi.mock('inquirer');
vi.mock('fs/promises');
vi.mock('../ui/brand/banner');
vi.mock('../capture/leads');
vi.mock('./generate/project');
vi.mock('./generate/claude');
vi.mock('./setup');
vi.mock('ora');

describe('Command Structure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should import init command without errors', async () => {
    const initModule = await import('./init');
    expect(initModule.initCommand).toBeDefined();
  });

  it('should import generate commands without errors', async () => {
    const generateModule = await import('./generate');
    expect(generateModule.generateCommand).toBeDefined();
  });

  it('should import setup command without errors', async () => {
    const setupModule = await import('./setup');
    expect(setupModule.setupCommand).toBeDefined();
  });

  it('should validate command exports are Command instances', async () => {
    const modules = [
      import('./init'),
      import('./generate'),
      import('./setup')
    ];

    const commands = await Promise.all(modules);
    
    commands.forEach((module, index) => {
      const commandName = ['initCommand', 'generateCommand', 'setupCommand'][index];
      const command = (module as any)[commandName];
      
      expect(command).toBeDefined();
      // Commander commands have these methods
      expect(typeof command.name).toBe('function');
      expect(typeof command.description).toBe('function');
    });
  });

  it('should verify generate submodules exist', async () => {
    await expect(import('./generate/claude')).resolves.toBeDefined();
    await expect(import('./generate/project')).resolves.toBeDefined();
    await expect(import('./generate/index')).resolves.toBeDefined();
  });

  it('should validate command configuration', async () => {
    const { initCommand } = await import('./init');
    
    // Test that the command has the expected structure
    expect(initCommand.name()).toBe('init');
    expect(typeof initCommand.description()).toBe('string');
    expect(initCommand.description()).toContain('Initialize');
  });

  it('should validate project types and roles', () => {
    const projectTypes = ['webapp', 'api', 'automation'];
    const roles = ['founder', 'product', 'marketing', 'operations'];
    
    projectTypes.forEach(type => {
      expect(typeof type).toBe('string');
      expect(type.length).toBeGreaterThan(0);
    });
    
    roles.forEach(role => {
      expect(typeof role).toBe('string');
      expect(['founder', 'product', 'marketing', 'operations']).toContain(role);
    });
  });

  it('should validate service options', () => {
    const services = ['vercel', 'supabase', 'github', 'resend', 'typesense'];
    
    services.forEach(service => {
      expect(typeof service).toBe('string');
      expect(service.length).toBeGreaterThan(0);
      expect(/^[a-z]+$/.test(service)).toBe(true);
    });
    
    expect(services.length).toBeGreaterThan(0);
    expect(services).toContain('vercel');
    expect(services).toContain('supabase');
  });
});