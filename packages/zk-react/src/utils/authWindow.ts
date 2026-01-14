// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

/**
 * Manages OAuth authentication popup windows
 */
export class AuthWindowManager {
  private window: Window | null = null;
  private checkInterval: number | null = null;

  /**
   * Opens an authentication window and waits for it to close
   *
   * @param authUrl - The OAuth authorization URL
   * @returns Promise that resolves when the window is closed
   */
  async openAuthWindow(authUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Calculate centered window position
      const width = 600;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      // Open popup window
      this.window = window.open(
        authUrl,
        'kzero_oauth_window',
        `width=${width},height=${height},left=${left},top=${top},` +
          'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes'
      );

      if (!this.window) {
        reject(new Error('Failed to open authentication window. Please allow popups for this site.'));

        return;
      }

      // Poll to check if window is closed
      this.checkInterval = window.setInterval(() => {
        if (!this.window || this.window.closed) {
          this.cleanup();
          resolve();
        }
      }, 100);

      // Timeout protection (5 minutes)
      setTimeout(
        () => {
          if (this.window && !this.window.closed) {
            this.window.close();
          }

          this.cleanup();
          reject(new Error('Authentication timeout after 5 minutes'));
        },
        5 * 60 * 1000
      );
    });
  }

  /**
   * Closes the authentication window if it's still open
   */
  closeAuthWindow(): void {
    if (this.window && !this.window.closed) {
      this.window.close();
    }

    this.cleanup();
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    this.window = null;
  }
}
