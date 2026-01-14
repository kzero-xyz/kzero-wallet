// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type {
  BaseMessageData,
  BidirectionalPortOptions,
  EventListener,
  EventMessage,
  Message,
  MessageHandler,
  PendingRequest,
  RequestMessage,
  ResponseMessage
} from './types.js';

/**
 * BidirectionalPort - Symmetric bidirectional communication via MessagePort
 *
 * @template TMessageData - Base message data type extending BaseMessageData
 *
 * Supports:
 * - Request/Response pattern (both directions)
 * - Event emission and listening (both directions)
 * - Type-safe message handling
 */
export class BidirectionalPort<TMessageData extends BaseMessageData = BaseMessageData> {
  private port: MessagePort;
  private timeout: number;
  private debug: boolean;
  private remoteOrigin: string;
  private _portId: string;

  // Request/Response tracking
  private pendingRequests = new Map<string, PendingRequest>();
  private requestHandlers = new Map<string, MessageHandler>();

  // Event listening
  private eventListeners = new Map<string, Set<EventListener>>();

  // Lifecycle
  private destroyed = false;

  constructor(port: MessagePort, remoteOrigin: string, options: BidirectionalPortOptions = {}) {
    this.port = port;
    this.remoteOrigin = remoteOrigin;
    this.timeout = options.timeout || 60000;
    this.debug = options.debug || false;

    // Generate unique ID for this port instance
    const portId = `Port-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Set up message listener
    this.port.addEventListener('message', this.handleMessage);
    this.port.start();

    this.log(`BidirectionalPort initialized (${portId})`);

    // Store portId for debugging
    this._portId = portId;
  }

  /**
   * Send a request and wait for response
   */
  request<K extends TMessageData['type']>(
    type: K,
    payload: Extract<TMessageData, { type: K }>['payload']
  ): Promise<Extract<TMessageData, { type: K }>['response']> {
    if (this.destroyed) {
      return Promise.reject(new Error('Port is destroyed'));
    }

    return new Promise((resolve, reject) => {
      const id = this.generateId();

      // Set up timeout
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout: ${String(type)}`));
      }, this.timeout);

      // Track pending request
      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timeout: timeoutId
      });

      // Send request message
      const message: RequestMessage = {
        messageType: 'request',
        id,
        type: String(type),
        payload
      };

      this.log('Sending request:', message);
      this.port.postMessage(message);
    });
  }

  /**
   * Register a handler for incoming requests
   */
  handle<K extends TMessageData['type']>(
    type: K,
    handler: MessageHandler<
      Extract<TMessageData, { type: K }>['payload'],
      Extract<TMessageData, { type: K }>['response']
    >
  ): void {
    this.log('Registering handler for:', type);
    this.requestHandlers.set(String(type), handler as MessageHandler);
  }

  /**
   * Unregister a handler for incoming requests
   */
  unhandle<K extends TMessageData['type']>(type: K): void {
    this.log('Unregistering handler for:', type);
    this.requestHandlers.delete(String(type));
  }

  /**
   * Emit an event (fire-and-forget)
   */
  emit<K extends TMessageData['type']>(type: K, data: Extract<TMessageData, { type: K }>['payload']): void {
    if (this.destroyed) {
      this.log('Cannot emit - port is destroyed');

      return;
    }

    const message: EventMessage = {
      messageType: 'event',
      type: String(type),
      data
    };

    this.log('Emitting event:', message);
    this.port.postMessage(message);
  }

  /**
   * Listen to events - returns unsubscribe function
   */
  on<K extends TMessageData['type']>(
    type: K,
    listener: EventListener<Extract<TMessageData, { type: K }>['payload']>
  ): () => void {
    this.log('Adding event listener for:', type);

    const typeStr = String(type);

    if (!this.eventListeners.has(typeStr)) {
      this.eventListeners.set(typeStr, new Set());
    }

    const listeners = this.eventListeners.get(typeStr)!;

    listeners.add(listener as EventListener<unknown>);

    // Return unsubscribe function
    return () => {
      this.off(type, listener);
    };
  }

  /**
   * Remove event listener(s)
   */
  off<K extends TMessageData['type']>(
    type: K,
    listener?: EventListener<Extract<TMessageData, { type: K }>['payload']>
  ): void {
    const typeStr = String(type);

    if (!listener) {
      // Remove all listeners for this type
      this.log('Removing all listeners for:', type);
      this.eventListeners.delete(typeStr);

      return;
    }

    // Remove specific listener
    this.log('Removing listener for:', type);
    const listeners = this.eventListeners.get(typeStr);

    if (listeners) {
      listeners.delete(listener as EventListener<unknown>);

      if (listeners.size === 0) {
        this.eventListeners.delete(typeStr);
      }
    }
  }

  /**
   * DOM-style event listener API (alias for on)
   */
  addEventListener<K extends TMessageData['type']>(
    type: K,
    listener: EventListener<Extract<TMessageData, { type: K }>['payload']>
  ): void {
    this.on(type, listener);
  }

  /**
   * DOM-style event listener removal (alias for off)
   */
  removeEventListener<K extends TMessageData['type']>(
    type: K,
    listener?: EventListener<Extract<TMessageData, { type: K }>['payload']>
  ): void {
    this.off(type, listener);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.destroyed) return;

    this.log('Destroying port');
    this.destroyed = true;

    // Clear all pending requests
    this.pendingRequests.forEach((pending) => {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Port destroyed'));
    });
    this.pendingRequests.clear();

    // Clear handlers and listeners
    this.requestHandlers.clear();
    this.eventListeners.clear();

    // Close port
    this.port.removeEventListener('message', this.handleMessage);
    this.port.close();
  }

  /**
   * Handle incoming messages
   */
  private handleMessage = (event: MessageEvent<Message>): void => {
    const message = event.data;

    // Note: MessagePort events don't have origin property
    // Origin validation is only for window.postMessage during handshake
    // Once MessagePort is established, it's a secure point-to-point channel
    // We use the remoteOrigin stored during construction (from handshake)

    this.log('Received message:', message);

    // Route message based on type
    if (message.messageType === 'request') {
      this.handleRequest(message as RequestMessage);
    } else if (message.messageType === 'response') {
      this.handleResponse(message as ResponseMessage);
    } else if (message.messageType === 'event') {
      this.handleEvent(message as EventMessage);
    } else {
      this.log('Unknown message type:', message);
    }
  };

  /**
   * Handle incoming request
   */
  private async handleRequest(message: RequestMessage): Promise<void> {
    const { id, type, payload } = message;

    const handler = this.requestHandlers.get(type);

    if (!handler) {
      // Send error response
      const response: ResponseMessage = {
        messageType: 'response',
        id,
        type,
        error: `No handler registered for: ${type}`
      };

      this.log('No handler for request, sending error:', response);
      this.port.postMessage(response);

      return;
    }

    try {
      // Execute handler with stored remoteOrigin
      const result = await handler(payload, this.remoteOrigin);

      // Send success response
      const response: ResponseMessage = {
        messageType: 'response',
        id,
        type,
        response: result
      };

      this.log('Sending response:', response);
      this.port.postMessage(response);
    } catch (error) {
      // Send error response
      const response: ResponseMessage = {
        messageType: 'response',
        id,
        type,
        error: error instanceof Error ? error.message : String(error)
      };

      this.log('Handler error, sending error response:', response);
      this.port.postMessage(response);
    }
  }

  /**
   * Handle incoming response
   */
  private handleResponse(message: ResponseMessage): void {
    const { id, error, response } = message;

    const pending = this.pendingRequests.get(id);

    if (!pending) {
      this.log('Received response for unknown request:', id);

      return;
    }

    // Clear timeout and remove from pending
    clearTimeout(pending.timeout);
    this.pendingRequests.delete(id);

    // Resolve or reject
    if (error) {
      this.log('Request failed:', error);
      pending.reject(new Error(error));
    } else {
      this.log('Request succeeded:', response);
      pending.resolve(response);
    }
  }

  /**
   * Handle incoming event
   */
  private handleEvent(message: EventMessage): void {
    const { type, data } = message;

    const listeners = this.eventListeners.get(type);

    if (!listeners || listeners.size === 0) {
      this.log('No listeners for event:', type);

      return;
    }

    this.log(`Invoking ${listeners.size} listener(s) for event:`, type);

    // Invoke all listeners with stored remoteOrigin
    listeners.forEach((listener) => {
      try {
        listener(data, this.remoteOrigin);
      } catch (error) {
        this.log('Listener error:', error);
      }
    });
  }

  /**
   * Generate unique message ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Debug logging
   */
  private log(...args: unknown[]): void {
    if (this.debug) {
      const portId = this._portId || 'unknown';

      console.log(`[BidirectionalPort:${portId}]`, ...args);
    }
  }
}
