const express = require('express');
const { upload, uploadResume } = require('../controllers/uploadController');

const router = express.Router();

// Upload route
router.post('/', upload.single('resume'), uploadResume);

module.exports = router;
