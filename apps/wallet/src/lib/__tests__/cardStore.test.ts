// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { SignerPayloadJSON } from '@kzero/zk-core';

import { beforeEach, describe, expect, it } from 'vitest';

import { useCardStore } from '../cardStore.js';

describe('cardStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useCardStore.getState().reset();
  });

  describe('initial state', () => {
    it('starts with welcome card', () => {
      const state = useCardStore.getState();

      expect(state.currentCard).toEqual({ type: 'welcome' });
    });

    it('starts with empty history', () => {
      const state = useCardStore.getState();

      expect(state.history).toEqual([]);
    });
  });

  describe('navigateTo', () => {
    it('navigates to a new card', () => {
      const { navigateTo } = useCardStore.getState();

      navigateTo({ type: 'encrypt' });

      const state = useCardStore.getState();

      expect(state.currentCard).toEqual({ type: 'encrypt' });
    });

    it('adds previous card to history', () => {
      const { navigateTo } = useCardStore.getState();

      navigateTo({ type: 'encrypt' });

      const state = useCardStore.getState();

      expect(state.history).toEqual([{ type: 'welcome' }]);
    });

    it('builds up history stack on multiple navigations', () => {
      const { navigateTo } = useCardStore.getState();

      navigateTo({ type: 'encrypt' });
      navigateTo({ type: 'login-success' });
      navigateTo({ type: 'forget' });

      const state = useCardStore.getState();

      expect(state.currentCard).toEqual({ type: 'forget' });
      expect(state.history).toEqual([{ type: 'welcome' }, { type: 'encrypt' }, { type: 'login-success' }]);
    });

    it('handles navigation with card data (connecting)', () => {
      const { navigateTo } = useCardStore.getState();

      navigateTo({ type: 'connecting', provider: 'google' });

      const state = useCardStore.getState();

      expect(state.currentCard).toEqual({ type: 'connecting', provider: 'google' });
    });

    it('handles navigation with card data (login-failed)', () => {
      const { navigateTo } = useCardStore.getState();

      navigateTo({ type: 'login-failed', error: 'Authentication failed', provider: 'github' });

      const state = useCardStore.getState();

      expect(state.currentCard).toEqual({
        type: 'login-failed',
        error: 'Authentication failed',
        provider: 'github'
      });
    });

    it('handles navigation with complex card data (sign-extrinsic)', () => {
      const { navigateTo } = useCardStore.getState();

      const mockPayload: SignerPayloadJSON = {
        specVersion: '0x00000001',
        transactionVersion: '0x00000001',
        address: '0x1234',
        blockHash: '0xabcd',
        blockNumber: '0x00000001',
        era: '0x00',
        genesisHash: '0xefgh',
        method: '0x5678',
        nonce: '0x00000000',
        signedExtensions: [],
        tip: '0x00000000',
        version: 4
      };

      navigateTo({
        type: 'sign-extrinsic',
        payload: mockPayload,
        wsEndpoint: 'wss://rpc.polkadot.io',
        origin: 'https://example.com'
      });

      const state = useCardStore.getState();

      expect(state.currentCard.type).toBe('sign-extrinsic');
      expect((state.currentCard as any).payload).toEqual(mockPayload);
      expect((state.currentCard as any).wsEndpoint).toBe('wss://rpc.polkadot.io');
      expect((state.currentCard as any).origin).toBe('https://example.com');
    });
  });

  describe('goBack', () => {
    it('goes back to previous card', () => {
      const { navigateTo, goBack } = useCardStore.getState();

      navigateTo({ type: 'encrypt' });
      goBack();

      const state = useCardStore.getState();

      expect(state.currentCard).toEqual({ type: 'welcome' });
    });

    it('removes last item from history', () => {
      const { navigateTo, goBack } = useCardStore.getState();

      navigateTo({ type: 'encrypt' });
      goBack();

      const state = useCardStore.getState();

      expect(state.history).toEqual([]);
    });

    it('does nothing when history is empty', () => {
      const { goBack } = useCardStore.getState();

      goBack();

      const state = useCardStore.getState();

      expect(state.currentCard).toEqual({ type: 'welcome' });
      expect(state.history).toEqual([]);
    });

    it('handles multiple back navigations', () => {
      const { navigateTo, goBack } = useCardStore.getState();

      navigateTo({ type: 'encrypt' });
      navigateTo({ type: 'login-success' });
      navigateTo({ type: 'forget' });

      goBack(); // Back to login-success

      let state = useCardStore.getState();

      expect(state.currentCard).toEqual({ type: 'login-success' });

      goBack(); // Back to encrypt

      state = useCardStore.getState();
      expect(state.currentCard).toEqual({ type: 'encrypt' });

      goBack(); // Back to welcome

      state = useCardStore.getState();
      expect(state.currentCard).toEqual({ type: 'welcome' });
      expect(state.history).toEqual([]);
    });
  });

  describe('reset', () => {
    it('resets to welcome card', () => {
      const { navigateTo, reset } = useCardStore.getState();

      navigateTo({ type: 'encrypt' });
      navigateTo({ type: 'login-success' });

      reset();

      const state = useCardStore.getState();

      expect(state.currentCard).toEqual({ type: 'welcome' });
    });

    it('clears history', () => {
      const { navigateTo, reset } = useCardStore.getState();

      navigateTo({ type: 'encrypt' });
      navigateTo({ type: 'login-success' });

      reset();

      const state = useCardStore.getState();

      expect(state.history).toEqual([]);
    });
  });

  describe('initialize', () => {
    it('sets initial card without adding to history', () => {
      const { initialize } = useCardStore.getState();

      initialize({ type: 'login-success' });

      const state = useCardStore.getState();

      expect(state.currentCard).toEqual({ type: 'login-success' });
      expect(state.history).toEqual([]);
    });

    it('replaces current card and clears history', () => {
      const { navigateTo, initialize } = useCardStore.getState();

      navigateTo({ type: 'encrypt' });
      navigateTo({ type: 'forget' });

      initialize({ type: 'login-success' });

      const state = useCardStore.getState();

      expect(state.currentCard).toEqual({ type: 'login-success' });
      expect(state.history).toEqual([]);
    });

    it('handles initialization with card data', () => {
      const { initialize } = useCardStore.getState();

      initialize({ type: 'login-failed', error: 'Test error', provider: 'google' });

      const state = useCardStore.getState();

      expect(state.currentCard).toEqual({
        type: 'login-failed',
        error: 'Test error',
        provider: 'google'
      });
      expect(state.history).toEqual([]);
    });
  });

  describe('type safety', () => {
    it('enforces correct data types for each card', () => {
      const { navigateTo } = useCardStore.getState();

      // These should compile without TypeScript errors
      navigateTo({ type: 'welcome' });
      navigateTo({ type: 'connecting', provider: 'google' });
      navigateTo({ type: 'connecting', provider: 'google', success: true });
      navigateTo({ type: 'login-success' });
      navigateTo({ type: 'login-failed', error: 'error', provider: 'github' });
      navigateTo({ type: 'encrypt' });
      navigateTo({ type: 'forget' });

      // Verify current card type is correct
      const state = useCardStore.getState();

      expect(state.currentCard.type).toBe('forget');
    });
  });
});
