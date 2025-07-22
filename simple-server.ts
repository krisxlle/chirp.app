import express from "express";
import path from "path";
import { createServer } from "vite";

const app = express();
const port = parseInt(process.env.PORT || "5000", 10);

async function startServer() {
  try {
    console.log("Starting React web client server (user preferred)...");
    
    // Add basic middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    
    // Serve static files
    app.use(express.static('public'));

    // Create Vite server in middleware mode for the React client
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: "./client",
      mode: "development",
    });

    // Use vite's connect instance as middleware
    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);

    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`React web client running on http://localhost:${port}`);
      console.log("Serving from client/ directory as preferred by user");
    });

    return server;
  } catch (error) {
    console.error("Error starting React web client:", error);
    process.exit(1);
  }
}

startServer();