const express = require('express');
const { upload, uploadResume } = require('../controllers/uploadController');

const router = express.Router();

// Simple in-memory rate limiter: max 10 uploads per IP per 15 min
const uploadAttempts = new Map();
const RATE_LIMIT = 10;
const WINDOW_MS = 15 * 60 * 1000;

const uploadRateLimit = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const record = uploadAttempts.get(ip) || { count: 0, windowStart: now };

    if (now - record.windowStart > WINDOW_MS) {
        record.count = 0;
        record.windowStart = now;
    }

    record.count += 1;
    uploadAttempts.set(ip, record);

    if (record.count > RATE_LIMIT) {
        return res.status(429).json({ error: 'Too many uploads. Please try again later.' });
    }
    next();
};

// Upload route (public but rate-limited)
router.post('/', uploadRateLimit, upload.single('resume'), uploadResume);

module.exports = router;

