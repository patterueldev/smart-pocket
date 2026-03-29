/**
 * Tests for setup form validation utilities
 * Tests pure validation functions without React hooks
 */

import {
  validateApiKey,
  validateBaseUrl,
  validateUrlFormat,
  ensureProtocol,
  validateForm,
  ValidationError,
} from '@/utils/setupFormValidation';

describe('Setup Form Validation Utils', () => {
  describe('validateApiKey', () => {
    describe('Valid API Keys', () => {
      it('should accept valid API key', () => {
        const result = validateApiKey('my-api-key-123');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should accept API key with special characters', () => {
        const result = validateApiKey('api-key_with.special$chars');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should accept long API key', () => {
        const result = validateApiKey('a'.repeat(100));
        expect(result.isValid).toBe(true);
      });

      it('should accept API key with numbers', () => {
        const result = validateApiKey('key12345');
        expect(result.isValid).toBe(true);
      });

      it('should accept API key with uppercase', () => {
        const result = validateApiKey('MY-API-KEY');
        expect(result.isValid).toBe(true);
      });
    });

    describe('Invalid API Keys', () => {
      it('should reject empty string', () => {
        const result = validateApiKey('');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Please enter an API key');
      });

      it('should reject whitespace only', () => {
        const result = validateApiKey('   ');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Please enter an API key');
      });

      it('should reject tab characters only', () => {
        const result = validateApiKey('\t\t\t');
        expect(result.isValid).toBe(false);
      });

      it('should reject newline only', () => {
        const result = validateApiKey('\n');
        expect(result.isValid).toBe(false);
      });

      it('should trim whitespace before validation', () => {
        const result = validateApiKey('  valid-key  ');
        expect(result.isValid).toBe(true);
      });
    });

    describe('Return Value Type', () => {
      it('should return object with isValid and error properties', () => {
        const result = validateApiKey('test');
        expect(result).toHaveProperty('isValid');
        expect(result).toHaveProperty('error');
      });

      it('should return ValidationError type', () => {
        const result: ValidationError = validateApiKey('test');
        expect(typeof result.isValid).toBe('boolean');
        expect(result.error === null || typeof result.error === 'string').toBe(true);
      });
    });
  });

  describe('validateBaseUrl', () => {
    describe('Valid URLs', () => {
      it('should accept valid URL', () => {
        const result = validateBaseUrl('http://localhost:3000');
        expect(result.isValid).toBe(true);
      });

      it('should accept https URL', () => {
        const result = validateBaseUrl('https://api.example.com');
        expect(result.isValid).toBe(true);
      });

      it('should accept URL without protocol', () => {
        const result = validateBaseUrl('localhost:3000');
        expect(result.isValid).toBe(true);
      });

      it('should accept IP address', () => {
        const result = validateBaseUrl('192.168.1.100:3000');
        expect(result.isValid).toBe(true);
      });

      it('should accept domain with path', () => {
        const result = validateBaseUrl('api.example.com/v1');
        expect(result.isValid).toBe(true);
      });
    });

    describe('Invalid URLs', () => {
      it('should reject empty string', () => {
        const result = validateBaseUrl('');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Please enter a server URL');
      });

      it('should reject whitespace only', () => {
        const result = validateBaseUrl('   ');
        expect(result.isValid).toBe(false);
      });

      it('should trim whitespace before validation', () => {
        const result = validateBaseUrl('  http://localhost:3000  ');
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('validateUrlFormat', () => {
    describe('Valid URL Formats', () => {
      it('should accept valid http URL', () => {
        const result = validateUrlFormat('http://localhost:3000');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should accept valid https URL', () => {
        const result = validateUrlFormat('https://api.example.com');
        expect(result.isValid).toBe(true);
      });

      it('should accept domain without protocol and add http', () => {
        const result = validateUrlFormat('localhost:3000');
        expect(result.isValid).toBe(true);
      });

      it('should accept simple domain', () => {
        const result = validateUrlFormat('example.com');
        expect(result.isValid).toBe(true);
      });

      it('should accept IP address', () => {
        const result = validateUrlFormat('192.168.1.1:8080');
        expect(result.isValid).toBe(true);
      });

      it('should accept localhost', () => {
        const result = validateUrlFormat('localhost');
        expect(result.isValid).toBe(true);
      });

      it('should accept port number', () => {
        const result = validateUrlFormat('http://localhost:3000');
        expect(result.isValid).toBe(true);
      });
    });

    describe('Invalid URL Formats', () => {
      it('should reject invalid format', () => {
        const result = validateUrlFormat('not a valid url');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Please enter a valid server URL');
      });

      it('should reject malformed URL', () => {
        const result = validateUrlFormat('http://');
        expect(result.isValid).toBe(false);
      });

      it('should reject just protocol', () => {
        const result = validateUrlFormat('http://');
        expect(result.isValid).toBe(false);
      });

      it('should handle whitespace padding', () => {
        const result = validateUrlFormat('  http://localhost:3000  ');
        expect(result.isValid).toBe(true);
      });
    });

    describe('Protocol Handling', () => {
      it('should accept URL already with http protocol', () => {
        const result = validateUrlFormat('http://example.com');
        expect(result.isValid).toBe(true);
      });

      it('should accept URL already with https protocol', () => {
        const result = validateUrlFormat('https://example.com');
        expect(result.isValid).toBe(true);
      });

      it('should add http protocol to URL without it', () => {
        const result = validateUrlFormat('example.com');
        expect(result.isValid).toBe(true);
      });

      it('should handle localhost without protocol', () => {
        const result = validateUrlFormat('localhost:3000');
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('ensureProtocol', () => {
    it('should return URL with http protocol unchanged', () => {
      const result = ensureProtocol('http://example.com');
      expect(result).toBe('http://example.com');
    });

    it('should return URL with https protocol unchanged', () => {
      const result = ensureProtocol('https://example.com');
      expect(result).toBe('https://example.com');
    });

    it('should add http protocol to URL without it', () => {
      const result = ensureProtocol('example.com');
      expect(result).toBe('http://example.com');
    });

    it('should add http protocol to localhost', () => {
      const result = ensureProtocol('localhost:3000');
      expect(result).toBe('http://localhost:3000');
    });

    it('should add http protocol to IP address', () => {
      const result = ensureProtocol('192.168.1.1:8080');
      expect(result).toBe('http://192.168.1.1:8080');
    });

    it('should trim whitespace', () => {
      const result = ensureProtocol('  example.com  ');
      expect(result).toBe('http://example.com');
    });

    it('should not double-add protocol', () => {
      const result = ensureProtocol('http://http://example.com');
      expect(result).toBe('http://http://example.com');
    });
  });

  describe('validateForm', () => {
    describe('All Valid', () => {
      it('should validate when all fields are valid', () => {
        const result = validateForm('api-key-123', 'http://localhost:3000');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should validate with https URL', () => {
        const result = validateForm('my-key', 'https://api.example.com');
        expect(result.isValid).toBe(true);
      });

      it('should validate with URL without protocol', () => {
        const result = validateForm('key', 'localhost:3000');
        expect(result.isValid).toBe(true);
      });

      it('should validate with whitespace around values', () => {
        const result = validateForm('  key  ', '  http://example.com  ');
        expect(result.isValid).toBe(true);
      });
    });

    describe('API Key Invalid', () => {
      it('should fail when API key is empty', () => {
        const result = validateForm('', 'http://localhost:3000');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Please enter an API key');
      });

      it('should fail when API key is whitespace', () => {
        const result = validateForm('   ', 'http://localhost:3000');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('API key');
      });
    });

    describe('Base URL Invalid', () => {
      it('should fail when base URL is empty', () => {
        const result = validateForm('my-key', '');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Please enter a server URL');
      });

      it('should fail when base URL is whitespace', () => {
        const result = validateForm('my-key', '   ');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('server URL');
      });
    });

    describe('URL Format Invalid', () => {
      it('should fail with invalid URL format', () => {
        const result = validateForm('my-key', 'not a valid url !@#$');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Please enter a valid server URL');
      });

      it('should fail with protocol-only URL', () => {
        const result = validateForm('my-key', 'http://');
        expect(result.isValid).toBe(false);
      });
    });

    describe('Validation Order', () => {
      it('should check API key first', () => {
        const result = validateForm('', 'invalid-url');
        expect(result.error).toContain('API key');
      });

      it('should check URL only if API key is valid', () => {
        const result = validateForm('valid-key', 'invalid-url-format-$$$');
        expect(result.error).toContain('valid server URL');
      });
    });

    describe('Error Messages', () => {
      it('should provide clear error message for empty API key', () => {
        const result = validateForm('', 'http://example.com');
        expect(result.error).toBe('Please enter an API key');
      });

      it('should provide clear error message for empty URL', () => {
        const result = validateForm('key', '');
        expect(result.error).toBe('Please enter a server URL');
      });

      it('should provide clear error message for invalid URL format', () => {
        const result = validateForm('key', 'invalid!!!');
        expect(result.error).toBe('Please enter a valid server URL');
      });
    });

    describe('Return Value', () => {
      it('should always return ValidationError object', () => {
        const result = validateForm('key', 'http://example.com');
        expect(result).toHaveProperty('isValid');
        expect(result).toHaveProperty('error');
      });

      it('should have correct types', () => {
        const result = validateForm('key', 'http://example.com');
        expect(typeof result.isValid).toBe('boolean');
        expect(result.error === null || typeof result.error === 'string').toBe(true);
      });
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle very long strings', () => {
      const longKey = 'k'.repeat(1000);
      const longUrl = 'http://example.com/' + 'path/'.repeat(100);
      const result = validateForm(longKey, longUrl);
      expect(result.isValid).toBe(true);
    });

    it('should handle unicode characters', () => {
      const result = validateForm('キー', 'http://example.com');
      expect(result.isValid).toBe(true);
    });

    it('should handle special characters in API key', () => {
      const result = validateForm('key!@#$%^&*()', 'http://example.com');
      expect(result.isValid).toBe(true);
    });

    it('should handle port numbers', () => {
      const result = validateForm('key', 'localhost:9999');
      expect(result.isValid).toBe(true);
    });

    it('should handle complex domains', () => {
      const result = validateForm('key', 'api.v2.staging.example.co.uk');
      expect(result.isValid).toBe(true);
    });

    it('should handle paths in URL', () => {
      const result = validateForm('key', 'http://example.com/api/v1/setup');
      expect(result.isValid).toBe(true);
    });
  });
});
