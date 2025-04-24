import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { resolve } from 'path'

export default defineConfig({
	base: '/iframe/',
	plugins: [preact()],
	build: {
		outDir: 'dist/iframe',
		rollupOptions: {
			input: resolve(__dirname, 'index.html')
		},
		emptyOutDir: true
	},
	resolve: {
		alias: {
			react: 'preact/compat',
			'react-dom': 'preact/compat'
		}
	}
})
