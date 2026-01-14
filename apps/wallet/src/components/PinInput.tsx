// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { OTPInput, REGEXP_ONLY_DIGITS, type SlotProps } from 'input-otp';
import React from 'react';

import { cn } from '../lib/utils';

interface PinInputProps {
  value?: string;
  isHidden: boolean;
  isError: boolean;
  onComplete: (pin: string) => void;
  onChange?: (pin: string) => void;
}

interface SlotComponentProps extends SlotProps {
  isError: boolean;
  isHidden: boolean;
}

function Slot({ char, isActive, isError, isHidden }: SlotComponentProps) {
  const hasValue = !!char;

  return (
    <div
      className={cn(
        'box-border flex-1 h-[50px] flex items-center justify-center p-0 leading-9 text-center',
        'border rounded-md text-[30px] font-semibold outline-none',
        isError ? 'border-error animate-shake' : 'border-border',
        hasValue && isHidden && (isError ? 'text-white bg-error' : 'text-white bg-primary'),
        hasValue && !isHidden && (isError ? 'text-error' : 'text-primary'),
        !hasValue && 'bg-transparent'
      )}
      style={{
        transformStyle: 'preserve-3d',
        transform: isHidden ? 'rotateX(180deg)' : 'rotateX(0deg)',
        transformOrigin: 'center',
        transition: 'transform 0.4s ease, background-color 0.4s ease',
        outline: isActive ? `2px solid ${isError ? 'var(--color-error)' : 'var(--color-primary)'}` : undefined
      }}
    >
      {char ? isHidden ? '-' : char : isActive ? <div className='w-0.5 h-6 bg-primary animate-blink' /> : ''}
    </div>
  );
}

export default React.memo(function PinInput({ value, isHidden, isError, onComplete, onChange }: PinInputProps) {
  return (
    <div>
      <OTPInput
        autoFocus
        containerClassName='w-full flex items-center gap-2 my-5 [perspective:1000px]'
        value={value}
        onChange={onChange}
        onComplete={onComplete}
        pattern={REGEXP_ONLY_DIGITS}
        maxLength={6}
        render={({ slots }) =>
          slots.slice(0, 6).map((slot, idx) => <Slot isHidden={isHidden} isError={isError} key={idx} {...slot} />)
        }
      />
    </div>
  );
});
