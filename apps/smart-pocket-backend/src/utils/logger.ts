import config from '../config/env';

interface LogData {
  [key: string]: string | number | boolean | object;
}

class Logger {
  log(message: string, data?: LogData | null): void {
    // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }
}

export default Logger;
export { Logger };
