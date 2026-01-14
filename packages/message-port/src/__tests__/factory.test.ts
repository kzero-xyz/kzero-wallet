// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { BaseMessageData } from '../types.js';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createIframePort, createParentPort } from '../factory.js';
import { HANDSHAKE_INIT, HANDSHAKE_READY } from '../types.js';

// Test message types
interface TestMessageData extends BaseMessageData {
  type: 'test';
  payload: { test: { data: string } }[this['type']];
  response: { test: { result: string } }[this['type']];
}

describe('Factory Functions', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('createParentPort', () => {
    it('should establish connection with iframe', async () => {
      const targetOrigin = 'https://iframe.test.com';

      // Mock iframe
      const iframe = {
        contentWindow: {
          postMessage: vi.fn()
        }
      } as unknown as HTMLIFrameElement;

      // Start handshake
      const portPromise = createParentPort<TestMessageData>(iframe, targetOrigin, { timeout: 1000 });

      // Wait for init message to be sent
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(iframe.contentWindow!.postMessage).toHaveBeenCalled();

      const postMessageCall = (iframe.contentWindow!.postMessage as ReturnType<typeof vi.fn>).mock.calls[0];

      expect(postMessageCall[0]).toEqual({ type: HANDSHAKE_INIT });
      expect(postMessageCall[1]).toBe(targetOrigin);
      expect(postMessageCall[2]).toBeInstanceOf(Array); // MessagePort array

      // Simulate iframe responding with HANDSHAKE_READY
      const readyEvent = new MessageEvent('message', {
        origin: targetOrigin,
        data: { type: HANDSHAKE_READY }
      });

      window.dispatchEvent(readyEvent);

      // Should resolve with port
      const port = await portPromise;

      expect(port).toBeDefined();
      expect(port.destroy).toBeInstanceOf(Function);
    });

    it('should timeout if iframe does not respond', async () => {
      const iframe = {
        contentWindow: {
          postMessage: vi.fn()
        }
      } as unknown as HTMLIFrameElement;

      await expect(createParentPort(iframe, 'https://test.com', { timeout: 100 })).rejects.toThrow('Handshake timeout');
    });

    it('should reject if iframe content window not available', async () => {
      const iframe = {
        contentWindow: null
      } as unknown as HTMLIFrameElement;

      await expect(createParentPort(iframe, 'https://test.com')).rejects.toThrow('Iframe content window not available');
    });

    it('should reject messages from wrong origin', async () => {
      const targetOrigin = 'https://expected.com';

      const iframe = {
        contentWindow: {
          postMessage: vi.fn()
        }
      } as unknown as HTMLIFrameElement;

      const portPromise = createParentPort(iframe, targetOrigin, { timeout: 1000 });

      // Send message from wrong origin
      const wrongOriginEvent = new MessageEvent('message', {
        origin: 'https://wrong.com',
        data: { type: HANDSHAKE_READY }
      });

      window.dispatchEvent(wrongOriginEvent);

      // Should still timeout because correct origin message never arrived
      await expect(portPromise).rejects.toThrow('Handshake timeout');
    }, 1500);
  });

  describe('createIframePort', () => {
    it('should establish connection with parent', async () => {
      const expectedOrigin = 'https://parent.test.com';

      // Mock parent.postMessage
      const originalParent = window.parent;

      Object.defineProperty(window, 'parent', {
        configurable: true,
        value: {
          postMessage: vi.fn()
        }
      });

      // Start handshake
      const portPromise = createIframePort<TestMessageData>(expectedOrigin, { timeout: 1000 });

      // Create mock MessageChannel
      const channel = new MessageChannel();

      // Simulate parent sending HANDSHAKE_INIT
      const initEvent = new MessageEvent('message', {
        origin: expectedOrigin,
        data: { type: HANDSHAKE_INIT },
        ports: [channel.port1]
      });

      window.dispatchEvent(initEvent);

      // Should resolve with port
      const port = await portPromise;

      expect(port).toBeDefined();
      expect(port.destroy).toBeInstanceOf(Function);

      // Should have sent HANDSHAKE_READY
      expect(window.parent.postMessage).toHaveBeenCalledWith({ type: HANDSHAKE_READY }, expectedOrigin);

      // Restore
      Object.defineProperty(window, 'parent', {
        configurable: true,
        value: originalParent
      });
    });

    it('should timeout if parent does not send init', async () => {
      await expect(createIframePort('https://test.com', { timeout: 100 })).rejects.toThrow('Handshake timeout');
    });

    it('should reject messages from wrong origin', async () => {
      const expectedOrigin = 'https://expected.com';

      const portPromise = createIframePort(expectedOrigin, { timeout: 1000 });

      const channel = new MessageChannel();

      // Send message from wrong origin
      const wrongOriginEvent = new MessageEvent('message', {
        origin: 'https://wrong.com',
        data: { type: HANDSHAKE_INIT },
        ports: [channel.port1]
      });

      window.dispatchEvent(wrongOriginEvent);

      // Should still timeout because correct origin message never arrived
      await expect(portPromise).rejects.toThrow('Handshake timeout');
    }, 1500);

    it('should ignore init message without port', async () => {
      const expectedOrigin = 'https://test.com';

      const portPromise = createIframePort(expectedOrigin, { timeout: 100 });

      // Send init without port
      const initEvent = new MessageEvent('message', {
        origin: expectedOrigin,
        data: { type: HANDSHAKE_INIT },
        ports: [] // No ports
      });

      window.dispatchEvent(initEvent);

      // Should timeout because valid message never arrived
      await expect(portPromise).rejects.toThrow('Handshake timeout');
    });
  });
});
