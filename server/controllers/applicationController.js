const { Job, Candidate, Application } = require('../models');
const { analyzeResume } = require('../utils/resumeParser');
const path = require('path');
const fs = require('fs');

// Enhanced scoring algorithm
const calculateMatchScore = (candidate, job) => {
    if (!job || !job.requirements) {
        return {
            score: 50,
            summary: 'No requirements specified for this role',
            status: 'APPLIED'
        };
    }

    const requirements = job.requirements;
    const {
        relevantExperience,
        skills,
        noticePeriod,
        expectedCtc,
        currentLocation,
        confirmedSkills = []
    } = candidate;

    let score = 0;
    const flags = [];
    const strengths = [];

    // 1. Experience Scoring (30 points)
    if (requirements.minExperience) {
        if (relevantExperience >= requirements.minExperience) {
            const experienceBonus = Math.min((relevantExperience - requirements.minExperience) * 5, 10);
            score += 20 + experienceBonus;
            strengths.push(`${relevantExperience}y relevant experience`);
        } else {
            score += (relevantExperience / requirements.minExperience) * 15;
            flags.push(`⚠️ Experience: ${relevantExperience}y (required: ${requirements.minExperience}y)`);
        }
    } else {
        score += 15;
    }

    // 2. Skills Matching (25 points)
    if (requirements.requiredSkills && requirements.requiredSkills.length > 0) {
        const candidateSkills = (skills || []).map(s => s.toLowerCase().trim());
        const requiredSkills = requirements.requiredSkills.map(s => s.toLowerCase().trim());
        const docSkills = (confirmedSkills || []).map(s => s.toLowerCase().trim());

        // Skills matched from Chatbot or Resume
        const matchedSkills = requiredSkills.filter(req =>
            candidateSkills.some(cand => cand.includes(req) || req.includes(cand)) ||
            docSkills.some(doc => doc.includes(req) || req.includes(doc))
        );

        const skillMatchPercent = (matchedSkills.length / requiredSkills.length) * 100;
        score += (skillMatchPercent / 100) * 25;

        // Bonus points for skills EXPLICITLY confirmed by the resume file (up to 5 points)
        const confirmedMatchCount = docSkills.filter(doc =>
            requiredSkills.some(req => doc.includes(req) || req.includes(doc))
        ).length;

        if (confirmedMatchCount > 0) {
            score += Math.min(confirmedMatchCount * 1, 5);
            strengths.push(`${confirmedMatchCount} skills confirmed by resume`);
        }

        if (skillMatchPercent >= 80) {
            strengths.push(`Strong overall skill match (${matchedSkills.length}/${requiredSkills.length})`);
        } else if (skillMatchPercent < 50) {
            flags.push(`⚠️ Skills: Only ${matchedSkills.length}/${requiredSkills.length} matched`);
        }
    } else {
        score += 12;
    }

    // 3. Notice Period (20 points)
    if (requirements.maxNoticePeriod) {
        if (noticePeriod <= requirements.maxNoticePeriod) {
            score += 20;
            if (noticePeriod <= 15) {
                strengths.push(`Immediate joiner (${noticePeriod} days)`);
            }
        } else {
            const penalty = Math.min((noticePeriod - requirements.maxNoticePeriod) * 2, 15);
            score += Math.max(20 - penalty, 0);
            flags.push(`⚠️ Notice: ${noticePeriod} days (max: ${requirements.maxNoticePeriod})`);
        }
    } else {
        score += 10;
    }

    // 4. Budget/CTC Fit (15 points)
    if (requirements.maxExpectedCtc) {
        if (expectedCtc <= requirements.maxExpectedCtc) {
            score += 15;
            const budgetFit = ((requirements.maxExpectedCtc - expectedCtc) / requirements.maxExpectedCtc) * 100;
            if (budgetFit >= 20) {
                strengths.push(`Budget-friendly (₹${expectedCtc}L)`);
            }
        } else {
            const overage = ((expectedCtc - requirements.maxExpectedCtc) / requirements.maxExpectedCtc) * 100;
            score += Math.max(15 - overage / 5, 0);
            flags.push(`⚠️ CTC: ₹${expectedCtc}L (budget: ₹${requirements.maxExpectedCtc}L)`);
        }
    } else {
        score += 7;
    }

    // 5. Location (10 points)
    if (requirements.preferredLocation && currentLocation) {
        const locationMatch = currentLocation.toLowerCase().includes(requirements.preferredLocation.toLowerCase()) ||
            requirements.preferredLocation.toLowerCase().includes(currentLocation.toLowerCase());
        if (locationMatch) {
            score += 10;
            strengths.push(`Located in ${currentLocation}`);
        } else {
            score += 3;
        }
    } else {
        score += 5;
    }

    const matchScore = Math.min(Math.round(score), 100);

    // Auto-assign status based on score
    let autoStatus = 'APPLIED';
    if (matchScore >= 80) {
        autoStatus = 'SHORTLISTED';
    } else if (matchScore >= 60) {
        autoStatus = 'HOLD';
    } else if (matchScore < 45) {
        autoStatus = 'REJECTED';
    }

    // Generate AI Summary
    let aiSummary;
    if (flags.length > 0) {
        aiSummary = flags.join(' | ');
    } else if (strengths.length > 0) {
        aiSummary = `✅ ${strengths.join(', ')}`;
    } else {
        aiSummary = `Match score: ${matchScore}%`;
    }

    return { score: matchScore, summary: aiSummary, status: autoStatus };
};

const { analyzeResume: analyzeResumeAI } = require('../services/geminiService');
// ... (rest of imports)

// ... (keep calculateMatchScore for fallback if needed)

// Submit application (from chatbot)
const submitApplication = async (req, res) => {
    try {
        console.log(`[SUBMIT] Received application for email: ${req.body.email}, JobId: ${req.body.jobId}`);
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

        if (!jobId || !email) {
            console.error('[SUBMIT] Missing required fields: jobId or email');
            return res.status(400).json({ error: 'Job ID and Email are required' });
        }

        // Find or create candidate
        let candidate = await Candidate.findOne({ email });

        if (candidate) {
            candidate.name = name;
            candidate.phone = phone;
            candidate.skills = Array.isArray(skills) ? skills : (skills ? String(skills).split(',') : []);
            candidate.experience_years = totalExperience;
            candidate.current_ctc = currentCtc;
            candidate.expected_ctc = expectedCtc;
            candidate.notice_period = noticePeriod;
            candidate.current_location = currentLocation;
            candidate.resume_url = resumeUrl;
            await candidate.save();
        } else {
            candidate = await Candidate.create({
                name,
                email,
                phone,
                skills: Array.isArray(skills) ? skills : (skills ? String(skills).split(',') : []),
                experience_years: totalExperience,
                current_ctc: currentCtc,
                expected_ctc: expectedCtc,
                notice_period: noticePeriod,
                current_location: currentLocation,
                resume_url: resumeUrl
            });
        }

        // Get job
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        // --- NEW: ADVANCED AI ANALYSIS WITH GEMINI ---
        let aiAnalysis = {
            matchScore: 0,
            summary: 'Reviewing...',
            topSkills: [],
            missingSkills: [],
            strengths: [],
            concerns: []
        };

        if (resumeUrl) {
            try {
                const fileName = path.basename(resumeUrl);
                const uploadDir = process.env.UPLOAD_DIR || './uploads';
                const resumeFilePath = path.join(process.cwd(), uploadDir, fileName);

                // Use the parser to get raw text instead of just keywords
                const { parseResume } = require('../utils/resumeParser');
                const parsingResult = await parseResume(resumeFilePath);

                console.log(`[GEMINI] Analyzing resume for ${name}...`);
                aiAnalysis = await analyzeResumeAI(
                    parsingResult.text,
                    job.title,
                    job.description,
                    {
                        name,
                        totalExperience,
                        relevantExperience,
                        skills: Array.isArray(skills) ? skills : []
                    }
                );
                console.log(`[GEMINI] Match Score: ${aiAnalysis.matchScore}%`);
            } catch (pError) {
                console.error('[GEMINI] Analysis error:', pError);
            }
        }

        // Auto-assign status based on Gemini score
        let autoStatus = 'APPLIED';
        if (aiAnalysis.matchScore >= 80) autoStatus = 'SHORTLISTED';
        else if (aiAnalysis.matchScore >= 60) autoStatus = 'HOLD';
        else if (aiAnalysis.matchScore < 40) autoStatus = 'REJECTED';

        // Create or update application
        const application = await Application.findOneAndUpdate(
            { job_id: jobId, candidate_id: candidate._id },
            {
                match_score: aiAnalysis.matchScore,
                ai_summary: aiAnalysis.summary,
                status: autoStatus,
                // We'll store the extra Gemini insights in the Application model
                // Note: You might want to update your Application Schema to hold these
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
            message: 'Application submitted successfully',
            application,
            matchScore: aiAnalysis.matchScore,
            autoStatus
        });
    } catch (error) {
        console.error('[SUBMIT] Error in submission handler:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
};

// Get candidates for a job
const getCandidates = async (req, res) => {
    const logFile = path.join(__dirname, '../debug-candidates.log');
    const log = (msg) => fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);

    try {
        const { jobId } = req.query;
        const recruiterId = req.user.userId;

        log(`getCandidates called. JobId: ${jobId}, RecruiterId: ${recruiterId}`);

        if (!jobId || !jobId.match(/^[0-9a-fA-F]{24}$/)) {
            log('Invalid Job ID format');
            return res.status(400).json({ error: 'Invalid Job ID' });
        }

        // Verify job belongs to recruiter
        const job = await Job.findOne({ _id: jobId, recruiter_id: recruiterId });
        if (!job) {
            log(`Job not found or unauthorized. JobId: ${jobId}, RecruiterId: ${recruiterId}`);
            // Check if job exists at all
            const jobExists = await Job.findById(jobId);
            log(`Job exists in DB? ${!!jobExists}. If yes, Owner: ${jobExists?.recruiter_id}`);
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const applications = await Application.find({ job_id: jobId })
            .populate('candidate_id')
            .sort({ match_score: -1, created_at: -1 });

        log(`Found ${applications.length} applications`);

        const candidates = applications
            .filter(app => {
                if (!app.candidate_id) log(`App ${app._id} has NO Candidate ID`);
                return app.candidate_id;
            })
            .map(app => {
                try {
                    return {
                        ...app.candidate_id.toObject(),
                        application_id: app._id,
                        application_status: app.status,
                        match_score: app.match_score,
                        ai_summary: app.ai_summary,
                        applied_at: app.created_at
                    };
                } catch (err) {
                    console.error('Error mapping candidate:', err);
                    log(`Error mapping candidate for App ${app._id}: ${err.message}`);
                    return null;
                }
            })
            .filter(c => c !== null);

        log(`Returning ${candidates.length} candidates`);
        res.json({ candidates });
    } catch (error) {
        fs.appendFileSync(logFile, `[ERROR] ${error.message}\n`);
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
