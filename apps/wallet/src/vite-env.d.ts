// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WS_ENDPOINT: string;
  readonly VITE_RPC_URL: string;
  readonly VITE_AUTH_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
