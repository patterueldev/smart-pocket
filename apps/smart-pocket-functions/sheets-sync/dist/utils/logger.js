"use strict";
/**
 * Logger Utility Wrapper
 *
 * Wraps the shared logger from parent context or provides a simple implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
class Logger {
    constructor() { }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    formatLog(level, message, context) {
        const timestamp = new Date().toISOString();
        const entry = { level, message, timestamp, ...(context && { context }) };
        return JSON.stringify(entry);
    }
    debug(message, context) {
        if (process.env.DEBUG === 'true') {
            console.log(this.formatLog('debug', message, context));
        }
    }
    info(message, context) {
        console.log(this.formatLog('info', message, context));
    }
    warn(message, context) {
        console.warn(this.formatLog('warn', message, context));
    }
    error(message, context) {
        console.error(this.formatLog('error', message, context));
    }
}
exports.logger = Logger.getInstance();
//# sourceMappingURL=logger.js.map