// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { LoginProvider } from '@kzero/zk-core';

import React from 'react';

import Button from '../components/Button.js';
import Divider from '../components/Divider.js';
import BackIcon from '../icons/Back.js';
import Failed from '../icons/Failed.js';

interface LoginFailedProps {
  error: string;
  provider: LoginProvider;
  onBack: () => void;
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

export function LoginFailed({ error, provider, onBack }: LoginFailedProps) {
  const providerName = PROVIDER_NAMES[provider] || provider;

  return (
    <>
      <Button iconOnly onClick={onBack}>
        <BackIcon />
      </Button>

      <div className='flex flex-1 flex-col items-center justify-center gap-5'>
        <Failed style={{ width: 128, height: 128 }} />
        <h3 className='m-0 text-xl font-semibold leading-6'>Login failed</h3>
        <div className='text-center'>
          <p className='m-0 text-sm text-gray-600'>Failed to login with {providerName}</p>
          <p className='m-0 mt-2 text-xs text-red-500'>{error}</p>
        </div>
      </div>

      <Divider />

      <Button onClick={onBack} className='w-full'>
        Try again
      </Button>
    </>
  );
}

export default React.memo(LoginFailed);
