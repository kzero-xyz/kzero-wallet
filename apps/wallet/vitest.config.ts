// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, mergeConfig } from 'vitest/config';

import { vitestConfig } from '@kzero/dev/vitest.config.base.js';

export default mergeConfig(
  vitestConfig,
  defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    test: {
      // App-specific overrides if needed
      setupFiles: ['./src/__tests__/setup.ts'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/setup.ts', '**/__tests__/setup.ts']
    }
  })
);
