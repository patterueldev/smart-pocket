import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for jsdom
// @ts-expect-error - require is available in Node.js

if (!global.TextEncoder) {
  // @ts-expect-error - global is available in Node.js
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TextEncoder, TextDecoder } = require('util');
  // @ts-expect-error - global is available in Node.js
  Object.assign(global, {
    TextEncoder,
    TextDecoder,
  });
}
