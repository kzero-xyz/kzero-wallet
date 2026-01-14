// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import KzeroText from '../icons/KzeroText';

interface PoweredByProps {
  showAccount?: boolean;
}

export default function PoweredBy({ showAccount = false }: PoweredByProps) {
  if (showAccount) {
    return null; // Placeholder for account display
  }

  return (
    <div className='flex items-center justify-center gap-1.5 text-xs leading-3.5'>
      <span className='opacity-30'>Powered by</span>
      <KzeroText style={{ width: 75, height: 10, color: 'inherit', opacity: 0.3 }} />
    </div>
  );
}
