// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { useCallback } from 'react';

const POINTS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

// Opacity values for each line
const OPACITIES = [0.08, 0.17, 0.25, 0.33, 0.42, 0.5, 0.58, 0.66, 0.75, 0.83, 0.92, 1];

interface RotatingLinesProps {
  width?: number;
}

export default function RotatingLines({ width = 20 }: RotatingLinesProps) {
  const lines = useCallback(
    () =>
      POINTS.map((point, index) => (
        <polyline
          key={point}
          points='24,12 24,4'
          strokeWidth={5}
          strokeLinecap='round'
          strokeOpacity={OPACITIES[index]}
          transform={`rotate(${point}, 24, 24)`}
        />
      )),
    []
  );

  return (
    <svg
      viewBox='0 0 48 48'
      width={width}
      stroke='currentColor'
      className='inline-block animate-[spin_0.75s_steps(12)_infinite]'
      data-testid='rotating-lines-svg'
    >
      {lines()}
    </svg>
  );
}
