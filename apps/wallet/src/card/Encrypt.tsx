// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { AuthService } from '../lib/authService.js';

import React, { useState } from 'react';

import Button from '../components/Button';
import Divider from '../components/Divider';
import PinInput from '../components/PinInput';
import BackIcon from '../icons/Back';
import HideIcon from '../icons/Hide';
import ViewIcon from '../icons/View';
import { proofPollingService } from '../lib/proofPollingService.js';
import { sessionManager } from '../lib/sessionManager.js';
import { cn } from '../lib/utils';
import SecurityCheck from './SecurityCheck';

interface EncryptProps {
  authService?: AuthService;
  onSuccess: () => void;
  onError: (error: string) => void;
  onBack: () => void;
}

function Encrypt({ authService, onSuccess, onError, onBack }: EncryptProps) {
  const [passphrase, setPassphrase] = useState('');
  const [isHidden, setIsHidden] = useState(true);
  const [isError, setIsError] = useState(false);

  const handleChange = (value: string) => {
    setPassphrase(value);
    setIsError(false);
  };

  const handleConfirm = (pin: string) => {
    try {
      // For new encryption
      if (authService) {
        // Encrypt session with PIN
        // This will automatically emit account change event via sessionManager
        sessionManager.encrypt(pin);

        // Get ephemeral public key for polling
        const ephemeralPublicKey = sessionManager.getEphemeralPublicKey();

        if (!ephemeralPublicKey) {
          throw new Error('No active session found');
        }

        // Start polling for proof updates
        proofPollingService.start(authService, ephemeralPublicKey);

        console.log('Authentication completed successfully, polling started');

        // Call success callback
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to encrypt keypair:', error);
      onError(error instanceof Error ? error.message : 'Encryption failed');
    }
  };

  const onComplete = (value: string) => {
    handleConfirm(value);
  };

  return (
    <>
      <div className='flex justify-between items-center gap-[5px]'>
        <Button iconOnly onClick={onBack}>
          <BackIcon />
        </Button>
        <SecurityCheck />
      </div>

      <form
        className='flex-1 flex flex-col items-center justify-center gap-2.5'
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <h4 className='m-0 text-xl font-semibold leading-6'>{'Create Transaction PIN'}</h4>
        <p className='m-0 text-sm font-normal leading-[17px]'>{'Required when initiating a transaction'}</p>

        <div className='w-full'>
          <PinInput isHidden={isHidden} isError={isError} onChange={handleChange} onComplete={onComplete} />
        </div>

        <div className='w-full h-10 flex justify-between items-center gap-2.5'>
          <Button
            type='button'
            className={cn(
              'shrink-0',
              isHidden
                ? 'text-border border-border hover:enabled:text-white hover:enabled:border-primary'
                : 'text-primary border-primary hover:enabled:text-white'
            )}
            onClick={() => setIsHidden(!isHidden)}
          >
            {isHidden ? <ViewIcon /> : <HideIcon />}
          </Button>
          <Button
            type='submit'
            variant='filled'
            color='primary'
            disabled={passphrase.length !== 6}
            className='flex-1'
            onClick={() => handleConfirm(passphrase)}
          >
            Confirm
          </Button>
        </div>
      </form>

      <Divider />
    </>
  );
}

export default React.memo(Encrypt);
