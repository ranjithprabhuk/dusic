import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../../../dist');

describe('Build smoke tests', () => {
  it('dist/index.html exists', () => {
    expect(existsSync(resolve(distDir, 'index.html'))).toBe(true);
  });

  it('index.html references correct base path', () => {
    const html = readFileSync(resolve(distDir, 'index.html'), 'utf-8');
    expect(html).toContain('/dusic/');
    expect(html).toContain('<title>');
  });

  it('dist/assets directory has bundles', () => {
    expect(existsSync(resolve(distDir, 'assets'))).toBe(true);
  });

  it('404.html exists for SPA routing', () => {
    expect(existsSync(resolve(distDir, '404.html'))).toBe(true);
  });

  it('sample files are included', () => {
    expect(existsSync(resolve(distDir, 'samples/dholak'))).toBe(true);
    expect(existsSync(resolve(distDir, 'samples/tabla'))).toBe(true);
  });
});
