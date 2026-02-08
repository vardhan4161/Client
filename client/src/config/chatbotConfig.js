export const chatbotFlow = [
    {
        id: 'intro',
        type: 'message',
        text: "Hi! I'm the automated recruiter assistant. I'll help you apply for this role. It will only take about 2 minutes.",
        delay: 1000
    },
    {
        id: 'name',
        question: "Let's start with your full name.",
        type: 'text',
        placeholder: 'e.g. John Doe',
        validation: {
            required: true,
            minLength: 2,
            message: 'Please enter a valid name'
        }
    },
    {
        id: 'email',
        question: "Great to meet you! What's your email address?",
        type: 'email',
        placeholder: 'john@example.com',
        validation: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        }
    },
    {
        id: 'phone',
        question: "And your phone number for us to contact you?",
        type: 'tel',
        placeholder: '+91 9876543210',
        validation: {
            required: true,
            pattern: /^\+?[\d\s-]{10,}$/,
            message: 'Please enter a valid phone number'
        }
    },
    {
        id: 'totalExperience',
        question: 'How many years of total experience do you have?',
        type: 'number',
        placeholder: 'e.g. 5',
        step: '0.5',
        validation: {
            required: true,
            min: 0,
            max: 50,
            message: 'Please enter a valid experience'
        }
    },
    {
        id: 'relevantExperience',
        question: 'How many of those are relevant to this role?',
        type: 'number',
        placeholder: 'e.g. 3',
        step: '0.5',
        validation: {
            required: true,
            min: 0,
            custom: (value, formData) => parseFloat(value) <= parseFloat(formData.totalExperience),
            message: 'Relevant experience cannot exceed total experience'
        }
    },
    {
        id: 'skills',
        question: 'What are your top technical skills? (comma separated)',
        type: 'text',
        placeholder: 'React, Node.js, Python...',
        validation: {
            required: true,
            minLength: 2,
            message: 'Please list at least one skill'
        }
    },
    {
        id: 'currentCtc',
        question: 'What is your current CTC (in LPA)?',
        type: 'number',
        placeholder: 'e.g. 12',
        step: '0.1',
        validation: {
            required: true,
            min: 0,
            message: 'Please enter a valid CTC'
        }
    },
    {
        id: 'expectedCtc',
        question: 'What is your expected CTC (in LPA)?',
        type: 'number',
        placeholder: 'e.g. 15',
        step: '0.1',
        validation: {
            required: true,
            min: 0,
            message: 'Please enter a valid CTC'
        }
    },
    {
        id: 'noticePeriod',
        question: 'What is your notice period (in days)?',
        type: 'number',
        placeholder: 'e.g. 30',
        validation: {
            required: true,
            min: 0,
            max: 180,
            message: 'Please enter a valid notice period'
        }
    },
    {
        id: 'currentLocation',
        question: 'Where are you currently located?',
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
        question: 'Finally, please upload your resume.',
        accept: '.pdf,.doc,.docx',
        validation: {
            required: true,
            message: 'Resume is required'
        }
    }
];
