import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/lib/utils/parsers.ts', 'src/lib/utils/sets.ts'],
      reporter: ['text', 'html'],
      thresholds: {
        branches: 75,
        functions: 90,
        lines: 90,
        statements: 85
      }
    }
  }
});
