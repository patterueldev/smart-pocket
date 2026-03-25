/**
 * Logger Utility Wrapper
 * 
 * Wraps the shared logger from parent context or provides a simple implementation
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

class Logger {
  private static instance: Logger;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLog(level: LogLevel, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const entry: LogEntry = { level, message, timestamp, ...(context && { context }) };
    return JSON.stringify(entry);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.DEBUG === 'true') {
      console.log(this.formatLog('debug', message, context));
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.log(this.formatLog('info', message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(this.formatLog('warn', message, context));
  }

  error(message: string, context?: Record<string, unknown>): void {
    console.error(this.formatLog('error', message, context));
  }
}

export const logger = Logger.getInstance();
