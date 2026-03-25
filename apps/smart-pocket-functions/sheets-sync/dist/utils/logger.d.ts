/**
 * Logger Utility Wrapper
 *
 * Wraps the shared logger from parent context or provides a simple implementation
 */
declare class Logger {
    private static instance;
    private constructor();
    static getInstance(): Logger;
    private formatLog;
    debug(message: string, context?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, context?: Record<string, unknown>): void;
}
export declare const logger: Logger;
export {};
//# sourceMappingURL=logger.d.ts.map