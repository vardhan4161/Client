const express = require('express');
const Joi = require('joi');
const { createJob, getJobs, getJobById, updateJobStatus } = require('../controllers/jobController');
const authMiddleware = require('../middleware/auth');
const validateRequest = require('../middleware/validate');

const router = express.Router();

// Validation schemas
const createJobSchema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(3).required(),
    requirements: Joi.object({
        minExperience: Joi.number().min(0).optional(),
        maxNoticePeriod: Joi.number().min(0).optional(),
        maxExpectedCtc: Joi.number().min(0).optional(),
        requiredSkills: Joi.array().items(Joi.string()).optional()
    }).optional()
});

const updateStatusSchema = Joi.object({
    status: Joi.string().valid('OPEN', 'CLOSED', 'DRAFT').required()
});

// Routes
router.post('/', authMiddleware, validateRequest(createJobSchema), createJob);
router.get('/', authMiddleware, getJobs);
router.get('/:id', getJobById); // Public route for candidates
router.put('/:id/status', authMiddleware, validateRequest(updateStatusSchema), updateJobStatus);

module.exports = router;
