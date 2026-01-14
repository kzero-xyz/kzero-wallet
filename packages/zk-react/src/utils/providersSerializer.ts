// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { LoginProvider } from '@kzero/zk-core';

/**
 * Default providers list
 */
const DEFAULT_PROVIDERS: LoginProvider[] = ['google', 'twitter', 'apple', 'github', 'telegram', 'discord'];

/**
 * Serialize providers list to URL parameter
 * @param providers - Array of login providers
 * @returns Comma-separated string of providers
 */
export function serializeProvidersToUrl(providers: LoginProvider[] | undefined): string {
  if (!providers || providers.length === 0) {
    return '';
  }

  // Check if it matches default providers (in any order)
  if (isDefaultProviders(providers)) {
    return 'default';
  }

  // Return comma-separated list
  return providers.join(',');
}

/**
 * Check if providers list matches default providers
 */
function isDefaultProviders(providers: LoginProvider[]): boolean {
  if (providers.length !== DEFAULT_PROVIDERS.length) {
    return false;
  }

  const sortedProviders = [...providers].sort();
  const sortedDefaults = [...DEFAULT_PROVIDERS].sort();

  return sortedProviders.every((p, i) => p === sortedDefaults[i]);
}
