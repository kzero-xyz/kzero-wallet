// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { LoginProvider, SignerPayloadJSON } from '@kzero/zk-core';

import { create } from 'zustand';

/**
 * Card data types for each card
 */
export type CardData =
  | { type: 'welcome' }
  | { type: 'connecting'; provider: LoginProvider; success?: boolean }
  | { type: 'login-success' }
  | { type: 'login-failed'; error: string; provider: LoginProvider }
  | { type: 'encrypt' }
  | { type: 'forget' }
  | {
      type: 'sign-extrinsic';
      payload: SignerPayloadJSON;
      wsEndpoint: string;
      origin: string;
    };

/**
 * Extract card type from CardData
 */
export type CardType = CardData['type'];

/**
 * Extract data type for a specific card type
 */
export type CardDataForType<T extends CardType> = Extract<CardData, { type: T }>;

/**
 * Card state interface
 */
interface CardState {
  /**
   * Current card data (includes type and associated data)
   */
  currentCard: CardData;

  /**
   * Navigation history stack
   */
  history: CardData[];

  /**
   * Navigate to a specific card with typed data
   */
  navigateTo: <T extends CardType>(data: CardDataForType<T>) => void;

  /**
   * Go back to the previous card
   */
  goBack: () => void;

  /**
   * Reset to initial state
   */
  reset: () => void;

  /**
   * Initialize with a specific card and data
   */
  initialize: <T extends CardType>(data: CardDataForType<T>) => void;
}

/**
 * Card store using Zustand
 */
export const useCardStore = create<CardState>((set) => ({
  currentCard: { type: 'welcome' },
  history: [],

  navigateTo: (data) =>
    set((state) => ({
      currentCard: data,
      history: [...state.history, state.currentCard]
    })),

  goBack: () =>
    set((state) => {
      if (state.history.length === 0) {
        return state;
      }

      const previous = state.history[state.history.length - 1];

      return {
        currentCard: previous,
        history: state.history.slice(0, -1)
      };
    }),

  reset: () =>
    set({
      currentCard: { type: 'welcome' },
      history: []
    }),

  initialize: (data) =>
    set({
      currentCard: data,
      history: []
    })
}));
