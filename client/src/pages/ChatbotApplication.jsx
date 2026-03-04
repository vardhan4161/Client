import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { jobAPI, applicationAPI, uploadAPI } from '../services/api';
import { MessageCircle, Upload, CheckCircle, Loader, Send, ChevronLeft } from 'lucide-react';
import { chatbotFlow } from '../config/chatbotConfig';

const ChatbotApplication = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Chat history for the interface
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [uploadingResume, setUploadingResume] = useState(false);
    const messagesEndRef = useRef(null);

    const [formData, setFormData] = useState({
        resumeUrl: ''
    });

    useEffect(() => {
        fetchJob();
    }, [jobId]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize chat flow
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (job && !hasInitialized.current) {
            hasInitialized.current = true;
            // Small delay to ensure render stability
            setTimeout(() => processStep(0), 100);
        }
    }, [job]);

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

    const processStep = (index) => {
        if (index >= chatbotFlow.length) {
            handleSubmit();
            return;
        }

        const step = chatbotFlow[index];

        // Add bot message
        if (step.type === 'message') {
            setMessages(prev => [...prev, { type: 'bot', text: step.text }]);
            setTimeout(() => {
                processStep(index + 1);
            }, step.delay || 1000);
            setCurrentStepIndex(index + 1);
            return;
        }

        // Add question
        setMessages(prev => [...prev, {
            type: 'bot',
            text: step.question,
            inputType: step.type,
            stepId: step.id
        }]);
        setCurrentStepIndex(index);
    };

    const validateInput = (value, step) => {
        if (!step.validation) return { isValid: true };

        const { required, minLength, pattern, min, max, custom, message } = step.validation;

        if (required && !value) return { isValid: false, message: message || 'This field is required' };
        if (minLength && value.length < minLength) return { isValid: false, message: message };
        if (pattern && !pattern.test(value)) return { isValid: false, message: message };
        if (min !== undefined && parseFloat(value) < min) return { isValid: false, message: message };
        if (max !== undefined && parseFloat(value) > max) return { isValid: false, message: message };
        if (custom && !custom(value, formData)) return { isValid: false, message: message };

        return { isValid: true };
    };

    const handleUserInput = async (value, type = 'text') => {
        const currentStep = chatbotFlow[currentStepIndex];

        // Validate
        const validation = validateInput(value, currentStep);
        if (!validation.isValid) {
            setMessages(prev => [...prev, { type: 'error', text: validation.message }]);
            return;
        }

        // Add user message
        if (type !== 'file') {
            setMessages(prev => [...prev, { type: 'user', text: value }]);
            setFormData(prev => ({ ...prev, [currentStep.id]: value }));
        } else {
            setMessages(prev => [...prev, { type: 'user', text: `Uploaded: ${value.name}` }]);
        }

        setInputValue('');

        // Move to next step
        setTimeout(() => {
            processStep(currentStepIndex + 1);
        }, 500);
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingResume(true);
        try {
            // Updated to use the correct upload API
            const response = await uploadAPI.uploadResume(file);
            setFormData(prev => ({ ...prev, resumeUrl: response.data.url }));
            handleUserInput(file, 'file');
        } catch (error) {
            setMessages(prev => [...prev, { type: 'error', text: 'Upload failed. Please try again.' }]);
        } finally {
            setUploadingResume(false);
        }
    };

    const handleSubmit = async () => {
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
                skills: (formData.skills || '').split(',').map(s => s.trim()).filter(s => s !== '')
            });
            setSubmitted(true);
        } catch (error) {
            console.error('Chatbot submission error:', error);
            setMessages(prev => [...prev, { type: 'error', text: 'Submission failed. Please try again.' }]);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading interview...</p>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="card max-w-md w-full text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <MessageCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
                    <p className="text-gray-600 mb-4">
                        The job you are looking for does not exist or has been closed.
                    </p>
                    <p className="text-sm text-gray-500">Job ID: {jobId}</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="card max-w-md w-full text-center animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
                    <p className="text-gray-600">
                        Thank you for applying to <strong>{job?.title}</strong>.
                        We have received your details and resume.
                    </p>
                </div>
            </div>
        );
    }

    const currentStep = chatbotFlow[currentStepIndex];
    const progress = ((currentStepIndex) / chatbotFlow.length) * 100;

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200 transform -rotate-3">
                        <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">
                            Talent<span className="text-primary-600">Sethu</span>
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">AI Assistant</p>
                        </div>
                    </div>
                </div>
                <div className="hidden sm:block text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Applying for</p>
                    <p className="text-sm font-black text-slate-800 line-clamp-1">{job?.title}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-200">
                <div
                    className="h-full bg-primary-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.type === 'user'
                                ? 'bg-primary-600 text-white rounded-br-none'
                                : msg.type === 'error'
                                    ? 'bg-red-50 text-red-600 border border-red-100'
                                    : 'bg-white text-gray-800 shadow-sm rounded-bl-none'
                                }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}

                {/* Typing Indicator */}
                {(submitting || uploadingResume) && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-full px-4 py-2 text-xs text-gray-500 animate-pulse">
                            Processing...
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />

                {/* Fallback Start Button */}
                {!loading && job && messages.length === 0 && (
                    <div className="flex justify-center mt-10">
                        <button
                            onClick={() => processStep(0)}
                            className="btn-primary flex items-center gap-2"
                        >
                            Start Interview
                        </button>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t p-4">
                {currentStep?.type === 'file' ? (
                    <div className="flex justify-center">
                        <input
                            type="file"
                            accept={currentStep.accept}
                            onChange={handleResumeUpload}
                            className="hidden"
                            id="file-upload"
                            disabled={uploadingResume}
                        />
                        <label
                            htmlFor="file-upload"
                            className="btn-primary w-full flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {uploadingResume ? <Loader className="animate-spin w-5 h-5" /> : <Upload className="w-5 h-5" />}
                            Upload Resume
                        </label>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input
                            type={currentStep?.type === 'number' ? 'number' : 'text'}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={currentStep?.placeholder || 'Type your answer...'}
                            className="flex-1 input-field mb-0 rounded-full"
                            onKeyPress={(e) => e.key === 'Enter' && handleUserInput(inputValue)}
                            step={currentStep?.step}
                            autoFocus
                            disabled={!currentStep || currentStep.type === 'message'}
                        />
                        <button
                            onClick={() => handleUserInput(inputValue)}
                            disabled={!inputValue || !currentStep || currentStep.type === 'message'}
                            className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatbotApplication;
