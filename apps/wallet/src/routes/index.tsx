// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { createFileRoute } from '@tanstack/react-router';

import App from './app';

export const Route = createFileRoute('/')({
  component: App
});
