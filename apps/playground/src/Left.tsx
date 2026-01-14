// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { LoginProvider, ThemeConfig, ZkAccount } from '@kzero/zk-core';

import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid2 as Grid,
  Link,
  OutlinedInput,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { useMemo } from 'react';

import { useKzero } from '@kzero/zk-react';

import { providerIconMapping, providerNameMapping } from './utils/providers.js';

function Authed({ account }: { account: ZkAccount }) {
  const { disconnect } = useKzero();
  const json = useMemo(() => {
    return JSON.stringify(account, null, 2);
  }, [account]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: 2,
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        bgcolor: 'background.paper',
        color: 'text.primary'
      }}
      className='no-scrollbar'
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          paddingY: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          fontWeight: 600,
          fontSize: '1rem'
        }}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth='2'
          stroke='currentColor'
          style={{ width: 20, height: 20 }}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z'
          ></path>
        </svg>
        Console
      </Box>

      <TextField
        multiline
        maxRows={40}
        value={json}
        sx={({ palette }) => ({
          borderRadius: 1,
          bgcolor: 'common.black',
          '& > div': { borderRadius: 1 },
          '& textarea': {
            color: 'common.white',
            WebkitTextFillColor: palette.common.white,
            fontFamily: 'monospace',
            fontSize: '0.75rem'
          }
        })}
      />

      <Typography>
        Kzero gives you modular components so you can customize your product for your users. Learn more in{' '}
        <Link>our docs</Link>.
      </Typography>

      <Stack
        sx={{
          borderRadius: 1,
          padding: 1,
          border: '1px solid',
          borderColor: 'border'
        }}
        alignItems='start'
        spacing={1.5}
      >
        <Typography>Sign out to restart the demo and customize your theme</Typography>
        <Button size='small' variant='outlined' onClick={disconnect}>
          Sign out
        </Button>
      </Stack>
    </Box>
  );
}

function Left({
  theme,
  providers,
  selectedProviders,
  brand,
  radius,
  setTheme,
  setPrimaryColor,
  setSelectedProviders,
  setBrand,
  setColor,
  setRadius
}: {
  theme: ThemeConfig;
  providers: LoginProvider[];
  selectedProviders: LoginProvider[];
  brand: string;
  radius: 'small' | 'medium' | 'large';
  setTheme: (theme: 'light' | 'dark' | 'custom') => void;
  setPrimaryColor: (color: string) => void;
  setSelectedProviders: (providers: LoginProvider[]) => void;
  setBrand: (brand: string) => void;
  setColor: (color: string) => void;
  setRadius: (radius: 'small' | 'medium' | 'large') => void;
}) {
  const { account, isConnected } = useKzero();

  if (isConnected && account) {
    return <Authed account={account} />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: 1,
        width: '100%',
        height: '100%',
        overflowY: 'auto'
      }}
      className='no-scrollbar'
      style={{ backgroundColor: theme.colors.background, color: theme.colors.foreground }}
    >
      <Stack spacing={1}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            paddingY: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            fontWeight: 600,
            fontSize: '1rem'
          }}
        >
          <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'>
            <path
              d='M19.3756 11.875C19.3756 12.0408 19.3097 12.1997 19.1925 12.3169C19.0753 12.4342 18.9164 12.5 18.7506 12.5H17.5006V13.75C17.5006 13.9158 17.4347 14.0747 17.3175 14.1919C17.2003 14.3092 17.0414 14.375 16.8756 14.375C16.7098 14.375 16.5509 14.3092 16.4337 14.1919C16.3164 14.0747 16.2506 13.9158 16.2506 13.75V12.5H15.0006C14.8348 12.5 14.6759 12.4342 14.5587 12.3169C14.4414 12.1997 14.3756 12.0408 14.3756 11.875C14.3756 11.7092 14.4414 11.5503 14.5587 11.4331C14.6759 11.3158 14.8348 11.25 15.0006 11.25H16.2506V10C16.2506 9.83424 16.3164 9.67527 16.4337 9.55806C16.5509 9.44085 16.7098 9.375 16.8756 9.375C17.0414 9.375 17.2003 9.44085 17.3175 9.55806C17.4347 9.67527 17.5006 9.83424 17.5006 10V11.25H18.7506C18.9164 11.25 19.0753 11.3158 19.1925 11.4331C19.3097 11.5503 19.3756 11.7092 19.3756 11.875ZM4.37559 5.625H5.62559V6.875C5.62559 7.04076 5.69144 7.19973 5.80865 7.31694C5.92586 7.43415 6.08483 7.5 6.25059 7.5C6.41635 7.5 6.57532 7.43415 6.69253 7.31694C6.80974 7.19973 6.87559 7.04076 6.87559 6.875V5.625H8.12559C8.29135 5.625 8.45032 5.55915 8.56753 5.44194C8.68474 5.32473 8.75059 5.16576 8.75059 5C8.75059 4.83424 8.68474 4.67527 8.56753 4.55806C8.45032 4.44085 8.29135 4.375 8.12559 4.375H6.87559V3.125C6.87559 2.95924 6.80974 2.80027 6.69253 2.68306C6.57532 2.56585 6.41635 2.5 6.25059 2.5C6.08483 2.5 5.92586 2.56585 5.80865 2.68306C5.69144 2.80027 5.62559 2.95924 5.62559 3.125V4.375H4.37559C4.20983 4.375 4.05086 4.44085 3.93365 4.55806C3.81644 4.67527 3.75059 4.83424 3.75059 5C3.75059 5.16576 3.81644 5.32473 3.93365 5.44194C4.05086 5.55915 4.20983 5.625 4.37559 5.625ZM14.3756 15H13.7506V14.375C13.7506 14.2092 13.6847 14.0503 13.5675 13.9331C13.4503 13.8158 13.2914 13.75 13.1256 13.75C12.9598 13.75 12.8009 13.8158 12.6837 13.9331C12.5664 14.0503 12.5006 14.2092 12.5006 14.375V15H11.8756C11.7098 15 11.5509 15.0658 11.4337 15.1831C11.3164 15.3003 11.2506 15.4592 11.2506 15.625C11.2506 15.7908 11.3164 15.9497 11.4337 16.0669C11.5509 16.1842 11.7098 16.25 11.8756 16.25H12.5006V16.875C12.5006 17.0408 12.5664 17.1997 12.6837 17.3169C12.8009 17.4342 12.9598 17.5 13.1256 17.5C13.2914 17.5 13.4503 17.4342 13.5675 17.3169C13.6847 17.1997 13.7506 17.0408 13.7506 16.875V16.25H14.3756C14.5414 16.25 14.7003 16.1842 14.8175 16.0669C14.9347 15.9497 15.0006 15.7908 15.0006 15.625C15.0006 15.4592 14.9347 15.3003 14.8175 15.1831C14.7003 15.0658 14.5414 15 14.3756 15ZM17.1342 6.25L6.25059 17.1336C6.0162 17.3678 5.69838 17.4994 5.367 17.4994C5.03562 17.4994 4.7178 17.3678 4.48341 17.1336L2.86622 15.518C2.75011 15.4019 2.65801 15.2641 2.59518 15.1124C2.53234 14.9607 2.5 14.7982 2.5 14.634C2.5 14.4698 2.53234 14.3072 2.59518 14.1556C2.65801 14.0039 2.75011 13.8661 2.86622 13.75L13.7506 2.86641C13.8667 2.7503 14.0045 2.6582 14.1562 2.59537C14.3078 2.53253 14.4704 2.50019 14.6346 2.50019C14.7988 2.50019 14.9613 2.53253 15.113 2.59537C15.2647 2.6582 15.4025 2.7503 15.5186 2.86641L17.1342 4.48203C17.2503 4.59811 17.3424 4.73592 17.4052 4.8876C17.4681 5.03927 17.5004 5.20184 17.5004 5.36602C17.5004 5.53019 17.4681 5.69276 17.4052 5.84444C17.3424 5.99611 17.2503 6.13392 17.1342 6.25ZM16.2506 5.36641L14.6342 3.75L12.1342 6.25L13.7506 7.86641L16.2506 5.36641Z'
              fill='currentColor'
            />
          </svg>
          Customize
        </Box>

        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ flexShrink: 0, flexGrow: 0 }}>
            <Box sx={{ paddingBottom: 1, fontSize: '0.875rem' }}>Background</Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  cursor: 'pointer',
                  borderRadius: '9999px',
                  border: '1px solid',
                  borderColor: 'border',
                  bgcolor: 'common.white'
                }}
                onClick={() => setTheme('light')}
              ></Box>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  cursor: 'pointer',
                  borderRadius: '9999px',
                  border: '1px solid',
                  borderColor: 'border',
                  bgcolor: 'common.black'
                }}
                onClick={() => setTheme('dark')}
              ></Box>
              <Box
                component='input'
                type='color'
                sx={{
                  margin: 0,
                  padding: 0,
                  width: 24,
                  height: 24,
                  borderRadius: '9999px',
                  border: '1px solid',
                  borderColor: 'border',
                  bgcolor: 'common.white',
                  backgroundImage: 'url(/conic-gradient.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  appearance: 'none',
                  caretColor: 'red'
                }}
                className='input-color'
                onChange={(e) => {
                  setTheme('custom');
                  setColor(e.target.value);
                }}
              />
            </Box>
          </Box>
          <Box sx={{ flexShrink: 0, flexGrow: 0 }}>
            <Box sx={{ paddingBottom: 1, fontSize: '0.875rem' }}>Accent</Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  cursor: 'pointer',
                  borderRadius: '9999px',
                  border: '1px solid',
                  borderColor: 'border',
                  bgcolor: '#5328E7'
                }}
                onClick={() => setPrimaryColor('#5328E7')}
              />
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  cursor: 'pointer',
                  borderRadius: '9999px',
                  border: '1px solid',
                  borderColor: 'border',
                  bgcolor: '#C93939'
                }}
                onClick={() => setPrimaryColor('#C93939')}
              />
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  cursor: 'pointer',
                  borderRadius: '9999px',
                  border: '1px solid',
                  borderColor: 'border',
                  bgcolor: '#FF2269'
                }}
                onClick={() => setPrimaryColor('#FF2269')}
              />
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  cursor: 'pointer',
                  borderRadius: '9999px',
                  border: '1px solid',
                  borderColor: 'border',
                  bgcolor: '#F09337'
                }}
                onClick={() => setPrimaryColor('#F09337')}
              />
              <Box
                component='input'
                type='color'
                sx={{
                  margin: 0,
                  padding: 0,
                  width: 24,
                  height: 24,
                  borderRadius: '9999px',
                  border: '1px solid',
                  borderColor: 'border',
                  bgcolor: 'common.white',
                  backgroundImage: 'url(/conic-gradient.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  appearance: 'none',
                  caretColor: 'red'
                }}
                className='input-color'
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
            </Box>
          </Box>
        </Box>

        <OutlinedInput
          size='small'
          placeholder='Add image URL'
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
      </Stack>

      <Stack spacing={1}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            paddingY: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            fontWeight: 600,
            fontSize: '1rem'
          }}
        >
          <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'>
            <path d='M3 11C3 6.58172 6.58172 3 11 3H17V17H3V11Z' fill='currentColor' />
          </svg>
          Radius
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            '&>div': {
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              paddingX: 1.5,
              paddingY: 0.5,
              border: '1px solid',
              borderColor: 'border',
              borderRadius: 1,
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              ':hover,&[data-selected="true"]': {
                bgcolor: 'primary.main',
                borderColor: 'primary.main',
                color: 'primary.contrastText'
              },
              ':hover>div,&[data-selected="true"]>div': {
                bgcolor: 'primary.contrastText',
                borderColor: 'primary.main'
              },
              '&>div': {
                width: 16,
                height: 16,
                bgcolor: 'border',
                transition: 'all 0.2s ease-in-out'
              }
            }
          }}
        >
          <Box data-selected={radius === 'small'} onClick={() => setRadius('small')}>
            <Box sx={{ borderRadius: '6px 0 0 0' }} />
            Small
          </Box>
          <Box data-selected={radius === 'medium'} onClick={() => setRadius('medium')}>
            <Box sx={{ borderRadius: '10px 0 0 0' }} />
            Medium
          </Box>
          <Box data-selected={radius === 'large'} onClick={() => setRadius('large')}>
            <Box sx={{ borderRadius: '14px 0 0 0' }} />
            Large
          </Box>
        </Box>
      </Stack>

      <Stack spacing={1}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            paddingY: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            fontWeight: 600,
            fontSize: '1rem'
          }}
        >
          <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'>
            <path
              d='M16.25 6.25H13.75V4.375C13.75 3.38044 13.3549 2.42661 12.6517 1.72335C11.9484 1.02009 10.9946 0.625 10 0.625C9.00544 0.625 8.05161 1.02009 7.34835 1.72335C6.64509 2.42661 6.25 3.38044 6.25 4.375V6.25H3.75C3.41848 6.25 3.10054 6.3817 2.86612 6.61612C2.6317 6.85054 2.5 7.16848 2.5 7.5V16.25C2.5 16.5815 2.6317 16.8995 2.86612 17.1339C3.10054 17.3683 3.41848 17.5 3.75 17.5H16.25C16.5815 17.5 16.8995 17.3683 17.1339 17.1339C17.3683 16.8995 17.5 16.5815 17.5 16.25V7.5C17.5 7.16848 17.3683 6.85054 17.1339 6.61612C16.8995 6.3817 16.5815 6.25 16.25 6.25ZM10 12.8125C9.81458 12.8125 9.63332 12.7575 9.47915 12.6545C9.32498 12.5515 9.20482 12.4051 9.13386 12.2338C9.06291 12.0625 9.04434 11.874 9.08051 11.6921C9.11669 11.5102 9.20598 11.3432 9.33709 11.2121C9.4682 11.081 9.63525 10.9917 9.8171 10.9555C9.99896 10.9193 10.1875 10.9379 10.3588 11.0089C10.5301 11.0798 10.6765 11.2 10.7795 11.3542C10.8825 11.5083 10.9375 11.6896 10.9375 11.875C10.9375 12.1236 10.8387 12.3621 10.6629 12.5379C10.4871 12.7137 10.2486 12.8125 10 12.8125ZM12.5 6.25H7.5V4.375C7.5 3.71196 7.76339 3.07607 8.23223 2.60723C8.70107 2.13839 9.33696 1.875 10 1.875C10.663 1.875 11.2989 2.13839 11.7678 2.60723C12.2366 3.07607 12.5 3.71196 12.5 4.375V6.25Z'
              fill='currentColor'
            />
          </svg>
          Authentication
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600, fontSize: '1rem' }}>
          <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18' fill='none'>
            <circle cx='7' cy='5' r='1' fill='currentColor' />
            <circle cx='11' cy='5' r='1' fill='currentColor' />
            <circle cx='7' cy='9' r='1' fill='currentColor' />
            <circle cx='11' cy='9' r='1' fill='currentColor' />
            <circle cx='7' cy='13' r='1' fill='currentColor' />
            <circle cx='11' cy='13' r='1' fill='currentColor' />
          </svg>
          <span style={{ flex: '1' }}>Socials</span>
        </Box>

        <Grid container columns={2} spacing={1.5}>
          {providers.map((provider) => {
            const Icon = providerIconMapping[provider];

            return (
              <Grid key={provider} size={1}>
                <FormControlLabel
                  sx={{
                    display: 'flex',
                    flexDirection: 'row-reverse',
                    justifyContent: 'space-between',
                    margin: 0,
                    paddingX: 1.5,
                    paddingY: 0.8,
                    border: '1px solid',
                    borderColor: 'border',
                    borderRadius: 1
                  }}
                  control={
                    <Checkbox
                      size='small'
                      checked={selectedProviders.includes(provider)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProviders([...selectedProviders, provider]);
                        } else {
                          setSelectedProviders(selectedProviders.filter((p) => p !== provider));
                        }
                      }}
                      name={provider}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                      <Icon style={{ width: 16, height: 16 }} />
                      {providerNameMapping[provider]}
                    </Box>
                  }
                />
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600, fontSize: '1rem' }}>
          <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18' fill='none'>
            <circle cx='7' cy='5' r='1' fill='currentColor' />
            <circle cx='11' cy='5' r='1' fill='currentColor' />
            <circle cx='7' cy='9' r='1' fill='currentColor' />
            <circle cx='11' cy='9' r='1' fill='currentColor' />
            <circle cx='7' cy='13' r='1' fill='currentColor' />
            <circle cx='11' cy='13' r='1' fill='currentColor' />
          </svg>
          <span style={{ flex: '1' }}>Wallets</span>
          <Switch checked={false} />
        </Box>
        <FormControlLabel
          sx={{
            display: 'flex',
            flexDirection: 'row-reverse',
            justifyContent: 'space-between',
            margin: 0,
            paddingX: 1.5,
            paddingY: 0.8,
            border: '1px solid',
            borderColor: 'border',
            borderRadius: 1
          }}
          control={<Checkbox size='small' disabled />}
          label={
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
              <Box
                component='svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth='2'
                stroke='currentColor'
                style={{ width: 16, height: 16, color: 'primary.main' }}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3'
                ></path>
              </Box>
              External Wallets
            </Box>
          }
        />
      </Stack>

      <Stack spacing={1}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            paddingY: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            fontWeight: 600,
            fontSize: '1rem'
          }}
        >
          <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'>
            <path
              d='M18.75 9.375C18.75 9.54076 18.6842 9.69973 18.5669 9.81694C18.4497 9.93415 18.2908 10 18.125 10H15.625V12.5H16.25C16.5815 12.5 16.8995 12.6317 17.1339 12.8661C17.3683 13.1005 17.5 13.4185 17.5 13.75V16.25C17.5 16.5815 17.3683 16.8995 17.1339 17.1339C16.8995 17.3683 16.5815 17.5 16.25 17.5H13.75C13.4185 17.5 13.1005 17.3683 12.8661 17.1339C12.6317 16.8995 12.5 16.5815 12.5 16.25V13.75C12.5 13.4185 12.6317 13.1005 12.8661 12.8661C13.1005 12.6317 13.4185 12.5 13.75 12.5H14.375V10H5.625V12.5H6.25C6.58152 12.5 6.89946 12.6317 7.13388 12.8661C7.3683 13.1005 7.5 13.4185 7.5 13.75V16.25C7.5 16.5815 7.3683 16.8995 7.13388 17.1339C6.89946 17.3683 6.58152 17.5 6.25 17.5H3.75C3.41848 17.5 3.10054 17.3683 2.86612 17.1339C2.6317 16.8995 2.5 16.5815 2.5 16.25V13.75C2.5 13.4185 2.6317 13.1005 2.86612 12.8661C3.10054 12.6317 3.41848 12.5 3.75 12.5H4.375V10H1.875C1.70924 10 1.55027 9.93415 1.43306 9.81694C1.31585 9.69973 1.25 9.54076 1.25 9.375C1.25 9.20924 1.31585 9.05027 1.43306 8.93306C1.55027 8.81585 1.70924 8.75 1.875 8.75H9.375V6.875H8.75C8.41848 6.875 8.10054 6.7433 7.86612 6.50888C7.6317 6.27446 7.5 5.95652 7.5 5.625V3.125C7.5 2.79348 7.6317 2.47554 7.86612 2.24112C8.10054 2.0067 8.41848 1.875 8.75 1.875H11.25C11.5815 1.875 11.8995 2.0067 12.1339 2.24112C12.3683 2.47554 12.5 2.79348 12.5 3.125V5.625C12.5 5.95652 12.3683 6.27446 12.1339 6.50888C11.8995 6.7433 11.5815 6.875 11.25 6.875H10.625V8.75H18.125C18.2908 8.75 18.4497 8.81585 18.5669 8.93306C18.6842 9.05027 18.75 9.20924 18.75 9.375Z'
              fill='currentColor'
            />
          </svg>
          Network
        </Box>

        <Grid container columns={2} spacing={1.5}>
          <Grid size={1}>
            <FormControlLabel
              sx={{
                display: 'flex',
                flexDirection: 'row-reverse',
                justifyContent: 'space-between',
                margin: 0,
                paddingX: 1.5,
                paddingY: 0.8,
                border: '1px solid',
                borderColor: 'border',
                borderRadius: 1
              }}
              control={<Checkbox disabled size='small' checked />}
              label={
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                  <img src={`/Polkadot.png`} style={{ width: 16, height: 16 }} />
                  Polkadot
                </Box>
              }
            />
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}

export default Left;
