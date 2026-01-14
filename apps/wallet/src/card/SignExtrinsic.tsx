// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { SignerPayloadJSON, SignerResult, ZkAccount } from '@kzero/zk-core';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { useEffect, useMemo, useState } from 'react';

import Button from '../components/Button';
import CircleLoading from '../components/CircleLoading';
import BackIcon from '../icons/Back';
import KzeroLogo from '../icons/KzeroLogo';
import CallDisplay from './SignPayload/CallDisplay';
import RequestInfo from './SignPayload/RequestInfo';
import Submit from './SignPayload/Submit';
import SecurityCheck from './SecurityCheck';

interface SignExtrinsicProps {
  payload: SignerPayloadJSON;
  account: ZkAccount;
  wsEndpoint: string;
  origin: string;
  onSuccess: (result: SignerResult) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
  onForget?: () => void;
}

export default function SignExtrinsic({
  payload,
  account,
  wsEndpoint,
  origin,
  onSuccess,
  onError,
  onCancel,
  onForget
}: SignExtrinsicProps) {
  const [api] = useState(() => new ApiPromise({ provider: new WsProvider(wsEndpoint) }));

  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.isReady.then(() => {
      setReady(true);
    });
  }, [api]);

  const call = useMemo(() => {
    try {
      return ready ? api.registry.createType('Call', payload.method) : null;
    } catch {
      return null;
    }
  }, [api.registry, payload.method, ready]);

  const jsonDetails = useMemo(() => {
    return call ? call.toHuman() : null;
  }, [call]);

  const handleSuccess = (signature: string, signedTransaction: string) => {
    onSuccess({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      signature: signature as `0x${string}`,
      signedTransaction: signedTransaction as `0x${string}`
    });
  };

  const handleCancel = () => {
    onCancel?.();
    onError('User rejected');
  };

  return (
    <>
      <div className='flex justify-between items-center gap-[5px]'>
        <Button iconOnly onClick={handleCancel}>
          <BackIcon />
        </Button>
        <SecurityCheck />
      </div>

      <div className='relative flex flex-1 flex-col overflow-hidden px-0.5'>
        {!ready ? (
          <div className='flex-1 flex items-center justify-center'>
            <CircleLoading size={128} success={ready}>
              <KzeroLogo style={{ width: '50%', height: '50%', color: 'inherit' }} />
            </CircleLoading>
          </div>
        ) : (
          <div className='flex-1 flex flex-col gap-5 overflow-y-auto px-0.5 overflow-x-hidden scrollbar-hide'>
            <RequestInfo
              origin={origin}
              account={account}
              chain={api.runtimeChain.toString()}
              hexDetails={payload.method}
              jsonDetails={jsonDetails}
            />
            {ready && call ? <CallDisplay api={api} call={call} /> : null}
            <Submit
              api={api}
              method={payload.method}
              address={payload.address}
              account={account}
              onSuccess={handleSuccess}
              onError={onError}
              onReject={handleCancel}
              onForget={onForget}
            />
          </div>
        )}
      </div>
    </>
  );
}
