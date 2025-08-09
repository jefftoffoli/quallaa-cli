import { describe, it, expect } from 'vitest';
import { founderContext, founderSections } from './founder';
import { productContext, productSections } from './product';
import { marketingContext, marketingSections } from './marketing';
import { operationsContext, operationsSections } from './operations';

describe('Role Contexts', () => {
  describe('Founder Context', () => {
    it('should have correct structure and content', () => {
      expect(founderContext.title).toBe('Technical Co-Founder / First Engineer Context');
      expect(founderContext.description).toContain('technical leaders');
      expect(founderContext.specificSections).toContain('Architecture Decisions');
      expect(founderContext.specificSections).toContain('Team Scaling');
    });

    it('should have founder-specific sections content', () => {
      expect(founderSections).toBeDefined();
      expect(typeof founderSections).toBe('string');
      expect(founderSections).toContain('Architecture');
      expect(founderSections).toContain('Scaling');
    });
  });

  describe('Product Context', () => {
    it('should have correct structure and content', () => {
      expect(productContext.title).toBe('Product Manager Context');
      expect(productContext.description).toContain('product');
      expect(productContext.specificSections).toContain('User Analytics & Tracking');
      expect(productContext.specificSections).toContain('A/B Testing Framework');
    });

    it('should have product-specific sections content', () => {
      expect(productSections).toBeDefined();
      expect(typeof productSections).toBe('string');
      expect(productSections).toContain('Analytics');
      expect(productSections).toContain('Testing');
    });
  });

  describe('Marketing Context', () => {
    it('should have correct structure and content', () => {
      expect(marketingContext.title).toBe('Marketing Lead Context');
      expect(marketingContext.description).toContain('marketing');
      expect(marketingContext.specificSections).toContain('Customer Data & Segmentation');
      expect(marketingContext.specificSections).toContain('Campaign Performance Tracking');
    });

    it('should have marketing-specific sections content', () => {
      expect(marketingSections).toBeDefined();
      expect(typeof marketingSections).toBe('string');
      expect(marketingSections).toContain('Campaign');
      expect(marketingSections).toContain('Attribution');
    });
  });

  describe('Operations Context', () => {
    it('should have correct structure and content', () => {
      expect(operationsContext.title).toBe('Operations Manager Context');
      expect(operationsContext.description).toContain('process automation');
      expect(operationsContext.specificSections).toContain('Process Automation');
      expect(operationsContext.specificSections).toContain('Data Pipeline Management');
    });

    it('should have operations-specific sections content', () => {
      expect(operationsSections).toBeDefined();
      expect(typeof operationsSections).toBe('string');
      expect(operationsSections).toContain('Automation');
      expect(operationsSections).toContain('Integration');
    });
  });

  describe('Cross-role validation', () => {
    it('should have unique titles for each role', () => {
      const titles = [
        founderContext.title,
        productContext.title,
        marketingContext.title,
        operationsContext.title
      ];
      
      const uniqueTitles = new Set(titles);
      expect(uniqueTitles.size).toBe(titles.length);
    });

    it('should have all required properties', () => {
      const contexts = [founderContext, productContext, marketingContext, operationsContext];
      
      contexts.forEach(context => {
        expect(context).toHaveProperty('title');
        expect(context).toHaveProperty('description');
        expect(context).toHaveProperty('specificSections');
        expect(context).toHaveProperty('commonTasks');
        expect(context).toHaveProperty('libraries');
        expect(Array.isArray(context.specificSections)).toBe(true);
        expect(Array.isArray(context.commonTasks)).toBe(true);
        expect(Array.isArray(context.libraries)).toBe(true);
      });
    });
  });
});