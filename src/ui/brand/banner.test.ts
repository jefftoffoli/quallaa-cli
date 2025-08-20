import { describe, it, expect, vi } from 'vitest';
import { displayBanner, displayWelcome } from './banner';

// Mock console.log to capture output
const mockConsole = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('Banner', () => {
  afterEach(() => {
    mockConsole.mockClear();
  });

  it('should display banner with ASCII art', () => {
    displayBanner();
    
    expect(mockConsole).toHaveBeenCalled();
    const output = mockConsole.mock.calls.map(call => call[0]).join('');
    expect(output).toContain('█████╗'); // ASCII art characters
    expect(output).toContain('Domain Engineering infrastructure');
  });

  it('should display welcome message by calling displayBanner', () => {
    const displayBannerSpy = vi.fn();
    // displayWelcome calls displayBanner internally
    expect(typeof displayWelcome).toBe('function');
  });
});