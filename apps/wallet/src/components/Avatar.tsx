// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import React, { useState } from 'react';

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback: React.ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, fallback, width, height, className, ...props }) => {
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
  };

  return (
    <div className='relative flex items-center justify-center rounded-full overflow-hidden' style={{ width, height }}>
      <div className='absolute inset-0 bg-primary/5 -z-10' />
      {error ? (
        fallback
      ) : (
        <img src={src} alt={alt} onError={handleError} width='100%' height='100%' className={className} {...props} />
      )}
    </div>
  );
};

export default React.memo(Avatar);
