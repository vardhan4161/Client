// Base flow — notice period branching is handled dynamically in ChatbotApplication.jsx
export const chatbotFlow = [
    {
        id: 'name',
        question: "Please enter your full name (As per your Aadhaar/Passport).",
        type: 'text',
        placeholder: 'e.g. Rahul Sharma',
        validation: {
            required: true,
            minLength: 2,
            message: 'Please enter a valid name (at least 2 characters)'
        }
    },
    {
        id: 'phone',
        question: 'What is your 10-digit mobile number? (e.g., 9876543210)',
        type: 'text',
        placeholder: '9876543210',
        validation: {
            required: true,
            pattern: /^[\+\d][\d\s\-\.\(\)]{8,}$/,
            message: 'Please enter a valid mobile number (10–13 digits)'
        }
    },
    {
        id: 'email',
        question: 'Please enter your professional email address.',
        type: 'email',
        placeholder: 'rahul@example.com',
        validation: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        }
    },
    {
        id: 'totalExperience',
        question: 'Total years of professional experience? (e.g., 5 or 5.5)',
        type: 'number',
        placeholder: 'e.g. 5',
        step: '0.5',
        validation: {
            required: true,
            min: 0,
            max: 50,
            message: 'Please enter a valid number of years (0–50)'
        }
    },
    {
        id: 'noticePeriodCheck',
        question: 'Are you currently serving your notice period? (Yes / No)',
        type: 'text',
        placeholder: 'Type Yes or No',
        isBranching: true,          // flag handled by ChatbotApplication
        validation: {
            required: true,
            pattern: /^(yes|no|y|n)$/i,
            message: 'Please answer Yes or No'
        }
    },
    // ── index 5: branching step injected dynamically by the component ──
    {
        id: 'currentCtc',
        question: 'What is your current Fixed CTC per annum in LPA? (e.g., 12)',
        type: 'number',
        placeholder: 'e.g. 12 (in LPA)',
        step: '0.1',
        validation: {
            required: true,
            min: 0,
            message: 'Please enter a valid CTC'
        }
    },
    {
        id: 'expectedCtc',
        question: 'What is your expected CTC in LPA? (e.g., 15)',
        type: 'number',
        placeholder: 'e.g. 15 (in LPA)',
        step: '0.1',
        validation: {
            required: true,
            min: 0,
            message: 'Please enter a valid expected CTC'
        }
    },
    {
        id: 'currentLocation',
        question: 'Which city are you currently located in? (e.g., Mumbai, MH)',
        type: 'text',
        placeholder: 'e.g. Mumbai',
        validation: {
            required: true,
            minLength: 2,
            message: 'Please enter your current location'
        }
    },
    {
        id: 'resume',
        type: 'file',
        question: 'Final step! Please upload your resume in PDF/DOC format (Max 1MB).',
        accept: '.pdf,.doc,.docx',
        validation: {
            required: true,
            message: 'Resume is required'
        }
    }
];

// Branch steps injected after noticePeriodCheck
export const noticeBranch = {
    yes: {
        id: 'noticePeriod_lastWorkingDay',
        question: 'When is your Last Working Day? (e.g., 30th April 2025)',
        type: 'text',
        placeholder: 'e.g. 30th April 2025',
        validation: { required: true, minLength: 3, message: 'Please enter your last working day' }
    },
    no: {
        id: 'noticePeriod_official',
        question: 'What is your official notice period in days? (e.g., 30 days or Immediate)',
        type: 'text',
        placeholder: 'e.g. 30 days',
        validation: { required: true, minLength: 1, message: 'Please enter your notice period' }
    }
};
