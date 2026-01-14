// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { LoginProvider } from '@kzero/zk-core';

/**
 * Default providers list
 */
const DEFAULT_PROVIDERS: LoginProvider[] = ['google', 'twitter', 'apple', 'github', 'telegram', 'discord'];

/**
 * Providers Manager
 * Manages the list of enabled login providers
 */
class ProvidersManager {
  private providers: LoginProvider[] = DEFAULT_PROVIDERS;
  private listeners: Set<(providers: LoginProvider[]) => void> = new Set();

  /**
   * Get current providers list
   */
  getProviders(): LoginProvider[] {
    return [...this.providers];
  }

  /**
   * Set providers list
   */
  setProviders(providers: LoginProvider[]): void {
    this.providers = providers.length > 0 ? providers : DEFAULT_PROVIDERS;
    this.notifyListeners();
  }

  /**
   * Subscribe to providers changes
   */
  subscribe(listener: (providers: LoginProvider[]) => void): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getProviders()));
  }
}

export const providersManager = new ProvidersManager();
