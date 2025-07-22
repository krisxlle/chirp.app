import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "vite";

const app = express();
const port = parseInt(process.env.PORT || "5000", 10);

async function startServer() {
  try {
    // Create Vite server in middleware mode
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: "./client",
    });

    // Use vite's connect instance as middleware
    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);

    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`Development server running on http://localhost:${port}`);
      console.log("React web application is being served from client/ directory");
    });

    return server;
  } catch (error) {
    console.error("Error starting development server:", error);
    process.exit(1);
  }
}

startServer();