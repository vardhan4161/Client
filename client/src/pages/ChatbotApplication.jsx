import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { jobAPI, applicationAPI } from '../services/api';
import { MessageCircle, Upload, CheckCircle, Loader } from 'lucide-react';

const ChatbotApplication = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeUrl, setResumeUrl] = useState('');
    const [uploadingResume, setUploadingResume] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        totalExperience: '',
        relevantExperience: '',
        currentCtc: '',
        expectedCtc: '',
        currentLocation: '',
        noticePeriod: '',
        skills: '',
    });

    useEffect(() => {
        fetchJob();
    }, [jobId]);

    const fetchJob = async () => {
        try {
            const response = await jobAPI.getById(jobId);
            setJob(response.data.job);
        } catch (error) {
            console.error('Failed to fetch job:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setResumeFile(file);
        setUploadingResume(true);

        try {
            const { uploadAPI } = await import('../services/api');
            const response = await uploadAPI.uploadResume(file);
            setResumeUrl(response.data.url);
        } catch (error) {
            alert('Failed to upload resume. Please try again.');
        } finally {
            setUploadingResume(false);
        }
    };

    const handleSubmit = async () => {
        if (!resumeUrl) {
            alert('Please upload your resume before submitting');
            return;
        }

        setSubmitting(true);

        try {
            await applicationAPI.submit({
                jobId,
                ...formData,
                totalExperience: parseFloat(formData.totalExperience),
                relevantExperience: parseFloat(formData.relevantExperience),
                currentCtc: parseFloat(formData.currentCtc),
                expectedCtc: parseFloat(formData.expectedCtc),
                noticePeriod: parseInt(formData.noticePeriod),
                skills: formData.skills.split(',').map(s => s.trim()),
                resumeUrl,
            });

            setSubmitted(true);
        } catch (error) {
            alert('Failed to submit application. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const questions = [
        {
            id: 'name',
            question: "What's your full name?",
            type: 'text',
            placeholder: 'John Doe',
        },
        {
            id: 'email',
            question: "What's your email address?",
            type: 'email',
            placeholder: 'john@example.com',
        },
        {
            id: 'phone',
            question: "What's your phone number?",
            type: 'tel',
            placeholder: '+91 9876543210',
        },
        {
            id: 'totalExperience',
            question: 'How many years of total experience do you have?',
            type: 'number',
            placeholder: '5',
            step: '0.5',
        },
        {
            id: 'relevantExperience',
            question: 'How many years of relevant experience do you have?',
            type: 'number',
            placeholder: '3',
            step: '0.5',
        },
        {
            id: 'currentCtc',
            question: 'What is your current CTC (in LPA)?',
            type: 'number',
            placeholder: '12',
            step: '0.1',
        },
        {
            id: 'expectedCtc',
            question: 'What is your expected CTC (in LPA)?',
            type: 'number',
            placeholder: '15',
            step: '0.1',
        },
        {
            id: 'currentLocation',
            question: 'What is your current location?',
            type: 'text',
            placeholder: 'Bangalore',
        },
        {
            id: 'noticePeriod',
            question: 'What is your notice period (in days)?',
            type: 'number',
            placeholder: '30',
        },
        {
            id: 'skills',
            question: 'What are your key skills? (comma-separated)',
            type: 'text',
            placeholder: 'React, Node.js, PostgreSQL',
        },
    ];

    const currentQuestion = questions[currentStep];
    const progress = ((currentStep + 1) / (questions.length + 1)) * 100;

    const handleNext = () => {
        if (formData[currentQuestion.id]) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                <Loader className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                <div className="card max-w-md text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
                    <p className="text-gray-600">This job posting is no longer available.</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                <div className="card max-w-md text-center animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
                    <p className="text-gray-600 mb-4">
                        Thank you for applying. The recruiter will review your application and get back to you soon.
                    </p>
                    <p className="text-sm text-gray-500">
                        You can close this window now.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Job Info */}
                <div className="card mb-6 animate-fade-in">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary-100 rounded-lg">
                            <MessageCircle className="w-6 h-6 text-primary-600" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                            <p className="text-gray-600">{job.description}</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-600 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-sm text-gray-600 mt-2 text-center">
                        Step {currentStep + 1} of {questions.length + 1}
                    </p>
                </div>

                {/* Chatbot Interface */}
                <div className="card animate-slide-up">
                    {currentStep < questions.length ? (
                        <>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                {currentQuestion.question}
                            </h2>
                            <input
                                type={currentQuestion.type}
                                className="input-field mb-4"
                                placeholder={currentQuestion.placeholder}
                                value={formData[currentQuestion.id]}
                                onChange={(e) =>
                                    setFormData({ ...formData, [currentQuestion.id]: e.target.value })
                                }
                                step={currentQuestion.step}
                                autoFocus
                                onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                            />
                            <div className="flex gap-3">
                                {currentStep > 0 && (
                                    <button onClick={handleBack} className="btn-secondary">
                                        Back
                                    </button>
                                )}
                                <button
                                    onClick={handleNext}
                                    className="btn-primary flex-1"
                                    disabled={!formData[currentQuestion.id]}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Upload Your Resume
                            </h2>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                                {resumeFile ? (
                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                        <CheckCircle className="w-5 h-5" />
                                        <span>{resumeFile.name}</span>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-600 mb-2">Upload your resume (PDF/DOC)</p>
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleResumeUpload}
                                            className="hidden"
                                            id="resume-upload"
                                        />
                                        <label htmlFor="resume-upload" className="btn-primary inline-block cursor-pointer">
                                            {uploadingResume ? 'Uploading...' : 'Choose File'}
                                        </label>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handleBack} className="btn-secondary">
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="btn-primary flex-1"
                                    disabled={!resumeUrl || submitting}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatbotApplication;
