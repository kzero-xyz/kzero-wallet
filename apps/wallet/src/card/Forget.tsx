// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { LoginProvider } from '@kzero/zk-core';

import React from 'react';

import AddressCell from '../components/AddressCell';
import Button from '../components/Button';
import BackIcon from '../icons/Back';

interface Account {
  address: string;
  provider: LoginProvider;
  type: 'zk' | 'injected';
  name?: string;
  picture?: string;
}

interface ForgetProps {
  onConfirm: (provider: LoginProvider) => void;
  onBack: () => void;
  accounts: Account[];
}

function Forget({ onConfirm, onBack, accounts }: ForgetProps) {
  return (
    <>
      <Button iconOnly onClick={onBack}>
        <BackIcon />
      </Button>

      <div className='flex-1 flex flex-col items-center justify-center gap-2.5'>
        <h4 className='m-0 text-xl font-semibold leading-6'>Set New Transaction PIN</h4>
        <p className='m-0 text-sm font-normal leading-[17px]'>Verify your account</p>

        {accounts.map((account) => (
          <div
            key={account.address}
            className='cursor-pointer flex items-center w-full mt-5 p-[15px] border border-border rounded-[10px] transition-all duration-200 hover:border-primary active:border-primary active:scale-[0.98]'
            onClick={() => onConfirm(account.provider)}
          >
            <AddressCell account={account} />
          </div>
        ))}
      </div>
    </>
  );
}

export default React.memo(Forget);
