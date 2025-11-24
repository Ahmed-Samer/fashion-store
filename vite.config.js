import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 1. زودنا الحد المسموح للتحذير لـ 1.5 ميجا عشان فايربيز تقيل شوية
    chunkSizeWarningLimit: 1600,
    
    // 2. إعدادات تقسيم الملفات (اختياري لتحسين الأداء)
    rollupOptions: {
      output: {
        manualChunks(id) {
          // بنفصل مكتبات node_modules في ملف لوحدها
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
})