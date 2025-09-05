import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(async () => {
  const plugins = [react(), runtimeErrorOverlay()];

  if (
    process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
  ) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    plugins.push(cartographer());
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
      cors: {
        origin: (origin, callback) => {
          // Allow requests with no origin (like mobile apps or curl requests)
          if (!origin) return callback(null, true);
          
          // Define allowed origins for development
          const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5000',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5000',
            'http://localhost:8080',
            'http://127.0.0.1:8080',
            // Add your computer's IP for mobile testing
            process.env.COMPUTER_IP ? `http://${process.env.COMPUTER_IP}:5000` : null,
            process.env.COMPUTER_IP ? `http://${process.env.COMPUTER_IP}:3000` : null,
          ].filter(Boolean);
          
          // Check if origin is allowed
          if (allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            console.warn(`🚨 Blocked CORS request from unauthorized origin: ${origin}`);
            callback(new Error('Not allowed by CORS'), false);
          }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      },
      hmr: {
        port: 24678, // Use a different port for HMR to avoid conflicts
      },
    },
  };
});
