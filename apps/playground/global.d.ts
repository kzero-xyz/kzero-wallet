// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { Injected } from '@polkadot/extension-inject/types';

declare global {
  interface Window {
    injectedWeb3?: Record<
      string,
      {
        enable: (origin: string) => Promise<Injected>;
        version: string;
      }
    >;
  }
}
