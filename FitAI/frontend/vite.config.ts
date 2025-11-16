import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    host: '0.0.0.0',  // 모든 네트워크 인터페이스에서 접근 허용
    port: 5173,
    allowedHosts: [
      'fitai.duckdns.org',  // 프로덕션 도메인
      'localhost',          // 로컬 개발
      '127.0.0.1',         // 로컬 IP
      '.duckdns.org'       // 모든 duckdns 서브도메인
    ]
  }
})