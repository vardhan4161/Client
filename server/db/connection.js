const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

let mongod;

const connectDB = async () => {
    try {
        // Try to connect to local MongoDB first
        const MONGODB_URI = process.env.MONGODB_URI;
        const isAtlas = MONGODB_URI && MONGODB_URI.includes('mongodb+srv');
        const connectionString = MONGODB_URI || 'mongodb://localhost:27017/hire_db';

        if (isAtlas) {
            // We have an Atlas URI — connect directly, no fallback
            console.log('🌐 Connecting to MongoDB Atlas...');
            await mongoose.connect(connectionString, { serverSelectionTimeoutMS: 30000 });
            console.log('✅ MongoDB Atlas connected successfully');
        } else {
            // Try local, fall back to in-memory
            try {
                await mongoose.connect(connectionString, { serverSelectionTimeoutMS: 3000 });
                console.log('✅ MongoDB connected successfully (local)');
            } catch (err) {
                console.log('⚠️  Local MongoDB not available, using in-memory database...');
                mongod = await MongoMemoryServer.create();
                const uri = mongod.getUri();
                await mongoose.connect(uri);
                console.log('✅ In-memory MongoDB connected successfully');
            }
        }
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

connectDB();

module.exports = mongoose;
