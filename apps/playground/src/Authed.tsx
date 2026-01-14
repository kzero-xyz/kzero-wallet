// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { ThemeConfig, ZkAccount } from '@kzero/zk-core';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Link,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { keyring } from '@polkadot/ui-keyring';
import { BN, formatBalance } from '@polkadot/util';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { useKzero } from '@kzero/zk-react';

import AddressCell from './components/AddressCell.js';
import { useCopy } from './hooks/useCopy.js';
import Copy from './icons/Copy.js';
import Success from './icons/Success.js';
import AccountIcon from './AccountIcon.js';

keyring.loadAll({ isDevelopment: true });
const alice = keyring.getPairs()[0];

function Authed({
  account,
  walletTheme,
  onTransferClick
}: {
  account: ZkAccount;
  walletTheme: ThemeConfig;
  onTransferClick?: () => void;
}) {
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));
  const { copy, isCopied } = useCopy();
  const { sendTransaction } = useKzero();
  const [api] = useState<ApiPromise>(
    () =>
      new ApiPromise({
        initWasm: true,
        provider: new WsProvider(import.meta.env.VITE_RPC_URL || 'ws://127.0.0.1:9944')
      })
  );
  const [isReady, setIsReady] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    api.isReady.then(() => {
      setIsReady(true);
    });
  }, [api.isReady]);

  const address = account.address;

  useEffect(() => {
    let unsub: Promise<() => void> | undefined;

    if (api && address && isReady) {
      unsub = api.query.system.account(address, (account) => {
        setBalance(formatBalance(account.data.free, { decimals: api.registry.chainDecimals[0] }));
      });
    }

    return () => {
      unsub?.then((unsub) => unsub());
    };
  }, [address, api, isReady]);

  const handleFaucet = async () => {
    setIsLoading(true);

    api.tx.balances
      .transferKeepAlive(address, new BN(100).mul(new BN(10 ** api.registry.chainDecimals[0])))
      .signAndSend(alice, (results) => {
        if (results.status.isInBlock) {
          setIsLoading(false);
          toast.success('Get token Successfully');
        }
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  const handleTransfer = async () => {
    onTransferClick?.();
    setIsSending(true);

    toast.promise(
      async () => {
        try {
          // Create transfer transaction
          const transfer = api.tx.balances.transferKeepAlive(
            alice.address,
            new BN(10).mul(new BN(10 ** api.registry.chainDecimals[0]))
          );

          // Sign transaction using useKzero's sendTransaction
          const result = await sendTransaction({
            address,
            method: transfer.method.toHex(),
            withSignedTransaction: true
          });

          // Send signed transaction to chain
          return new Promise<string>((resolve, reject) => {
            if (!result.signedTransaction) {
              reject(new Error('No signed transaction returned'));

              return;
            }

            api
              .tx(result.signedTransaction)
              .send((txResult) => {
                if (txResult.status.isInBlock) {
                  resolve(txResult.status.asInBlock.toString());
                } else if (txResult.isError) {
                  reject(new Error('Failed to send transaction'));
                }
              })
              .catch(reject);
          });
        } catch (error) {
          console.error('[Authed] Transfer error:', error);
          throw error;
        } finally {
          setIsSending(false);
        }
      },
      {
        pending: 'Sending...',
        success: {
          render: (props) => (
            <Box>
              <Typography variant='h6'>Sent successfully!</Typography>
              <Typography>
                <Link
                  color='primary'
                  style={{ fontSize: 'inherit' }}
                  target='_blank'
                  href={`https://polkadot.js.org/apps/?rpc=${import.meta.env.VITE_RPC_URL}#/explorer/query/${props.data}`}
                >
                  View on Polkadot.js
                </Link>
              </Typography>
            </Box>
          )
        },
        error: {
          render: (props) => {
            const error = props.data as Error;

            return `Failed to send: ${error.message}`;
          }
        }
      }
    );
  };

  return (
    <Stack spacing={2} sx={{ width: { xs: '100%', sm: 360 } }}>
      {downSm && (
        <AccountIcon
          account={account}
          wrapperSx={{ width: '100%', color: 'primary.main', '&>svg': { width: 48, height: 48 } }}
        />
      )}

      <Card sx={{ width: '100%', padding: 2, borderRadius: walletTheme.radius.card }}>
        <CardHeader
          slotProps={{
            title: {
              sx: {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'text.primary'
              }
            }
          }}
          title={
            <>
              <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'>
                <path
                  d='M16.875 5H4.375C4.20924 5 4.05027 4.93415 3.93306 4.81694C3.81585 4.69973 3.75 4.54076 3.75 4.375C3.75 4.20924 3.81585 4.05027 3.93306 3.93306C4.05027 3.81585 4.20924 3.75 4.375 3.75H15C15.1658 3.75 15.3247 3.68415 15.4419 3.56694C15.5592 3.44973 15.625 3.29076 15.625 3.125C15.625 2.95924 15.5592 2.80027 15.4419 2.68306C15.3247 2.56585 15.1658 2.5 15 2.5H4.375C3.87772 2.5 3.40081 2.69754 3.04917 3.04917C2.69754 3.40081 2.5 3.87772 2.5 4.375V14.375C2.5 14.8723 2.69754 15.3492 3.04917 15.7008C3.40081 16.0525 3.87772 16.25 4.375 16.25H16.875C17.2065 16.25 17.5245 16.1183 17.7589 15.8839C17.9933 15.6495 18.125 15.3315 18.125 15V6.25C18.125 5.91848 17.9933 5.60054 17.7589 5.36612C17.5245 5.1317 17.2065 5 16.875 5ZM14.0625 11.25C13.8771 11.25 13.6958 11.195 13.5417 11.092C13.3875 10.989 13.2673 10.8426 13.1964 10.6713C13.1254 10.5 13.1068 10.3115 13.143 10.1296C13.1792 9.94775 13.2685 9.7807 13.3996 9.64959C13.5307 9.51848 13.6977 9.42919 13.8796 9.39301C14.0615 9.35684 14.25 9.37541 14.4213 9.44636C14.5926 9.51732 14.739 9.63748 14.842 9.79165C14.945 9.94582 15 10.1271 15 10.3125C15 10.5611 14.9012 10.7996 14.7254 10.9754C14.5496 11.1512 14.3111 11.25 14.0625 11.25Z'
                  fill='currentColor'
                />
              </svg>
              Wallet
            </>
          }
        />
        <Divider sx={{ marginY: 1 }} />
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              justifyContent: 'space-between',
              outline: '1px solid',
              outlineColor: 'primary.main',
              borderRadius: 'var(--kzero-radius-button)',
              padding: 1,
              marginBottom: 1
            }}
          >
            <AddressCell account={account} iconSize={32} />

            {account.proofStatus === 'pending' ? (
              <Chip size='small' color='warning' label='Pending' />
            ) : account.proofStatus === 'generated' ? (
              <Chip size='small' color='success' label='Ready' />
            ) : (
              <Chip size='small' color='error' label='Failed' />
            )}
          </Box>
          Balance: {balance}
        </CardContent>
      </Card>

      <Card sx={{ width: '100%', padding: 2, borderRadius: walletTheme.radius.card }}>
        <CardHeader
          slotProps={{
            title: {
              sx: {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'text.primary'
              }
            }
          }}
          title={
            <>
              <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'>
                <path
                  d='M13.5938 3.73029C12.6287 2.61579 11.5426 1.61221 10.3555 0.738106C10.2504 0.66449 10.1252 0.625 9.99687 0.625C9.86857 0.625 9.74337 0.66449 9.63828 0.738106C8.45332 1.61257 7.36931 2.61614 6.40625 3.73029C4.25859 6.1967 3.125 8.7967 3.125 11.2498C3.125 13.0732 3.84933 14.8219 5.13864 16.1112C6.42795 17.4005 8.17664 18.1248 10 18.1248C11.8234 18.1248 13.572 17.4005 14.8614 16.1112C16.1507 14.8219 16.875 13.0732 16.875 11.2498C16.875 8.7967 15.7414 6.1967 13.5938 3.73029ZM14.3633 11.9795C14.2012 12.8848 13.7657 13.7186 13.1153 14.3688C12.465 15.019 11.6311 15.4544 10.7258 15.6162C10.6924 15.6216 10.6588 15.6245 10.625 15.6248C10.4682 15.6248 10.3172 15.5658 10.2018 15.4596C10.0865 15.3535 10.0153 15.2078 10.0023 15.0516C9.98933 14.8953 10.0355 14.7399 10.1318 14.6162C10.228 14.4924 10.3673 14.4093 10.5219 14.3834C11.8164 14.1655 12.9148 13.067 13.1344 11.7701C13.1621 11.6067 13.2537 11.4609 13.3889 11.3649C13.5242 11.269 13.692 11.2307 13.8555 11.2584C14.019 11.2862 14.1647 11.3778 14.2607 11.513C14.3566 11.6482 14.395 11.816 14.3672 11.9795H14.3633Z'
                  fill='currentColor'
                />
              </svg>
              Faucet
            </>
          }
        />

        <Divider sx={{ marginY: 1 }} />

        <CardContent>
          Receive 100 test tokens to initiating transactions.
          <LoadingButton
            loading={isLoading}
            fullWidth
            color='primary'
            variant='contained'
            disabled={!isReady}
            onClick={handleFaucet}
            sx={{ marginTop: 1 }}
          >
            {isReady ? 'Get 100 Test Token' : 'Connecting to node...'}
          </LoadingButton>
        </CardContent>
      </Card>

      <Card sx={{ width: '100%', padding: 2, borderRadius: walletTheme.radius.card }}>
        <CardHeader
          slotProps={{
            title: {
              sx: {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'text.primary'
              }
            }
          }}
          title={
            <>
              <svg width='16' height='17' viewBox='0 0 16 17' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <g id='icon-send'>
                  <path
                    id='Subtract'
                    fillRule='evenodd'
                    clipRule='evenodd'
                    d='M8 16.5C12.4183 16.5 16 12.9183 16 8.5C16 4.08172 12.4183 0.5 8 0.5C3.58172 0.5 0 4.08172 0 8.5C0 12.9183 3.58172 16.5 8 16.5ZM4 11.5193C4 11.7788 4.10327 12.0277 4.28703 12.211V12.2179C4.67009 12.5955 5.28545 12.5955 5.6685 12.2179L10.046 7.83356V10.362C10.0481 10.9002 10.4849 11.3353 11.023 11.3353C11.5611 11.3353 11.9979 10.9002 12 10.362V5.47701C12 4.93742 11.5626 4.5 11.023 4.5H6.13797C5.59984 4.50206 5.1647 4.93887 5.1647 5.477C5.1647 6.01513 5.59984 6.45194 6.13797 6.454H8.66451L4.28703 10.8276C4.10327 11.0109 4 11.2597 4 11.5193Z'
                    fill='currentColor'
                  />
                </g>
              </svg>
              Transfer
            </>
          }
        />

        <Divider sx={{ marginY: 1 }} />

        <CardContent>
          Initiate a transfer transaction to send 10 test tokens to Alice
          <Box
            sx={{
              marginY: 1,
              paddingX: 1.5,
              paddingY: 0.8,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'primary.main',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1,
              wordBreak: 'break-all',
              fontSize: '0.75rem'
            }}
            onClick={() => copy(alice.address)}
          >
            {alice.address}
            {isCopied ? (
              <Success style={{ width: 16, height: 16 }} />
            ) : (
              <Copy style={{ cursor: 'pointer', width: 16, height: 16 }} />
            )}
          </Box>
          <LoadingButton
            loading={isSending}
            fullWidth
            color='primary'
            variant='contained'
            disabled={!isReady}
            onClick={handleTransfer}
            sx={{ marginTop: 1 }}
          >
            {isReady ? 'Send' : 'Connecting to node...'}
          </LoadingButton>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default Authed;
