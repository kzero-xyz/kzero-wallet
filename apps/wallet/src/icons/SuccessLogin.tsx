// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

function SuccessLogin({ style }: { style?: React.CSSProperties }) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='100' height='101' viewBox='0 0 100 101' fill='none' style={style}>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M100 50.5C100 78.1142 77.6142 100.5 50 100.5C22.3858 100.5 0 78.1142 0 50.5C0 22.8858 22.3858 0.5 50 0.5C77.6142 0.5 100 22.8858 100 50.5ZM17.195 47.2H43.43V37.3L59.93 50.5L43.43 63.7V53.8H17.195C18.8483 70.4749 32.9195 83.5 50.03 83.5C68.2559 83.5 83.03 68.7259 83.03 50.5C83.03 32.2741 68.2559 17.5 50.03 17.5C32.9162 17.5 18.845 30.5251 17.195 47.2Z'
        className='text-primary'
        fill='currentColor'
      />
    </svg>
  );
}

export default SuccessLogin;
