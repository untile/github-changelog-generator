#!/usr/bin/env node

// Ignore the experimental warning for the fetch API
const originalEmit = process.emit;
process.emit = (name, data, ...args) => {
  if (
    name === 'warning' &&
    typeof data === 'object' &&
    data.name === 'ExperimentalWarning' &&
    data.message.includes('Fetch API')
  ) {
    return false;
  }

  return originalEmit.apply(process, args);
};

require('../dist/cjs/index.js');
