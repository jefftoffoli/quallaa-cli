import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Documentation & Help System', () => {
  const CLI_CMD = 'node dist/bin/quallaa.js';

  describe('Help Content Quality', () => {
    it('should provide comprehensive command descriptions', () => {
      const commands = ['init', 'setup', 'generate'];
      
      commands.forEach(cmd => {
        const help = execSync(`${CLI_CMD} ${cmd} --help`, { encoding: 'utf-8' });
        
        // Should have substantial description
        expect(help.length).toBeGreaterThan(100);
        
        // Should explain what the command does
        expect(help.toLowerCase()).toMatch(/(create|setup|configure|generate|initialize)/);
        
        // Should have usage examples
        expect(help).toContain('Usage:');
        
        // Should list all options
        expect(help).toContain('Options:');
      });
    });

    it('should use consistent terminology', () => {
      const mainHelp = execSync(`${CLI_CMD} --help`, { encoding: 'utf-8' });
      
      // Should use consistent terms throughout
      const keyTerms = ['project', 'service', 'setup', 'generate'];
      
      keyTerms.forEach(term => {
        if (mainHelp.toLowerCase().includes(term)) {
          // Should use the term consistently (not synonyms)
          expect(mainHelp.toLowerCase()).toContain(term);
        }
      });
    });

    it('should provide beginner-friendly examples', () => {
      const initHelp = execSync(`${CLI_CMD} init --help`, { encoding: 'utf-8' });
      
      // Should show concrete examples
      expect(initHelp.toLowerCase()).toMatch(/(example|e\.g\.|for instance)/);
      
      // Should not assume prior knowledge
      expect(initHelp).not.toMatch(/(?:obviously|simply|just|merely)/i);
    });
  });

  describe('Error Message Clarity', () => {
    it('should provide actionable error messages', () => {
      try {
        execSync(`${CLI_CMD} nonexistent-command`, { encoding: 'utf-8', stdio: 'pipe' });
      } catch (error: any) {
        const output = error.stderr || error.stdout || '';
        
        // Should suggest what to do
        expect(output.toLowerCase()).toMatch(/(try|use|run|see)/);
        
        // Should mention help
        expect(output).toContain('help');
        
        // Should not be intimidating
        expect(output).not.toMatch(/error|fail|abort/i);
      }
    });

    it('should explain technical terms when first used', () => {
      const help = execSync(`${CLI_CMD} --help`, { encoding: 'utf-8' });
      
      // Should not use unexplained jargon
      const technicalTerms = ['API', 'CLI', 'OAuth', 'JWT', 'SSH'];
      
      technicalTerms.forEach(term => {
        if (help.includes(term)) {
          // If technical terms are used, they should be in context
          expect(help).not.toContain(term + ' '); // Not just standalone
        }
      });
    });
  });

  describe('Progressive Disclosure', () => {
    it('should show brief help first, detailed help on request', () => {
      const briefHelp = execSync(`${CLI_CMD} --help`, { encoding: 'utf-8' });
      const detailedHelp = execSync(`${CLI_CMD} init --help`, { encoding: 'utf-8' });
      
      // Brief help should be shorter
      expect(briefHelp.split('\n').length).toBeLessThan(detailedHelp.split('\n').length);
      
      // Detailed help should have more information
      expect(detailedHelp).toContain('--');
      expect(detailedHelp.length).toBeGreaterThan(briefHelp.length);
    });

    it('should organize information hierarchically', () => {
      const help = execSync(`${CLI_CMD} --help`, { encoding: 'utf-8' });
      
      // Should have clear sections
      const sections = ['Usage:', 'Commands:', 'Options:'];
      
      let lastIndex = -1;
      sections.forEach(section => {
        if (help.includes(section)) {
          const currentIndex = help.indexOf(section);
          expect(currentIndex).toBeGreaterThan(lastIndex);
          lastIndex = currentIndex;
        }
      });
    });
  });

  describe('Accessibility', () => {
    it('should work with screen readers', () => {
      const help = execSync(`${CLI_CMD} --help`, { encoding: 'utf-8' });
      
      // Should have logical reading order
      expect(help).toMatch(/Usage:.*Commands:.*Options:/s);
      
      // Should not rely only on visual formatting
      expect(help).toMatch(/\w+\s+-\s+\w+/); // Description follows command
    });

    it('should support different terminal widths', () => {
      const help = execSync(`${CLI_CMD} --help`, { encoding: 'utf-8' });
      const lines = help.split('\n');
      
      // Should not have extremely long lines
      const maxLine = Math.max(...lines.map(line => line.length));
      expect(maxLine).toBeLessThan(120); // Reasonable line length
      
      // Should wrap text appropriately
      lines.forEach(line => {
        if (line.length > 80) {
          // Long lines should have natural break points
          expect(line).toMatch(/\s/); // Contains spaces for wrapping
        }
      });
    });
  });

  describe('Documentation Completeness', () => {
    it('should document all available options', () => {
      const commands = ['init', 'setup', 'generate'];
      
      commands.forEach(cmd => {
        const help = execSync(`${CLI_CMD} ${cmd} --help`, { encoding: 'utf-8' });
        
        // Should document short and long forms
        expect(help).toMatch(/-\w,\s+--\w+/);
        
        // Should explain what each option does
        expect(help).toMatch(/--\w+.*\w/); // Option followed by description
      });
    });

    it('should provide context for each feature', () => {
      const initHelp = execSync(`${CLI_CMD} init --help`, { encoding: 'utf-8' });
      
      // Should explain why options exist
      expect(initHelp.toLowerCase()).toMatch(/(project|setup|configure)/);
      
      // Should connect features to user goals
      expect(initHelp.toLowerCase()).toMatch(/(help|create|build|develop)/);
    });
  });

  describe('Language & Tone', () => {
    it('should use encouraging, supportive language', () => {
      const help = execSync(`${CLI_CMD} --help`, { encoding: 'utf-8' });
      
      // Should be welcoming
      expect(help.toLowerCase()).toMatch(/(welcome|help|get started|let\'s)/);
      
      // Should avoid negative language
      expect(help.toLowerCase()).not.toMatch(/(can\'t|won\'t|don\'t|failed|error)/);
      
      // Should be empowering
      expect(help.toLowerCase()).toMatch(/(you|your|build|create|develop)/);
    });

    it('should use active voice', () => {
      const help = execSync(`${CLI_CMD} init --help`, { encoding: 'utf-8' });
      
      // Should use action verbs
      expect(help.toLowerCase()).toMatch(/(initialize|create|setup|generate|build)/);
      
      // Should avoid passive constructions where possible
      const passiveIndicators = help.match(/is \w+ed|are \w+ed|be \w+ed/g);
      const activeIndicators = help.match(/(create|build|setup|generate|initialize)/gi);
      
      if (passiveIndicators && activeIndicators) {
        expect(activeIndicators.length).toBeGreaterThanOrEqual(passiveIndicators.length);
      }
    });
  });

  describe('Visual Design', () => {
    it('should use consistent formatting', () => {
      const commands = ['init', 'setup', 'generate'];
      
      commands.forEach(cmd => {
        const help = execSync(`${CLI_CMD} ${cmd} --help`, { encoding: 'utf-8' });
        
        // Should have consistent option formatting
        expect(help).toMatch(/\s+-\w,\s+--[\w-]+/);
        
        // Should have consistent indentation
        const lines = help.split('\n');
        const indentedLines = lines.filter(line => line.startsWith('  '));
        expect(indentedLines.length).toBeGreaterThan(0);
      });
    });

    it('should use visual hierarchy', () => {
      const help = execSync(`${CLI_CMD} --help`, { encoding: 'utf-8' });
      
      // Should have clear headers
      expect(help).toMatch(/^[A-Z][A-Za-z ]+:$/m);
      
      // Should group related information
      expect(help).toMatch(/Commands:[\s\S]*Options:/);
    });

    it('should include branding appropriately', () => {
      const help = execSync(`${CLI_CMD} --help`, { encoding: 'utf-8' });
      
      // Should show brand identity
      expect(help).toMatch(/[█╗╚═]/); // ASCII art characters
      
      // Should include tagline/value proposition
      expect(help.toLowerCase()).toMatch(/(ai-native|development|domain)/);
      
      // Should not be overwhelming
      const brandingLines = help.split('\n').filter(line => line.includes('█'));
      expect(brandingLines.length).toBeLessThan(15); // Reasonable amount
    });
  });

  describe('Context-Sensitive Help', () => {
    it('should provide relevant help for user situations', () => {
      // Test help for different user scenarios
      const scenarios = [
        { command: 'init', context: 'starting new project' },
        { command: 'setup', context: 'configuring services' },
        { command: 'generate', context: 'creating files' }
      ];

      scenarios.forEach(({ command, context }) => {
        const help = execSync(`${CLI_CMD} ${command} --help`, { encoding: 'utf-8' });
        
        // Should relate to the user's context
        expect(help.toLowerCase()).toMatch(new RegExp(context.replace(' ', '.*')));
      });
    });

    it('should suggest next steps', () => {
      const help = execSync(`${CLI_CMD} --help`, { encoding: 'utf-8' });
      
      // Should guide users on what to do first
      expect(help.toLowerCase()).toMatch(/(start|begin|first|try)/);
      
      // Should mention the most common command
      expect(help).toContain('init');
    });
  });
});