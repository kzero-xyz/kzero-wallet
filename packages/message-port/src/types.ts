// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

/**
 * Base message data structure for type-safe communication
 */
export interface BaseMessageData {
  type: string;
  payload: unknown;
  response: unknown;
}

/**
 * Message type discriminator for better type safety
 */
export type MessageType = 'request' | 'response' | 'event';

/**
 * Request message structure - sent when expecting a response
 */
export interface RequestMessage<TType extends string = string, TPayload = unknown> {
  messageType: 'request';
  id: string;
  type: TType;
  payload: TPayload;
}

/**
 * Response message structure - sent in reply to a request
 */
export interface ResponseMessage<TType extends string = string, TResponse = unknown> {
  messageType: 'response';
  id: string;
  type: TType;
  response?: TResponse;
  error?: string;
}

/**
 * Event message structure - fire-and-forget, no response expected
 */
export interface EventMessage<TType extends string = string, TData = unknown> {
  messageType: 'event';
  type: TType;
  data: TData;
}

/**
 * Union of all possible message types
 */
export type Message = RequestMessage | ResponseMessage | EventMessage;

/**
 * Message handler function signature for handling requests
 */
export type MessageHandler<TPayload = unknown, TResponse = unknown> = (
  payload: TPayload,
  origin: string
) => TResponse | Promise<TResponse>;

/**
 * Event listener function signature for handling events
 */
export type EventListener<TData = unknown> = (data: TData, origin: string) => void;

/**
 * Pending request tracking
 */
export interface PendingRequest<TResponse = unknown> {
  resolve: (value: TResponse) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

/**
 * Configuration options for BidirectionalPort
 */
export interface BidirectionalPortOptions {
  /**
   * Default timeout for requests in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;
}

/**
 * Handshake message types for establishing connection
 */
export const HANDSHAKE_INIT = '__HANDSHAKE_INIT__';
export const HANDSHAKE_READY = '__HANDSHAKE_READY__';

/**
 * Handshake initialization message
 */
export interface HandshakeInitMessage {
  type: typeof HANDSHAKE_INIT;
}

/**
 * Handshake ready message
 */
export interface HandshakeReadyMessage {
  type: typeof HANDSHAKE_READY;
}
