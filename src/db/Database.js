import mongoose from "mongoose";

async function connectToDatabase() {
    // If already connected, reuse the existing connection
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (mongoose.connection.readyState === 2) {
        console.log("Database is already connecting. Waiting for connection...");
        return new Promise((resolve) => {
            mongoose.connection.once("connected", () => {
                resolve(mongoose.connection);
            });
        });
    }

}

export default connectToDatabase;