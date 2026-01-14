// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { ZkAccount } from '@kzero/zk-core';

import { encodeAddress } from '@polkadot/util-crypto';
import { useMemo, useState } from 'react';
import ReactJson from 'react-json-view';

import Avatar from '../../components/Avatar';
import GoogleIcon from '../../icons/Google';

interface RequestInfoProps {
  origin?: string;
  account: ZkAccount;
  chain: string;
  hexDetails: string;
  jsonDetails: Record<string, any> | null;
}

export default function RequestInfo({ origin = 'Unknown', account, chain, hexDetails, jsonDetails }: RequestInfoProps) {
  const [isOpen, setIsOpen] = useState(false);

  const address = useMemo(() => {
    const _address = encodeAddress(account.address);

    return _address.slice(0, 6) + '...' + _address.slice(-6);
  }, [account.address]);

  return (
    <div className='flex flex-col items-center gap-2.5'>
      <div className='flex items-center justify-center bg-secondary text-secondary-foreground text-xs py-[5px] px-2.5 rounded-md'>
        <span className='opacity-50'>{origin}</span>
      </div>

      <h3 className='m-0 text-xl font-semibold leading-6 text-center'>Approve Request</h3>
      <p className='m-0 text-sm leading-[17px] text-center'>You are approving a request with account</p>

      <div className='flex items-center justify-center gap-[5px]'>
        <Avatar
          width={24}
          height={24}
          src={account.picture}
          fallback={<GoogleIcon style={{ width: '60%', height: '60%' }} />}
        />
        <b className='font-semibold'>{account.name || address}</b>
        <span>On</span>
        <b className='font-semibold'>{chain}</b>
      </div>

      {isOpen &&
        (jsonDetails ? (
          <ReactJson
            style={{ width: '100%', overflow: 'auto' }}
            enableClipboard={false}
            indentWidth={2}
            src={jsonDetails}
            displayDataTypes={false}
            displayObjectSize={false}
            collapseStringsAfterLength={15}
            theme='summerfruit:inverted'
          />
        ) : (
          <div className='break-all'>{hexDetails}</div>
        ))}

      <div
        className='text-primary cursor-pointer text-xs font-semibold hover:underline'
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Hide Details' : 'View Details'}
      </div>
    </div>
  );
}
