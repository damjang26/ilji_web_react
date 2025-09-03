import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
            'Cross-Origin-Embedder-Policy': 'unsafe-none',
        },

        proxy: {
            '/api': {
                target: 'http://localhost:8090', // 백엔드 서버 주소
                changeOrigin: true,
            }
        }
    },
})
