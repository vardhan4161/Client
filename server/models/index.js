const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    name: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

const jobSchema = new mongoose.Schema({
    recruiter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: {
        minExperience: Number,
        maxNoticePeriod: Number,
        maxExpectedCtc: Number,
        requiredSkills: [String],
        preferredLocation: String
    },
    status: { type: String, enum: ['OPEN', 'CLOSED', 'DRAFT'], default: 'OPEN' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const candidateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    resume_url: String,
    skills: [String],
    experience_years: Number,
    current_ctc: Number,
    expected_ctc: Number,
    notice_period: Number,
    current_location: String,
    created_at: { type: Date, default: Date.now }
});

const applicationSchema = new mongoose.Schema({
    job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    status: {
        type: String,
        enum: ['APPLIED', 'SHORTLISTED', 'REJECTED', 'HIRED', 'HOLD'],
        default: 'APPLIED'
    },
    match_score: Number,
    ai_summary: String,
    gemini_data: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    recruiter_notes: { type: String, default: '' },
    last_contacted: Date,
    created_at: { type: Date, default: Date.now }
});

applicationSchema.index({ job_id: 1, candidate_id: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);
const Job = mongoose.model('Job', jobSchema);
const Candidate = mongoose.model('Candidate', candidateSchema);
const Application = mongoose.model('Application', applicationSchema);

module.exports = { User, Job, Candidate, Application };
