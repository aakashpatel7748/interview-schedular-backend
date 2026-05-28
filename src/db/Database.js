import mongoose from "mongoose";

async function connectToDatabase() {
    if (!process.env.MONGODB_URI) {
        console.error("CRITICAL: MONGODB_URI is not defined in environment variables!");
        return;
    }
    try {
        const connectionOptions = {
            serverSelectionTimeoutMS: 60000, // Increase timeout to 60s
            socketTimeoutMS: 45000,          // Close sockets after 45s of inactivity
            family: 4                        // Force IPv4 if IPv6 is unstable
        };
        await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
        console.log("Connected to the database successfully");
    } catch (error) {
        console.error("MongoDB Connection Error Details:", error.message);
    }
}

export default connectToDatabase;