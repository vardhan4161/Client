const mongoose = require('mongoose');
const { Job, Candidate, Application } = require('./models');

const debugPopulate = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/hire_db');

        console.log('--- POPULATION DEBUG ---');

        const apps = await Application.find({}).populate('candidate_id');
        console.log(`Found ${apps.length} applications`);

        if (apps.length > 0) {
            const firstApp = apps[0];
            console.log('First App ID:', firstApp._id);
            console.log('First App JobID:', firstApp.job_id);
            console.log('First App CandidateID (Raw):', firstApp.candidate_id ? firstApp.candidate_id._id : 'NULL');
            console.log('First App Candidate Name:', firstApp.candidate_id ? firstApp.candidate_id.name : 'Unknown');
            console.log('Full Candidate Object:', JSON.stringify(firstApp.candidate_id, null, 2));
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

debugPopulate();
