import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // LAN・コンテナ環境でも到達可能にする
    port: 5173,
    strictPort: false, // 5173が塞がれていたら次のポートへ自動移動
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
})
