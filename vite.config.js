// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    fs: {
      strict: false
    },
    // ✅ 아래 설정 추가!
    historyApiFallback: true,
  },
  build: {
    target: 'esnext' // 최신 ES 기능 지원
  }
});
