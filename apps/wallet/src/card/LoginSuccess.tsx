// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { LoginProvider } from '@kzero/zk-core';

import React, { useEffect } from 'react';

import Button from '../components/Button.js';
import Divider from '../components/Divider.js';
import SuccessLogin from '../icons/SuccessLogin.js';

interface LoginSuccessProps {
  account: {
    address: string;
    name?: string;
    email?: string;
  };
  provider: LoginProvider;
  onContinue?: () => void;
}

/**
 * Provider display name mapping
 */
const PROVIDER_NAMES: Record<LoginProvider, string> = {
  google: 'Google',
  twitter: 'Twitter',
  apple: 'Apple',
  github: 'GitHub',
  telegram: 'Telegram',
  discord: 'Discord'
};

export function LoginSuccess({ account, provider, onContinue }: LoginSuccessProps) {
  const providerName = PROVIDER_NAMES[provider] || provider;

  // Auto-continue after 2 seconds if onContinue is provided
  useEffect(() => {
    if (onContinue) {
      const timer = setTimeout(() => {
        onContinue();
      }, 2000);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [onContinue]);

  return (
    <>
      <div className='flex flex-1 flex-col items-center justify-center gap-5'>
        <SuccessLogin style={{ width: 128, height: 128 }} />
        <h3 className='m-0 text-xl font-semibold leading-6'>Login successfully</h3>
        <div className='text-center'>
          <p className='m-0 text-sm text-foreground/60'>
            Logged in with {providerName}
            {account.email && ` as ${account.email}`}
          </p>
          <p className='m-0 mt-2 text-xs text-foreground/50'>Your proof is being generated in the background</p>
        </div>
      </div>

      <Divider />

      {onContinue && (
        <Button onClick={onContinue} className='w-full'>
          Continue
        </Button>
      )}
    </>
  );
}

export default React.memo(LoginSuccess);
