// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { ThemeConfig } from '@kzero/zk-core';

/**
 * Apply theme configuration to CSS custom properties
 * Maps ThemeConfig values to CSS variables in :root
 */
export function applyTheme(theme: ThemeConfig): void {
  const root = document.documentElement;

  // Apply colors
  root.style.setProperty('--background', theme.colors.background);
  root.style.setProperty('--foreground', theme.colors.foreground);
  root.style.setProperty('--primary', theme.colors.primary);
  root.style.setProperty('--primary-foreground', theme.colors.primaryForeground);
  root.style.setProperty('--secondary', theme.colors.secondary);
  root.style.setProperty('--secondary-foreground', theme.colors.secondaryForeground);
  root.style.setProperty('--success', theme.colors.success);
  root.style.setProperty('--success-foreground', theme.colors.successForeground);
  root.style.setProperty('--error', theme.colors.error);
  root.style.setProperty('--error-foreground', theme.colors.errorForeground);
  root.style.setProperty('--warning', theme.colors.warning);
  root.style.setProperty('--warning-foreground', theme.colors.warningForeground);
  root.style.setProperty('--border', theme.colors.border);
  root.style.setProperty('--divider', theme.colors.divider);

  // Apply radius
  root.style.setProperty('--radius', theme.radius.base);
  root.style.setProperty('--radius-card', theme.radius.card);
}
