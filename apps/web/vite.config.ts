import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	// 現在の作業ディレクトリからenvファイルをロード
	const env = loadEnv(mode, process.cwd(), "");

	return {
		plugins: [react()],
		server: {
			port: 3000,
			// API_URLが設定されている場合、そのドメインへのリクエストをプロキシ
			proxy: {
				"/api": {
					target: env.VITE_API_URL || "http://localhost:8080",
					changeOrigin: true,
				},
			},
		},
	};
});
