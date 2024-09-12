import Fastify from "fastify";
import { connectDB } from './src/config/connect.js';
import "dotenv/config"; // Make sure this line is at the top to load environment variables
import { buildAdminRouter } from "./src/config/setup.js";

const PORT = process.env.PORT || 3000; // Define PORT with fallback value

const start = async () => {
    // Connect to the database
    await connectDB(process.env.MONGO_URI);

    // Create Fastify instance
    const app = Fastify();

    // Build admin router
    await buildAdminRouter(app);

    try {
        // Start the server
        await app.listen({ port: PORT, host: "0.0.0.0" });
        console.log(`easykit Started on ${PORT}${app.options.rootPath}`);
    } catch (err) {
        console.error("Error starting the server:", err);
        process.exit(1); // Exit the process if the server fails to start
    }
};

// Start the server
start();
