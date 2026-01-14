// Copyright 2023-2024 kzero authors & contributors
// SPDX-License-Identifier: GPL-3.0

import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import url from '@rollup/plugin-url';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
    preserveModules: true,
    preserveModulesRoot: 'src',
    sourcemap: false
  },
  treeshake: false,
  external: [
    /node_modules/,
    '@emotion/react',
    '@emotion/styled',
    'react',
    'react-dom',
    'react/jsx-runtime',
    '@kzero/zk-core',
    '@kzero/message-port',
    '@polkadot/util-crypto',
    'input-otp'
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.app.json',
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src',
      compilerOptions: {
        target: 'ES2020',
        module: 'NodeNext'
      }
    }),
    nodeResolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }),
    commonjs(),
    postcss({
      extract: 'style.css',
      minimize: true
    }),
    url({
      limit: 10 * 1024, // 10KB
      include: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.webp'],
      emitFiles: true
    })
  ]
};
