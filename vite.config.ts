import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import IconsResolve from 'unplugin-icons/resolver'
import {BootstrapVueNextResolver} from 'bootstrap-vue-next/resolvers'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    Components({
      resolvers: [IconsResolve(), BootstrapVueNextResolver()],
      dts: true,
    }),
    Icons({
      compiler: 'vue3',
      autoInstall: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    chunkSizeWarningLimit: 600 * 1024,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        codeSplitting: {
          minSize: 10000, // Минимальный размер чанка (10 КБ)

          groups: [
            {
              name: 'vendor-echarts',
              test: /[\\/]node_modules[\\/](echarts|vue-echarts)[\\/]/,
            },
            {
              name: 'vendor-vue',
              test: /[\\/]node_modules[\\/](vue|@vue|pinia|vue-router)[\\/]/,
            },
            {
              name: 'vendor-base',
              test: /[\\/]node_modules[\\/]/,
            },
          ],
        },
      },
    },
  },
})
