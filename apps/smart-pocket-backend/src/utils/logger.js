const config = require('../config/env');

class Logger {
  log(message, data = null) {
    console.log(`[LOG] ${message}`, data || '');
  }

  error(message, error = null) {
    console.error(`[ERROR] ${message}`, error || '');
  }

  warn(message, data = null) {
    console.warn(`[WARN] ${message}`, data || '');
  }

  info(message, data = null) {
    console.info(`[INFO] ${message}`, data || '');
  }

  debug(message, data = null) {
    if (config.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }
}

module.exports = new Logger();
