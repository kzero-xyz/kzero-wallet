// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { WALLET_IFRAME_ID } from '../utils/constants.js';

export interface WalletIframeProps {
  walletUrl: string;
  visible: boolean;
  onLoad?: (iframe: HTMLIFrameElement) => void;
  onClose?: () => void;
}

/**
 * Wallet iframe modal component with professional styling
 */
export function WalletIframe({ walletUrl, visible, onLoad, onClose }: WalletIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasCalledOnLoad = useRef(false);

  useEffect(() => {
    // Only call onLoad once when iframe first loads
    if (iframeRef.current && isLoaded && !hasCalledOnLoad.current) {
      hasCalledOnLoad.current = true;
      onLoad?.(iframeRef.current);
    }
  }, [isLoaded, onLoad]);

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  useEffect(() => {
    // Handle ESC key to close modal
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && visible) {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          transition: 'opacity 0.2s ease-out'
        }}
        aria-hidden='true'
      />

      {/* Modal Container */}
      <div
        role='dialog'
        aria-modal='true'
        aria-label='Kzero Wallet'
        aria-hidden={!visible}
        onClick={handleBackdropClick}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          transition: 'opacity 0.2s ease-out'
        }}
      >
        {/* Modal Content */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '320px',
            height: 'auto',
            maxHeight: '90vh',
            backgroundColor: 'transparent',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            transform: visible ? 'scale(1)' : 'scale(0.95)',
            transition: 'transform 0.2s ease-out'
          }}
        >
          <iframe
            ref={iframeRef}
            id={WALLET_IFRAME_ID}
            src={walletUrl}
            onLoad={handleLoad}
            style={{
              width: '100%',
              height: '600px',
              border: 'none',
              display: 'block',
              background: 'transparent',
              borderRadius: '16px'
            }}
            title='Kzero Wallet'
          />
        </div>
      </div>

      {/* Global Styles */}
      <style>
        {`
          /* Mobile responsive */
          @media (max-width: 640px) {
            [role="dialog"][aria-label="Kzero Wallet"] {
              padding: 0 !important;
            }

            [role="dialog"][aria-label="Kzero Wallet"] > div {
              max-width: 100% !important;
              max-height: 100vh !important;
              border-radius: 0 !important;
            }

            [role="dialog"][aria-label="Kzero Wallet"] > div > iframe {
              height: 100vh !important;
              border-radius: 0 !important;
            }
          }
        `}
      </style>
    </>
  );

  // Render to body using Portal
  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
