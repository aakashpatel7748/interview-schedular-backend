import mongoose from "mongoose";

let cachedConnection = null;
let cachedPromise = null;

async function connectToDatabase() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI environment variable is not defined");
    }

    // If already connected, reuse the existing connection
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }

    if (mongoose.connection.readyState === 1) {
        cachedConnection = mongoose.connection;
        return cachedConnection;
    }

    // If currently connecting, wait for the existing connection/promise
    if (mongoose.connection.readyState === 2) {
        console.log("Database is already connecting. Waiting for connection...");
        if (cachedPromise) {
            return cachedPromise;
        }
        return new Promise((resolve, reject) => {
            mongoose.connection.once("connected", () => resolve(mongoose.connection));
            mongoose.connection.once("error", (err) => reject(err));
        });
    }

    console.log("Initiating new MongoDB connection...");

    // In serverless, setting bufferCommands to false is safer to fail fast
    const opts = {
        bufferCommands: false,
    };

    cachedPromise = mongoose.connect(uri, opts)
        .then((mongooseInstance) => {
            console.log("MongoDB connected successfully");
            cachedConnection = mongooseInstance.connection;
            return cachedConnection;
        })
        .catch((err) => {
            console.error("MongoDB connection failed:", err);
            cachedPromise = null;
            cachedConnection = null;
            throw err;
        });

    return cachedPromise;
}

export default connectToDatabase;