const { Job, Candidate, Application } = require('../models');
const { analyzeResume: analyzeResumeAI } = require('../services/geminiService');
const { parseResume } = require('../utils/resumeParser');
const path = require('path');

// ─── Algorithmic Scoring (fallback when no resume / Gemini fails) ─────────────
const calculateMatchScore = (candidate, job) => {
    if (!job || !job.requirements) {
        return { score: 50, summary: 'No requirements specified for this role', status: 'APPLIED' };
    }

    const req = job.requirements;
    const { relevantExperience, skills, noticePeriod, expectedCtc, currentLocation, confirmedSkills = [] } = candidate;
    let score = 0;
    const flags = [];
    const strengths = [];

    // 1. Experience (30 pts)
    if (req.minExperience) {
        if (relevantExperience >= req.minExperience) {
            score += 20 + Math.min((relevantExperience - req.minExperience) * 5, 10);
            strengths.push(`${relevantExperience}y relevant experience`);
        } else {
            score += (relevantExperience / req.minExperience) * 15;
            flags.push(`⚠️ Experience: ${relevantExperience}y (required: ${req.minExperience}y)`);
        }
    } else { score += 15; }

    // 2. Skills (25 pts + 5 bonus)
    if (req.requiredSkills && req.requiredSkills.length > 0) {
        const cands = (skills || []).map(s => s.toLowerCase());
        const reqs = req.requiredSkills.map(s => s.toLowerCase());
        const docs = (confirmedSkills || []).map(s => s.toLowerCase());
        const matched = reqs.filter(r => cands.some(c => c.includes(r) || r.includes(c)) || docs.some(d => d.includes(r) || r.includes(d)));
        const pct = (matched.length / reqs.length) * 100;
        score += (pct / 100) * 25;
        const bonusMatches = docs.filter(d => reqs.some(r => d.includes(r) || r.includes(d))).length;
        if (bonusMatches > 0) score += Math.min(bonusMatches, 5);
        if (pct >= 80) strengths.push(`Strong skill match (${matched.length}/${reqs.length})`);
        else if (pct < 50) flags.push(`⚠️ Skills: ${matched.length}/${reqs.length} matched`);
    } else { score += 12; }

    // 3. Notice Period (20 pts)
    if (req.maxNoticePeriod) {
        if (noticePeriod <= req.maxNoticePeriod) {
            score += 20;
            if (noticePeriod <= 15) strengths.push(`Immediate joiner (${noticePeriod}d)`);
        } else {
            score += Math.max(20 - Math.min((noticePeriod - req.maxNoticePeriod) * 2, 15), 0);
            flags.push(`⚠️ Notice: ${noticePeriod}d (max: ${req.maxNoticePeriod}d)`);
        }
    } else { score += 10; }

    // 4. CTC (15 pts)
    if (req.maxExpectedCtc) {
        if (expectedCtc <= req.maxExpectedCtc) {
            score += 15;
            if (((req.maxExpectedCtc - expectedCtc) / req.maxExpectedCtc) * 100 >= 20) strengths.push(`Budget-friendly (₹${expectedCtc}L)`);
        } else {
            score += Math.max(15 - ((expectedCtc - req.maxExpectedCtc) / req.maxExpectedCtc) * 100 / 5, 0);
            flags.push(`⚠️ CTC: ₹${expectedCtc}L (budget: ₹${req.maxExpectedCtc}L)`);
        }
    } else { score += 7; }

    // 5. Location (10 pts)
    if (req.preferredLocation && currentLocation) {
        const match = currentLocation.toLowerCase().includes(req.preferredLocation.toLowerCase()) ||
            req.preferredLocation.toLowerCase().includes(currentLocation.toLowerCase());
        score += match ? 10 : 3;
        if (match) strengths.push(`Located in ${currentLocation}`);
    } else { score += 5; }

    const matchScore = Math.min(Math.round(score), 100);
    let autoStatus = 'APPLIED';
    if (matchScore >= 80) autoStatus = 'SHORTLISTED';
    else if (matchScore >= 60) autoStatus = 'HOLD';
    else if (matchScore < 45) autoStatus = 'REJECTED';

    const summary = flags.length > 0 ? flags.join(' | ') : strengths.length > 0 ? `✅ ${strengths.join(', ')}` : `Match score: ${matchScore}%`;
    return { score: matchScore, summary, status: autoStatus };
};

// ─── Submit Application ────────────────────────────────────────────────────────
const submitApplication = async (req, res) => {
    try {
        const {
            jobId, name, email, phone,
            totalExperience, relevantExperience,
            currentCtc, expectedCtc, currentLocation, noticePeriod,
            skills, resumeUrl
        } = req.body;

        if (!jobId || !email) {
            return res.status(400).json({ success: false, message: 'Job ID and Email are required' });
        }

        // Upsert candidate
        const skillList = Array.isArray(skills) ? skills : (skills ? String(skills).split(',').map(s => s.trim()) : []);
        let candidate = await Candidate.findOne({ email });
        if (candidate) {
            Object.assign(candidate, { name, phone, skills: skillList, experience_years: totalExperience, current_ctc: currentCtc, expected_ctc: expectedCtc, notice_period: noticePeriod, current_location: currentLocation, resume_url: resumeUrl });
            await candidate.save();
        } else {
            candidate = await Candidate.create({ name, email, phone, skills: skillList, experience_years: totalExperience, current_ctc: currentCtc, expected_ctc: expectedCtc, notice_period: noticePeriod, current_location: currentLocation, resume_url: resumeUrl });
        }

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        // AI Analysis
        let aiAnalysis = { matchScore: 0, summary: 'Pending review', topSkills: [], missingSkills: [], strengths: [], concerns: [] };

        if (resumeUrl) {
            try {
                const fileName = path.basename(resumeUrl);
                const uploadDir = process.env.UPLOAD_DIR || './uploads';
                const resumeFilePath = path.join(process.cwd(), uploadDir, fileName);
                const parsingResult = await parseResume(resumeFilePath);

                aiAnalysis = await analyzeResumeAI(
                    parsingResult.text || parsingResult.rawText || '',
                    job.title,
                    job.description,
                    { name, totalExperience, relevantExperience, skills: skillList }
                );
            } catch (aiErr) {
                // Gemini failed — fall back to algorithmic scoring
                const fallback = calculateMatchScore(
                    { relevantExperience, skills: skillList, noticePeriod, expectedCtc, currentLocation },
                    job
                );
                aiAnalysis = { matchScore: fallback.score, summary: fallback.summary, topSkills: skillList.slice(0, 3), missingSkills: [], strengths: [], concerns: [] };
            }
        } else {
            // No resume — algorithmic only
            const fallback = calculateMatchScore(
                { relevantExperience, skills: skillList, noticePeriod, expectedCtc, currentLocation },
                job
            );
            aiAnalysis = { matchScore: fallback.score, summary: fallback.summary, topSkills: skillList.slice(0, 3), missingSkills: [], strengths: [], concerns: [] };
        }

        let autoStatus = 'APPLIED';
        if (aiAnalysis.matchScore >= 80) autoStatus = 'SHORTLISTED';
        else if (aiAnalysis.matchScore >= 60) autoStatus = 'HOLD';
        else if (aiAnalysis.matchScore < 40) autoStatus = 'REJECTED';

        const application = await Application.findOneAndUpdate(
            { job_id: jobId, candidate_id: candidate._id },
            {
                match_score: aiAnalysis.matchScore,
                ai_summary: aiAnalysis.summary,
                status: autoStatus,
                gemini_data: {
                    topSkills: aiAnalysis.topSkills,
                    missingSkills: aiAnalysis.missingSkills,
                    strengths: aiAnalysis.strengths,
                    concerns: aiAnalysis.concerns
                }
            },
            { new: true, upsert: true }
        );

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: { application },
            // Top-level convenience fields for the chatbot success screen
            matchScore: aiAnalysis.matchScore,
            aiSummary: aiAnalysis.summary,
            autoStatus
        });
    } catch (error) {
        console.error('Submit application error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit application' });
    }
};

// ─── Get Candidates for a Job ─────────────────────────────────────────────────
const getCandidates = async (req, res) => {
    try {
        const { jobId } = req.query;
        const recruiterId = req.user.userId;

        if (!jobId || !jobId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid Job ID' });
        }

        // Verify job belongs to recruiter
        const job = await Job.findOne({ _id: jobId, recruiter_id: recruiterId });
        if (!job) {
            return res.status(403).json({ success: false, message: 'Unauthorized or job not found' });
        }

        const applications = await Application.find({ job_id: jobId })
            .populate('candidate_id')
            .sort({ match_score: -1, created_at: -1 });

        const candidates = applications
            .filter(app => app.candidate_id)
            .map(app => ({
                ...app.candidate_id.toObject(),
                application_id: app._id,
                application_status: app.status,
                match_score: app.match_score,
                ai_summary: app.ai_summary,
                gemini_data: app.gemini_data,
                applied_at: app.created_at
            }));

        res.json({ success: true, data: { candidates, job: { title: job.title, status: job.status } } });
    } catch (error) {
        console.error('Get candidates error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch candidates' });
    }
};

// ─── Update Application Status ────────────────────────────────────────────────
const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const recruiterId = req.user.userId;

        const application = await Application.findById(id).populate('job_id');
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (application.job_id.recruiter_id.toString() !== recruiterId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        application.status = status;
        await application.save();

        res.json({ success: true, message: 'Status updated', data: { application } });
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
};

module.exports = { submitApplication, getCandidates, updateApplicationStatus };
