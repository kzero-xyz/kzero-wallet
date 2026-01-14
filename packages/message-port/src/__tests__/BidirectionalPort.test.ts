// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BidirectionalPort } from '../BidirectionalPort.js';

// Test message types - use mapped types for correct inference
type TestMessageData =
  | {
      type: 'ping';
      payload: { message: string };
      response: { reply: string };
    }
  | {
      type: 'echo';
      payload: { text: string };
      response: { echoed: string };
    }
  | {
      type: 'error';
      payload: { shouldFail: boolean };
      response: { success: boolean };
    }
  | {
      type: 'event';
      payload: { data: string };
      response: never;
    };

describe('BidirectionalPort', () => {
  let port1: BidirectionalPort<TestMessageData>;
  let port2: BidirectionalPort<TestMessageData>;
  let channel: MessageChannel;

  beforeEach(() => {
    channel = new MessageChannel();
    // port1's remoteOrigin is where port2 is (5173)
    port1 = new BidirectionalPort<TestMessageData>(channel.port1, 'http://localhost:5173', {
      timeout: 1000,
      debug: false
    });
    // port2's remoteOrigin is where port1 is (3000)
    port2 = new BidirectionalPort<TestMessageData>(channel.port2, 'http://localhost:3000', {
      timeout: 1000,
      debug: false
    });
  });

  describe('request/response', () => {
    it('should send request and receive response', async () => {
      // Register handler on port2
      port2.handle('ping', async (payload: any) => {
        return { reply: `pong: ${payload.message}` };
      });

      // Send request from port1
      const result = await port1.request('ping', { message: 'hello' });

      expect(result.reply).toBe('pong: hello');
    });

    it('should handle multiple concurrent requests', async () => {
      port2.handle('echo', async (payload: any) => {
        return { echoed: payload.text };
      });

      const results = await Promise.all([
        port1.request('echo', { text: 'first' }),
        port1.request('echo', { text: 'second' }),
        port1.request('echo', { text: 'third' })
      ]);

      expect(results[0].echoed).toBe('first');
      expect(results[1].echoed).toBe('second');
      expect(results[2].echoed).toBe('third');
    });

    it('should return error if no handler registered', async () => {
      // No handler registered
      await expect(port1.request('ping', { message: 'hello' })).rejects.toThrow('No handler registered');
    });

    it('should handle errors from handler', async () => {
      port2.handle('error', async () => {
        throw new Error('Handler failed');
      });

      await expect(port1.request('error', { shouldFail: true })).rejects.toThrow('Handler failed');
    });

    it('should support bidirectional requests', async () => {
      // Register handlers on both sides
      port1.handle('ping', async (payload: any) => {
        return { reply: `port1: ${payload.message}` };
      });

      port2.handle('ping', async (payload: any) => {
        return { reply: `port2: ${payload.message}` };
      });

      // Both sides can send requests
      const result1 = await port1.request('ping', { message: 'from port1' });
      const result2 = await port2.request('ping', { message: 'from port2' });

      expect(result1.reply).toBe('port2: from port1');
      expect(result2.reply).toBe('port1: from port2');
    });
  });

  describe('events', () => {
    it('should emit and listen to events', async () => {
      const listener = vi.fn();

      port2.on('event', listener);

      port1.emit('event', { data: 'test event' });

      // Wait for async event delivery
      await new Promise((resolve) => setTimeout(resolve, 10));

      // port1 emits, port2 receives with port2's remoteOrigin (port1's location)
      expect(listener).toHaveBeenCalledWith({ data: 'test event' }, 'http://localhost:3000');
    });

    it('should support multiple listeners for same event', async () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      port2.on('event', listener1);
      port2.on('event', listener2);

      port1.emit('event', { data: 'test' });

      await new Promise((resolve) => setTimeout(resolve, 10));

      // port1 emits, both listeners on port2 receive with port2's remoteOrigin
      expect(listener1).toHaveBeenCalledWith({ data: 'test' }, 'http://localhost:3000');
      expect(listener2).toHaveBeenCalledWith({ data: 'test' }, 'http://localhost:3000');
    });

    it('should unsubscribe via returned function', async () => {
      const listener = vi.fn();

      const unsubscribe = port2.on('event', listener);

      unsubscribe();

      port1.emit('event', { data: 'test' });

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(listener).not.toHaveBeenCalled();
    });

    it('should remove specific listener with off()', async () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      port2.on('event', listener1);
      port2.on('event', listener2);

      port2.off('event', listener1);

      port1.emit('event', { data: 'test' });

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should remove all listeners with off() without listener argument', async () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      port2.on('event', listener1);
      port2.on('event', listener2);

      port2.off('event');

      port1.emit('event', { data: 'test' });

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it('should support bidirectional events', async () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      port1.on('event', listener1);
      port2.on('event', listener2);

      port1.emit('event', { data: 'from port1' });
      port2.emit('event', { data: 'from port2' });

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(listener1).toHaveBeenCalledWith({ data: 'from port2' }, 'http://localhost:5173');
      expect(listener2).toHaveBeenCalledWith({ data: 'from port1' }, 'http://localhost:3000');
    });
  });

  describe('DOM-style event API', () => {
    it('should support addEventListener', async () => {
      const listener = vi.fn();

      port2.addEventListener('event', listener);

      port1.emit('event', { data: 'test' });

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(listener).toHaveBeenCalled();
    });

    it('should support removeEventListener', async () => {
      const listener = vi.fn();

      port2.addEventListener('event', listener);
      port2.removeEventListener('event', listener);

      port1.emit('event', { data: 'test' });

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('handler management', () => {
    it('should unregister handler with unhandle()', async () => {
      port2.handle('ping', async (payload: any) => {
        return { reply: payload.message };
      });

      port2.unhandle('ping');

      await expect(port1.request('ping', { message: 'test' })).rejects.toThrow('No handler registered');
    });
  });

  describe('lifecycle', () => {
    it('should clean up on destroy()', async () => {
      const listener = vi.fn();

      port2.on('event', listener);

      port2.handle('ping', async (payload: any) => {
        return { reply: payload.message };
      });

      port2.destroy();

      // Requests should fail after destroy
      await expect(port1.request('ping', { message: 'test' })).rejects.toThrow('timeout');

      // Events should not be delivered
      port1.emit('event', { data: 'test' });
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(listener).not.toHaveBeenCalled();
    });

    it('should reject pending requests on destroy()', async () => {
      const promise = port1.request('ping', { message: 'test' });

      port1.destroy();

      await expect(promise).rejects.toThrow('Port destroyed');
    });

    it('should not emit after destroy()', () => {
      port1.destroy();

      expect(() => {
        port1.emit('event', { data: 'test' });
      }).not.toThrow();
    });
  });
});
