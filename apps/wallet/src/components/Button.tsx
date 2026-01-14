// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

import { cn } from '../lib/utils';

const buttonVariants = cva(
  // Base styles - cursor handled by disabled state below
  'h-10 inline-flex items-center gap-2.5 rounded-[var(--radius)] text-sm leading-5 font-normal tracking-[0.16px] transition-all duration-200 cursor-pointer disabled:cursor-not-allowed active:scale-[0.96] disabled:active:scale-100',
  {
    variants: {
      variant: {
        bordered: 'bg-transparent border border-border',
        filled: 'border border-transparent'
      },
      color: {
        primary: '',
        success: '',
        error: '',
        default: ''
      },
      iconOnly: {
        true: 'w-10 p-0 justify-center', // Square: 40x40 (same as h-10)
        false: 'w-auto px-4 py-2'
      },
      align: {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end'
      }
    },
    compoundVariants: [
      // Bordered variants
      {
        variant: 'bordered',
        color: 'primary',
        className: 'border-primary text-primary hover:enabled:bg-primary hover:enabled:text-primary-foreground'
      },
      {
        variant: 'bordered',
        color: 'success',
        className: 'border-success text-success hover:enabled:bg-success hover:enabled:text-success-foreground'
      },
      {
        variant: 'bordered',
        color: 'error',
        className: 'border-error text-error hover:enabled:bg-error hover:enabled:text-error-foreground'
      },
      {
        variant: 'bordered',
        color: 'default',
        className: 'border-border text-foreground hover:enabled:bg-primary hover:enabled:text-primary-foreground'
      },
      // Filled variants
      {
        variant: 'filled',
        color: 'primary',
        className: 'bg-primary text-primary-foreground hover:enabled:opacity-80'
      },
      {
        variant: 'filled',
        color: 'success',
        className: 'bg-success text-success-foreground hover:enabled:opacity-80'
      },
      {
        variant: 'filled',
        color: 'error',
        className: 'bg-error text-error-foreground hover:enabled:opacity-80'
      },
      {
        variant: 'filled',
        color: 'default',
        className: 'bg-border text-foreground hover:enabled:opacity-80'
      },
      // Icon-only border removal
      {
        iconOnly: true,
        className: 'border-none'
      }
    ],
    defaultVariants: {
      variant: 'bordered',
      color: 'default',
      iconOnly: false,
      align: 'center'
    }
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof buttonVariants> {}

export default function Button({
  className,
  variant,
  color,
  iconOnly,
  align,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants({ variant, color, iconOnly, align }),
        // Disabled state: force gray background and text, override all variant colors
        disabled && 'bg-(--button-disabled-bg)! text-(--button-disabled-text)! border-(--button-disabled-bg)!',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
