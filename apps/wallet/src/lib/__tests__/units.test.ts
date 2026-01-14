// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { describe, expect, it } from 'vitest';

import { formatDisplay, formatUnits } from '../units.js';

describe('units', () => {
  describe('formatUnits', () => {
    it('formats basic integer value with decimals', () => {
      expect(formatUnits('1000000', 6)).toBe('1.000000');
    });

    it('formats value with remainder', () => {
      expect(formatUnits('1234567', 6)).toBe('1.234567');
    });

    it('formats zero value', () => {
      expect(formatUnits('0', 6)).toBe('0.000000');
    });

    it('formats small value less than one unit', () => {
      expect(formatUnits('123', 6)).toBe('0.000123');
    });

    it('formats large value', () => {
      expect(formatUnits('123456789012', 6)).toBe('123456.789012');
    });

    it('handles negative values', () => {
      expect(formatUnits('-1234567', 6)).toBe('-1.234567');
    });

    it('handles negative small values', () => {
      expect(formatUnits('-123', 6)).toBe('-0.000123');
    });

    it('pads remainder with leading zeros', () => {
      expect(formatUnits('1000001', 6)).toBe('1.000001');
    });

    it('handles different decimal places (18 decimals)', () => {
      expect(formatUnits('1000000000000000000', 18)).toBe('1.000000000000000000');
    });

    it('handles different decimal places (2 decimals)', () => {
      expect(formatUnits('12345', 2)).toBe('123.45');
    });

    it('handles value exactly equal to divisor', () => {
      expect(formatUnits('1000000', 6)).toBe('1.000000');
    });

    it('handles very large numbers', () => {
      expect(formatUnits('999999999999999999', 6)).toBe('999999999999.999999');
    });
  });

  describe('formatDisplay', () => {
    it('returns whole part only when no fraction', () => {
      expect(formatDisplay('123')).toEqual(['123', '', '']);
    });

    it('returns whole part only when fraction is all zeros', () => {
      expect(formatDisplay('123.000000')).toEqual(['123', '', '']);
    });

    it('handles normal decimal with non-zero fraction', () => {
      expect(formatDisplay('123.4567')).toEqual(['123', '4567', '']);
    });

    it('handles small decimals with leading zeros (E notation)', () => {
      expect(formatDisplay('0.00001234')).toEqual(['0', '1234', 'E-4']);
    });

    it('handles one leading zero in fraction', () => {
      expect(formatDisplay('0.01234')).toEqual(['0', '1234', 'E-1']);
    });

    it('handles two leading zeros in fraction', () => {
      expect(formatDisplay('0.001234')).toEqual(['0', '1234', 'E-2']);
    });

    it('extracts only 4 significant digits after first non-zero', () => {
      expect(formatDisplay('0.0000123456789')).toEqual(['0', '1234', 'E-4']);
    });

    it('handles fraction starting immediately (no leading zeros)', () => {
      expect(formatDisplay('123.456789')).toEqual(['123', '4567', '']);
    });

    it('handles single digit fraction', () => {
      expect(formatDisplay('123.5')).toEqual(['123', '5', '']);
    });

    it('handles two digit fraction', () => {
      expect(formatDisplay('123.56')).toEqual(['123', '56', '']);
    });

    it('handles three digit fraction', () => {
      expect(formatDisplay('123.567')).toEqual(['123', '567', '']);
    });

    it('handles exactly four digit fraction', () => {
      expect(formatDisplay('123.5678')).toEqual(['123', '5678', '']);
    });

    it('handles whole number with decimal point but no digits', () => {
      expect(formatDisplay('123.')).toEqual(['123', '', '']);
    });

    it('handles zero with small fraction', () => {
      expect(formatDisplay('0.0001234')).toEqual(['0', '1234', 'E-3']);
    });

    it('handles very large whole number with fraction', () => {
      expect(formatDisplay('999999999.123456')).toEqual(['999999999', '1234', '']);
    });

    it('handles many leading zeros', () => {
      expect(formatDisplay('0.000000001234')).toEqual(['0', '1234', 'E-8']);
    });
  });
});
