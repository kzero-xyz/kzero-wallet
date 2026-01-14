// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import React from 'react';

import { useKzeroContext } from '../context/KzeroContext.js';
import { WALLET_IFRAME_ID } from '../utils/constants.js';

interface WalletCardProps {
  /**
   * Custom styling for the iframe
   */
  className?: string;

  /**
   * Custom styles for the iframe
   */
  style?: React.CSSProperties;

  /**
   * Callback when iframe loads
   */
  onLoad?: (iframe: HTMLIFrameElement) => void;
}

/**
 * WalletCard Component
 *
 * In embedded mode, this component renders the wallet iframe directly.
 * It combines the functionality of WalletCard and WalletIframe.
 *
 * Configure providers and theme via KzeroProvider props:
 * ```tsx
 * <KzeroProvider
 *   walletUrl="http://localhost:5176"
 *   displayMode="embedded"
 *   providers={['google', 'twitter']}
 *   theme={darkTheme}
 * >
 *   <WalletCard />
 * </KzeroProvider>
 * ```
 *
 * TODO: Providers and theme configuration passthrough to wallet iframe
 */
export default function WalletCard({ className, style, onLoad }: WalletCardProps) {
  const { walletUrl, handleIframeLoad } = useKzeroContext();
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const handleLoad = () => {
    if (iframeRef.current) {
      // Initialize wallet connection
      handleIframeLoad(iframeRef.current);

      // Call user's onLoad if provided
      onLoad?.(iframeRef.current);
    }
  };

  return (
    <iframe
      ref={iframeRef}
      id={WALLET_IFRAME_ID}
      src={walletUrl}
      onLoad={handleLoad}
      className={className}
      style={{
        width: '100%',
        height: '420px',
        border: '1px solid rgba(217, 217, 217, 0.5)',
        borderRadius: '20px',
        background: 'transparent',
        boxShadow: 'rgba(0, 0, 0, 0.06) 0px 0px 10px 0px',
        overflow: 'hidden',
        ...style
      }}
      title='Kzero Wallet'
    />
  );
}
