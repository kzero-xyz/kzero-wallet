// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

export function formatUnits(value: string, decimals: number): string {
  const negative = value.startsWith('-');
  const base = BigInt(value.replace('-', ''));
  const divisor = BigInt(10 ** decimals);
  const whole = base / divisor;
  const remainder = base % divisor;

  const formattedRemainder = remainder.toString().padStart(decimals, '0');

  return `${negative ? '-' : ''}${whole}.${formattedRemainder}`;
}

export function formatDisplay(value: string): [string, string, string] {
  const [whole, fraction] = value.split('.');

  if (!fraction) {
    return [whole, '', ''];
  }

  // Find first non-zero digit in fraction
  const firstNonZero = fraction.search(/[1-9]/);

  if (firstNonZero === -1) {
    return [whole, '', ''];
  }

  // Get significant digits after first non-zero
  const significantPart = fraction.slice(firstNonZero, firstNonZero + 4);
  const unit = firstNonZero === 0 ? '' : `E-${firstNonZero}`;

  return [whole, significantPart, unit];
}
