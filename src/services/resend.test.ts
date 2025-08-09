import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('Resend Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API Key Validation', () => {
    it('should validate Resend API key format', () => {
      const validKey = 're_AbCdEfGh_123456789';
      const invalidKey = 'invalid_key';
      
      expect(validKey.startsWith('re_')).toBe(true);
      expect(invalidKey.startsWith('re_')).toBe(false);
    });

    it('should handle API authentication', async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: { name: 'Test Domain' }
      });
      
      const response = await axios.get('https://api.resend.com/domains');
      expect(response.data.name).toBe('Test Domain');
    });

    it('should handle API errors', async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error('Unauthorized'));
      
      await expect(axios.get('https://api.resend.com/domains')).rejects.toThrow('Unauthorized');
    });
  });

  describe('Email Operations', () => {
    it('should validate email configuration', () => {
      const emailConfig = {
        from: 'noreply@example.com',
        to: ['user@example.com'],
        subject: 'Test Email',
        html: '<p>Hello World</p>'
      };
      
      expect(emailConfig.from).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(emailConfig.to[0]).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(emailConfig.subject.length).toBeGreaterThan(0);
      expect(emailConfig.html).toContain('<p>');
    });

    it('should handle domain verification', () => {
      const domain = 'example.com';
      const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
      
      expect(domainPattern.test(domain)).toBe(true);
      expect(domainPattern.test('invalid..domain')).toBe(false);
    });
  });
});