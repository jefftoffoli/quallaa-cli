import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

describe('CLI UX for Novices', () => {
  const CLI_CMD = 'node dist/bin/quallaa.js';

  describe('Help System Accessibility', () => {
    it('should show help when no arguments provided', () => {
      try {
        const output = execSync(`${CLI_CMD}`, { encoding: 'utf-8', stdio: 'pipe' });
        expect(output).toContain('Usage:');
        expect(output).toContain('Commands:');
      } catch (error: any) {
        // CLI may exit with code 0 or show help on stderr
        expect(error.stdout || error.stderr).toContain('Usage:');
      }
    });

    it('should provide clear help for each command', () => {
      const commands = ['init', 'setup', 'generate'];
      
      commands.forEach(cmd => {
        const output = execSync(`${CLI_CMD} ${cmd} --help`, { encoding: 'utf-8' });
        expect(output).toContain(`Usage:`);
        expect(output).toContain('Options:');
        expect(output).not.toContain('undefined');
        expect(output.length).toBeGreaterThan(50); // Substantial help text
      });
    });

    it('should use beginner-friendly language', () => {
      const output = execSync(`${CLI_CMD} --help`, { encoding: 'utf-8' });
      
      // Should avoid technical jargon
      expect(output).not.toContain('binary');
      expect(output).not.toContain('execute');
      expect(output).not.toContain('runtime');
      
      // Should use approachable language
      expect(output).toContain('AI-native development');
      expect(output).toMatch(/setup|create|build|help/i);
    });
  });

  describe('Error Messages for Novices', () => {
    it('should provide actionable error messages', () => {
      try {
        execSync(`${CLI_CMD} invalid-command`, { encoding: 'utf-8', stdio: 'pipe' });
      } catch (error: any) {
        const errorOutput = error.stderr || error.stdout || '';
        expect(errorOutput).toContain('Invalid command');
        expect(errorOutput).toContain('--help'); // Shows how to get help
        expect(errorOutput).not.toContain('Error:'); // Avoid scary technical errors
      }
    });

    it('should handle missing required options gracefully', () => {
      // Test commands that might have required options
      const commands = ['init', 'generate claude'];
      
      commands.forEach(cmd => {
        try {
          execSync(`${CLI_CMD} ${cmd} --invalid-option`, { 
            encoding: 'utf-8', 
            stdio: 'pipe' 
          });
        } catch (error: any) {
          const errorOutput = error.stderr || error.stdout || '';
          expect(errorOutput).not.toContain('TypeError');
          expect(errorOutput).not.toContain('undefined');
          // Should provide helpful guidance
          if (errorOutput.includes('unknown option')) {
            expect(errorOutput).toContain('--help');
          }
        }
      });
    });
  });

  describe('Progressive Disclosure', () => {
    it('should not overwhelm users with too many options at once', () => {
      const mainHelp = execSync(`${CLI_CMD} --help`, { encoding: 'utf-8' });
      const lines = mainHelp.split('\n').filter(line => line.trim());
      
      // Main help should be concise
      expect(lines.length).toBeLessThan(30);
      
      // Should focus on primary commands
      expect(mainHelp).toContain('init');
      expect(mainHelp).toContain('setup');
      expect(mainHelp).toContain('generate');
    });

    it('should provide detailed help only when requested', () => {
      const mainHelp = execSync(`${CLI_CMD} --help`, { encoding: 'utf-8' });
      const initHelp = execSync(`${CLI_CMD} init --help`, { encoding: 'utf-8' });
      
      // Detailed help should be longer
      expect(initHelp.length).toBeGreaterThan(mainHelp.length);
      
      // Should contain specific option details
      expect(initHelp).toContain('--name');
      expect(initHelp).toContain('--role');
    });
  });

  describe('Visual Clarity', () => {
    it('should use clear visual hierarchy', () => {
      const output = execSync(`${CLI_CMD} --help`, { encoding: 'utf-8' });
      
      // Should have clear sections
      expect(output).toContain('Usage:');
      expect(output).toContain('Commands:');
      expect(output).toContain('Options:');
      
      // Should have visual branding
      expect(output).toMatch(/█+|╗|╚|═/); // ASCII art present
    });

    it('should have consistent formatting across commands', () => {
      const commands = ['init', 'setup', 'generate'];
      
      commands.forEach(cmd => {
        const output = execSync(`${CLI_CMD} ${cmd} --help`, { encoding: 'utf-8' });
        expect(output).toContain('Usage:');
        expect(output).toContain('Options:');
        expect(output).toMatch(/^\s*-\w,\s*--\w+/m); // Consistent option format
      });
    });
  });

  describe('Confirmation and Safety', () => {
    it('should indicate what actions will be taken', () => {
      const initHelp = execSync(`${CLI_CMD} init --help`, { encoding: 'utf-8' });
      
      expect(initHelp).toContain('Initialize'); // Clear action verb
      expect(initHelp.toLowerCase()).toMatch(/create|setup|configure/);
    });

    it('should show version information clearly', () => {
      const version = execSync(`${CLI_CMD} --version`, { encoding: 'utf-8' });
      
      expect(version.trim()).toMatch(/^\d+\.\d+\.\d+$/); // Semantic version
      expect(version.trim().length).toBeLessThan(20); // Concise
    });
  });
});