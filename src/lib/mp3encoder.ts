// Re-export Mp3Encoder from vendored lamejs bundle.
// The npm package has broken CJS module boundaries (MPEGMode not scoped),
// so we use the self-contained lame.all.js with ESM exports appended.
// @ts-expect-error — untyped vendored JS
export { Mp3Encoder } from './lame.js';
