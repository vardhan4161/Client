import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { jobAPI, applicationAPI, uploadAPI } from '../services/api';
import { CheckCircle, Loader, Send, Paperclip } from 'lucide-react';
import { chatbotFlow, noticeBranch } from '../config/chatbotConfig';
import owlMascot from '../assets/owl-mascot.png';

/* ─────────────────────────────────────────────
   Typing bubble — three animated dots
───────────────────────────────────────────── */
const TypingBubble = () => (
    <div className="flex items-end gap-2 mb-1">
        <img src={owlMascot} alt="bot" className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1 drop-shadow" />
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center">
            {[0, 1, 2].map(i => (
                <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-slate-400 inline-block"
                    style={{ animation: `chatDot 1.2s ${i * 0.2}s ease-in-out infinite` }}
                />
            ))}
        </div>
    </div>
);

/* ─────────────────────────────────────────────
   Single chat message row
───────────────────────────────────────────── */
const ChatMessage = ({ msg, showAvatar }) => {
    if (msg.type === 'bot') return (
        <div className="flex items-end gap-2 mb-1 animate-slideUp">
            {showAvatar
                ? <img src={owlMascot} alt="bot" className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1 drop-shadow" />
                : <div className="w-7 flex-shrink-0" />}
            <div className="max-w-[78%] bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-none px-4 py-2.5 text-slate-800 text-sm leading-relaxed">
                {msg.text}
            </div>
        </div>
    );

    if (msg.type === 'error') return (
        <div className="flex justify-center mb-1 animate-slideUp">
            <div className="max-w-[78%] bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2 text-xs text-center">
                ⚠️ {msg.text}
            </div>
        </div>
    );

    return (
        <div className="flex justify-end mb-1 animate-slideUp">
            <div className="max-w-[78%] bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl rounded-br-none px-4 py-2.5 text-sm leading-relaxed shadow-sm">
                {msg.text}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════
   Main component
═══════════════════════════════════════════ */
const ChatbotApplication = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [referenceId, setReferenceId] = useState('');
    const [aiFeedback, setAiFeedback] = useState(null);

    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [uploadingResume, setUploadingResume] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    // Dynamic steps list (base flow + injected branch step)
    const [steps, setSteps] = useState([...chatbotFlow]);
    const [stepIndex, setStepIndex] = useState(0);
    const [formData, setFormData] = useState({ resumeUrl: '' });

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const hasInitialized = useRef(false);

    // ── Fetch job
    useEffect(() => { fetchJob(); }, [jobId]);

    // ── Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // ── Start flow once job loaded
    useEffect(() => {
        if (job && !hasInitialized.current) {
            hasInitialized.current = true;
            setTimeout(() => askStep([...chatbotFlow], 0), 300);
        }
    }, [job]);

    // ── Re-focus input after bot finishes typing
    useEffect(() => {
        if (!isTyping) inputRef.current?.focus();
    }, [isTyping]);

    const fetchJob = async () => {
        try {
            const response = await jobAPI.getById(jobId);
            setJob(response.data.data?.job || response.data.job);
        } catch (err) {
            console.error('Failed to fetch job:', err);
        } finally {
            setLoading(false);
        }
    };

    /* Push a bot message with typing animation */
    const pushBot = (text, delay = 650) => new Promise(resolve => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, { type: 'bot', text }]);
            resolve();
        }, delay);
    });

    /* Ask the step at a given index from a given steps array */
    const askStep = async (currentSteps, index) => {
        if (index >= currentSteps.length) {
            handleSubmit();
            return;
        }
        const step = currentSteps[index];
        setSteps(currentSteps);
        setStepIndex(index);
        await pushBot(step.question, index === 0 ? 800 : 600);
    };

    /* Validate a value against step rules */
    const validateInput = (value, step) => {
        if (!step.validation) return { isValid: true };
        const { required, minLength, pattern, min, max, message } = step.validation;
        if (required && !value) return { isValid: false, message: message || 'This field is required' };
        if (minLength && value.length < minLength) return { isValid: false, message };
        if (pattern && !pattern.test(value)) return { isValid: false, message };
        if (min !== undefined && parseFloat(value) < min) return { isValid: false, message };
        if (max !== undefined && parseFloat(value) > max) return { isValid: false, message };
        return { isValid: true };
    };

    /* Handle text/number/email send */
    const handleSend = () => {
        const value = inputValue.trim();
        if (!value || isTyping || submitting) return;

        const currentStep = steps[stepIndex];
        if (!currentStep) return;

        const validation = validateInput(value, currentStep);
        if (!validation.isValid) {
            setMessages(prev => [...prev, { type: 'error', text: validation.message }]);
            return;
        }

        // User bubble
        setMessages(prev => [...prev, { type: 'user', text: value }]);
        const newFormData = { ...formData, [currentStep.id]: value };
        setFormData(newFormData);
        setInputValue('');

        // ── Notice period branching ──
        if (currentStep.isBranching) {
            const isYes = /^(yes|y)$/i.test(value);
            const branchStep = isYes ? noticeBranch.yes : noticeBranch.no;

            // Find the index of noticePeriodCheck in steps and splice the branch step right after it
            const newSteps = [...steps];
            const branchInsertIndex = stepIndex + 1;
            // Remove any previously injected branch step (lastWorkingDay or noticePeriod)
            const filtered = newSteps.filter(s => s.id !== 'lastWorkingDay' && s.id !== 'noticePeriod');
            // Find where noticePeriodCheck lands in the filtered list, then insert after it
            const checkIdx = filtered.findIndex(s => s.id === 'noticePeriodCheck');
            filtered.splice(checkIdx + 1, 0, branchStep);

            setTimeout(() => askStep(filtered, branchInsertIndex), 400);
            return;
        }

        setTimeout(() => askStep(steps, stepIndex + 1), 400);
    };

    /* Handle resume file upload */
    const handleResumeUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const ext = (file.name.split('.').pop() || '').toLowerCase();
        const allowed = ['pdf', 'doc', 'docx'];
        const maxBytes = 1 * 1024 * 1024; // 1 MB strict

        if (!allowed.includes(ext)) {
            setMessages(prev => [...prev, { type: 'error', text: 'Only PDF, DOC, or DOCX files are accepted.' }]);
            e.target.value = '';
            return;
        }
        if (file.size > maxBytes) {
            setMessages(prev => [...prev, { type: 'error', text: 'File exceeds 1 MB limit. Please compress and try again.' }]);
            e.target.value = '';
            return;
        }

        setUploadingResume(true);
        setIsTyping(true);
        try {
            const response = await uploadAPI.uploadResume(file);
            setFormData(prev => ({ ...prev, resumeUrl: response.data.url }));
            setMessages(prev => [...prev, { type: 'user', text: `📎 ${file.name}` }]);
            setIsTyping(false);
            setTimeout(() => handleSubmit(), 400);
        } catch (err) {
            setIsTyping(false);
            setMessages(prev => [...prev, { type: 'error', text: 'Upload failed. Please try again.' }]);
        } finally {
            setUploadingResume(false);
        }
    };

    /* Final application submit */
    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const response = await applicationAPI.submit({
                jobId,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                currentLocation: formData.currentLocation,
                resumeUrl: formData.resumeUrl,
                totalExperience: parseFloat(formData.totalExperience) || 0,
                relevantExperience: parseFloat(formData.relevantExperience || formData.totalExperience) || 0,
                currentCtc: parseFloat(formData.currentCtc) || 0,
                expectedCtc: parseFloat(formData.expectedCtc) || 0,
                noticePeriod: parseInt(formData.noticePeriod) || 0,
                skills: Array.isArray(formData.skills)
                    ? formData.skills
                    : formData.skills
                        ? String(formData.skills).split(',').map(s => s.trim()).filter(Boolean)
                        : [],
            });

            const data = response.data.data || response.data;
            if (data.matchScore !== undefined) {
                setAiFeedback({
                    score: data.matchScore,
                    summary: data.aiSummary || `You matched ${data.matchScore}% for this role!`,
                });
            }
            setReferenceId(data.application?._id || data._id || '');
            setSubmitted(true);
        } catch (err) {
            const status = err?.response?.status;
            const details = err?.response?.data?.details;
            const msg = details ? details.join(' | ') : (err?.response?.data?.message || err?.message || 'Unknown error');
            let display = `Submission failed: ${msg}`;
            if (status === 404) display = '❌ This job link has expired. Please get a fresh link from the recruiter.';
            else if (status === 400) display = `❌ Validation Error: ${msg}`;
            else if (!navigator.onLine) display = '❌ No internet connection. Please check your network.';
            setMessages(prev => [...prev, { type: 'error', text: display }]);
        } finally {
            setSubmitting(false);
        }
    };

    const currentStep = steps[stepIndex];
    const progress = Math.min((stepIndex / steps.length) * 100, 100);
    const isFileStep = currentStep?.type === 'file';
    const isInputDisabled = isTyping || submitting || uploadingResume || isFileStep;

    /* ═══ LOADING ═══ */
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#e8f5e9 0%,#f1f8e9 100%)' }}>
            <div className="text-center">
                <Loader className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">Loading your interview…</p>
            </div>
        </div>
    );

    /* ═══ JOB NOT FOUND ═══ */
    if (!job) return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg,#e8f5e9 0%,#f1f8e9 100%)' }}>
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔎</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Job Not Found</h2>
                <p className="text-sm text-slate-500">
                    This role no longer exists or the link has expired. Please contact the recruiter for a new link.
                </p>
            </div>
        </div>
    );

    /* ═══ SUCCESS ═══ */
    if (submitted) return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg,#e8f5e9 0%,#f1f8e9 100%)' }}>
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-fadeIn">
                <img src={owlMascot} alt="TalentSetu" className="w-28 h-28 mx-auto mb-4 drop-shadow-xl" />
                <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-full mb-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-1">Application Submitted!</h2>
                <p className="text-slate-500 text-sm mb-6">
                    Thank you for applying to <strong className="text-slate-700">{job?.title}</strong>. We'll be in touch via email soon.
                </p>
                {aiFeedback && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-left mb-5">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-lg">
                                {aiFeedback.score}% Match
                            </span>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Owl Wisdom</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed italic">"{aiFeedback.summary}"</p>
                    </div>
                )}
                {referenceId && (
                    <div className="bg-slate-100 rounded-xl py-2 px-4 inline-block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference ID</p>
                        <p className="text-xs font-mono font-bold text-slate-700">#{referenceId.slice(-8).toUpperCase()}</p>
                    </div>
                )}
            </div>
        </div>
    );

    /* ═══ MAIN CHAT UI ═══ */
    return (
        <>
            <style>{`
                @keyframes chatDot {
                    0%,80%,100% { transform:scale(0.6); opacity:0.4; }
                    40%         { transform:scale(1);   opacity:1;   }
                }
                @keyframes slideUp {
                    from { opacity:0; transform:translateY(10px); }
                    to   { opacity:1; transform:translateY(0);    }
                }
                @keyframes fadeIn {
                    from { opacity:0; transform:scale(0.96); }
                    to   { opacity:1; transform:scale(1);    }
                }
                .animate-slideUp { animation:slideUp 0.25s ease forwards; }
                .animate-fadeIn  { animation:fadeIn 0.4s ease forwards; }
            `}</style>

            <div className="flex flex-col" style={{ height:'100dvh', background:'linear-gradient(160deg,#e2f0e8 0%,#edf5f0 60%,#e8f4ef 100%)' }}>

                {/* ══ HEADER ══ */}
                <div className="flex-shrink-0 bg-gradient-to-r from-emerald-600 to-green-600 shadow-md">
                    <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto w-full">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img src={owlMascot} alt="Assistant" className="w-10 h-10 rounded-full object-cover border-2 border-white/30 shadow-lg" />
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-lime-400 rounded-full border-2 border-emerald-600 animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-white font-black text-base leading-none tracking-tight">
                                    Talent<span className="opacity-80">Setu</span><span className="text-lime-300">.ai</span>
                                </h1>
                                <p className="text-emerald-100 text-[11px] font-medium mt-0.5">Owl Recruiter · Online</p>
                            </div>
                        </div>
                        <div className="hidden sm:block text-right">
                            <p className="text-emerald-200 text-[10px] font-bold uppercase tracking-wider">Applying for</p>
                            <p className="text-white text-sm font-black line-clamp-1 max-w-[180px]">{job?.title}</p>
                        </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-0.5 bg-emerald-700/40 max-w-2xl mx-auto w-full">
                        <div className="h-full bg-lime-400 transition-all duration-700 ease-out" style={{ width:`${progress}%` }} />
                    </div>
                </div>

                {/* ══ MESSAGES ══ */}
                <div className="flex-1 overflow-y-auto">
                    <div className="px-4 py-5 space-y-1 max-w-2xl mx-auto w-full">

                        {/* Static greeting */}
                        <div className="flex items-end gap-2 mb-1 animate-slideUp">
                            <img src={owlMascot} alt="bot" className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1 drop-shadow" />
                            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-none px-4 py-2.5 text-slate-800 text-sm leading-relaxed">
                                👋 Hi! Thanks for reaching out.
                            </div>
                        </div>
                        <div className="flex items-end gap-2 mb-3 animate-slideUp" style={{ animationDelay:'0.15s' }}>
                            <div className="w-7 flex-shrink-0" />
                            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-none px-4 py-2.5 text-slate-800 text-sm leading-relaxed">
                                We are currently hiring for: <strong>{job?.title}</strong>
                            </div>
                        </div>

                        {/* Dynamic messages */}
                        {messages.map((msg, idx) => {
                            const prev = messages[idx - 1];
                            const showAvatar = !prev || prev.type !== 'bot';
                            return <ChatMessage key={idx} msg={msg} showAvatar={showAvatar} />;
                        })}

                        {/* Typing / uploading indicator */}
                        {(isTyping || uploadingResume) && <TypingBubble />}

                        {/* Submitting indicator */}
                        {submitting && (
                            <div className="flex items-end gap-2 mb-1 animate-slideUp">
                                <img src={owlMascot} alt="bot" className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1 drop-shadow" />
                                <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-none px-4 py-2.5 text-slate-500 text-xs italic">
                                    Submitting your application…
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* ══ INPUT AREA ══ */}
                <div className="flex-shrink-0 bg-white border-t border-slate-100 shadow-[0_-2px_12px_rgba(0,0,0,0.05)]">
                    <div className="px-3 py-3 max-w-2xl mx-auto w-full">
                        {isFileStep ? (
                            <div className="flex flex-col items-center gap-2">
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleResumeUpload}
                                    className="hidden"
                                    id="resume-upload"
                                    disabled={uploadingResume || submitting}
                                />
                                <label
                                    htmlFor="resume-upload"
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 px-5 rounded-full cursor-pointer transition-all duration-200 shadow-sm active:scale-[0.98] text-sm"
                                >
                                    {uploadingResume
                                        ? <><Loader className="w-4 h-4 animate-spin" /> Uploading…</>
                                        : <><Paperclip className="w-4 h-4" /> Attach Resume (PDF/DOC, max 1MB)</>
                                    }
                                </label>
                                <p className="text-[11px] text-slate-400">Supported: .pdf · .doc · .docx</p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type={
                                        currentStep?.type === 'number' ? 'number'
                                        : currentStep?.type === 'email' ? 'email'
                                        : 'text'
                                    }
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    placeholder={currentStep?.placeholder || 'Type your answer…'}
                                    step={currentStep?.step}
                                    disabled={isInputDisabled}
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all disabled:opacity-50"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isInputDisabled}
                                    aria-label="Send"
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-sm hover:from-emerald-600 hover:to-green-700 active:scale-90 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatbotApplication;
