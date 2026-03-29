require('dotenv').config({path: './server/.env'});
const mongoose = require('mongoose');
const {Candidate} = require('./server/models/index');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const candidates = await Candidate.find({ 
            resume_url: { $exists: true, $ne: null, $ne: '' } 
        });
        console.log('COUNT:', candidates.length);
        candidates.forEach(c => {
            console.log(`- CANDIDATE: ${c.name}, RESUME: ${c.resume_url}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
