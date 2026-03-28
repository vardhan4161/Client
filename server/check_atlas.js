const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://talentsetuai_db_user:lH34j52FRAykG4Hp@cluster0.yuc8otc.mongodb.net/?retryWrites=true&w=majority';

async function check() {
    try {
        console.log('Connecting to Atlas...');
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ Connected to Atlas');
        
        const db = mongoose.connection.db;
        const users = await db.collection('users').find({}).toArray();
        console.log(`User count: ${users.length}`);
        users.forEach(u => console.log(` - ${u.email}`));
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to connect to Atlas:', err.message);
        process.exit(1);
    }
}

check();
