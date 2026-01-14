// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { LoginProvider } from '@kzero/zk-core';

import Button from '../../components/Button';
import XIcon from '../../icons/X';

export default function TwitterProvider({ onClick }: { onClick: (provider: LoginProvider) => void }) {
  return (
    <Button align='left' onClick={() => onClick('twitter')}>
      <XIcon style={{ width: 20, height: 20 }} />X (Twitter)
    </Button>
  );
}
