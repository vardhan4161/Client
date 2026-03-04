const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extracts raw text from a PDF or DOCX file
 * @param {string} filePath - Absolute path to the file
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromFile = async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();

    if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
    }

    const dataBuffer = fs.readFileSync(filePath);

    if (ext === '.pdf') {
        try {
            // Handle different ways pdf-parse might be exported
            const parsePdf = typeof pdf === 'function' ? pdf : pdf.default;
            if (typeof parsePdf !== 'function') {
                console.error('[AI ANALYSIS] pdf-parse is not a function. Type:', typeof pdf);
                throw new Error('PDF parsing library not loaded correctly');
            }
            const data = await parsePdf(dataBuffer);
            return data.text;
        } catch (pdfError) {
            console.error('[AI ANALYSIS] PDF parsing failed:', pdfError);
            return ''; // Return empty string so other parts can continue
        }
    } else if (ext === '.docx' || ext === '.doc') {
        const result = await mammoth.extractRawText({ buffer: dataBuffer });
        return result.value;
    } else {
        throw new Error('Unsupported file format');
    }
};

/**
 * Matches extracted text against a list of required skills
 * @param {string} text - The raw text of the resume
 * @param {string[]} requiredSkills - List of skills to look for
 * @returns {string[]} - List of found skills
 */
const matchSkills = (text, requiredSkills) => {
    if (!text || !requiredSkills || requiredSkills.length === 0) return [];

    const normalizedText = text.toLowerCase();

    return requiredSkills.filter(skill => {
        const normalizedSkill = skill.toLowerCase().trim();
        // Simple word boundary check to avoid partial matches
        // e.g., "react" shouldn't match "reaction"
        const regex = new RegExp(`\\b${normalizedSkill}\\b`, 'i');
        return regex.test(normalizedText);
    });
};

/**
 * Full analysis of a resume for a specific job
 * @param {string} filePath - Absolute path to resume
 * @param {string[]} requiredSkills - Job requirements
 * @returns {Promise<{ foundSkills: string[], rawText: string }>}
 */
const analyzeResume = async (filePath, requiredSkills) => {
    try {
        const rawText = await extractTextFromFile(filePath);
        const foundSkills = matchSkills(rawText, requiredSkills);
        return { foundSkills, rawText };
    } catch (error) {
        console.error('Resume Analysis Error:', error);
        return { foundSkills: [], rawText: '' };
    }
};

module.exports = { analyzeResume };
