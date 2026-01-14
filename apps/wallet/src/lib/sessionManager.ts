// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { Hex, Proof, ZkAccount } from '@kzero/zk-core';
import type { EncryptedData } from './encryptionUtils.js';
import type { EphemeralKeypair } from './ephemeralKeyUtils.js';

import { Logger } from '@kzero/zk-core';

import { decryptWithPIN, encryptWithPIN } from './encryptionUtils.js';
import { generateEphemeralKeypair } from './ephemeralKeyUtils.js';
import { getDebugFromUrl } from './urlParams.js';

const log = new Logger('SessionManager', { enabled: getDebugFromUrl() });

/**
 * Account change callback type
 */
type AccountChangeCallback = (account: ZkAccount | null) => void;

/**
 * Session state machine
 */
export type SessionState =
  | 'idle' // No session
  | 'initialized' // Ephemeral keypair generated (in memory)
  | 'authenticated' // OAuth completed, proof received
  | 'encrypted' // PIN set, keypair encrypted to sessionStorage
  | 'active'; // Fully active session

/**
 * Session data stored in sessionStorage
 */
interface StoredSessionData {
  ephemeralPublicKey: Hex;
  encryptedKeypair: EncryptedData;
  proof: Proof | null;
  timestamp: number;
  version: number; // For future migration
}

/**
 * In-memory session data (before encryption)
 */
interface MemorySessionData {
  ephemeralPublicKey: Hex;
  keypair: EphemeralKeypair;
  proof: Proof | null;
  timestamp: number;
}

/**
 * Current session information exposed to components
 */
export interface SessionInfo {
  state: SessionState;
  ephemeralPublicKey: Hex;
  proof: Proof | null;
  account: ZkAccount | null;
  timestamp: number;
}

/**
 * Centralized session manager
 * Manages ephemeral keypair and proof lifecycle
 */
class SessionManager {
  private static readonly SESSION_KEY = 'kzero_session';
  private static readonly VERSION = 1;

  // In-memory cache for unencrypted sessions
  private memorySession: MemorySessionData | null = null;

  // Account change listeners
  private accountChangeListeners: Set<AccountChangeCallback> = new Set();

  /**
   * Subscribe to account changes
   *
   * @param callback - Called when account changes
   * @returns Unsubscribe function
   */
  onAccountChange(callback: AccountChangeCallback): () => void {
    this.accountChangeListeners.add(callback);

    return () => {
      this.accountChangeListeners.delete(callback);
    };
  }

  /**
   * Emit account change event to all listeners
   * Only emits when account is ready or null (logout)
   * @private
   */
  private emitAccountChange(account: ZkAccount | null): void {
    log.debug('Emitting account change:', account?.address ?? 'null');
    this.accountChangeListeners.forEach((callback) => callback(account));
  }

  /**
   * Initialize a new session
   * Generates ephemeral keypair and stores in memory
   *
   * @returns Session data with public key
   */
  initialize(): { ephemeralPublicKey: Hex } {
    // Clear any existing session
    this.terminate();

    // Generate new ephemeral keypair
    const keypair = generateEphemeralKeypair();

    // Store in memory
    this.memorySession = {
      ephemeralPublicKey: keypair.publicKey,
      keypair,
      proof: null,
      timestamp: Date.now()
    };

    log.debug('Session initialized:', keypair.publicKey);

    return { ephemeralPublicKey: keypair.publicKey };
  }

  /**
   * Store proof after OAuth authentication
   *
   * @param proof - ZK proof received from backend
   */
  authenticate(proof: Proof): void {
    if (!this.memorySession) {
      throw new Error('No active session. Call initialize() first.');
    }

    this.memorySession.proof = proof;

    log.debug('Session authenticated, proof status:', proof.status);
  }

  /**
   * Encrypt keypair with PIN and persist to sessionStorage
   * Transitions from memory-only to persistent session
   *
   * @param pin - 6-digit PIN for encryption
   */
  encrypt(pin: string): void {
    if (!this.memorySession) {
      throw new Error('No active session to encrypt.');
    }

    if (!this.memorySession.proof) {
      throw new Error('No proof available. Complete authentication first.');
    }

    // Derive account before clearing memory session
    const account = this.deriveAccountFromProof(this.memorySession.proof, this.memorySession.ephemeralPublicKey);

    // Encrypt keypair
    const encryptedKeypair = encryptWithPIN(this.memorySession.keypair, pin);

    // Store to sessionStorage
    const storedData: StoredSessionData = {
      ephemeralPublicKey: this.memorySession.ephemeralPublicKey,
      encryptedKeypair,
      proof: this.memorySession.proof,
      timestamp: this.memorySession.timestamp,
      version: SessionManager.VERSION
    };

    sessionStorage.setItem(SessionManager.SESSION_KEY, JSON.stringify(storedData));

    // Clear memory session (security)
    this.memorySession = null;

    log.debug('Session encrypted and persisted');

    // Emit account change event (account state hasn't changed, but encryption state has)
    this.emitAccountChange(account);
  }

  /**
   * Get decrypted keypair
   * Requires PIN for decryption
   *
   * @param pin - 6-digit PIN
   * @returns Ephemeral keypair
   * @throws Error if wrong PIN or no session
   */
  getKeypair(pin: string): EphemeralKeypair {
    // Check memory first (before encryption)
    if (this.memorySession) {
      return this.memorySession.keypair;
    }

    // Load from sessionStorage and decrypt
    const stored = this.loadStoredSession();

    if (!stored) {
      throw new Error('No active session found.');
    }

    try {
      return decryptWithPIN<EphemeralKeypair>(stored.encryptedKeypair, pin);
    } catch (error) {
      log.error('Failed to decrypt keypair:', error);
      throw new Error('Failed to decrypt keypair. Incorrect PIN?');
    }
  }

  /**
   * Update proof (called by polling service)
   *
   * @param proof - Updated proof
   */
  updateProof(proof: Proof): void {
    let ephemeralPublicKey: Hex | null = null;

    // Update memory session if exists
    if (this.memorySession) {
      this.memorySession.proof = proof;
      ephemeralPublicKey = this.memorySession.ephemeralPublicKey;
    }

    // Update sessionStorage if exists
    const stored = this.loadStoredSession();

    if (stored) {
      stored.proof = proof;
      sessionStorage.setItem(SessionManager.SESSION_KEY, JSON.stringify(stored));
      ephemeralPublicKey = stored.ephemeralPublicKey;
    }

    log.debug('Proof updated, status:', proof.status);

    // Emit account change event if we have the public key
    if (ephemeralPublicKey && proof.zkAddress) {
      const account = this.deriveAccountFromProof(proof, ephemeralPublicKey);

      this.emitAccountChange(account);
    }
  }

  /**
   * Get current session information
   *
   * @returns Session info or null if no session
   */
  getSession(): SessionInfo | null {
    // Check memory session first
    if (this.memorySession) {
      const account = this.memorySession.proof
        ? this.deriveAccountFromProof(this.memorySession.proof, this.memorySession.ephemeralPublicKey)
        : null;

      return {
        state: this.memorySession.proof ? 'authenticated' : 'initialized',
        ephemeralPublicKey: this.memorySession.ephemeralPublicKey,
        proof: this.memorySession.proof,
        account,
        timestamp: this.memorySession.timestamp
      };
    }

    // Check sessionStorage
    const stored = this.loadStoredSession();

    if (!stored || !stored.proof) {
      return null;
    }

    const account = stored.proof.zkAddress
      ? this.deriveAccountFromProof(stored.proof, stored.ephemeralPublicKey)
      : null;

    return {
      state: stored.proof.status === 'generated' ? 'active' : 'encrypted',
      ephemeralPublicKey: stored.ephemeralPublicKey,
      proof: stored.proof,
      account,
      timestamp: stored.timestamp
    };
  }

  /**
   * Restore session from sessionStorage
   * Called on page load
   *
   * @returns Session info or null if no session to restore
   */
  restore(): SessionInfo | null {
    return this.getSession();
  }

  /**
   * Terminate session and clean up all data
   */
  terminate(): void {
    // Clear memory
    this.memorySession = null;

    // Clear sessionStorage
    sessionStorage.removeItem(SessionManager.SESSION_KEY);

    log.debug('Session terminated');

    // Emit account change event (account is now null)
    this.emitAccountChange(null);
  }

  /**
   * Check if session exists
   */
  hasSession(): boolean {
    return this.getSession() !== null;
  }

  /**
   * Get ephemeral public key (if session exists)
   */
  getEphemeralPublicKey(): Hex | null {
    const session = this.getSession();

    return session?.ephemeralPublicKey ?? null;
  }

  /**
   * Load stored session from sessionStorage
   * @private
   */
  private loadStoredSession(): StoredSessionData | null {
    const stored = sessionStorage.getItem(SessionManager.SESSION_KEY);

    if (!stored) return null;

    try {
      return JSON.parse(stored) as StoredSessionData;
    } catch {
      log.error('Failed to parse stored session');

      return null;
    }
  }

  /**
   * Derive ZkAccount from Proof
   * @private
   */
  private deriveAccountFromProof(proof: Proof, ephemeralPublicKey: Hex): ZkAccount {
    return {
      type: 'zk',
      address: proof.zkAddress!,
      provider: proof.provider,
      ephemeralPublicKey,
      name: proof.name,
      email: proof.email,
      picture: proof.picture,
      proofStatus: proof.status === 'generated' ? 'generated' : proof.status === 'failed' ? 'error' : 'pending'
    };
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();

// Backward compatibility exports (delegate to sessionManager)
export function getCurrentAccount() {
  const session = sessionManager.getSession();

  if (!session?.account || !session.proof) return null;

  return {
    account: session.account,
    ephemeralPublicKey: session.ephemeralPublicKey,
    proof: session.proof,
    timestamp: session.timestamp
  };
}

export function hasCurrentAccount(): boolean {
  return sessionManager.hasSession();
}

export function removeCurrentAccount(): void {
  sessionManager.terminate();
}

export function storeCurrentAccount(_ephemeralPublicKey: Hex, proof: Proof | null): void {
  // This is called during authentication
  // If no memory session, it means we're updating an existing session
  if (proof) {
    sessionManager.updateProof(proof);
  }
}
