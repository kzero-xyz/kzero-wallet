// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { u8aToHex } from '@polkadot/util';
import { blake2AsU8a, ed25519PairFromRandom } from '@polkadot/util-crypto';

import { type Account, getProof, type Hex, type Proof } from '@kzero/zk-core';

import { encrypt } from '../crypto/encrypt.js';
import { _clearPassphrase, _getPassphrase, getZkAccount, unlock } from '../utils.js';
import IframeMessage from './IframeMessage.js';

class WalletMessage extends IframeMessage {
  #ephemeralKeys: Map<Hex, Uint8Array> = new Map(); // ephemeralPublicKeyHex -> encryptedPrivateKeyHex

  constructor() {
    super();
    this.onMessage('ephemeral-key.encrypt', this.handleEncryptKey.bind(this));
    this.onMessage('ephemeral-key.generate', this.handleGenerateKey.bind(this));
    this.onMessage('accounts.all', this.handleGetAccounts.bind(this));
    this.onMessage('accounts.retrieve', this.handleRetrieveAccount.bind(this));
    this.onMessage('unlock', this.handleUnlock.bind(this));
    this.onMessage('isLocked', this.handleIsLocked.bind(this));
    this.onMessage('proof.get', this.handleGetProof.bind(this));
    this.onMessage('logout', this.handleLogout.bind(this));

    const account = getZkAccount();

    if (account) {
      if (account.status === 'ready' && account.proofStatus === 'pending') {
        this.retrieveProof(account.ephemeralPublicKey);
      }

      if (account.status !== 'ready') {
        localStorage.removeItem('zk-account');
      }
    }
  }

  private _encryptKey(ephemeralPublicKey: Hex, passphrase: string | null = _getPassphrase()) {
    if (!passphrase) {
      throw new Error('Passphrase is required');
    }

    unlock(passphrase);

    const privateKey = this.#ephemeralKeys.get(ephemeralPublicKey);

    if (!privateKey) {
      throw new Error('Invalid ephemeral public key');
    }

    const encryptedPrivateKey = encrypt(privateKey, blake2AsU8a(passphrase));
    const encryptedPrivateKeyHex: Hex = u8aToHex(encryptedPrivateKey);

    // store the encrypted private key in localStorage
    localStorage.setItem(`ephemeral_keypair:${ephemeralPublicKey}`, JSON.stringify(encryptedPrivateKeyHex));

    const account = getZkAccount(ephemeralPublicKey);

    // update the account status to ready
    if (account && account.type === 'zk') {
      account.status = 'ready';
      localStorage.setItem(`zk-account`, JSON.stringify(account));
      window.parent.postMessage({ type: 'accounts.change', data: account }, '*');
    }
  }

  private handleUnlock(id: string, payload: { passphrase: string }) {
    try {
      unlock(payload.passphrase);
      this.sendMessage('unlock', id, null);
    } catch (error) {
      console.error(error);

      return this.sendError('unlock', id, (error as any)?.toString?.() || 'Unknown error');
    }
  }

  private handleIsLocked(id: string) {
    const isLocked = !_getPassphrase();

    this.sendMessage('isLocked', id, { isLocked });
  }

  private handleEncryptKey(id: string, payload: { passphrase?: string; ephemeralPublicKey: Hex }) {
    try {
      this._encryptKey(payload.ephemeralPublicKey, payload.passphrase);
      this.sendMessage('ephemeral-key.encrypt', id, null);
    } catch (error) {
      console.error(error);

      return this.sendError('ephemeral-key.encrypt', id, (error as any)?.toString?.() || 'Unknown error');
    }
  }

  private handleGenerateKey(id: string) {
    const randomKeypair = ed25519PairFromRandom();
    const privateKey = randomKeypair.secretKey;
    const publicKey = randomKeypair.publicKey;
    const publicKeyHex: Hex = u8aToHex(publicKey);

    this.#ephemeralKeys.set(publicKeyHex, privateKey);

    this.sendMessage('ephemeral-key.generate', id, {
      publicKey: publicKeyHex
    });
  }

  private handleGetAccounts(id: string) {
    const account = getZkAccount();

    this.sendMessage('accounts.all', id, { accounts: account ? [account] : [] });
  }

  private async handleRetrieveAccount(id: string, payload: { ephemeralPublicKey: Hex }) {
    try {
      const proof = await getProof('http://localhost:3000', payload.ephemeralPublicKey);
      // const proof = await getProof('https://demo-auth.kzero.xyz', payload.ephemeralPublicKey);

      if (proof.status === 'failed') {
        this.sendError('accounts.retrieve', id, 'Failed to Login');

        return;
      }

      const account: Account = {
        type: 'zk',
        address: proof.zkAddress,
        provider: proof.provider,
        ephemeralPublicKey: payload.ephemeralPublicKey,
        name: proof.name,
        picture: proof.picture,
        email: proof.email,
        status: 'encrypting',
        proofStatus: 'pending'
      };

      localStorage.setItem(`zk-account`, JSON.stringify(account));
      window.parent.postMessage({ type: 'accounts.change', data: account }, '*');

      const passphrase = _getPassphrase();

      if (passphrase) {
        this._encryptKey(payload.ephemeralPublicKey, passphrase);
      }

      this.sendMessage('accounts.retrieve', id, {
        account: { ...account }
      });

      setTimeout(() => {
        this.retrieveProof(payload.ephemeralPublicKey);
      }, 3000);
    } catch (error) {
      this.sendError('accounts.retrieve', id, (error as any)?.toString?.() || 'Unknown error');
    }
  }

  private async retrieveProof(ephemeralPublicKey: Hex) {
    while (true) {
      try {
        const proof = await getProof('http://localhost:3000', ephemeralPublicKey);
        // const proof = await getProof('https://demo-auth.kzero.xyz', ephemeralPublicKey);

        if (proof.status === 'generated') {
          const account = getZkAccount(ephemeralPublicKey);

          if (account) {
            account.proofStatus = 'generated';
            localStorage.setItem('zk-account', JSON.stringify(account));
            window.parent.postMessage({ type: 'accounts.change', data: account }, '*');
          }

          localStorage.setItem(`proof:${ephemeralPublicKey}`, JSON.stringify(proof));

          window.parent.postMessage({ type: 'proof.change', data: proof }, '*');

          const passphrase = _getPassphrase();

          if (passphrase) {
            this._encryptKey(ephemeralPublicKey, passphrase);
          }

          break;
        } else if (proof.status === 'failed') {
          const account = getZkAccount(ephemeralPublicKey);

          if (account) {
            account.proofStatus = 'error';
            localStorage.setItem('zk-account', JSON.stringify(account));
            window.parent.postMessage({ type: 'accounts.change', data: account }, '*');
          }

          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  private handleLogout(id: string) {
    localStorage.removeItem('zk-account');
    window.parent.postMessage({ type: 'accounts.change', data: null }, '*');
    _clearPassphrase();
    this.sendMessage('logout', id, null);
  }

  private handleGetProof(id: string, payload: { ephemeralPublicKey: Hex }) {
    const proof: Proof | null = JSON.parse(localStorage.getItem(`proof:${payload.ephemeralPublicKey}`) || 'null');

    this.sendMessage('proof.get', id, { proof });
  }
}

export default WalletMessage;
