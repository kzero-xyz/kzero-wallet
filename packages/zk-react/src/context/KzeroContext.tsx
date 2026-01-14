// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { KzeroContextState } from './types.js';

import { createContext, useContext } from 'react';

/**
 * Kzero React Context
 */
export const KzeroContext = createContext<KzeroContextState | null>(null);

/**
 * Hook to access Kzero context
 * @throws Error if used outside of KzeroProvider
 */
export function useKzeroContext(): KzeroContextState {
  const context = useContext(KzeroContext);

  if (!context) {
    throw new Error('useKzeroContext must be used within KzeroProvider');
  }

  return context;
}
