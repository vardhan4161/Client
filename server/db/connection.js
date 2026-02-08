const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

let mongod;

const connectDB = async () => {
    try {
        // Try to connect to local MongoDB first
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hire_db';

        try {
            await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
            console.log('✅ MongoDB connected successfully');
        } catch (err) {
            console.log('⚠️  Local MongoDB not available, using in-memory database...');

            // Start in-memory MongoDB
            mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            await mongoose.connect(uri);
            console.log('✅ In-memory MongoDB connected successfully');
        }
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

connectDB();

module.exports = mongoose;
