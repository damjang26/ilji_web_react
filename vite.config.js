import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '',
    define: {
        global: 'window',
    },
    optimizeDeps: {
        include: ["fabric"]
    },
    build: {
        commonjsOptions: {
            transformMixedEsModules: true, // ← require()를 ESM으로 변환 허용
        },
    },
    server: {
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
            'Cross-Origin-Embedder-Policy': 'unsafe-none',
        },

        proxy: {
            '/api': {
                target: 'http://localhost:8090', // 백엔드 서버 주소
                changeOrigin: true,
            },
            '/ai': {
                target: 'http://localhost:8090', // AI 백엔드 서버 주소
                changeOrigin: true,
            },
            // [2025-09-15 Gemini] WebSocket proxy for notifications
            // To rollback, remove the '/ws' block below.
            '/ws': {
                target: 'ws://localhost:8090',
                ws: true,
            }
        }
    },
})
