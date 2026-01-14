// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

export function getBestForegroundColor(bgColor: string): string {
  let r: number, g: number, b: number;

  if (bgColor.startsWith('#')) {
    // Parse the hex color into R, G, and B components
    let hex = bgColor.slice(1);

    if (hex.length === 3) {
      // Expand shorthand hex to full form, e.g., #abc -> #aabbcc
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('');
    } else if (hex.length !== 6) {
      throw new Error('Invalid hex color format. Must be 3 or 6 characters long.');
    }

    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else if (bgColor.startsWith('rgb')) {
    // Parse the RGB color
    const match = bgColor.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);

    if (!match) {
      throw new Error("Invalid RGB color format. Must be in the form 'rgb(r, g, b)'.");
    }

    r = parseInt(match[1], 10);
    g = parseInt(match[2], 10);
    b = parseInt(match[3], 10);
  } else {
    throw new Error('Invalid color format. Use a hex color string or RGB color string.');
  }

  // Calculate the relative luminance of the color
  const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

  // Determine adjustment factors to create a contrasting color
  const adjustContrast = (value: number, delta: number) => {
    const adjusted = value + delta;

    return Math.min(255, Math.max(0, adjusted));
  };

  // Generate a contrasting color dynamically
  const contrastFactor = luminance > 0.5 ? -200 : 200;
  const newR = adjustContrast(r, contrastFactor);
  const newG = adjustContrast(g, contrastFactor);
  const newB = adjustContrast(b, contrastFactor);

  // Convert the adjusted RGB values back to hex format
  const toHex = (value: number) => value.toString(16).padStart(2, '0');

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}
