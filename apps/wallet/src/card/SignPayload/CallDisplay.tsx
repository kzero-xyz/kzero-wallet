// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { ApiPromise } from '@polkadot/api';
import type { GenericCall } from '@polkadot/types';
import type { Circle } from '@polkadot/ui-shared/icons/types';

import { polkadotIcon } from '@polkadot/ui-shared';
import { useMemo } from 'react';

import { formatDisplay, formatUnits } from '../../lib/units';

const circlesFunc = () => {
  const map = new Map<string, Circle[]>();

  return (address: string): Circle[] => {
    if (map.has(address)) {
      return map.get(address) as Circle[];
    }

    const circles = polkadotIcon(address, { isAlternative: false });

    map.set(address, circles);

    return circles;
  };
};

const getCircles = circlesFunc();

function renderCircle({ cx, cy, fill, r }: Circle, index: number) {
  return <circle key={index} cx={cx} cy={cy} fill={fill} r={r} />;
}

interface CallDisplayProps {
  api: ApiPromise;
  call: GenericCall;
}

export default function CallDisplay({ api, call }: CallDisplayProps) {
  const [section, method, ...args] = useMemo((): [section: string, method: string, ...args: any[]] => {
    return [call.section, call.method, ...call.args];
  }, [call]);

  const decimals = useMemo(() => api.registry.chainDecimals[0], [api]);

  if (
    section === 'balances' &&
    (method === 'transfer' ||
      method === 'transferKeepAlive' ||
      method === 'transferAll' ||
      method === 'transferAllowDeath')
  ) {
    const dest = args[0].toString();
    const destCircles = getCircles(dest);
    const amount = args[1].toString();

    const formated = formatDisplay(formatUnits(amount, decimals));

    return (
      <div className='p-5 px-2.5 bg-secondary text-foreground rounded-[10px] text-sm leading-6 text-center'>
        <span className='opacity-50'>Transfer</span>&nbsp;
        <b className='font-semibold'>
          {formated[0]}
          {formated[1] ? `.${formated[1]}` : ''}
          {formated[2] || ''}
        </b>
        &nbsp;{api.registry.chainTokens[0]}
        <br />
        <span className='opacity-50'>To</span>&nbsp;
        <svg viewBox='0 0 64 64' width={20} height={20} className='inline-block align-middle'>
          {destCircles.map(renderCircle)}
        </svg>
        &nbsp;
        <b className='font-semibold cursor-copy' onClick={() => navigator.clipboard.writeText(dest)}>
          {dest.slice(0, 6)}...{dest.slice(-6)}
        </b>
      </div>
    );
  }

  return null;
}
