/**
 * Export vitest config.
 */

export default {
  moduleNameMapper: {
    '^src/(.*)$': './src/$1'
  },
  test: {
    environment: 'jsdom'
  },
  testMatch: ['src/**/*.test.ts']
};
