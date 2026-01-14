// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

// Provider
export { KzeroProvider } from './providers/KzeroProvider.js';

// Hooks
export { useKzero } from './hooks/useKzero.js';
export type { UseKzeroReturn } from './hooks/useKzero.js';

// Components (minimal - only wallet-specific)
export { default as WalletCard } from './components/WalletCard.js';

// Theme & Configuration
export { darkTheme, lightTheme } from './defaults.js';
export type { ThemeConfig } from './defaults.js';

// Types - re-export from @kzero/zk-core
export type { LoginProvider, ZkAccount } from '@kzero/zk-core';

// Types - SDK specific
export type { KzeroProviderProps, DisplayMode, TransactionRequest, TransactionResponse } from './types/index.js';

// Errors
export { ConnectionError, KzeroError, NotSupportedError, TransactionError } from './utils/errors.js';
