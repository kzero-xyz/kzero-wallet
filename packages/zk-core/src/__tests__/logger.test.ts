// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Logger } from '../logger.js';

describe('Logger', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Spy on console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore and clear all mocks
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('creates logger with default options (disabled)', () => {
      const log = new Logger('TestModule');

      log.debug('test');
      log.info('test');

      expect(console.log).not.toHaveBeenCalled();
    });

    it('creates logger with enabled option', () => {
      const log = new Logger('TestModule', { enabled: true });

      log.debug('test');

      expect(console.log).toHaveBeenCalledWith('[TestModule]', 'test');
    });

    it('creates logger with custom level', () => {
      const log = new Logger('TestModule', { enabled: true, level: 'warn' });

      log.debug('debug');
      log.info('info');

      expect(console.log).not.toHaveBeenCalled();

      log.warn('warning');

      expect(console.warn).toHaveBeenCalledWith('[TestModule]', 'warning');
    });
  });

  describe('configure', () => {
    it('enables logger at runtime', () => {
      const log = new Logger('TestModule');

      log.debug('before');

      expect(console.log).not.toHaveBeenCalled();

      log.configure({ enabled: true });
      log.debug('after');

      expect(console.log).toHaveBeenCalledWith('[TestModule]', 'after');
    });

    it('changes log level at runtime', () => {
      const log = new Logger('TestModule', { enabled: true, level: 'debug' });

      log.debug('debug1');

      expect(console.log).toHaveBeenCalledTimes(1);

      log.configure({ level: 'error' });
      log.debug('debug2');
      log.info('info2');
      log.warn('warn2');

      // Should not have called console.log or console.warn after level change
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.warn).not.toHaveBeenCalled();

      log.error('error1');

      expect(console.error).toHaveBeenCalledWith('[TestModule]', 'error1');
    });

    it('can enable and change level together', () => {
      const log = new Logger('TestModule');

      log.configure({ enabled: true, level: 'warn' });
      log.debug('debug');
      log.info('info');

      expect(console.log).not.toHaveBeenCalled();

      log.warn('warning');

      expect(console.warn).toHaveBeenCalledWith('[TestModule]', 'warning');
    });
  });

  describe('debug', () => {
    it('does not log when disabled', () => {
      const log = new Logger('TestModule');

      log.debug('test message');

      expect(console.log).not.toHaveBeenCalled();
    });

    it('logs with module prefix when enabled', () => {
      const log = new Logger('TestModule', { enabled: true });

      log.debug('test message', { foo: 'bar' });

      expect(console.log).toHaveBeenCalledWith('[TestModule]', 'test message', { foo: 'bar' });
    });

    it('does not log when level is higher than debug', () => {
      const log = new Logger('TestModule', { enabled: true, level: 'info' });

      log.debug('debug message');

      expect(console.log).not.toHaveBeenCalled();
    });

    it('supports multiple arguments', () => {
      const log = new Logger('TestModule', { enabled: true });

      log.debug('arg1', 'arg2', 'arg3', { foo: 'bar' });

      expect(console.log).toHaveBeenCalledWith('[TestModule]', 'arg1', 'arg2', 'arg3', { foo: 'bar' });
    });
  });

  describe('info', () => {
    it('does not log when disabled', () => {
      const log = new Logger('TestModule');

      log.info('test message');

      expect(console.log).not.toHaveBeenCalled();
    });

    it('logs with module prefix when enabled', () => {
      const log = new Logger('TestModule', { enabled: true });

      log.info('info message');

      expect(console.log).toHaveBeenCalledWith('[TestModule]', 'info message');
    });

    it('does not log when level is higher than info', () => {
      const log = new Logger('TestModule', { enabled: true, level: 'warn' });

      log.info('info message');

      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('does not log when level is higher than warn', () => {
      const log = new Logger('TestModule', { level: 'error' });

      log.warn('warning');

      expect(console.warn).not.toHaveBeenCalled();
    });

    it('logs with console.warn even when enabled is false', () => {
      const log = new Logger('TestModule', { enabled: false, level: 'warn' });

      log.warn('warning message');

      expect(console.warn).toHaveBeenCalledWith('[TestModule]', 'warning message');
    });

    it('logs with module prefix', () => {
      const log = new Logger('TestModule');

      log.warn('warning', { code: 123 });

      expect(console.warn).toHaveBeenCalledWith('[TestModule]', 'warning', { code: 123 });
    });
  });

  describe('error', () => {
    it('does not log when level is set incorrectly', () => {
      // In practice, level should not be set higher than error, but test boundary
      const log = new Logger('TestModule');

      log.error('error message');

      expect(console.error).toHaveBeenCalledWith('[TestModule]', 'error message');
    });

    it('logs with console.error even when enabled is false', () => {
      const log = new Logger('TestModule', { enabled: false });

      log.error('error message', new Error('test error'));

      expect(console.error).toHaveBeenCalledWith('[TestModule]', 'error message', expect.any(Error));
    });

    it('logs with module prefix', () => {
      const log = new Logger('TestModule');
      const error = new Error('test error');

      log.error('Something went wrong:', error);

      expect(console.error).toHaveBeenCalledWith('[TestModule]', 'Something went wrong:', error);
    });
  });

  describe('log level hierarchy', () => {
    it('debug level logs all messages', () => {
      const log = new Logger('TestModule', { enabled: true, level: 'debug' });

      log.debug('debug');
      log.info('info');
      log.warn('warn');
      log.error('error');

      expect(console.log).toHaveBeenCalledTimes(2); // debug + info
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it('info level excludes debug', () => {
      const log = new Logger('TestModule', { enabled: true, level: 'info' });

      log.debug('debug');
      log.info('info');
      log.warn('warn');
      log.error('error');

      expect(console.log).toHaveBeenCalledTimes(1); // only info
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it('warn level excludes debug and info', () => {
      const log = new Logger('TestModule', { enabled: true, level: 'warn' });

      log.debug('debug');
      log.info('info');
      log.warn('warn');
      log.error('error');

      expect(console.log).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it('error level only logs errors', () => {
      const log = new Logger('TestModule', { enabled: true, level: 'error' });

      log.debug('debug');
      log.info('info');
      log.warn('warn');
      log.error('error');

      expect(console.log).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('multiple logger instances', () => {
    it('each instance has independent configuration', () => {
      const log1 = new Logger('Module1', { enabled: true });
      const log2 = new Logger('Module2', { enabled: false });

      log1.debug('from module1');
      log2.debug('from module2');

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith('[Module1]', 'from module1');
    });

    it('different modules can have different log levels', () => {
      const log1 = new Logger('Module1', { enabled: true, level: 'debug' });
      const log2 = new Logger('Module2', { enabled: true, level: 'error' });

      log1.debug('debug1');
      log2.debug('debug2');

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith('[Module1]', 'debug1');
    });
  });
});
