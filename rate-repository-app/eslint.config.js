// eslint.config.js
const reactPlugin = require('eslint-plugin-react');
const reactNativePlugin = require('eslint-plugin-react-native');
const { FlatCompat } = require('@eslint/eslintrc');

// Create compatibility instance with specific path to fix reference issues
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// First, define our custom base rules
const baseConfig = {
  files: ['**/*.{js,jsx}'],
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    globals: {
      // Browser globals
      window: true,
      document: true,
      navigator: true,
      // Node.js globals
      process: true,
      require: true,
      module: true,
      exports: true,
      // React Native globals
      __DEV__: true,
      // Console for SignIn.jsx
      console: true,
    },
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
  plugins: {
    react: reactPlugin,
    'react-native': reactNativePlugin,
  },
  settings: {
    react: { version: 'detect' },
  },
};

// Now explicitly create a rule override config that will be applied AFTER all others
const overrideRules = {
  files: ['**/*.{js,jsx}'],
  rules: {
    // Explicitly disable prop-types - this should take precedence
    'react/prop-types': 0, // Using 0 instead of 'off' for extra emphasis
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',
    'react/react-in-jsx-scope': 'off',
    'react-native/no-unused-styles': 'warn',
    'react-native/no-inline-styles': 'warn',
    'no-unused-vars': 'warn',
    'no-undef': 'error',
    'no-console': 'off',
  },
};

// Create the complete config array
module.exports = [
  // Start with the base config
  baseConfig,
  
  // Add the compatibility configs in the middle
  ...compat.config({ extends: ['plugin:react/recommended'] }),
  ...compat.config({ extends: ['plugin:react/jsx-runtime'] }),
  
  // End with our override rules to ensure they take precedence
  overrideRules,
];