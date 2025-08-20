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
                    configure: (proxy, options) => {
                        proxy.on("error", (err, req, res) => {
                            console.log("Proxy error:", err);
                        });
                        proxy.on("proxyReq", (proxyReq, req, res) => {
                            console.log(
                                "Sending Request:",
                                req.method,
                                req.url
                            );
                        });
                        proxy.on("proxyRes", (proxyRes, req, res) => {
                            console.log(
                                "Received Response:",
                                proxyRes.statusCode,
                                req.url
                            );
                        });
                    },
                },
            },
        },
    };
});
