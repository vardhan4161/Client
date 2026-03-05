const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Interface with Gemini to analyze resume text against a job description.
 */
const analyzeResume = async (resumeText, jobTitle, jobDescription, candidateData) => {
    try {
        const prompt = `
        You are an expert AI recruiter assistant for TalentSetu.ai. 
        Analyze the following candidate's resume text against the job requirements.

        JOB TITLE: ${jobTitle}
        JOB DESCRIPTION: ${jobDescription}

        CANDIDATE NAME: ${candidateData.name}
        TOTAL EXPERIENCE: ${candidateData.totalExperience} years
        RELEVANT EXPERIENCE: ${candidateData.relevantExperience} years
        SKILLS (FROM CHAT): ${candidateData.skills.join(', ')}

        RESUME CONTENT:
        ${resumeText}

        INSTRUCTIONS:
        1. Calculate a MATCH SCORE (0-100) based on how well the candidate fits the role.
        2. Identify TOP SKILLS verified from the resume.
        3. Identify MISSING CRITICAL SKILLS or GAPS.
        4. Provide a HIGH-LEVEL SUMMARY (max 3 sentences) that tells the recruiter why this candidate is or isn't a good fit. Use an emoji to start.
        5. Provide 3 BULLET POINTS for "Key Strengths".
        6. Provide 2 BULLET POINTS for "Areas of Concern" or "Missing Info".

        RETURN ONLY A JSON OBJECT in this exact format:
        {
            "matchScore": number,
            "topSkills": ["skill1", "skill2", "skill3"],
            "missingSkills": ["gap1", "gap2"],
            "summary": "Short insightful summary...",
            "strengths": ["point1", "point2", "point3"],
            "concerns": ["point1", "point2"]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean the response in case Gemini includes markdown blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Invalid JSON response from Gemini");

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return {
            matchScore: 0,
            topSkills: [],
            missingSkills: [],
            summary: "⚠️ AI Analysis failed. Please review manually.",
            strengths: [],
            concerns: ["Technical error during AI assessment"]
        };
    }
};

module.exports = { analyzeResume };
