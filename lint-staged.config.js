export default {
  '*.{ts,tsx,js,jsx}': [
    'prettier --write',
    'pnpm --filter @ksc/web exec eslint --fix --no-warn-ignored',
  ],
  '*.{json,css,md,yml,yaml}': 'prettier --write',
}
