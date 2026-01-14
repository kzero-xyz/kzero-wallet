// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import type { LoginProvider, ThemeConfig } from '@kzero/zk-core';

import { alpha, emphasize, lighten, StyledEngineProvider } from '@mui/material';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { ToastContainer } from 'react-toastify';

import { darkTheme, KzeroProvider, lightTheme } from '@kzero/zk-react';

import BaseContainer from './BaseContainer';
import Center from './Center';
import GlobalStyle from './GlobalStyle';
import Header from './Header';
import Left from './Left';
import ThemeProvider from './theme';
import { getBestForegroundColor } from './utils';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'custom'>('light');
  const [color, setColor] = useState('#FDFCFC');
  const [primaryColor, setPrimaryColor] = useState(lightTheme.colors.primary);
  const [providers] = useState<LoginProvider[]>(['google', 'apple', 'github']);
  const [selectedProviders, setSelectedProviders] = useState<LoginProvider[]>(providers);
  const [brand, setBrand] = useState<string>('');
  const [radius, setRadius] = useState<'small' | 'medium' | 'large'>('medium');
  const [displayMode, setDisplayMode] = useState<'embedded' | 'modal'>('embedded');

  // Store computed themes in state to avoid recalculating on every render
  const [kzeroTheme, setKzeroTheme] = useState<ThemeConfig>(() => {
    const baseTheme = lightTheme;
    const primary = baseTheme.colors.primary;

    // Compute derived colors from primary
    const primaryForeground = getBestForegroundColor(primary);
    const secondary = alpha(primary, 0.1);
    const secondaryForeground = primary;

    return {
      colors: {
        ...baseTheme.colors,
        primary: primary,
        primaryForeground: primaryForeground,
        secondary: secondary,
        secondaryForeground: secondaryForeground,
        background: baseTheme.colors.background,
        foreground: baseTheme.colors.foreground,
        border: baseTheme.colors.border
      },
      radius: {
        base: '10px',
        card: '20px'
      }
    };
  });

  const [workspaceColor, setWorkspaceColor] = useState<string>(() => {
    return lighten(emphasize(lightTheme.colors.background || '#FFFFFF', 0.02), 0.1);
  });

  const [, startTransition] = useTransition();
  const computeThemeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to compute theme with debounce
  const computeTheme = useCallback(
    (
      themeMode: 'light' | 'dark' | 'custom',
      bgColor: string,
      primary: string,
      radiusSize: 'small' | 'medium' | 'large'
    ) => {
      if (computeThemeTimerRef.current) {
        clearTimeout(computeThemeTimerRef.current);
      }

      computeThemeTimerRef.current = setTimeout(() => {
        startTransition(() => {
          const baseTheme = themeMode === 'light' ? lightTheme : darkTheme;
          const backgroundColor = themeMode === 'custom' ? bgColor : baseTheme.colors.background;
          const foregroundColor =
            themeMode === 'custom' ? getBestForegroundColor(bgColor) : baseTheme.colors.foreground;

          // Dynamically compute secondary and foreground colors based on primary
          const primaryForeground = getBestForegroundColor(primary);
          const secondary = alpha(primary, 0.1);
          const secondaryForeground = primary;

          setKzeroTheme({
            colors: {
              ...baseTheme.colors,
              primary: primary,
              primaryForeground: primaryForeground,
              secondary: secondary,
              secondaryForeground: secondaryForeground,
              background: backgroundColor,
              foreground: foregroundColor,
              border: themeMode === 'custom' ? lighten(emphasize(bgColor, 0.2), 0.2) : baseTheme.colors.border
            },
            radius: {
              base: radiusSize === 'small' ? '5px' : radiusSize === 'medium' ? '10px' : '15px',
              card: radiusSize === 'small' ? '15px' : radiusSize === 'medium' ? '20px' : '25px'
            }
          });

          setWorkspaceColor(lighten(emphasize(backgroundColor || '#FFFFFF', 0.02), 0.1));
        });
      }, 16);
    },
    []
  );

  // Wrapped setState functions that also update theme
  const handleSetTheme = useCallback(
    (newTheme: 'light' | 'dark' | 'custom') => {
      setTheme(newTheme);
      computeTheme(newTheme, color, primaryColor, radius);
    },
    [color, primaryColor, radius, computeTheme]
  );

  const handleSetColor = useCallback(
    (newColor: string) => {
      setColor(newColor);
      computeTheme(theme, newColor, primaryColor, radius);
    },
    [theme, primaryColor, radius, computeTheme]
  );

  const handleSetPrimaryColor = useCallback(
    (newPrimaryColor: string) => {
      setPrimaryColor(newPrimaryColor);
      computeTheme(theme, color, newPrimaryColor, radius);
    },
    [theme, color, radius, computeTheme]
  );

  const handleSetRadius = useCallback(
    (newRadius: 'small' | 'medium' | 'large') => {
      setRadius(newRadius);
      computeTheme(theme, color, primaryColor, newRadius);
    },
    [theme, color, primaryColor, computeTheme]
  );

  // Switch to modal mode when user connects
  const handleConnect = useCallback(() => {
    setDisplayMode('modal');
  }, []);

  // Switch back to embedded mode when user disconnects
  const handleDisconnect = useCallback(() => {
    setDisplayMode('embedded');
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (computeThemeTimerRef.current) {
        clearTimeout(computeThemeTimerRef.current);
      }
    };
  }, []);

  return (
    <StyledEngineProvider injectFirst>
      <KzeroProvider
        walletUrl={import.meta.env.VITE_WALLET_URL || 'http://localhost:5176'}
        rpcUrl={import.meta.env.VITE_RPC_URL || 'ws://127.0.0.1:9944'}
        authEndpoint={import.meta.env.VITE_AUTH_ENDPOINT || 'http://localhost:3000'}
        displayMode={displayMode}
        providers={selectedProviders}
        theme={kzeroTheme}
        debug={import.meta.env.DEV}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      >
        <ThemeProvider walletTheme={kzeroTheme}>
          <GlobalStyle />
          <Header workspaceColor={workspaceColor} />

          <BaseContainer
            workspaceColor={workspaceColor}
            walletTheme={kzeroTheme}
            left={
              <Left
                theme={kzeroTheme}
                providers={providers}
                selectedProviders={selectedProviders}
                brand={brand}
                radius={radius}
                setTheme={handleSetTheme}
                setPrimaryColor={handleSetPrimaryColor}
                setSelectedProviders={setSelectedProviders}
                setBrand={setBrand}
                setColor={handleSetColor}
                setRadius={handleSetRadius}
              />
            }
          >
            <Center />
          </BaseContainer>
          <ToastContainer />
        </ThemeProvider>
      </KzeroProvider>
    </StyledEngineProvider>
  );
}

export default App;
