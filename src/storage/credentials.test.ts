import { describe, it, expect, vi, beforeEach } from 'vitest';
import keytar from 'keytar';
import { saveCredentials, getCredentials, deleteCredentials, getAllCredentials, testCredentialStorage } from './credentials';
import { CredentialStorageError } from '../lib/errors/custom-errors';

// Mock keytar module
vi.mock('keytar');

describe('Credential Storage', () => {
  const mockKeytar = vi.mocked(keytar);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveCredentials', () => {
    it('should save credentials successfully', async () => {
      // Arrange
      const service = 'github';
      const credentials = { token: 'gh_test_token', username: 'testuser' };
      mockKeytar.setPassword.mockResolvedValue();

      // Act
      await saveCredentials(service, credentials);

      // Assert
      expect(mockKeytar.setPassword).toHaveBeenCalledWith(
        'quallaa-cli',
        'quallaa-cli-github',
        JSON.stringify(credentials)
      );
    });

    it('should throw CredentialStorageError when storage is unavailable', async () => {
      // Arrange
      const service = 'github';
      const credentials = { token: 'test_token' };
      const error = new Error('Keychain not available');
      mockKeytar.setPassword.mockRejectedValue(error);

      // Act & Assert
      await expect(saveCredentials(service, credentials))
        .rejects
        .toThrow(CredentialStorageError);
    });

    it('should throw CredentialStorageError for permission denied', async () => {
      // Arrange
      const service = 'vercel';
      const credentials = { token: 'vercel_token' };
      const error = new Error('access denied');
      mockKeytar.setPassword.mockRejectedValue(error);

      // Act & Assert
      await expect(saveCredentials(service, credentials))
        .rejects
        .toThrow('Permission denied accessing credential storage');
    });
  });

  describe('getCredentials', () => {
    it('should retrieve and parse credentials successfully', async () => {
      // Arrange
      const service = 'supabase';
      const expectedCredentials = { 
        accessToken: 'sb_token',
        projectRef: 'abc123',
        anonKey: 'anon_key' 
      };
      mockKeytar.getPassword.mockResolvedValue(JSON.stringify(expectedCredentials));

      // Act
      const result = await getCredentials(service);

      // Assert
      expect(result).toEqual(expectedCredentials);
      expect(mockKeytar.getPassword).toHaveBeenCalledWith(
        'quallaa-cli',
        'quallaa-cli-supabase'
      );
    });

    it('should return null when credentials do not exist', async () => {
      // Arrange
      const service = 'resend';
      mockKeytar.getPassword.mockResolvedValue(null);

      // Act
      const result = await getCredentials(service);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle corrupt credential data gracefully', async () => {
      // Arrange
      const service = 'typesense';
      const corruptData = 'invalid-json-data';
      mockKeytar.getPassword.mockResolvedValue(corruptData);
      mockKeytar.deletePassword.mockResolvedValue(true);

      // Act
      const result = await getCredentials(service);

      // Assert
      expect(result).toBeNull();
      expect(mockKeytar.deletePassword).toHaveBeenCalledWith(
        'quallaa-cli',
        'quallaa-cli-typesense'
      );
    });

    it('should handle keychain unavailability gracefully', async () => {
      // Arrange
      const service = 'github';
      const error = new Error('Keychain not available');
      mockKeytar.getPassword.mockRejectedValue(error);

      // Act
      const result = await getCredentials(service);

      // Assert
      expect(result).toBeNull();
      // Should not throw error, just warn
    });
  });

  describe('deleteCredentials', () => {
    it('should delete credentials successfully', async () => {
      // Arrange
      const service = 'github';
      mockKeytar.deletePassword.mockResolvedValue(true);

      // Act
      const result = await deleteCredentials(service);

      // Assert
      expect(result).toBe(true);
      expect(mockKeytar.deletePassword).toHaveBeenCalledWith(
        'quallaa-cli',
        'quallaa-cli-github'
      );
    });

    it('should return true when credential does not exist', async () => {
      // Arrange
      const service = 'vercel';
      const error = new Error('not found');
      mockKeytar.deletePassword.mockRejectedValue(error);

      // Act
      const result = await deleteCredentials(service);

      // Assert
      expect(result).toBe(true);
    });

    it('should throw CredentialStorageError for other errors', async () => {
      // Arrange
      const service = 'supabase';
      const error = new Error('Permission denied');
      mockKeytar.deletePassword.mockRejectedValue(error);

      // Act & Assert
      await expect(deleteCredentials(service))
        .rejects
        .toThrow(CredentialStorageError);
    });
  });

  describe('getAllCredentials', () => {
    it('should retrieve all available credentials', async () => {
      // Arrange
      const githubCreds = { token: 'gh_token' };
      const vercelCreds = { token: 'vc_token' };
      
      mockKeytar.getPassword
        .mockImplementation(async (service, account) => {
          if (account === 'quallaa-cli-github') {
            return JSON.stringify(githubCreds);
          }
          if (account === 'quallaa-cli-vercel') {
            return JSON.stringify(vercelCreds);
          }
          return null;
        });

      // Act
      const result = await getAllCredentials();

      // Assert
      expect(result).toEqual({
        github: githubCreds,
        vercel: vercelCreds
      });
    });

    it('should continue with other services if one fails', async () => {
      // Arrange
      const githubCreds = { token: 'gh_token' };
      
      mockKeytar.getPassword
        .mockImplementation(async (service, account) => {
          if (account === 'quallaa-cli-github') {
            return JSON.stringify(githubCreds);
          }
          if (account === 'quallaa-cli-vercel') {
            throw new Error('Service error');
          }
          return null;
        });

      // Act
      const result = await getAllCredentials();

      // Assert
      expect(result).toEqual({
        github: githubCreds
      });
    });
  });

  describe('testCredentialStorage', () => {
    it('should return true for working credential storage', async () => {
      // Arrange
      const testData = { test: 'data' };
      mockKeytar.setPassword.mockResolvedValue();
      mockKeytar.getPassword.mockResolvedValue(JSON.stringify(testData));
      mockKeytar.deletePassword.mockResolvedValue(true);

      // Act
      const result = await testCredentialStorage();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when storage operations fail', async () => {
      // Arrange
      mockKeytar.setPassword.mockRejectedValue(new Error('Storage error'));

      // Act
      const result = await testCredentialStorage();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when retrieved data is invalid', async () => {
      // Arrange
      mockKeytar.setPassword.mockResolvedValue();
      mockKeytar.getPassword.mockResolvedValue(JSON.stringify({ test: 'wrong' }));

      // Act
      const result = await testCredentialStorage();

      // Assert
      expect(result).toBe(false);
    });
  });
});