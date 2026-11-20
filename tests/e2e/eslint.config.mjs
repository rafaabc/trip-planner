import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      '.features-gen/**',
      'allure-results/**',
      'allure-report/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...playwright.configs['flat/recommended'],
    files: ['**/*.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // No fixed waits: rely on Playwright auto-waiting and web-first assertions
      'playwright/no-wait-for-timeout': 'error',
      // Assertions live in Then steps, not in the spec files playwright-bdd generates
      'playwright/expect-expect': 'off',
    },
  },
  {
    // Step definitions run inside the tests playwright-bdd generates, so expect() is valid here
    files: ['steps/**/*.ts'],
    rules: { 'playwright/no-standalone-expect': 'off' },
  },
  prettier,
);
