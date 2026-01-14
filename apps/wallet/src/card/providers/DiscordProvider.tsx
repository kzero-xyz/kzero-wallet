// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { LoginProvider } from '@kzero/zk-core';

import Button from '../../components/Button';
import DiscordIcon from '../../icons/Discord';

export default function DiscordProvider({ onClick }: { onClick: (provider: LoginProvider) => void }) {
  return (
    <Button align='left' onClick={() => onClick('discord')}>
      <DiscordIcon style={{ width: 20, height: 20 }} />
      Discord
    </Button>
  );
}
