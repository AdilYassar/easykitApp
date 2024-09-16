// Import necessary modules
import "dotenv/config"; // Ensure environment variables are loaded first
import Fastify from "fastify";
import { connectDB } from './src/config/connect.js';
import { buildAdminRouter } from "./src/config/setup.js";
import { registerRoutes } from './src/routes/index.js';
import { authRoutes } from "./src/routes/auth.js";
import { rootPath } from "./src/config/setup.js";
import fastifySocketIO from "fastify-socket.io";


const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
   
    await connectDB(process.env.MONGO_URI);
    console.log("Connected to the database");
    
    
    const app = Fastify();
  
    app.register(fastifySocketIO, {
      cors: {
        origin: "*", 
      },
      pingInterval: 10000, 
      pingTimeout: 5000, 
      transports: ['websocket'],
    });

   
    await registerRoutes(app);


    await buildAdminRouter(app);
    
    
    await app.listen({ port: PORT }); 
    console.log(`Server started on http://localhost:${PORT}`);

    
    app.ready().then(() => {
      app.io.on("connection", (socket) => {
        console.log("A user connected");

  
        socket.on("joinRoom", (orderId) => {
          socket.join(orderId); 
          console.log(`User joined room: ${orderId}`);
        });

        
      });
    });
  } catch (err) {
    console.error("Error starting the server:", err);
    process.exit(1); 
  }
};


start();
