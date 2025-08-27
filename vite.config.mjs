import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [react()],
        server: {
            proxy: {
                "/api": {
                    target: env.VITE_DATA_URL || "localhost:8000",
                    changeOrigin: true,
                    secure: true,
                    rewrite: (path) => path,
                    headers: {
                        "ngrok-skip-browser-warning": "true",
                    },
                },
            },
        },
    };
});
