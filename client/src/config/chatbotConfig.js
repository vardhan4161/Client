// Base flow — notice period branching is handled dynamically in ChatbotApplication.jsx
export const chatbotFlow = [
    {
        id: 'name',
        question: "What's your full name?",
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
        question: 'Enter your mobile number?',
        type: 'text',
        placeholder: '+91 9876543210',
        validation: {
            required: true,
            pattern: /^[\+\d][\d\s\-\.\(\)]{8,}$/,
            message: 'Please enter a valid mobile number (10–13 digits)'
        }
    },
    {
        id: 'email',
        question: 'Enter your email id?',
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
        question: 'Total years of experience?',
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
        question: 'Are you currently serving notice period? (Yes/No)',
        type: 'text',
        placeholder: 'Yes or No',
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
        question: 'What is your current CTC? (per annum)',
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
        question: 'And what is your expected CTC?',
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
        question: 'What is your current location?',
        type: 'text',
        placeholder: 'e.g. Bangalore',
        validation: {
            required: true,
            minLength: 2,
            message: 'Please enter your current location'
        }
    },
    {
        id: 'resume',
        type: 'file',
        question: 'Please upload your resume (PDF/DOC, max 1MB).',
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
        question: 'When is your last working day in your current company?',
        type: 'text',
        placeholder: 'e.g. 30th April 2025',
        validation: { required: true, minLength: 3, message: 'Please enter your last working day' }
    },
    no: {
        id: 'noticePeriod_official',
        question: 'What is your official notice period?',
        type: 'text',
        placeholder: 'e.g. 30 days / Immediate',
        validation: { required: true, minLength: 1, message: 'Please enter your notice period' }
    }
};
