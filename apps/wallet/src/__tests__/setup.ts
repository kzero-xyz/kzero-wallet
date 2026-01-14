// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { beforeEach, vi } from 'vitest';

/**
 * Test setup file for wallet app
 * Configures global test environment, mocks, and utilities
 */

// Mock sessionStorage for tests
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);

      return keys[index] || null;
    }
  };
})();

// Use vi.stubGlobal for better coverage mode compatibility
vi.stubGlobal('sessionStorage', sessionStorageMock);

// Also set it on globalThis for double coverage
Object.defineProperty(globalThis, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
  configurable: true
});

// Reset sessionStorage before each test
beforeEach(() => {
  sessionStorage.clear();
});
