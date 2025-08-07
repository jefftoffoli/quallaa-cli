import { describe, it, expect, vi, beforeEach } from 'vitest';
import inquirer from 'inquirer';
import { captureLeadInfo } from './leads';
import { submitToQuallaaCRM } from './crm';

// Mock inquirer and CRM submission
vi.mock('inquirer');
vi.mock('./crm');

describe('Lead Capture', () => {
  const mockInquirer = vi.mocked(inquirer);
  const mockSubmitToQuallaaCRM = vi.mocked(submitToQuallaaCRM);
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubmitToQuallaaCRM.mockResolvedValue();
  });

  describe('captureLeadInfo', () => {
    it('should capture valid lead information', async () => {
      // Arrange - Use realistic test data instead of "foo" values
      const userInput = {
        name: 'Sarah Chen',
        email: 'sarah.chen@techstartup.com',
        company: 'TechStartup Inc'
      };
      
      mockInquirer.prompt.mockResolvedValue(userInput);

      // Act
      const result = await captureLeadInfo();

      // Assert
      expect(result).toEqual({
        ...userInput,
        createdAt: expect.any(Date)
      });
      
      expect(mockInquirer.prompt).toHaveBeenCalledWith([
        {
          type: 'input',
          name: 'name',
          message: 'Your name:',
          validate: expect.any(Function)
        },
        {
          type: 'input', 
          name: 'email',
          message: 'Your email:',
          validate: expect.any(Function)
        },
        {
          type: 'input',
          name: 'company',
          message: 'Company (optional):'
        }
      ]);
      
      expect(mockSubmitToQuallaaCRM).toHaveBeenCalledWith({
        ...userInput,
        createdAt: expect.any(Date)
      });
    });

    it('should handle CRM submission failure gracefully', async () => {
      // Arrange
      const userInput = {
        name: 'Alex Rodriguez',
        email: 'alex@growthcompany.io',
        company: 'Growth Company'
      };
      
      mockInquirer.prompt.mockResolvedValue(userInput);
      mockSubmitToQuallaaCRM.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await captureLeadInfo();

      // Assert
      expect(result).toEqual({
        ...userInput,
        createdAt: expect.any(Date)
      });
      
      // Should not throw error even if CRM submission fails
      expect(mockSubmitToQuallaaCRM).toHaveBeenCalled();
    });

    it('should capture lead without optional company', async () => {
      // Arrange
      const userInput = {
        name: 'Jordan Kim',
        email: 'jordan.kim@freelancer.dev',
        company: ''
      };
      
      mockInquirer.prompt.mockResolvedValue(userInput);

      // Act
      const result = await captureLeadInfo();

      // Assert
      expect(result.name).toBe('Jordan Kim');
      expect(result.email).toBe('jordan.kim@freelancer.dev');
      expect(result.company).toBe('');
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('validation', () => {
    it('should validate name input correctly', async () => {
      // Arrange
      mockInquirer.prompt.mockResolvedValue({
        name: 'Test User',
        email: 'test@example.com',
        company: 'Test Co'
      });

      await captureLeadInfo();
      
      // Get the validation function from the first call
      const nameValidation = mockInquirer.prompt.mock.calls[0][0][0].validate;

      // Act & Assert
      expect(nameValidation('John Doe')).toBe(true);
      expect(nameValidation('A')).toBe('Name must be at least 2 characters');
      expect(nameValidation('')).toBe('Name must be at least 2 characters');
    });

    it('should validate email input correctly', async () => {
      // Arrange  
      mockInquirer.prompt.mockResolvedValue({
        name: 'Test User',
        email: 'test@example.com', 
        company: 'Test Co'
      });

      await captureLeadInfo();
      
      // Get the email validation function
      const emailValidation = mockInquirer.prompt.mock.calls[0][0][1].validate;

      // Act & Assert
      expect(emailValidation('user@example.com')).toBe(true);
      expect(emailValidation('user.name+tag@domain.co.uk')).toBe(true);
      expect(emailValidation('invalid-email')).toBe('Invalid email address');
      expect(emailValidation('user@')).toBe('Invalid email address');
      expect(emailValidation('@domain.com')).toBe('Invalid email address');
    });
  });

  describe('edge cases', () => {
    it('should handle internationalized email addresses', async () => {
      // Arrange - Test with realistic international email
      const userInput = {
        name: 'Björn Andersson',
        email: 'björn@företag.se', 
        company: 'Swedish Tech AB'
      };
      
      mockInquirer.prompt.mockResolvedValue(userInput);

      // Act
      const result = await captureLeadInfo();

      // Assert
      expect(result.name).toBe('Björn Andersson');
      expect(result.email).toBe('björn@företag.se');
    });

    it('should handle very long company names', async () => {
      // Arrange
      const userInput = {
        name: 'Emma Thompson',
        email: 'emma@example.com',
        company: 'Very Long Company Name That Exceeds Normal Expectations International Holdings LLC'
      };
      
      mockInquirer.prompt.mockResolvedValue(userInput);

      // Act
      const result = await captureLeadInfo();

      // Assert
      expect(result.company).toBe(userInput.company);
      expect(result).toHaveProperty('createdAt');
    });
  });
});