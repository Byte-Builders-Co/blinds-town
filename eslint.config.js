import js from '@eslint/js';
import reactCompiler from 'eslint-plugin-react-compiler';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            'node_modules',
            'public/build',
            'bootstrap/ssr',
            'vendor',
            'resources/js/actions',
            'resources/js/routes',
            'resources/js/wayfinder',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    react.configs.flat.recommended,
    react.configs.flat['jsx-runtime'],
    {
        plugins: {
            'react-hooks': reactHooks,
            'react-compiler': reactCompiler,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-compiler/react-compiler': 'error',
        },
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
        },
    },
    eslintConfigPrettier,
);
