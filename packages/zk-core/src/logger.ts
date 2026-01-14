// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

/**
 * Log level type
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logger configuration options
 */
export interface LoggerOptions {
  /**
   * Enable debug and info logs
   * @default false (silent by default, suitable for SDK)
   */
  enabled?: boolean;

  /**
   * Minimum log level to display
   * @default 'debug'
   */
  level?: LogLevel;
}

/**
 * Module-specific logger class
 * Each module creates its own independent instance
 */
export class Logger {
  private readonly module: string;
  private enabled: boolean;
  private level: LogLevel;

  constructor(module: string, options: LoggerOptions = {}) {
    this.module = module;
    this.enabled = options.enabled ?? false;
    this.level = options.level ?? 'debug';
  }

  /**
   * Configure logger instance
   */
  configure(options: LoggerOptions): void {
    if (options.enabled !== undefined) {
      this.enabled = options.enabled;
    }

    if (options.level !== undefined) {
      this.level = options.level;
    }
  }

  /**
   * Debug level log (only when enabled)
   */
  debug(...args: unknown[]): void {
    if (this.enabled && this.shouldLog('debug')) {
      console.log(`[${this.module}]`, ...args);
    }
  }

  /**
   * Info level log (only when enabled)
   */
  info(...args: unknown[]): void {
    if (this.enabled && this.shouldLog('info')) {
      console.log(`[${this.module}]`, ...args);
    }
  }

  /**
   * Warning log (respects level config)
   */
  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[${this.module}]`, ...args);
    }
  }

  /**
   * Error log (respects level config)
   */
  error(...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(`[${this.module}]`, ...args);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

    return levels.indexOf(level) >= levels.indexOf(this.level);
  }
}

/**
 * Usage examples:
 *
 * @example
 * ```ts
 * // SDK usage (disabled by default)
 * import { Logger } from '@kzero/zk-core';
 *
 * const log = new Logger('MySDKModule');
 * log.debug('This will not show');  // Silent by default
 * log.error('This will not show');  // Also silent by default
 * ```
 *
 * @example
 * ```ts
 * // App usage with environment detection
 * import { Logger } from '@kzero/zk-core';
 *
 * const isDev = import.meta.env.DEV;
 * const log = new Logger('MyAppModule', {
 *   enabled: isDev,
 *   level: isDev ? 'debug' : 'warn'
 * });
 *
 * log.debug('Debug info');     // Shows in dev only
 * log.info('Info message');     // Shows in dev only
 * log.warn('Warning');          // Shows always (respects level)
 * log.error('Error', error);    // Shows always (respects level)
 * ```
 *
 * @example
 * ```ts
 * // Runtime configuration
 * import { Logger } from '@kzero/zk-core';
 *
 * const log = new Logger('ConfigurableModule');
 *
 * // Enable later when needed
 * log.configure({ enabled: true });
 *
 * // Change log level
 * log.configure({ level: 'warn' });  // Only show warnings and errors
 * ```
 */
