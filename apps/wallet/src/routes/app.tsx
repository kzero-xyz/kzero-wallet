// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { CardRouter } from '../components/CardRouter.js';
import { AppProvider } from '../lib/AppContext.js';

/**
 * Main App Component
 *
 * Provides application context (port, authService) and routes to appropriate cards
 */
export function App() {
  return (
    <AppProvider>
      <CardRouter />
    </AppProvider>
  );
}

export default App;
