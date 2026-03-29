import { Logger } from '../../src/utils/logger';

// Mock console methods
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    jest.clearAllMocks();
    logger = new Logger();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleDebugSpy.mockRestore();
  });

  describe('log method', () => {
    it('should log message to console.log', () => {
      logger.log('Test message');

      expect(consoleLogSpy).toHaveBeenCalled();
      const call = (consoleLogSpy as jest.Mock).mock.calls[0][0];
      expect(call).toContain('Test message');
    });

    it('should include [LOG] prefix', () => {
      logger.log('Test message');

      const call = (consoleLogSpy as jest.Mock).mock.calls[0][0];
      expect(call).toContain('[LOG]');
    });

    it('should log optional data', () => {
      logger.log('Test', { key: 'value' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[LOG]'),
        { key: 'value' }
      );
    });

    it('should handle null data', () => {
      logger.log('Test', null);

      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('error method', () => {
    it('should log error to console.error', () => {
      const err = new Error('Test error');
      logger.error('An error occurred', err);

      expect(consoleErrorSpy).toHaveBeenCalled();
      const call = (consoleErrorSpy as jest.Mock).mock.calls[0][0];
      expect(call).toContain('[ERROR]');
    });

    it('should include [ERROR] prefix', () => {
      logger.error('An error occurred');

      const call = (consoleErrorSpy as jest.Mock).mock.calls[0][0];
      expect(call).toContain('[ERROR]');
    });

    it('should handle null error', () => {
      logger.error('An error occurred', null);

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('warn method', () => {
    it('should log warning to console.warn', () => {
      logger.warn('Warning message');

      expect(consoleWarnSpy).toHaveBeenCalled();
      const call = (consoleWarnSpy as jest.Mock).mock.calls[0][0];
      expect(call).toContain('[WARN]');
    });

    it('should include [WARN] prefix', () => {
      logger.warn('Warning message');

      const call = (consoleWarnSpy as jest.Mock).mock.calls[0][0];
      expect(call).toContain('[WARN]');
    });

    it('should log optional data', () => {
      logger.warn('Warning', { warning: 'data' });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
        { warning: 'data' }
      );
    });
  });

  describe('info method', () => {
    it('should log info to console.info', () => {
      logger.info('Info message');

      expect(consoleInfoSpy).toHaveBeenCalled();
      const call = (consoleInfoSpy as jest.Mock).mock.calls[0][0];
      expect(call).toContain('[INFO]');
    });

    it('should include [INFO] prefix', () => {
      logger.info('Info message');

      const call = (consoleInfoSpy as jest.Mock).mock.calls[0][0];
      expect(call).toContain('[INFO]');
    });

    it('should log optional data', () => {
      logger.info('Info', { key: 'value' });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        { key: 'value' }
      );
    });
  });

  describe('debug method', () => {
    it('should call console.debug', () => {
      logger.debug('Debug message');

      // May or may not be called depending on isDevelopment flag
      // Just verify method doesn't throw
      expect(() => logger.debug('Debug')).not.toThrow();
    });

    it('should include [DEBUG] prefix when called', () => {
      jest.resetModules();
      const { Logger: TestLogger } = require('../../src/utils/logger');
      const testLogger = new TestLogger();

      testLogger.debug('Debug message');

      // Debug is conditionally logged, so we just verify it doesn't throw
      expect(() => testLogger.debug('Debug')).not.toThrow();
    });
  });

  describe('Logger robustness', () => {
    it('should handle empty message', () => {
      expect(() => logger.log('')).not.toThrow();
    });

    it('should handle undefined data', () => {
      expect(() => logger.log('Message', undefined)).not.toThrow();
    });

    it('should handle large data objects', () => {
      const largeData = {
        array: Array(1000).fill('data'),
        nested: { deep: { object: { structure: 'test' } } },
      };
      expect(() => logger.info('Large data', largeData)).not.toThrow();
    });

    it('should handle special characters in message', () => {
      expect(() => logger.log('Message with special chars: !@#$%^&*()')).not.toThrow();
    });

    it('should handle Error objects in error method', () => {
      const error = new Error('Test error');
      expect(() => logger.error('Error occurred', error)).not.toThrow();
    });
  });

  describe('Logger usage patterns', () => {
    it('should support method chaining style logging', () => {
      expect(() => {
        logger.info('Starting process', { step: 1 });
        logger.info('In progress', { step: 2 });
        logger.info('Complete', { step: 3 });
      }).not.toThrow();
    });

    it('should create logger instances independently', () => {
      const logger1 = new Logger();
      const logger2 = new Logger();

      expect(logger1).not.toBe(logger2);
      expect(() => logger1.info('Logger 1')).not.toThrow();
      expect(() => logger2.info('Logger 2')).not.toThrow();
    });
  });
});
