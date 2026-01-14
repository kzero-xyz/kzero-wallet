// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { ApiPromise } from '@polkadot/api';
import type { ZkAccount } from '@kzero/zk-core';

import { createPair } from '@polkadot/keyring';
import { hexToU8a } from '@polkadot/util';
import { ed25519PairFromSecret, encodeAddress } from '@polkadot/util-crypto';
import { useState } from 'react';

import Button from '../../components/Button';
import PinInput from '../../components/PinInput';
import HideIcon from '../../icons/Hide';
import ViewIcon from '../../icons/View';
import { prepareCall } from '../../lib/parseCall';
import { sessionManager } from '../../lib/sessionManager';
import { cn } from '../../lib/utils';

interface SubmitProps {
  api: ApiPromise;
  method: string;
  address: string;
  account: ZkAccount;
  onSuccess: (signature: string, signedTransaction: string) => void;
  onError: (reason: string) => void;
  onReject: () => void;
  onForget?: () => void;
}

export default function Submit({ api, method, onSuccess, onError, onReject, onForget }: SubmitProps) {
  const [isHidden, setIsHidden] = useState(true);
  const [isError, setIsError] = useState(false);

  const handlePress = async (pinValue: string) => {
    const data = sessionManager.getSession();
    const proof = data?.proof;

    // Check if proof is in 'generated' status
    if (proof?.status !== 'generated') {
      console.error('[Submit] Proof is not ready:', proof?.status);
      onError(`Proof is not ready (status: ${proof?.status})`);

      return;
    }

    try {
      // Get ephemeral keypair from session manager (decrypts with PIN)
      const ephemeralKeypair = sessionManager.getKeypair(pinValue);

      await api.isReady;

      // Create keypair from ephemeral private key seed (convert hex to Uint8Array)
      const keypair = createPair(
        { toSS58: (addr: Uint8Array) => encodeAddress(addr), type: 'ed25519' },
        ed25519PairFromSecret(hexToU8a(ephemeralKeypair.privateKey))
      );

      const { uxt, zkMaterial, address: zkAddress } = await prepareCall(api, method, keypair, proof);

      const tx = api.tx.zkLogin.submitZkloginUnsigned(
        api.createType('Bytes', uxt.toU8a()),
        api.createType('MultiAddress', {
          Id: zkAddress
        }),
        zkMaterial
      );

      onSuccess(tx.signature.toString(), tx.toHex());
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown error';

      console.error('[Submit] Error signing transaction:', error);

      // Check if this is a PIN decryption error (wrong password)
      if (reason.includes('Failed to decrypt keypair')) {
        // Show error in UI only, don't call onError callback
        setIsError(true);
      } else {
        // For other errors, call onError callback
        onError(reason);
      }
    }
  };

  const handleChange = () => {
    setIsError(false);
  };

  const onComplete = (value: string) => {
    handlePress(value);
  };

  return (
    <div className='flex flex-col gap-5'>
      <PinInput isHidden={isHidden} isError={isError} onChange={handleChange} onComplete={onComplete} />
      <div className='w-full h-10 flex items-center gap-2.5'>
        <Button
          type='button'
          className={cn(
            'shrink-0',
            isHidden
              ? 'rounded-full text-border border-border hover:enabled:text-white hover:enabled:border-primary'
              : 'text-primary border-primary hover:enabled:text-white'
          )}
          onClick={() => setIsHidden(!isHidden)}
        >
          {isHidden ? <ViewIcon /> : <HideIcon />}
        </Button>
        <Button color='primary' onClick={onReject}>
          Reject
        </Button>
        <span className='flex-1 cursor-pointer text-primary text-sm text-right' onClick={onForget}>
          Forget PIN?
        </span>
      </div>
    </div>
  );
}
