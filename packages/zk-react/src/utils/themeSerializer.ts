// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { ThemeConfig } from '@kzero/zk-core';

import { darkTheme, lightTheme } from '../defaults.js';

/**
 * Serialize theme configuration to URL parameter
 * @param theme - Theme configuration object
 * @returns URL-encoded theme string
 */
export function serializeThemeToUrl(theme: ThemeConfig | undefined): string {
  if (!theme) {
    return '';
  }

  // Check if theme matches preset themes
  if (isDeepEqual(theme, darkTheme)) {
    return 'dark';
  }

  if (isDeepEqual(theme, lightTheme)) {
    return 'light';
  }

  // Serialize as JSON and encode for URL
  return encodeURIComponent(JSON.stringify(theme));
}

/**
 * Deep equality check for theme objects
 */
function isDeepEqual(obj1: ThemeConfig, obj2: ThemeConfig): boolean {
  return (
    obj1.radius.base === obj2.radius.base &&
    obj1.radius.card === obj2.radius.card &&
    obj1.colors.background === obj2.colors.background &&
    obj1.colors.foreground === obj2.colors.foreground &&
    obj1.colors.primary === obj2.colors.primary &&
    obj1.colors.primaryForeground === obj2.colors.primaryForeground &&
    obj1.colors.secondary === obj2.colors.secondary &&
    obj1.colors.secondaryForeground === obj2.colors.secondaryForeground &&
    obj1.colors.success === obj2.colors.success &&
    obj1.colors.successForeground === obj2.colors.successForeground &&
    obj1.colors.error === obj2.colors.error &&
    obj1.colors.errorForeground === obj2.colors.errorForeground &&
    obj1.colors.warning === obj2.colors.warning &&
    obj1.colors.warningForeground === obj2.colors.warningForeground &&
    obj1.colors.border === obj2.colors.border &&
    obj1.colors.divider === obj2.colors.divider
  );
}
