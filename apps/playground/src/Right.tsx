// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { ThemeConfig } from '@kzero/zk-core';

import { Card, CardContent, CardHeader, Divider, Stack, Typography } from '@mui/material';

function Right({ walletTheme }: { walletTheme: ThemeConfig }) {
  return (
    <Stack spacing={2}>
      <Card sx={{ width: 360, padding: 2, borderRadius: walletTheme.radius.card }}>
        <CardHeader title='Keyless. One-Click. Anywhere. Anytime.' />
        <Divider sx={{ marginY: 1 }} />
        <CardContent>
          <Typography fontSize='0.75rem'>
            Say goodbye to managing private keys. One-click access to your DAppswithout keys or device dependency.
            Simple, fast, and frictionless.
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ width: 360, padding: 2, borderRadius: `${walletTheme.radius.card}` }}>
        <CardHeader title='ZKP-based Social Login. Privacy Protected.' />
        <Divider sx={{ marginY: 1 }} />
        <CardContent>
          <Typography fontSize='0.75rem'>
            Zero-knowledge proof (ZKP) lets you interact with Web3 while keeping your data private. No
            compromises—access DApps securely and anonymously.
          </Typography>
        </CardContent>
      </Card>
      <Card sx={{ width: 360, padding: 2, borderRadius: `${walletTheme.radius.card}` }}>
        <CardHeader title='Non-Custodial. Maximum Security.' />
        <Divider sx={{ marginY: 1 }} />
        <CardContent>
          <Typography fontSize='0.75rem'>
            Fully non-custodial—your data stays with you. Maximum security for your assets and identity, always under
            your control.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default Right;
