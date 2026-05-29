import 'dotenv/config';
import app from './src/app.js';
import connectToDatabase from './src/db/Database.js';

// db connect with error catching
connectToDatabase().catch((err) => {
    console.error("Failed to connect to database during startup:", err);
});

// server
const port = process.env.PORT || 5000;
if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        if (process.env.NODE_ENV === 'production') {
            console.log('running in production');
        }
    });
}

export default app;