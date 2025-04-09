import js from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import preactPlugin from 'eslint-plugin-preact'
import globals from 'globals'

export default [
	js.configs.recommended,
	{
		plugins: {
			react: reactPlugin,
			preact: preactPlugin
		},
		languageOptions: {
			ecmaVersion: 2021,
			sourceType: 'module',
			parserOptions: {
			  ecmaFeatures: {
					jsx: true
			  }
			},
			globals: {
			  ...globals.browser
			}
		},
		rules: {
			...preactPlugin.configs.recommended.rules,
			semi: ['error', 'never']
		},
		settings: {
			react: {
				pragma: 'h',
				version: 'detect'
			}
		}
	},
	{
		ignores: ['dist']
	}
]
