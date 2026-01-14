// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { cn } from '../lib/utils';

interface CircleLoadingProps {
  size?: number;
  children?: React.ReactNode;
  success?: boolean;
  error?: boolean;
}

export default function CircleLoading({ size = 128, children, success, error }: CircleLoadingProps) {
  const strokeDasharray = success || error ? '200px, 200px' : '40px, 200px';

  return (
    <div className='relative' style={{ width: size, height: size }}>
      <div className='w-full h-full'>
        {/* Background circle */}
        <svg viewBox='22 22 44 44' className='absolute inset-0 block w-full h-full'>
          <circle
            cx='44'
            cy='44'
            r='20'
            fill='none'
            stroke='currentColor'
            opacity={0.05}
            strokeDasharray='200px, 200px'
            strokeDashoffset='0'
            strokeWidth='2'
            strokeLinecap='round'
          />
        </svg>

        {/* Animated loading circle */}
        <svg
          viewBox='22 22 44 44'
          className={cn(
            'absolute inset-0 block w-full h-full animate-spin transition-colors duration-550',
            error ? 'text-error' : success ? 'text-success' : 'text-primary'
          )}
          style={{ animationDuration: '550ms' }}
        >
          <circle
            cx='44'
            cy='44'
            r='20'
            fill='none'
            stroke='currentColor'
            strokeDasharray={strokeDasharray}
            strokeDashoffset='0'
            strokeWidth='2'
            strokeLinecap='round'
            className='transition-[stroke-dasharray] duration-550'
          />
        </svg>
      </div>

      {/* Center content */}
      <div className='absolute inset-0 flex items-center justify-center'>{children}</div>
    </div>
  );
}
