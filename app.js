// Import necessary modules
import "dotenv/config"; // Ensure environment variables are loaded first
import Fastify from "fastify";
import { connectDB } from './src/config/connect.js';
import { buildAdminRouter } from "./src/config/setup.js";
import { registerRoutes } from './src/routes/index.js';
import { authRoutes } from "./src/routes/auth.js";
import { rootPath } from "./src/config/setup.js";

// Define PORT with a fallback value
const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    // Connect to the database
    await connectDB(process.env.MONGO_URI);
    console.log("Connected to the database");
    
    // Create a Fastify instance
    const app = Fastify();
    
    // Register routes
    await registerRoutes(app);

    // Build AdminJS router
    await buildAdminRouter(app);
    
    // Start the server
    await app.listen({ port: PORT }); // Removed host option
    console.log(`Server started on http://localhost:${PORT}`);
  } catch (err) {
    console.error("Error starting the server:", err);
    process.exit(1); // Exit the process if the server fails to start
  }
};

// Start the server
start();
