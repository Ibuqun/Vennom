import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';

describe('icons', () => {
  it('has all required icon components', () => {
    const files = readdirSync('src/lib/icons').filter((file) => file.endsWith('.svelte'));
    expect(files.length).toBe(24);
  });
});
