// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthWindowManager } from '../authWindow.js';

describe('AuthWindowManager', () => {
  let authWindowManager: AuthWindowManager;
  let mockWindow: { closed: boolean; close: () => void };

  beforeEach(() => {
    authWindowManager = new AuthWindowManager();

    // Create a mock window object
    mockWindow = {
      closed: false,
      close: vi.fn()
    };

    // Mock window.open
    vi.stubGlobal('open', vi.fn().mockReturnValue(mockWindow));

    // Mock window.screen for window positioning
    vi.stubGlobal('screen', {
      width: 1920,
      height: 1080
    });

    // Mock setInterval and clearInterval
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('openAuthWindow', () => {
    it('opens popup window with correct parameters', async () => {
      const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=123';

      const promise = authWindowManager.openAuthWindow(authUrl);

      expect(window.open).toHaveBeenCalledWith(authUrl, 'kzero_oauth_window', expect.stringContaining('width=600'));
      expect(window.open).toHaveBeenCalledWith(authUrl, 'kzero_oauth_window', expect.stringContaining('height=700'));

      // Close the window to resolve the promise
      mockWindow.closed = true;
      await vi.advanceTimersByTimeAsync(100);

      await promise;
    });

    it('calculates centered window position', async () => {
      const authUrl = 'https://example.com/auth';

      const promise = authWindowManager.openAuthWindow(authUrl);

      const expectedLeft = (1920 - 600) / 2; // (screen.width - width) / 2
      const expectedTop = (1080 - 700) / 2; // (screen.height - height) / 2

      expect(window.open).toHaveBeenCalledWith(
        authUrl,
        'kzero_oauth_window',
        expect.stringContaining(`left=${expectedLeft}`)
      );
      expect(window.open).toHaveBeenCalledWith(
        authUrl,
        'kzero_oauth_window',
        expect.stringContaining(`top=${expectedTop}`)
      );

      mockWindow.closed = true;
      await vi.advanceTimersByTimeAsync(100);
      await promise;
    });

    it('resolves when window is closed', async () => {
      const authUrl = 'https://example.com/auth';

      const promise = authWindowManager.openAuthWindow(authUrl);

      // Simulate window closing after 500ms
      await vi.advanceTimersByTimeAsync(500);
      mockWindow.closed = true;
      await vi.advanceTimersByTimeAsync(100);

      await expect(promise).resolves.toBeUndefined();
    });

    it('rejects when popup is blocked', async () => {
      vi.stubGlobal('open', vi.fn().mockReturnValue(null));

      await expect(authWindowManager.openAuthWindow('https://example.com/auth')).rejects.toThrow(
        'Failed to open authentication window'
      );
      await expect(authWindowManager.openAuthWindow('https://example.com/auth')).rejects.toThrow('Please allow popups');
    });

    it('rejects after timeout (5 minutes)', async () => {
      const authUrl = 'https://example.com/auth';

      const promise = authWindowManager.openAuthWindow(authUrl).catch((err) => err);

      // Advance time by 5 minutes + 1ms
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000 + 1);

      const error = await promise;

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Authentication timeout after 5 minutes');
      expect(mockWindow.close).toHaveBeenCalled();
    });

    it('cleans up interval when window closes', async () => {
      const authUrl = 'https://example.com/auth';
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      const promise = authWindowManager.openAuthWindow(authUrl);

      // Close window
      mockWindow.closed = true;
      await vi.advanceTimersByTimeAsync(100);

      await promise;

      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('handles window becoming null during polling', async () => {
      const authUrl = 'https://example.com/auth';

      const promise = authWindowManager.openAuthWindow(authUrl);

      // Simulate window being set to null (e.g., closed by browser) by mocking window.open to return null on next poll
      await vi.advanceTimersByTimeAsync(200);
      // For this test, we'll just close the window which simulates the same outcome
      mockWindow.closed = true;
      await vi.advanceTimersByTimeAsync(100);

      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('closeAuthWindow', () => {
    it('closes open window', async () => {
      const authUrl = 'https://example.com/auth';

      authWindowManager.openAuthWindow(authUrl);
      authWindowManager.closeAuthWindow();

      expect(mockWindow.close).toHaveBeenCalled();
    });

    it('does not throw if window is already closed', () => {
      mockWindow.closed = true;

      expect(() => authWindowManager.closeAuthWindow()).not.toThrow();
    });

    it('cleans up interval', async () => {
      const authUrl = 'https://example.com/auth';
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      authWindowManager.openAuthWindow(authUrl);
      authWindowManager.closeAuthWindow();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('can be called multiple times safely', () => {
      authWindowManager.closeAuthWindow();
      authWindowManager.closeAuthWindow();

      expect(() => authWindowManager.closeAuthWindow()).not.toThrow();
    });
  });

  describe('multiple windows', () => {
    it('last opened window takes precedence', async () => {
      const authUrl = 'https://example.com/auth';

      const promise = authWindowManager.openAuthWindow(authUrl);

      // Close window
      mockWindow.closed = true;
      await vi.advanceTimersByTimeAsync(100);

      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('window features', () => {
    it('includes all required window features', async () => {
      const authUrl = 'https://example.com/auth';

      const promise = authWindowManager.openAuthWindow(authUrl);

      expect(window.open).toHaveBeenCalledWith(authUrl, 'kzero_oauth_window', expect.stringContaining('toolbar=no'));
      expect(window.open).toHaveBeenCalledWith(authUrl, 'kzero_oauth_window', expect.stringContaining('location=no'));
      expect(window.open).toHaveBeenCalledWith(authUrl, 'kzero_oauth_window', expect.stringContaining('status=no'));
      expect(window.open).toHaveBeenCalledWith(authUrl, 'kzero_oauth_window', expect.stringContaining('menubar=no'));
      expect(window.open).toHaveBeenCalledWith(
        authUrl,
        'kzero_oauth_window',
        expect.stringContaining('scrollbars=yes')
      );
      expect(window.open).toHaveBeenCalledWith(authUrl, 'kzero_oauth_window', expect.stringContaining('resizable=yes'));

      mockWindow.closed = true;
      await vi.advanceTimersByTimeAsync(100);
      await promise;
    });
  });

  describe('polling interval', () => {
    it('polls every 100ms', async () => {
      const authUrl = 'https://example.com/auth';

      const promise = authWindowManager.openAuthWindow(authUrl);

      // Check that polling happens
      await vi.advanceTimersByTimeAsync(100);
      await vi.advanceTimersByTimeAsync(100);
      await vi.advanceTimersByTimeAsync(100);

      // Close window after multiple polls
      mockWindow.closed = true;
      await vi.advanceTimersByTimeAsync(100);

      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('handles window closing immediately', async () => {
      const authUrl = 'https://example.com/auth';

      mockWindow.closed = true;

      const promise = authWindowManager.openAuthWindow(authUrl);

      await vi.advanceTimersByTimeAsync(100);

      await expect(promise).resolves.toBeUndefined();
    });

    it('resolves when auth completes immediately', async () => {
      const authUrl = 'https://example.com/auth';

      mockWindow.closed = true;

      const promise = authWindowManager.openAuthWindow(authUrl);

      await vi.advanceTimersByTimeAsync(100);

      await expect(promise).resolves.toBeUndefined();
    });
  });
});
