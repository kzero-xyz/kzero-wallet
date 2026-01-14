// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

function SuccessLogin({ style }: { style?: React.CSSProperties }) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='100' height='101' viewBox='0 0 100 101' fill='none' style={style}>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M50 100.5C77.6142 100.5 100 78.1142 100 50.5C100 22.8858 77.6142 0.5 50 0.5C22.3858 0.5 0 22.8858 0 50.5C0 78.1142 22.3858 100.5 50 100.5ZM50.5001 43.2218L64.2886 29.4333C66.4365 27.2854 69.9189 27.2854 72.0668 29.4333C74.2146 31.5812 74.2146 35.0636 72.0668 37.2115L58.2783 50.9999L72.0667 64.7884C74.2146 66.9363 74.2146 70.4187 72.0667 72.5665C69.9189 74.7144 66.4365 74.7144 64.2886 72.5665L50.5001 58.7781L36.7114 72.5668C34.5635 74.7147 31.0811 74.7147 28.9332 72.5668C26.7854 70.4189 26.7854 66.9365 28.9332 64.7887L42.722 50.9999L28.9332 37.2112C26.7854 35.0633 26.7854 31.5809 28.9332 29.433C31.0811 27.2851 34.5635 27.2851 36.7114 29.433L50.5001 43.2218Z'
        fill='url(#paint0_linear_18381_505)'
      />
      <defs>
        <linearGradient id='paint0_linear_18381_505' x1='0' y1='0.5' x2='100' y2='100.5' gradientUnits='userSpaceOnUse'>
          <stop stopColor='#FF00B0' />
          <stop offset='1' stopColor='#FF0000' />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default SuccessLogin;
