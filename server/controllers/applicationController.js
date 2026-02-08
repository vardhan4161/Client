const { Job, Candidate, Application } = require('../models');

// Submit application (from chatbot)
const submitApplication = async (req, res) => {
    try {
        const {
            jobId,
            name,
            email,
            phone,
            totalExperience,
            relevantExperience,
            currentCtc,
            expectedCtc,
            currentLocation,
            noticePeriod,
            skills,
            resumeUrl
        } = req.body;

        // Find or create candidate
        let candidate = await Candidate.findOne({ email });

        if (candidate) {
            // Update existing candidate
            candidate.name = name;
            candidate.phone = phone;
            candidate.skills = skills;
            candidate.experience_years = totalExperience;
            candidate.current_ctc = currentCtc;
            candidate.expected_ctc = expectedCtc;
            candidate.notice_period = noticePeriod;
            candidate.current_location = currentLocation;
            candidate.resume_url = resumeUrl;
            await candidate.save();
        } else {
            // Create new candidate
            candidate = await Candidate.create({
                name,
                email,
                phone,
                skills,
                experience_years: totalExperience,
                current_ctc: currentCtc,
                expected_ctc: expectedCtc,
                notice_period: noticePeriod,
                current_location: currentLocation,
                resume_url: resumeUrl
            });
        }

        // Get job requirements for scoring
        const job = await Job.findById(jobId);
        let matchScore = 50; // Default score
        let aiSummary = 'Application received';

        if (job && job.requirements) {
            const requirements = job.requirements;
            let score = 50;

            if (requirements.minExperience && relevantExperience >= requirements.minExperience) {
                score += 20;
            }

            if (requirements.maxNoticePeriod && noticePeriod <= requirements.maxNoticePeriod) {
                score += 20;
            }

            if (requirements.maxExpectedCtc && expectedCtc <= requirements.maxExpectedCtc) {
                score += 10;
            }

            matchScore = Math.min(score, 100);

            if (requirements.maxNoticePeriod && noticePeriod > requirements.maxNoticePeriod) {
                aiSummary = `Auto-flagged: Notice period (${noticePeriod} days) exceeds requirement`;
            }
        }

        // Create or update application
        const application = await Application.findOneAndUpdate(
            { job_id: jobId, candidate_id: candidate._id },
            { match_score: matchScore, ai_summary: aiSummary },
            { new: true, upsert: true }
        );

        res.status(201).json({
            message: 'Application submitted successfully',
            application
        });
    } catch (error) {
        console.error('Submit application error:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
};

// Get candidates for a job
const getCandidates = async (req, res) => {
    try {
        const { jobId } = req.query;
        const recruiterId = req.user.userId;

        // Verify job belongs to recruiter
        const job = await Job.findOne({ _id: jobId, recruiter_id: recruiterId });
        if (!job) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const applications = await Application.find({ job_id: jobId })
            .populate('candidate_id')
            .sort({ match_score: -1, created_at: -1 });

        const candidates = applications.map(app => ({
            ...app.candidate_id.toObject(),
            application_id: app._id,
            application_status: app.status,
            match_score: app.match_score,
            ai_summary: app.ai_summary,
            applied_at: app.created_at
        }));

        res.json({ candidates });
    } catch (error) {
        console.error('Get candidates error:', error);
        res.status(500).json({ error: 'Failed to fetch candidates' });
    }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const recruiterId = req.user.userId;

        // Find application and verify ownership
        const application = await Application.findById(id).populate('job_id');
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        if (application.job_id.recruiter_id.toString() !== recruiterId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        application.status = status;
        await application.save();

        res.json({
            message: 'Application status updated',
            application
        });
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({ error: 'Failed to update application status' });
    }
};

module.exports = { submitApplication, getCandidates, updateApplicationStatus };
