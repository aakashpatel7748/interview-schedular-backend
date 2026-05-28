import mongoose from "mongoose";

async function connectToDatabase() {
    // If already connected, reuse the existing connection
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    // If currently connecting, wait for the connection to be established
    if (mongoose.connection.readyState === 2) {
        console.log("Database is already connecting. Waiting for connection...");
        return new Promise((resolve) => {
            mongoose.connection.once("connected", () => {
                resolve(mongoose.connection);
            });
        });
    }

    // 1. Try Remote MongoDB Atlas
    const remoteUri = process.env.MONGODB_URI;
    if (remoteUri) {
        try {
            console.log("Connecting to remote MongoDB Atlas...");
            const connectionOptions = {
                serverSelectionTimeoutMS: 5000, // Fast fallback timeout (5 seconds)
                socketTimeoutMS: 45000,
                family: 4
            };
            const db = await mongoose.connect(remoteUri, connectionOptions);
            console.log("Connected to remote MongoDB Atlas successfully!");
            return db;
        } catch (error) {
            console.warn("⚠️ Remote MongoDB Atlas Connection Failed:", error.message);
        }
    }
}

export default connectToDatabase;