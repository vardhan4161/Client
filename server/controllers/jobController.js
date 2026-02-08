const { Job } = require('../models');

// Create a new job
const createJob = async (req, res) => {
    try {
        const { title, description, requirements } = req.body;
        const recruiterId = req.user.userId;

        const job = await Job.create({
            recruiter_id: recruiterId,
            title,
            description,
            requirements: requirements || {}
        });

        res.status(201).json({
            message: 'Job created successfully',
            job
        });
    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({ error: 'Failed to create job' });
    }
};

// Get all jobs for the logged-in recruiter
const getJobs = async (req, res) => {
    try {
        const recruiterId = req.user.userId;
        const jobs = await Job.find({ recruiter_id: recruiterId }).sort({ created_at: -1 });

        res.json({ jobs });
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
};

// Get a single job by ID (public - for candidates)
const getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findOne({ _id: id, status: 'OPEN' });

        if (!job) {
            return res.status(404).json({ error: 'Job not found or closed' });
        }

        res.json({ job });
    } catch (error) {
        console.error('Get job error:', error);
        res.status(500).json({ error: 'Failed to fetch job' });
    }
};

// Update job status
const updateJobStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const recruiterId = req.user.userId;

        const job = await Job.findOneAndUpdate(
            { _id: id, recruiter_id: recruiterId },
            { status, updated_at: new Date() },
            { new: true }
        );

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json({
            message: 'Job status updated',
            job
        });
    } catch (error) {
        console.error('Update job status error:', error);
        res.status(500).json({ error: 'Failed to update job status' });
    }
};

module.exports = { createJob, getJobs, getJobById, updateJobStatus };
