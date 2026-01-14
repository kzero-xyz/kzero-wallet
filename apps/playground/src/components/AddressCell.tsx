// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { Account } from '@kzero/zk-core';

import { encodeAddress } from '@polkadot/util-crypto';
import { useMemo } from 'react';

import { useCopy } from '../hooks/useCopy.js';
import Copy from '../icons/Copy.js';
import GoogleIcon from '../icons/Google.js';
import Success from '../icons/Success.js';
import Avatar from './Avatar.js';

interface AddressCellProps {
  iconSize?: number;
  account: {
    address: string;
    picture?: string;
    name?: string;
    type: Account['type'];
  };
}

export default function AddressCell({ iconSize = 40, account }: AddressCellProps) {
  const address = useMemo(() => {
    const _address = encodeAddress(account.address);

    return _address.slice(0, 6) + '...' + _address.slice(-6);
  }, [account.address]);

  const { copy, isCopied } = useCopy();

  if (account.type === 'zk') {
    return (
      <div className='flex items-center gap-1.5'>
        {/* Online indicator */}
        <div className='w-2 h-2 rounded-full bg-success' />

        <Avatar
          width={iconSize}
          height={iconSize}
          src={account.picture}
          fallback={<GoogleIcon style={{ width: '60%', height: '60%' }} />}
        />

        <div className='flex flex-col gap-1 text-sm font-medium text-foreground leading-tight'>
          <b className='font-semibold'>{account.name}</b>
          <span
            className='flex items-center gap-1 text-xs font-normal opacity-50 cursor-pointer'
            onClick={() => copy(encodeAddress(account.address))}
          >
            {address}
            {isCopied ? (
              <Success style={{ width: 12, height: 12 }} />
            ) : (
              <Copy style={{ cursor: 'pointer', width: 12, height: 12 }} />
            )}
          </span>
        </div>
      </div>
    );
  }

  return <div className='flex items-center gap-1.5'>{account.address}</div>;
}
