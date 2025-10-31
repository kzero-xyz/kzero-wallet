// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

function Auth() {
  const { provider, ephemeralPublicKey } = useParams<{ provider: string; ephemeralPublicKey: string }>();

  useEffect(() => {
    if (provider && ephemeralPublicKey) {
      fetch(`http://localhost:3000/auth/${provider}?ephemeral_public_key=${ephemeralPublicKey}`, {
      // fetch(`https://demo-auth.kzero.xyz/auth/${provider}?ephemeral_public_key=${ephemeralPublicKey}`, {
        credentials: 'include'
      })
        .then((res) => res.json())
        .then(({ url }) => {
          window.location.href = url;
        });
    }
  }, [provider, ephemeralPublicKey]);

  return null;
}

export default Auth;
