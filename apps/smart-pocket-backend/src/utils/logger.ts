import config from '../config/env';

interface LogData {
  [key: string]: any;
}

class Logger {
  log(message: string, data?: LogData | null): void {
    console.log(`[LOG] ${message}`, data || '');
  }

  error(message: string, error?: Error | null): void {
    console.error(`[ERROR] ${message}`, error || '');
  }

  warn(message: string, data?: LogData | null): void {
    console.warn(`[WARN] ${message}`, data || '');
  }

  info(message: string, data?: LogData | null): void {
    console.info(`[INFO] ${message}`, data || '');
  }

  debug(message: string, data?: LogData | null): void {
    if (config.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }
}

export default new Logger();
