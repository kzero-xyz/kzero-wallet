// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { LoginProvider } from '@kzero/zk-core';

import Button from '../../components/Button';
import AppleIcon from '../../icons/Apple';

export default function AppleProvider({ onClick }: { onClick: (provider: LoginProvider) => void }) {
  return (
    <Button align='left' onClick={() => onClick('apple')}>
      <AppleIcon style={{ width: 20, height: 20 }} />
      Apple
    </Button>
  );
}
