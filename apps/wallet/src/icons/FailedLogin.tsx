// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

function FailedLogin({ style }: { style?: React.CSSProperties }) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='100' height='101' viewBox='0 0 100 101' fill='none' style={style}>
      <path
        d='M50 100.5C77.6142 100.5 100 78.1142 100 50.5C100 22.8858 77.6142 0.5 50 0.5C22.3858 0.5 0 22.8858 0 50.5C0 78.1142 22.3858 100.5 50 100.5Z'
        fill='url(#paint0_linear_18381_502)'
      />
      <defs>
        <linearGradient id='paint0_linear_18381_502' x1='0' y1='0.5' x2='100' y2='100.5' gradientUnits='userSpaceOnUse'>
          <stop stopColor='#E70184' />
          <stop offset='1' stopColor='#FF6F00' />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default FailedLogin;
