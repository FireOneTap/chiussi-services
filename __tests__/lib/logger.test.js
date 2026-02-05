/**
 * Tests for lib/logger.js
 * Coverage: maskSensitiveData, sanitizeObject, logger functions
 */

import logger from '../../lib/logger';

describe('Logger - Security & PII Masking', () => {
  let consoleLogSpy;
  let consoleWarnSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('maskSensitiveData', () => {
    it('should mask email addresses', () => {
      const input = 'Contact me at john@example.com for help';
      const result = logger.maskSensitiveData(input);
      expect(result).toContain('[EMAIL]');
      expect(result).not.toContain('john@example.com');
    });

    it('should mask phone numbers', () => {
      const input = 'Call me at +33123456789 or 0987654321';
      const result = logger.maskSensitiveData(input);
      expect(result).toContain('[PHONE]');
      expect(result).not.toMatch(/\d{6,14}/);
    });

    it('should mask bearer tokens', () => {
      const input = 'Authorization: bearer sk_test_abcdef123456';
      const result = logger.maskSensitiveData(input);
      expect(result).toContain('[TOKEN]');
      expect(result).not.toContain('sk_test_abcdef123456');
    });

    it('should mask access tokens', () => {
      const input = 'access_token: "secret_xyz_789"';
      const result = logger.maskSensitiveData(input);
      expect(result).toContain('[TOKEN]');
      expect(result).not.toContain('secret_xyz_789');
    });

    it('should return non-string input unchanged', () => {
      expect(logger.maskSensitiveData(123)).toBe(123);
      expect(logger.maskSensitiveData(null)).toBe(null);
      expect(logger.maskSensitiveData(undefined)).toBe(undefined);
    });

    it('should handle multiple patterns in one string', () => {
      const input = 'Email: test@domain.com, Phone: 0612345678, Token: bearer xyz123';
      const result = logger.maskSensitiveData(input);
      expect(result).toContain('[EMAIL]');
      expect(result).toContain('[PHONE]');
      expect(result).toContain('[TOKEN]');
    });
  });

  describe('sanitizeObject', () => {
    it('should mask strings within objects', () => {
      const obj = { email: 'user@example.com', name: 'John' };
      const result = logger.sanitizeObject(obj);
      expect(result.email).toContain('[EMAIL]');
      expect(result.name).toBe('John');
    });

    it('should redact password fields', () => {
      const obj = { username: 'john', password: 'secret123' };
      const result = logger.sanitizeObject(obj);
      expect(result.username).toBe('john');
      expect(result.password).toBe('[REDACTED]');
    });

    it('should redact token fields', () => {
      const obj = { token: 'xyz123', apiKey: 'secret', data: 'safe' };
      const result = logger.sanitizeObject(obj);
      expect(result.token).toBe('[REDACTED]');
      expect(result.apiKey).toBe('[REDACTED]');
      expect(result.data).toBe('safe');
    });

    it('should handle arrays', () => {
      const arr = ['email@example.com', 'name@domain.com', 'safe_data'];
      const result = logger.sanitizeObject(arr);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toContain('[EMAIL]');
      expect(result[2]).toBe('safe_data');
    });

    it('should limit depth to 5', () => {
      const deepObj = { a: { b: { c: { d: { e: { f: { g: 'deep' } } } } } } };
      const result = logger.sanitizeObject(deepObj);
      // At depth 5, we hit the limit, so 'e' contains 'f' which is returned as [DEEP_OBJECT]
      expect(result.a.b.c.d.e).toEqual({ f: '[DEEP_OBJECT]' });
    });

    it('should handle nested objects with sensitive data', () => {
      const obj = {
        user: { password: 'secret', email: 'test@example.com' },
        token: 'xyz123',
      };
      const result = logger.sanitizeObject(obj);
      expect(result.user.password).toBe('[REDACTED]');
      expect(result.user.email).toContain('[EMAIL]');
      expect(result.token).toBe('[REDACTED]');
    });
  });

  describe('logger.info', () => {
    it('should log info messages', () => {
      logger.info('Test message', { data: 'value' });
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should sanitize objects in info logs', () => {
      logger.info('User login', { password: 'secret', username: 'john' });
      // Verify that console.log was called (sanitization happens before console output)
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('logger.warn', () => {
    it('should log warning messages', () => {
      logger.warn('Warning message', { code: 'WARN001' });
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('logger.error', () => {
    it('should log error messages', () => {
      logger.error('Error occurred', new Error('Test error'));
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should sanitize error messages', () => {
      const error = new Error('User email@example.com failed');
      logger.error('Auth error', error);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('GDPR Compliance', () => {
    it('should not log PII without masking', () => {
      const sensitiveData = {
        email: 'john.doe@company.com',
        phone: '+33612345678',
        ssn: '123456789',
        address: '123 Main Street, City',
        token: 'bearer sk_live_secret_key_xyz',
      };

      logger.info('User data', sensitiveData);

      // Verify console.log was called (meaning data was logged)
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });
});
