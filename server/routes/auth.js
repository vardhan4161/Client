const express = require('express');
const Joi = require('joi');
const { register, login } = require('../controllers/authController');
const validateRequest = require('../middleware/validate');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

// Routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);

module.exports = router;
