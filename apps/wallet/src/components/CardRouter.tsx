// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import Connecting from '../card/Connecting.js';
import Encrypt from '../card/Encrypt.js';
import Forget from '../card/Forget.js';
import LoginFailed from '../card/LoginFailed.js';
import LoginSuccess from '../card/LoginSuccess.js';
import SignExtrinsic from '../card/SignExtrinsic.js';
import { Welcome } from '../card/Welcome.js';
import { useCardStore } from '../lib/cardStore.js';
import { getMessageHandler } from '../lib/messageHandler.js';
import { sessionManager } from '../lib/sessionManager.js';
import { useAppContext } from '../lib/useAppContext.js';
import AddressCell from './AddressCell.js';
import PoweredBy from './PoweredBy.js';

/**
 * Card Router Component
 * Routes to the appropriate card based on current state
 */
export function CardRouter() {
  const { currentCard, navigateTo } = useCardStore();
  const { port, authService } = useAppContext();

  // Check if user is logged in
  const currentSession = sessionManager.getSession();
  const isLoggedIn = currentSession !== null;

  let cardContent;

  switch (currentCard.type) {
    case 'welcome':
      cardContent = <Welcome port={port} authService={authService} onNavigate={navigateTo} />;
      break;

    case 'connecting':
      cardContent = (
        <Connecting
          provider={currentCard.provider}
          success={currentCard.success}
          onBack={() => navigateTo({ type: 'welcome' })}
          onSuccess={() => navigateTo({ type: 'encrypt' })}
        />
      );
      break;

    case 'login-success':
      cardContent = (
        <LoginSuccess
          account={currentSession?.account || { address: '', email: '' }}
          provider='google' // TODO: Store provider
        />
      );
      break;

    case 'login-failed':
      cardContent = (
        <LoginFailed
          error={currentCard.error}
          provider={currentCard.provider}
          onBack={() => navigateTo({ type: 'welcome' })}
        />
      );
      break;

    case 'encrypt':
      cardContent = (
        <Encrypt
          authService={authService}
          onSuccess={() => {
            navigateTo({ type: 'login-success' });
          }}
          onError={(error) => {
            navigateTo({
              type: 'login-failed',
              error,
              provider: 'google' // TODO: Store provider
            });
          }}
          onBack={() => navigateTo({ type: 'welcome' })}
        />
      );
      break;

    case 'forget':
      cardContent = (
        <Forget
          accounts={[]}
          onConfirm={(provider) => {
            // TODO: Handle account recovery
            console.log('Recover account with provider:', provider);
          }}
          onBack={() => navigateTo({ type: 'welcome' })}
        />
      );
      break;

    case 'sign-extrinsic':
      if (!currentSession || !currentSession.account || !currentSession.proof) {
        // No session, redirect to welcome
        cardContent = <Welcome port={port} authService={authService} onNavigate={navigateTo} />;
      } else {
        const messageHandler = getMessageHandler();

        cardContent = (
          <SignExtrinsic
            payload={currentCard.payload}
            account={currentSession.account}
            wsEndpoint={currentCard.wsEndpoint}
            origin={currentCard.origin}
            onSuccess={(result) => {
              messageHandler?.resolveSignRequest(result);
              // Navigate back to login-success or stay on current view
              navigateTo({ type: 'login-success' });
            }}
            onError={(error) => {
              messageHandler?.rejectSignRequest(error);
              // Navigate back to login-success or stay on current view
              navigateTo({ type: 'login-success' });
            }}
            onCancel={() => {
              messageHandler?.rejectSignRequest('User cancelled transaction');
              // Navigate back to login-success or stay on current view
              navigateTo({ type: 'login-success' });
            }}
          />
        );
      }

      break;

    default:
      // Fallback to welcome
      cardContent = <Welcome port={port} authService={authService} onNavigate={navigateTo} />;
  }

  return (
    <div className='flex h-full w-full flex-col gap-5 p-5 text-sm antialiased'>
      {cardContent}

      {/* Footer: Show AddressCell if logged in, otherwise show PoweredBy */}
      <div className='mt-auto'>
        {isLoggedIn && currentSession?.account ? <AddressCell account={currentSession.account} /> : <PoweredBy />}
      </div>
    </div>
  );
}
