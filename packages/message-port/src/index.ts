// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

// Main API
export { BidirectionalPort } from './BidirectionalPort.js';
export { createIframePort, createParentPort } from './factory.js';

// Types
export type {
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
export { HANDSHAKE_INIT, HANDSHAKE_READY } from './types.js';
