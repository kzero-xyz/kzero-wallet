// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import Connecting from '../card/Connecting';
import Encrypt from '../card/Encrypt';
import Forget from '../card/Forget';
import LoginFailed from '../card/LoginFailed';
import LoginSuccess from '../card/LoginSuccess';
import SecurityCheck from '../card/SecurityCheck';
import SignExtrinsic from '../card/SignExtrinsic';

function CardsPage() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const mockAccount: any = {
    type: 'zk' as const,
    name: 'Test User',
    address: '0xeb906536b84a16ae85b3e2f83816a7c17e6d1dfc1874daf5d4573fd70268f787',
    picture: 'https://lh3.googleusercontent.com/a/default-user',
    provider: 'google' as const,
    ephemeralPublicKey: '0x1234567890abcdef'
  };

  return (
    <div className='min-h-full bg-background text-foreground p-8'>
      <div className='max-w-6xl mx-auto space-y-12'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-4xl font-bold mb-2'>Kzero Wallet Cards</h1>
            <p className='text-foreground/60'>Wallet card components showcase</p>
          </div>
          <button
            onClick={toggleTheme}
            className='px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors'
          >
            {isDark ? '☀️' : '🌙'} {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* SecurityCheck Component */}
        <section className='space-y-4'>
          <h2 className='text-2xl font-semibold'>SecurityCheck Component</h2>
          <div className='flex gap-4 items-center p-6 bg-secondary/10 rounded-lg'>
            <SecurityCheck />
            <p className='text-sm text-foreground/60'>
              This component shows security check progress with animated states
            </p>
          </div>
        </section>

        {/* Card Components Grid */}
        <section className='space-y-4'>
          <h2 className='text-2xl font-semibold'>Card Components</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {/* Connecting */}
            <div className='space-y-2'>
              <h3 className='text-lg font-medium'>Connecting</h3>
              <Connecting provider='google' onBack={() => console.log('Back clicked')} />
            </div>

            {/* LoginSuccess */}
            <div className='space-y-2'>
              <h3 className='text-lg font-medium'>Login Success</h3>
              <LoginSuccess
                account={{
                  address: '0xeb906536b84a16ae85b3e2f83816a7c17e6d1dfc1874daf5d4573fd70268f787',
                  email: 'user@example.com'
                }}
                provider='google'
                onContinue={() => console.log('Continue clicked')}
              />
            </div>

            {/* LoginFailed */}
            <div className='space-y-2'>
              <h3 className='text-lg font-medium'>Login Failed</h3>
              <LoginFailed error='Connection failed' provider='google' onBack={() => console.log('Back clicked')} />
            </div>

            {/* Encrypt - Create PIN */}
            <div className='space-y-2'>
              <h3 className='text-lg font-medium'>Create Transaction PIN</h3>
              <Encrypt
                onSuccess={() => console.log('PIN created successfully')}
                onError={(error) => console.log('Error:', error)}
                onBack={() => console.log('Back clicked')}
              />
            </div>

            {/* Forget */}
            <div className='space-y-2'>
              <h3 className='text-lg font-medium'>Forget PIN</h3>
              <Forget
                accounts={[mockAccount]}
                onConfirm={(provider) => console.log('Confirm with provider:', provider)}
                onBack={() => console.log('Back clicked')}
              />
            </div>

            {/* Welcome - Needs port and authService, skipped in demo */}
            <div className='space-y-2'>
              <h3 className='text-lg font-medium'>Welcome</h3>
              <div className='p-4 border rounded bg-secondary/5'>
                <p className='text-sm text-foreground/60'>Welcome card requires real port and authService context</p>
              </div>
            </div>

            {/* SignExtrinsic */}
            <div className='space-y-2'>
              <h3 className='text-lg font-medium'>Sign Extrinsic</h3>
              <SignExtrinsic
                payload={{
                  address: mockAccount.address,
                  method: '0x1234',
                  withSignedTransaction: true
                }}
                account={mockAccount}
                origin='https://example.com'
                wsEndpoint='ws://127.0.0.1:9944'
                onSuccess={(result) => console.log('Sign success:', result)}
                onError={(error) => console.log('Sign error:', error)}
                onCancel={() => console.log('Sign cancelled')}
              />
            </div>
          </div>
        </section>

        <div className='h-20' />
      </div>
    </div>
  );
}

export const Route = createFileRoute('/cards')({
  component: CardsPage
});
