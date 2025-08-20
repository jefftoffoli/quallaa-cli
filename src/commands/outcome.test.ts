import { describe, it, expect, vi, beforeEach } from 'vitest';
import { outcomeCommand } from './outcome';

// Mock dependencies
vi.mock('../ui/brand/banner');
vi.mock('../capture/leads');
vi.mock('./generate/project');
vi.mock('./generate/claude');
vi.mock('./generate/outcome-project');
vi.mock('./setup');

describe('outcome command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods to avoid output during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should be properly configured', () => {
    expect(outcomeCommand.name()).toBe('outcome');
    expect(outcomeCommand.description()).toBe('Initialize a project with pre-configured outcome templates');
  });

  it('should have template option', () => {
    const options = outcomeCommand.options;
    const templateOption = options.find(opt => opt.long === '--template');
    expect(templateOption).toBeDefined();
    expect(templateOption?.description).toContain('template');
  });

  it('should have name option', () => {
    const options = outcomeCommand.options;
    const nameOption = options.find(opt => opt.long === '--name');
    expect(nameOption).toBeDefined();
  });

  it('should have role option', () => {
    const options = outcomeCommand.options;
    const roleOption = options.find(opt => opt.long === '--role');
    expect(roleOption).toBeDefined();
  });

  it('should have skip-lead-capture option', () => {
    const options = outcomeCommand.options;
    const skipOption = options.find(opt => opt.long === '--skip-lead-capture');
    expect(skipOption).toBeDefined();
  });
});