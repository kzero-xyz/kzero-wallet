// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { BidirectionalPort } from '@kzero/message-port';
import type { Hex, LoginProvider, MessageData, Proof } from '@kzero/zk-core';
import type { AuthService } from '../lib/authService.js';
import type { CardDataForType, CardType } from '../lib/cardStore.js';

import { useEffect, useMemo, useState } from 'react';

import Button from '../components/Button.js';
import Divider from '../components/Divider.js';
import Socials from '../icons/Socials.js';
import { providersManager } from '../lib/providersManager.js';
import { sessionManager } from '../lib/sessionManager.js';
import AppleProvider from './providers/AppleProvider.js';
import DiscordProvider from './providers/DiscordProvider.js';
import GithubProvider from './providers/GithubProvider.js';
import GoogleProvider from './providers/GoogleProvider.js';
import TelegramProvider from './providers/TelegramProvider.js';
import TwitterProvider from './providers/TwitterProvider.js';
import RemainProviders from './RemainProviders.js';

interface WelcomeProps {
  port: BidirectionalPort<MessageData>;
  authService: AuthService;
  onNavigate: <T extends CardType>(data: CardDataForType<T>) => void;
}

// Provider component mapping
const providerMapping: Record<LoginProvider, React.ComponentType<{ onClick: (provider: LoginProvider) => void }>> = {
  google: GoogleProvider,
  twitter: TwitterProvider,
  apple: AppleProvider,
  github: GithubProvider,
  telegram: TelegramProvider,
  discord: DiscordProvider
};

// Polling configuration
const POLL_INTERVAL = 1000; // 1 second
const MAX_POLL_ATTEMPTS = 15; // 15 seconds total

/**
 * Navigate to connecting success state (which will auto-navigate to encrypt)
 */
function navigateToConnectingSuccess(
  _proof: Proof,
  provider: LoginProvider,
  _ephemeralPublicKey: string,
  onNavigate: <T extends CardType>(data: CardDataForType<T>) => void
) {
  onNavigate({
    type: 'connecting',
    provider,
    success: true
  });
}

/**
 * Navigate to login failed with error message
 */
function navigateToLoginFailed(
  error: string,
  provider: LoginProvider,
  onNavigate: <T extends CardType>(data: CardDataForType<T>) => void
) {
  onNavigate({
    type: 'login-failed',
    error,
    provider
  });
}

/**
 * Handle proof status and navigate accordingly
 */
function handleProofStatus(
  proof: Proof,
  provider: LoginProvider,
  ephemeralPublicKey: string,
  onNavigate: <T extends CardType>(data: CardDataForType<T>) => void,
  cleanup: () => void
): 'handled' | 'waiting' {
  if (proof.status === 'generated' || proof.status === 'generating') {
    cleanup();
    navigateToConnectingSuccess(proof, provider, ephemeralPublicKey, onNavigate);

    return 'handled';
  } else if (proof.status === 'failed') {
    cleanup();
    navigateToLoginFailed('Proof generation failed', provider, onNavigate);

    return 'handled';
  } else if (proof.status === 'waiting') {
    return 'waiting';
  }

  return 'handled';
}

/**
 * Start polling for proof with timeout
 */
function startProofPolling(
  authService: AuthService,
  ephemeralPublicKey: Hex,
  provider: LoginProvider,
  onNavigate: <T extends CardType>(data: CardDataForType<T>) => void,
  unsubscribe: () => void,
  setIsLoading: (loading: boolean) => void
) {
  let pollAttempts = 0;

  const cleanup = () => {
    clearInterval(pollInterval);
    unsubscribe();
    setIsLoading(false);
  };

  const pollForProof = async () => {
    try {
      pollAttempts++;

      const proof = await authService.getProof(ephemeralPublicKey);

      // Update proof in session
      sessionManager.authenticate(proof);

      const result = handleProofStatus(proof, provider, ephemeralPublicKey, onNavigate, cleanup);

      if (result === 'waiting') {
        // Check timeout
        if (pollAttempts >= MAX_POLL_ATTEMPTS) {
          cleanup();
          onNavigate({ type: 'welcome' });
        }
        // Continue polling
      }
    } catch (error) {
      console.error('Poll error:', error);
      cleanup();
      onNavigate({ type: 'welcome' });
    }
  };

  // Start polling
  const pollInterval = window.setInterval(pollForProof, POLL_INTERVAL);
}

export function Welcome({ port, authService, onNavigate }: WelcomeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showRemainingProviders, setShowRemainingProviders] = useState(false);
  const [providers, setProviders] = useState<LoginProvider[]>(providersManager.getProviders());

  // Subscribe to providers changes
  useEffect(() => {
    const unsubscribe = providersManager.subscribe(setProviders);

    return unsubscribe;
  }, []);

  const [topProviders, remainingProviders] = useMemo(
    () => (providers.length > 3 ? [providers.slice(0, 2), providers.slice(4)] : [providers, []]),
    [providers]
  );

  const handleProviderClick = async (provider: LoginProvider) => {
    try {
      setIsLoading(true);

      // 1. Initialize session and generate ephemeral keypair
      const { ephemeralPublicKey } = sessionManager.initialize();

      // 2. Get authentication URL from backend
      const authUrl = await authService.getAuthUrl(provider, ephemeralPublicKey);

      // 3. Send auth request to parent window
      port.emit('auth.request', {
        provider,
        authUrl,
        sessionId: ephemeralPublicKey // Use ephemeralPublicKey as sessionId
      });

      // 4. Navigate to Connecting card
      onNavigate({ type: 'connecting', provider });

      // 5. Listen for window closed event and then fetch proof
      const unsubscribe = port.on('auth.window-closed', async () => {
        try {
          // Query backend for proof using ephemeral public key
          const proof = await authService.getProof(ephemeralPublicKey);

          const cleanup = () => {
            unsubscribe();
            setIsLoading(false);
          };

          // Store proof in session
          sessionManager.authenticate(proof);

          // Handle immediate proof status
          const result = handleProofStatus(proof, provider, ephemeralPublicKey, onNavigate, cleanup);

          // If still waiting, start polling
          if (result === 'waiting') {
            startProofPolling(authService, ephemeralPublicKey, provider, onNavigate, unsubscribe, setIsLoading);
          }
        } catch (error) {
          console.error('Failed to get proof:', error);
          unsubscribe();
          setIsLoading(false);

          navigateToLoginFailed('User rejected', provider, onNavigate);
        }
      });
    } catch (error) {
      console.error('Auth error:', error);
      setIsLoading(false);
      navigateToLoginFailed(error instanceof Error ? error.message : 'Unknown error', provider, onNavigate);
    }
  };

  if (showRemainingProviders) {
    return (
      <RemainProviders
        providers={remainingProviders}
        handleProviderClick={handleProviderClick}
        onBack={() => setShowRemainingProviders(false)}
        providerMapping={providerMapping}
      />
    );
  }

  return (
    <>
      <div className='flex items-center justify-center'>
        <img
          src='/kzero-bg.webp'
          alt='Kzero Logo'
          className='h-[100px] w-auto rounded-md object-contain object-center'
        />
      </div>

      <div className='text-center'>Login or Sign up</div>

      <Divider />

      <div className='flex flex-1 flex-col gap-2.5'>
        {topProviders.map((provider) => {
          const Component = providerMapping[provider];

          return <Component key={provider} onClick={handleProviderClick} />;
        })}
        {remainingProviders.length > 0 && (
          <Button align='left' onClick={() => setShowRemainingProviders(true)} disabled={isLoading}>
            <Socials />
            Other socials
          </Button>
        )}
      </div>
    </>
  );
}

export default Welcome;
