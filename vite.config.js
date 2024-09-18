import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    build: {
        target: 'es2022',
    },
    esbuild: {
        target: 'es2022',
    },
    optimizeDeps: {
        esbuildOptions: {
            target: 'es2022',
        },
    },
    resolve: {
        alias: {
            three: path.resolve(__dirname, 'build/three.webgpu.js'),
            addons: path.resolve(__dirname, 'addons'),
        },
    },
})
