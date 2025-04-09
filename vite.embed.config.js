import { defineConfig } from 'vite'
import { resolve } from 'path'
import { terser } from 'rollup-plugin-terser'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/debiclic-entry.js'),
      name: 'debiclic',
      formats: ['iife'],
      fileName: () => 'debiclic.min.js',
    },
    outDir: 'dist/embed',
    minify: 'terser',
    rollupOptions: {
      plugins: [terser()],
    },
    emptyOutDir: false,
  }
})
