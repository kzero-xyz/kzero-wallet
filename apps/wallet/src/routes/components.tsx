// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import AddressCell from '../components/AddressCell';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import CircleLoading from '../components/CircleLoading';
import Divider from '../components/Divider';
import PinInput from '../components/PinInput';
import PoweredBy from '../components/PoweredBy';
import RotatingLines from '../components/RotatingLines';
import AppleIcon from '../icons/Apple';
import BackIcon from '../icons/Back';
import DiscordIcon from '../icons/Discord';
import FailedIcon from '../icons/Failed';
import FailedLoginIcon from '../icons/FailedLogin';
import GithubIcon from '../icons/Github';
import GoogleIcon from '../icons/Google';
import HideIcon from '../icons/Hide';
import KzeroLogo from '../icons/KzeroLogo';
import SocialsIcon from '../icons/Socials';
import SuccessLoginIcon from '../icons/SuccessLogin';
import TelegramIcon from '../icons/Telegram';
import ViewIcon from '../icons/View';
import WebWalletIcon from '../icons/WebWallet';
import XIcon from '../icons/X';

function ComponentsPage() {
  const [pin, setPin] = useState('');
  const [isHidden, setIsHidden] = useState(false);
  const [isError, setIsError] = useState(false);
  const [loadingState, setLoadingState] = useState<'loading' | 'success' | 'error'>('loading');
  const [isDark, setIsDark] = useState(false);

  const mockAccount: any = {
    type: 'zk' as const,
    name: 'Test User',
    address: `0xeb906536b84a16ae85b3e2f83816a7c17e6d1dfc1874daf5d4573fd70268f787`,
    picture: 'https://lh3.googleusercontent.com/a/default-user'
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className='min-h-full bg-background text-foreground p-8'>
      <div className='max-w-4xl mx-auto space-y-12'>
        {/* Header with Theme Toggle */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-4xl font-bold mb-2'>Kzero Wallet Components</h1>
            <p className='text-foreground/60'>Tailwind CSS migration showcase</p>
          </div>
          <Button variant='bordered' color='primary' onClick={toggleTheme}>
            {isDark ? '☀️' : '🌙'} {isDark ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>

        {/* Buttons Section */}
        <section className='space-y-4'>
          <h2 className='text-2xl font-semibold'>Buttons</h2>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <p className='text-sm font-medium'>Filled Variants</p>
              <div className='flex flex-col gap-2'>
                <Button variant='filled' color='primary'>
                  Primary Button
                </Button>
                <Button variant='filled' color='success'>
                  Success Button
                </Button>
                <Button variant='filled' color='error'>
                  Error Button
                </Button>
                <Button variant='filled' color='default'>
                  Default Button
                </Button>
                <Button variant='filled' color='primary' disabled>
                  Disabled Button
                </Button>
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium'>Bordered Variants</p>
              <div className='flex flex-col gap-2'>
                <Button variant='bordered' color='primary'>
                  Primary Button
                </Button>
                <Button variant='bordered' color='success'>
                  Success Button
                </Button>
                <Button variant='bordered' color='error'>
                  Error Button
                </Button>
                <Button variant='bordered' color='default'>
                  Default Button
                </Button>
                <Button variant='bordered' color='primary' disabled>
                  Disabled Button
                </Button>
              </div>
            </div>
          </div>
          <div className='space-y-2'>
            <p className='text-sm font-medium'>Icon + Text</p>
            <div className='flex flex-col gap-2'>
              <Button variant='filled' color='primary'>
                <GoogleIcon style={{ width: 20, height: 20 }} />
                Sign in with Google
              </Button>
              <Button variant='bordered' color='primary'>
                <AppleIcon style={{ width: 20, height: 20 }} />
                Sign in with Apple
              </Button>
              <Button variant='bordered' color='default'>
                <BackIcon style={{ width: 20, height: 20 }} />
                Go Back
              </Button>
            </div>
          </div>
          <div className='space-y-2'>
            <p className='text-sm font-medium'>Icon Only (Square 40x40)</p>
            <div className='flex gap-2'>
              <Button iconOnly variant='filled' color='primary'>
                <GoogleIcon style={{ width: 20, height: 20 }} />
              </Button>
              <Button iconOnly variant='bordered' color='primary'>
                <GoogleIcon style={{ width: 20, height: 20 }} />
              </Button>
              <Button iconOnly variant='bordered' color='default'>
                <BackIcon style={{ width: 20, height: 20 }} />
              </Button>
              <Button iconOnly variant='filled' color='success'>
                <AppleIcon style={{ width: 20, height: 20 }} />
              </Button>
              <Button iconOnly variant='filled' color='error'>
                <XIcon style={{ width: 20, height: 20 }} />
              </Button>
            </div>
          </div>
        </section>

        <Divider />

        {/* Avatar & AddressCell Section */}
        <section className='space-y-4'>
          <h2 className='text-2xl font-semibold'>Avatar & AddressCell</h2>
          <div className='flex gap-8 items-center'>
            <div className='space-y-2'>
              <p className='text-sm font-medium'>Avatar</p>
              <Avatar
                width={60}
                height={60}
                src='https://invalid-url.com/image.jpg'
                fallback={<GoogleIcon style={{ width: '60%', height: '60%' }} />}
              />
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium'>AddressCell</p>
              <AddressCell account={mockAccount} />
            </div>
          </div>
        </section>

        <Divider />

        {/* Loading Indicators Section */}
        <section className='space-y-4'>
          <h2 className='text-2xl font-semibold'>Loading Indicators</h2>
          <div className='grid grid-cols-3 gap-8'>
            <div className='space-y-2'>
              <p className='text-sm font-medium'>RotatingLines</p>
              <RotatingLines width={40} />
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium'>CircleLoading</p>
              <div className='flex gap-4'>
                <div className='space-y-2'>
                  <CircleLoading size={64} success={loadingState === 'success'} error={loadingState === 'error'}>
                    <GoogleIcon style={{ width: 32, height: 32 }} />
                  </CircleLoading>
                  <div className='flex gap-2'>
                    <button
                      className='text-xs px-2 py-1 bg-primary text-white rounded'
                      onClick={() => setLoadingState('loading')}
                    >
                      Loading
                    </button>
                    <button
                      className='text-xs px-2 py-1 bg-success text-white rounded'
                      onClick={() => setLoadingState('success')}
                    >
                      Success
                    </button>
                    <button
                      className='text-xs px-2 py-1 bg-error text-white rounded'
                      onClick={() => setLoadingState('error')}
                    >
                      Error
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* PinInput Section */}
        <section className='space-y-4'>
          <h2 className='text-2xl font-semibold'>PinInput</h2>
          <div className='max-w-md space-y-4'>
            <PinInput
              value={pin}
              isHidden={isHidden}
              isError={isError}
              onChange={setPin}
              onComplete={(value) => {
                console.log('PIN completed:', value);

                if (value === '123456') {
                  setIsError(false);
                  alert('Correct PIN!');
                } else {
                  setIsError(true);
                  setTimeout(() => setIsError(false), 500);
                }
              }}
            />
            <div className='flex gap-4'>
              <label className='flex items-center gap-2 text-sm'>
                <input type='checkbox' checked={isHidden} onChange={(e) => setIsHidden(e.target.checked)} />
                Hide PIN
              </label>
              <button className='text-xs px-3 py-1 bg-error text-white rounded' onClick={() => setIsError(!isError)}>
                Toggle Error
              </button>
              <button className='text-xs px-3 py-1 bg-border text-foreground rounded' onClick={() => setPin('')}>
                Clear
              </button>
            </div>
            <p className='text-xs text-foreground/60'>Try entering: 123456</p>
          </div>
        </section>

        <Divider />

        {/* Icons Section */}
        <section className='space-y-4'>
          <h2 className='text-2xl font-semibold'>Icons Gallery</h2>

          <div className='space-y-6'>
            {/* Brand Icons */}
            <div className='space-y-2'>
              <h3 className='text-lg font-medium'>Brand Icons (20x20)</h3>
              <div className='flex gap-4 items-center p-4 bg-secondary/10 rounded-lg'>
                <div className='flex flex-col items-center gap-1'>
                  <GoogleIcon style={{ width: 20, height: 20 }} />
                  <span className='text-xs opacity-60'>Google</span>
                </div>
                <div className='flex flex-col items-center gap-1'>
                  <AppleIcon style={{ width: 20, height: 20 }} />
                  <span className='text-xs opacity-60'>Apple</span>
                </div>
                <div className='flex flex-col items-center gap-1'>
                  <DiscordIcon style={{ width: 20, height: 20 }} />
                  <span className='text-xs opacity-60'>Discord</span>
                </div>
                <div className='flex flex-col items-center gap-1'>
                  <GithubIcon style={{ width: 20, height: 20 }} />
                  <span className='text-xs opacity-60'>Github</span>
                </div>
                <div className='flex flex-col items-center gap-1'>
                  <TelegramIcon style={{ width: 20, height: 20 }} />
                  <span className='text-xs opacity-60'>Telegram</span>
                </div>
                <div className='flex flex-col items-center gap-1'>
                  <XIcon style={{ width: 20, height: 20 }} />
                  <span className='text-xs opacity-60'>X/Twitter</span>
                </div>
              </div>
            </div>

            {/* Action Icons */}
            <div className='space-y-2'>
              <h3 className='text-lg font-medium'>Action Icons (24x24)</h3>
              <div className='flex gap-4 items-center p-4 bg-secondary/10 rounded-lg'>
                <div className='flex flex-col items-center gap-1'>
                  <BackIcon style={{ width: 24, height: 24 }} />
                  <span className='text-xs opacity-60'>Back</span>
                </div>
                <div className='flex flex-col items-center gap-1'>
                  <ViewIcon style={{ width: 24, height: 24 }} />
                  <span className='text-xs opacity-60'>View</span>
                </div>
                <div className='flex flex-col items-center gap-1'>
                  <HideIcon style={{ width: 24, height: 24 }} />
                  <span className='text-xs opacity-60'>Hide</span>
                </div>
                <div className='flex flex-col items-center gap-1'>
                  <SocialsIcon style={{ width: 24, height: 24 }} />
                  <span className='text-xs opacity-60'>Socials</span>
                </div>
                <div className='flex flex-col items-center gap-1'>
                  <WebWalletIcon style={{ width: 24, height: 24 }} />
                  <span className='text-xs opacity-60'>WebWallet</span>
                </div>
                <div className='flex flex-col items-center gap-1'>
                  <FailedIcon style={{ width: 24, height: 24 }} />
                  <span className='text-xs opacity-60'>Failed</span>
                </div>
              </div>
            </div>

            {/* Status Icons */}
            <div className='space-y-2'>
              <h3 className='text-lg font-medium'>Status Icons (64x64 & 128x128)</h3>
              <div className='flex gap-8 items-center p-4 bg-secondary/10 rounded-lg'>
                <div className='flex flex-col items-center gap-2'>
                  <SuccessLoginIcon style={{ width: 64, height: 64 }} />
                  <span className='text-xs opacity-60'>Success Login</span>
                </div>
                <div className='flex flex-col items-center gap-2'>
                  <FailedLoginIcon style={{ width: 64, height: 64 }} />
                  <span className='text-xs opacity-60'>Failed Login</span>
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className='space-y-2'>
              <h3 className='text-lg font-medium'>Kzero Logo</h3>
              <div className='flex gap-8 items-center p-4 bg-secondary/10 rounded-lg'>
                <div className='flex flex-col items-center gap-2'>
                  <KzeroLogo style={{ width: 100, height: 100 }} />
                  <span className='text-xs opacity-60'>Main Logo</span>
                </div>
              </div>
            </div>

            {/* Color Variations */}
            <div className='space-y-2'>
              <h3 className='text-lg font-medium'>Color Inheritance Test</h3>
              <div className='flex gap-4 items-center p-4 bg-secondary/10 rounded-lg'>
                <div className='text-primary'>
                  <BackIcon style={{ width: 24, height: 24 }} />
                </div>
                <div className='text-success'>
                  <BackIcon style={{ width: 24, height: 24 }} />
                </div>
                <div className='text-error'>
                  <BackIcon style={{ width: 24, height: 24 }} />
                </div>
                <div className='text-warning'>
                  <BackIcon style={{ width: 24, height: 24 }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* PoweredBy Section */}
        <section className='space-y-4'>
          <h2 className='text-2xl font-semibold'>PoweredBy</h2>
          <PoweredBy />
        </section>

        <div className='h-20' />
      </div>
    </div>
  );
}

export const Route = createFileRoute('/components')({
  component: ComponentsPage
});
