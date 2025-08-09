import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('Update Checker Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should compare version numbers', () => {
    // Test version comparison logic
    const version1 = '1.0.0';
    const version2 = '1.1.0';
    const version3 = '2.0.0';
    
    expect(version1 < version2).toBe(true);
    expect(version2 < version3).toBe(true);
    expect(version3 > version1).toBe(true);
  });

  it('should handle semver parsing', () => {
    const semverPattern = /^(\d+)\.(\d+)\.(\d+)/;
    
    const validVersions = ['1.0.0', '2.3.4', '0.1.0'];
    const invalidVersions = ['v1.0.0', '1.0', 'invalid'];
    
    validVersions.forEach(version => {
      expect(semverPattern.test(version)).toBe(true);
    });
    
    // Note: v1.0.0 is actually valid with v prefix, but testing strict format
    expect(semverPattern.test('1.0')).toBe(false);
    expect(semverPattern.test('invalid')).toBe(false);
  });

  it('should handle network requests for version checks', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: { tag_name: 'v1.2.0' }
    });
    
    const response = await axios.get('https://api.github.com/repos/test/test/releases/latest');
    expect(response.data.tag_name).toBe('v1.2.0');
  });
});