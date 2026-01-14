// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { useEffect, useState } from 'react';

import RotatingLines from '../components/RotatingLines';
import { cn } from '../lib/utils';

async function checkSecurity() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

export default function SecurityCheck() {
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [showText, setShowText] = useState(true);

  useEffect(() => {
    let timer: unknown;

    checkSecurity()
      .then(() => {
        setStatus('success');
        timer = setTimeout(() => {
          setShowText(false);
        }, 2000);
      })
      .catch(() => {
        setStatus('failed');
      });

    return () => {
      clearTimeout(timer as number);
    };
  }, []);

  return (
    <div
      className={cn(
        'inline-flex flex-row-reverse items-center flex-nowrap',
        'h-[26px] p-[5px] gap-[5px]',
        'transition-all duration-300 ease-in-out',
        'rounded-full',
        'whitespace-nowrap overflow-hidden',
        'min-w-[26px]',
        status === 'pending' && 'bg-transparent text-foreground',
        status === 'success' && 'bg-success text-white',
        status === 'failed' && 'bg-error text-white',
        showText ? 'max-w-full' : 'max-w-[26px]'
      )}
    >
      {status === 'pending' && (
        <>
          <RotatingLines width={20} />
          {showText && <span>Security check in progress...</span>}
        </>
      )}

      {status === 'success' && (
        <>
          <svg width='16' height='17' viewBox='0 0 16 17' fill='none' className='shrink-0'>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M8 0.5C12.4183 0.5 16 4.08172 16 8.5C16 12.9183 12.4183 16.5 8 16.5C3.58172 16.5 0 12.9183 0 8.5C0 4.08172 3.58172 0.5 8 0.5ZM13.6132 5.67521C13.1602 5.22226 12.4259 5.22226 11.9729 5.67521L7.08301 10.5651L4.16308 7.64518C3.71013 7.19223 2.97575 7.19223 2.5228 7.64518C2.06985 8.09813 2.06985 8.83251 2.5228 9.28546L6.26287 13.0255C6.71582 13.4785 7.4502 13.4785 7.90315 13.0255L13.6132 7.31549C14.0661 6.86254 14.0661 6.12816 13.6132 5.67521Z'
              fill='currentColor'
            />
          </svg>
          <span style={{ opacity: showText ? 1 : 0 }}>Security check passed!</span>
        </>
      )}

      {status === 'failed' && (
        <>
          <svg width='16' height='17' viewBox='0 0 16 17' fill='none' className='shrink-0'>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M8 0.5C12.4183 0.5 16 4.08172 16 8.5C16 12.9183 12.4183 16.5 8 16.5C3.58172 16.5 0 12.9183 0 8.5C0 4.08172 3.58172 0.5 8 0.5ZM10.5655 4.37649L8.02278 6.90517L5.48005 4.37649C5.03113 3.93004 4.30851 3.92683 3.85565 4.36535L3.83978 4.38101C3.38808 4.83521 3.3901 5.56959 3.8443 6.02128L6.37793 8.54098L3.89681 11.0085C3.44261 11.4602 3.44059 12.1945 3.89228 12.6487C4.34398 13.1029 5.07836 13.105 5.53256 12.6533L8.02278 10.1767L10.513 12.6533C10.9619 13.0997 11.6845 13.1029 12.1374 12.6644L12.1533 12.6487C12.605 12.1945 12.6029 11.4602 12.1487 11.0085L9.66757 8.54098L12.2012 6.02128C12.6554 5.56959 12.6575 4.83521 12.2058 4.38101C11.7541 3.92681 11.0197 3.92479 10.5655 4.37649Z'
              fill='currentColor'
            />
          </svg>
          <span style={{ opacity: showText ? 1 : 0 }}>Security check failed!</span>
        </>
      )}
    </div>
  );
}
