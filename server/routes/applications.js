const express = require('express');
const Joi = require('joi');
const { submitApplication, getCandidates, updateApplicationStatus } = require('../controllers/applicationController');
const authMiddleware = require('../middleware/auth');
const validateRequest = require('../middleware/validate');

const router = express.Router();

// Validation schemas
const submitApplicationSchema = Joi.object({
    jobId: Joi.string().uuid().required(),
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(10).required(),
    totalExperience: Joi.number().min(0).required(),
    relevantExperience: Joi.number().min(0).required(),
    currentCtc: Joi.number().min(0).required(),
    expectedCtc: Joi.number().min(0).required(),
    currentLocation: Joi.string().min(2).required(),
    noticePeriod: Joi.number().min(0).required(),
    skills: Joi.array().items(Joi.string()).required(),
    resumeUrl: Joi.string().required()
});

const updateStatusSchema = Joi.object({
    status: Joi.string().valid('APPLIED', 'SHORTLISTED', 'REJECTED', 'HIRED', 'HOLD').required()
});

// Routes
router.post('/submit', validateRequest(submitApplicationSchema), submitApplication);
router.get('/candidates', authMiddleware, getCandidates);
router.patch('/:id/status', authMiddleware, validateRequest(updateStatusSchema), updateApplicationStatus);

module.exports = router;
