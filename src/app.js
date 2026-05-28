import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import connectToDatabase from "./db/Database.js";
import { genetatedErrors } from './middleware/errors.js';
import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/bookings.js";
import notificationRoutes from "./routes/notifications.js";
import slotRoutes from "./routes/slots.js";
import ErrorHandler from "./utils/ErrorHandler.js";

const app = express();

// Ensure database connection is active before processing any requests (Crucial for Serverless Vercel context)
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (err) {
        console.error("Database connection middleware error:", err.message);
        next(new ErrorHandler("Database connection could not be established", 500));
    }
});

// Request Logger Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}))

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// auth Routes
app.use('/api/auth', authRoutes);

// slot routes
app.use('/api/slots', slotRoutes);

// bokking routes
app.use('/api/bookings', bookingRoutes);

// notification routes
app.use('/api/notifications', notificationRoutes);

app.get("/", (req, res) => {
    res.send("Hello World! Server is live.");
});

app.use((req, res, next) => {
    next(new ErrorHandler(`Route not found: ${req.originalUrl}`, 404));
});

app.use(genetatedErrors)

export default app;