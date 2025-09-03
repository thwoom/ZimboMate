/**
 * Centralized logging service with environment-aware behavior
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: string;
  data?: unknown;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private constructor() {
    // Set log level based on environment
    if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
      this.logLevel = LogLevel.DEBUG;
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private addLog(level: LogLevel, message: string, context?: string, data?: any): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context,
      data
    };

    this.logs.push(entry);
    
    // Keep logs within limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output
    if (this.shouldLog(level)) {
      const prefix = context ? `[${context}]` : '';
      const logMessage = `${prefix} ${message}`;
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(logMessage, data);
          break;
        case LogLevel.INFO:
          console.info(logMessage, data);
          break;
        case LogLevel.WARN:
          console.warn(logMessage, data);
          break;
        case LogLevel.ERROR:
          console.error(logMessage, data);
          break;
      }
    }
  }

  debug(message: string, context?: string, data?: any): void {
    this.addLog(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, context?: string, data?: any): void {
    this.addLog(LogLevel.INFO, message, context, data);
  }

  warn(message: string, context?: string, data?: any): void {
    this.addLog(LogLevel.WARN, message, context, data);
  }

  error(message: string, context?: string, data?: any): void {
    this.addLog(LogLevel.ERROR, message, context, data);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
}

// Export singleton instance
export const logger = Logger.getInstance();