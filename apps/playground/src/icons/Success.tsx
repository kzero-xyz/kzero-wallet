// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

function Success({ style }: { style?: React.CSSProperties }) {
  return (
    <svg focusable='false' aria-hidden='true' viewBox='0 0 24 24' style={style}>
      <path d='M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' fill='currentColor' />
    </svg>
  );
}

export default Success;
