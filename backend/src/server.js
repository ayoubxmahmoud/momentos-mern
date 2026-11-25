
// Import the core express framework
import express from "express";
import cors from "cors";
import dotenv from "dotenv";


// Import the custom routes for handling all endpoints related to momentos
import momentoRoutes from "./routes/momentoRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import authRoutes from "./routes/authRoutes.js";


dotenv.config();

// Initialize the Express application instance
const app = express();
const PORT = process.env.PORT || 5001

// middleware
app.use(cors({
    origin: "http://localhost:5173"
}));
app.use(express.json());
app.use(rateLimiter);


// This prefixes all endpoints inside momentoRoutes with "/api/momentos"
app.use("/api/momentos", momentoRoutes);
app.use("/api/auth", authRoutes);
// Start the local server and listen to incoming network requests on port 5001
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server running on PORT: ", PORT);
    });
});