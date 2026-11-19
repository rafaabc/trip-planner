import js from '@eslint/js';
import globals from 'globals';
import mocha from 'eslint-plugin-mocha';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['node_modules/', 'reports/'] },
  js.configs.recommended,
  mocha.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node, ...globals.mocha },
    },
    rules: {
      'mocha/no-exclusive-tests': 'error',
      'mocha/no-pending-tests': 'warn',
      'mocha/no-mocha-arrows': 'off',
    },
  },
  prettier,
];
