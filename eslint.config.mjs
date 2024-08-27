import pluginJs from '@eslint/js';
import tsEslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

/* eslint @stylistic/comma-dangle: ["error", "always-multiline"] */

export default [
	{
		files: ['**/*.{js,mjs,ts}'],
	},
	stylistic.configs['recommended-flat'],
	pluginJs.configs.recommended,
	...tsEslint.configs.recommended,
	{
		rules: {
			'no-console': 'error',
			'@stylistic/semi': ['error', 'always'],
			'@stylistic/comma-dangle': ['error', 'never'],
			'@stylistic/member-delimiter-style': ['error', {
				multiline: {
					delimiter: 'semi',
					requireLast: true,
				},
				singleline: {
					delimiter: 'semi',
					requireLast: false,
				},
				multilineDetection: 'brackets',
			}],
			'@typescript-eslint/no-unused-vars': ['error', {
				args: 'all',
				argsIgnorePattern: '^_',
				caughtErrors: 'all',
				caughtErrorsIgnorePattern: '^_',
				destructuredArrayIgnorePattern: '^_',
				varsIgnorePattern: '^_',
				ignoreRestSiblings: true,
			}],
			'@stylistic/indent': ['error', 'tab'],
			'@stylistic/no-tabs': ['error', {
				allowIndentationTabs: true,
			}],
			'@stylistic/brace-style': ['error', '1tbs'],
			'@stylistic/operator-linebreak': ['error', 'before', {
				overrides: {
					'||': 'after',
					'&&': 'after',
				},
			}],
			'@stylistic/arrow-parens': ['error', 'as-needed'],
			'@stylistic/spaced-comment': ['error', 'always', {
				markers: ['#region', '#endregion'],
			}],
		},
	},
	{
		ignores: ['built/*'],
	},
];
