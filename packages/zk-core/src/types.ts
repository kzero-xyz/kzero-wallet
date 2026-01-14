// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

export type Hex = `0x${string}`;

export type LoginProvider = 'google' | 'twitter' | 'apple' | 'github' | 'telegram' | 'discord';

/**
 * Theme configuration for wallet UI customization
 * Maps to CSS custom properties in wallet app
 */
export interface ThemeConfig {
  colors: {
    background: string;
    foreground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    success: string;
    successForeground: string;
    error: string;
    errorForeground: string;
    warning: string;
    warningForeground: string;
    border: string;
    divider: string;
  };
  radius: {
    base: string;
    card: string;
  };
}

export type ZkAccount = {
  type: 'zk';
  address: Hex;
  provider: LoginProvider;
  ephemeralPublicKey: Hex;
  name: string;
  email?: string;
  picture?: string;
  proofStatus: 'pending' | 'error' | 'generated';
};

export type Account =
  | ZkAccount
  | {
      type: 'injected';
      address: Hex;
      name?: string;
      source: string;
    };

export interface SignerPayloadJSON {
  /**
   * @description The ss-58 encoded address
   */
  address: string;
  /**
   * @description The id of the asset used to pay fees, in hex
   */
  assetId?: number | object;
  /**
   * @description The checkpoint hash of the block, in hex
   */
  blockHash?: Hex;
  /**
   * @description The checkpoint block number, in hex
   */
  blockNumber?: Hex;
  /**
   * @description The era for this transaction, in hex
   */
  era?: Hex;
  /**
   * @description The genesis hash of the chain, in hex
   */
  genesisHash?: Hex;
  /**
   * @description The metadataHash for the CheckMetadataHash SignedExtension, as hex
   */
  metadataHash?: Hex;
  /**
   * @description The encoded method (with arguments) in hex
   */
  method: string;
  /**
   * @description The mode for the CheckMetadataHash SignedExtension, in hex
   */
  mode?: number;
  /**
   * @description The nonce for this transaction, in hex
   */
  nonce?: Hex;
  /**
   * @description The current spec version for the runtime
   */
  specVersion?: Hex;
  /**
   * @description The tip for this transaction, in hex
   */
  tip?: Hex;
  /**
   * @description The current transaction version for the runtime
   */
  transactionVersion?: Hex;
  /**
   * @description The applicable signed extensions for this runtime
   */
  signedExtensions?: string[];
  /**
   * @description The version of the extrinsic we are dealing with
   */
  version?: number;
  /**
   * @description Optional flag that enables the use of the `signedTransaction` field in
   * `singAndSend`, `signAsync`, and `dryRun`.
   */
  withSignedTransaction?: boolean;
}

export interface SignerResult {
  /**
   * @description The id for this request
   */
  id: string;
  /**
   * @description The resulting signature in hex
   */
  signature: Hex;
  /**
   * @description The payload constructed by the signer. This allows the
   * inputted signed transaction to bypass `signAndSend` from adding the signature to the payload,
   * and instead broadcasting the transaction directly. There is a small validation layer. Please refer
   * to the implementation for more information. If the inputted signed transaction is not actually signed, it will fail with an error.
   *
   * This will also work for `signAsync`. The new payload will be added to the Extrinsic, and will be sent once the consumer calls `.send()`.
   *
   * NOTE: This is only implemented for `signPayload`, and will only work when the `withSignedTransaction` option is enabled as an option.
   */
  signedTransaction: Hex;
}

export interface MetadataDefBase {
  chain: string;
  genesisHash: Hex;
  icon: string;
  ss58Format: number;
  chainType?: 'substrate' | 'ethereum';
}
export interface MetadataDef extends MetadataDefBase {
  color?: string;
  specVersion: number;
  tokenDecimals: number;
  tokenSymbol: string;
  types: Record<string, Record<string, string> | string>;
  metaCalls?: string;
  userExtensions?: Record<string, any>;
}

/**
 * Message types for parent-wallet communication
 * Using discriminated unions for type-safe message handling
 */
export type MessageData = { id: string; error?: string } &
  // Account management
  (| {
        type: 'accounts.all';
        payload: null | undefined;
        response: { accounts: ZkAccount[] };
      }
    | {
        type: 'logout';
        payload: null | undefined;
        response: null;
      }
    // Transaction signing
    | {
        type: 'sign.request';
        payload: SignerPayloadJSON;
        response: SignerResult;
      }
    | {
        type: 'sign.cancelled';
        payload: null | undefined;
        response: null;
      }
    // Events (emit/listen only, no request/response)
    | {
        type: 'accounts.change';
        payload: ZkAccount | null;
        response: null;
      }
    | {
        type: 'auth.request';
        payload: {
          provider: LoginProvider;
          authUrl: string;
          sessionId: string;
        };
        response: null;
      }
    | {
        type: 'auth.window-closed';
        payload: null | undefined;
        response: null;
      }
    // Theme management
    | {
        type: 'theme.update';
        payload: ThemeConfig;
        response: null;
      }
    // Providers management
    | {
        type: 'providers.update';
        payload: LoginProvider[];
        response: null;
      }
  );

export type RequestMessage = Omit<MessageData, 'response'>;

export type ResponseMessage = Omit<MessageData, 'payload'>;

export type Proof = {
  updatedAt: number; // timestamp
  createdAt: number; // timestamp
  maxEpoch: string;
  kid: number;
  email?: string;
  name: string;
  picture?: string;
  provider: LoginProvider;
} & (
  | { status: 'waiting' | 'generating'; zkAddress: Hex }
  | {
      status: 'generated';
      proof: {
        proof_points: {
          a: [string, string, string];
          b: [[string, string], [string, string], [string, string]];
          c: [string, string, string];
        };
        iss_base64_details: {
          value: string;
          index_mod_4: number;
        };
        header: string;
      };
      public: [`${number}`];
      zkAddress: Hex;
    }
  | { status: 'failed'; zkAddress?: Hex }
);

export type InjectedAccount = {
  address: string;
  name?: string;
  type: 'ed25519';
};
