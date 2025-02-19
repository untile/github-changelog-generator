/**
 * Module dependencies.
 */

import path from 'node:path';

/**
 * Export vitest config.
 */

export default {
  moduleNameMapper: {
    '^src/(.*)$': './src/$1'
  },
  resolve: {
    alias: [
      { find: 'src', replacement: path.resolve(__dirname, 'src') }
    ]
  },
  test: {
    environment: 'jsdom'
  },
  testMatch: ['src/**/*.test.ts']
};
