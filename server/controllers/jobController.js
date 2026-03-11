const { Job, Application } = require('../models');

// POST /api/jobs
const createJob = async (req, res) => {
    try {
        const { title, description, requirements } = req.body;
        const recruiterId = req.user.userId;

        const job = await Job.create({ recruiter_id: recruiterId, title, description, requirements: requirements || {} });
        res.status(201).json({ success: true, message: 'Job created successfully', data: { job } });
    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({ success: false, message: 'Failed to create job' });
    }
};

// GET /api/jobs
const getJobs = async (req, res) => {
    try {
        const recruiterId = req.user.userId;
        const jobs = await Job.find({ recruiter_id: recruiterId }).sort({ created_at: -1 });

        const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
            const [applicantCount, shortlistedCount] = await Promise.all([
                Application.countDocuments({ job_id: job._id }),
                Application.countDocuments({ job_id: job._id, status: 'SHORTLISTED' }),
            ]);
            return { ...job.toObject(), applicantCount, shortlistedCount };
        }));

        res.json({ success: true, data: { jobs: jobsWithCounts } });
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch jobs' });
    }
};

// GET /api/jobs/:id  (public — for candidates)
const getJobById = async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.id, status: 'OPEN' });
        if (!job) return res.status(404).json({ success: false, message: 'Job not found or closed' });
        res.json({ success: true, data: { job } });
    } catch (error) {
        console.error('Get job error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch job' });
    }
};

// PUT /api/jobs/:id/status
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

        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        res.json({ success: true, message: 'Job status updated', data: { job } });
    } catch (error) {
        console.error('Update job status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update job status' });
    }
};

module.exports = { createJob, getJobs, getJobById, updateJobStatus };
