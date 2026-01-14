// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type {
  BaseMessageData,
  BidirectionalPortOptions,
  HandshakeInitMessage,
  HandshakeReadyMessage
} from './types.js';

import { BidirectionalPort } from './BidirectionalPort.js';
import { HANDSHAKE_INIT, HANDSHAKE_READY } from './types.js';

/**
 * Create a BidirectionalPort for the parent window side
 *
 * Initiates handshake with iframe and establishes MessagePort connection
 *
 * @template TMessageData - Base message data type extending BaseMessageData
 * @param iframe - The iframe element to connect to
 * @param targetOrigin - The expected origin of the iframe (for security)
 * @param options - Optional configuration
 * @returns Promise that resolves to a BidirectionalPort
 */
export async function createParentPort<TMessageData extends BaseMessageData = BaseMessageData>(
  iframe: HTMLIFrameElement,
  targetOrigin: string,
  options: BidirectionalPortOptions = {}
): Promise<BidirectionalPort<TMessageData>> {
  return new Promise((resolve, reject) => {
    const { timeout = 30000 } = options;

    // Ensure iframe has loaded
    if (!iframe.contentWindow) {
      reject(new Error('Iframe content window not available'));

      return;
    }

    // Create MessageChannel
    const channel = new MessageChannel();
    const port1 = channel.port1;
    const port2 = channel.port2;

    // Set up timeout
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Handshake timeout'));
    }, timeout);

    // Listen for handshake ready message
    const handleMessage = (event: MessageEvent<HandshakeReadyMessage>) => {
      if (event.origin !== targetOrigin) {
        console.warn('[createParentPort] Rejected message from unauthorized origin:', event.origin);

        return;
      }

      if (event.data?.type === HANDSHAKE_READY) {
        cleanup();

        // Create BidirectionalPort with the MessagePort and verified target origin
        const port = new BidirectionalPort<TMessageData>(port1, targetOrigin, options);

        resolve(port);
      }
    };

    const cleanup = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('message', handleMessage);
    };

    // Listen for handshake ready
    window.addEventListener('message', handleMessage);

    // Send handshake init with port2
    const initMessage: HandshakeInitMessage = {
      type: HANDSHAKE_INIT
    };

    iframe.contentWindow.postMessage(initMessage, targetOrigin, [port2]);
  });
}

/**
 * Create a BidirectionalPort for the iframe side
 *
 * Waits for handshake from parent and establishes MessagePort connection
 *
 * @template TMessageData - Base message data type extending BaseMessageData
 * @param expectedOrigin - The expected origin of the parent window (for security)
 * @param options - Optional configuration
 * @returns Promise that resolves to a BidirectionalPort
 */
export async function createIframePort<TMessageData extends BaseMessageData = BaseMessageData>(
  expectedOrigin: string,
  options: BidirectionalPortOptions = {}
): Promise<BidirectionalPort<TMessageData>> {
  return new Promise((resolve, reject) => {
    const { timeout = 30000 } = options;

    // Set up timeout
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Handshake timeout'));
    }, timeout);

    // Listen for handshake init message
    const handleMessage = (event: MessageEvent<HandshakeInitMessage>) => {
      // Allow '*' as wildcard for development
      if (expectedOrigin !== '*' && event.origin !== expectedOrigin) {
        console.warn('[createIframePort] Rejected message from unauthorized origin:', event.origin);

        return;
      }

      if (event.data?.type === HANDSHAKE_INIT && event.ports?.[0]) {
        cleanup();

        const port = event.ports[0];
        // Use the actual parent origin from the handshake event
        // If expectedOrigin is '*', use the actual origin; otherwise use the expected one
        const parentOrigin = expectedOrigin === '*' ? event.origin : expectedOrigin;

        // Send handshake ready
        const readyMessage: HandshakeReadyMessage = {
          type: HANDSHAKE_READY
        };

        window.parent.postMessage(readyMessage, expectedOrigin);

        // Create BidirectionalPort with the received MessagePort and parent origin
        const bidirectionalPort = new BidirectionalPort<TMessageData>(port, parentOrigin, options);

        resolve(bidirectionalPort);
      }
    };

    const cleanup = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('message', handleMessage);
    };

    // Listen for handshake init
    window.addEventListener('message', handleMessage);
  });
}
