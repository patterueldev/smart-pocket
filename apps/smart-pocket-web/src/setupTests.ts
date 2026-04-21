import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for jsdom
if (!global.TextEncoder) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TextEncoder, TextDecoder } = require('util');
  Object.assign(global, {
    TextEncoder,
    TextDecoder,
  });
}
