import { defineConfig } from 'vite'
import { terser } from 'rollup-plugin-terser'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/debiclic-entry.js'),
			name: 'debiclic',
			formats: ['iife'],
			fileName: () => 'debiclic.min.js'
		},
		outDir: 'dist/embed',
		minify: 'terser',
		rollupOptions: {
			plugins: [terser()]
		},
		emptyOutDir: false
	}
})
