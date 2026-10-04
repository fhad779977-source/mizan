import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * ثلاث عمليات بناء منفصلة لأن Chrome يتطلب:
 * - content script كملف واحد (IIFE) بدون import
 * - service worker كملف واحد
 * - صفحات HTML (الإعدادات، النافذة المنبثقة، الخصوصية)
 */
export default defineConfig(({ mode }) => {
  const shared = {
    plugins: [react()],
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  };

  if (mode === 'content' || mode === 'background') {
    const entry = mode === 'content' ? 'src/content/index.tsx' : 'src/background/index.ts';
    return {
      ...shared,
      publicDir: false,
      build: {
        outDir: 'dist',
        emptyOutDir: false,
        sourcemap: false,
        lib: {
          entry: resolve(__dirname, entry),
          name: mode === 'content' ? 'XArabicCleanContent' : 'XArabicCleanBackground',
          formats: ['iife'],
          fileName: () => `${mode}.js`,
        },
        rollupOptions: { output: { inlineDynamicImports: true } },
      },
    };
  }

  return {
    ...shared,
    base: './',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          options: resolve(__dirname, 'options.html'),
          popup: resolve(__dirname, 'popup.html'),
          privacy: resolve(__dirname, 'privacy.html'),
        },
      },
    },
  };
});
