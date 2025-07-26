/// <reference types="node" />

declare global {
  const require: NodeRequire;
  const __filename: string;
  const __dirname: string;
}

// Declare Node.js built-in modules for Storybook
declare module 'path' {
  export * from 'path';
  export { join, resolve, dirname } from 'path';
}
