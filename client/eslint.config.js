import reactPlugin from 'eslint-plugin-react';

export default [{
  files: ['src/**/*.{js,jsx}'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
  plugins: { react: reactPlugin },
  rules: {
    'react/jsx-uses-vars': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^React$' }],
  },
}];
