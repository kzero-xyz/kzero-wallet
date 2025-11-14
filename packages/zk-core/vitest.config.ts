// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { defineConfig, mergeConfig } from 'vitest/config';

import { vitestConfig } from '@kzero/dev/vitest.config.base.js';

export default mergeConfig(
  vitestConfig,
  defineConfig({
    test: {
      // Package-specific overrides if needed
    }
  })
);
