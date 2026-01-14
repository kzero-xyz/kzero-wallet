// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { LoginProvider } from '@kzero/zk-core';

import Button from '../components/Button';
import Divider from '../components/Divider';
import BackIcon from '../icons/Back';

interface RemainProvidersProps {
  providers: LoginProvider[];
  handleProviderClick: (provider: LoginProvider) => void;
  onBack: () => void;
  providerMapping: Record<LoginProvider, React.ComponentType<{ onClick: (provider: LoginProvider) => void }>>;
}

function RemainProviders({ providers, handleProviderClick, onBack, providerMapping }: RemainProvidersProps) {
  return (
    <>
      <Button iconOnly onClick={onBack}>
        <BackIcon />
      </Button>

      {providers.map((provider) => {
        const Component = providerMapping[provider];

        return <Component key={provider} onClick={handleProviderClick} />;
      })}
      <div className='flex-1' />

      <Divider />
    </>
  );
}

export default RemainProviders;
