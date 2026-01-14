// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

/**
 * Extracts origin from a URL
 *
 * @param url - The URL to extract origin from
 * @returns The origin (protocol + hostname + port)
 */
export function getOriginFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);

    return urlObj.origin;
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }
}
