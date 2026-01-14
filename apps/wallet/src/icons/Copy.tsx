// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

function Copy({ style }: { style?: React.CSSProperties }) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none' style={style}>
      <g clipPath='url(#clip0_17472_53102)'>
        <path
          d='M3.25 3.1079V1.95312C3.25 1.5648 3.5648 1.25 3.95312 1.25H10.0469C10.4352 1.25 10.75 1.5648 10.75 1.95312V8.04688C10.75 8.4352 10.4352 8.75 10.0469 8.75H8.87908'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M8.04688 3.25H1.95312C1.5648 3.25 1.25 3.5648 1.25 3.95312V10.0469C1.25 10.4352 1.5648 10.75 1.95312 10.75H8.04688C8.4352 10.75 8.75 10.4352 8.75 10.0469V3.95312C8.75 3.5648 8.4352 3.25 8.04688 3.25Z'
          stroke='currentColor'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_17472_53102'>
          <rect width='12' height='12' fill='white' />
        </clipPath>
      </defs>
    </svg>
  );
}

export default Copy;
