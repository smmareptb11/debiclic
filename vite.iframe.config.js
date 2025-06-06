import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { resolve } from 'path'

export default defineConfig({
	base: './',
	plugins: [preact()],
	build: {
		assetsDir: 'assets',
		outDir: 'dist/iframe',
		rollupOptions: {
			input: resolve(__dirname, 'index.html'),
			output: {
				entryFileNames: `assets/[name].js`,
				chunkFileNames: `assets/[name].js`,
				assetFileNames: `assets/[name].[ext]`
			}
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