// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { LoginProvider } from '@kzero/zk-core';

import React, { useEffect } from 'react';

import Button from '../components/Button.js';
import CircleLoading from '../components/CircleLoading.js';
import Divider from '../components/Divider.js';
import AppleIcon from '../icons/Apple.js';
import BackIcon from '../icons/Back.js';
import DiscordIcon from '../icons/Discord.js';
import GithubIcon from '../icons/Github.js';
import GoogleIcon from '../icons/Google.js';
import TelegramIcon from '../icons/Telegram.js';
import XIcon from '../icons/X.js';

interface ConnectingProps {
  provider: LoginProvider;
  success?: boolean;
  onBack: () => void;
  onSuccess?: () => void;
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

/**
 * Provider icon mapping
 */
const PROVIDER_ICONS: Record<LoginProvider, React.ComponentType<{ style?: React.CSSProperties }>> = {
  google: GoogleIcon,
  twitter: XIcon,
  apple: AppleIcon,
  github: GithubIcon,
  telegram: TelegramIcon,
  discord: DiscordIcon
};

export function Connecting({ provider, success = false, onBack, onSuccess }: ConnectingProps) {
  const providerName = PROVIDER_NAMES[provider] || provider;
  const ProviderIcon = PROVIDER_ICONS[provider] || GoogleIcon;

  // Auto-continue after 2 seconds when success is true
  useEffect(() => {
    if (success && onSuccess) {
      const timer = setTimeout(() => {
        onSuccess();
      }, 800);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [success, onSuccess]);

  return (
    <>
      <Button iconOnly onClick={onBack}>
        <BackIcon />
      </Button>

      <div className='flex flex-1 flex-col items-center justify-center gap-5'>
        <CircleLoading size={128} success={success} error={false}>
          <ProviderIcon style={{ width: '60%', height: '60%' }} />
        </CircleLoading>
        <h3 className='m-0 text-xl font-semibold leading-6'>
          {success ? `Connected with ${providerName}!` : `Connecting with ${providerName}...`}
        </h3>
        <p className='m-0 text-center text-sm text-gray-500'>
          {success ? 'Authentication successful' : 'Please complete authentication in the popup window'}
        </p>
      </div>

      <Divider />
    </>
  );
}

export default React.memo(Connecting);
