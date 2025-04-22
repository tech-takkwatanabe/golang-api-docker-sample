import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 現在の作業ディレクトリからenvファイルをロード
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    esbuild: {
      loader: 'tsx', // tsx, js などを指定する
      include: /\.ts$|\.tsx$|\.js$|\.jsx$/,
      exclude: /node_modules/, // node_modules 内の処理を除外する
    },
    optimizeDeps: {
      exclude: ['fsevents'], // fsevents を除外する
    },
    css: {
      postcss: {
        plugins: [autoprefixer()], // 必要な PostCSS プラグインを追加
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  };
});
