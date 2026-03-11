import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationAPI } from '../services/api';
import { ArrowLeft, Download, Filter, Search, Loader, Star, CheckCircle2, AlertCircle } from 'lucide-react';

// Use env var for API base so resume links work in production too
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const Candidates = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandSummary, setExpandSummary] = useState(null);

    useEffect(() => {
        fetchCandidates();
    }, [jobId]);

    const fetchCandidates = async () => {
        try {
            setFetchError('');
            const response = await applicationAPI.getCandidates(jobId);
            setCandidates(response.data.data?.candidates || response.data.candidates || []);
        } catch (error) {
            console.error('Failed to fetch candidates:', error);
            setFetchError('Failed to load candidates. Please refresh.');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (applicationId, status) => {
        try {
            await applicationAPI.updateStatus(applicationId, status);
            fetchCandidates();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const filteredCandidates = candidates.filter((candidate) => {
        const matchesFilter = filter === 'ALL' || candidate.application_status === filter;
        const matchesSearch =
            candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const statusColors = {
        APPLIED: 'bg-blue-100 text-blue-700',
        SHORTLISTED: 'bg-green-100 text-green-700',
        REJECTED: 'bg-red-100 text-red-700',
        HIRED: 'bg-purple-100 text-purple-700',
        HOLD: 'bg-yellow-100 text-yellow-700',
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
                        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                            {filteredCandidates.length} Applicants
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="card mb-6 sticky top-24 z-10 shadow-lg">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or skills..."
                                    className="input-field pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            {['ALL', 'APPLIED', 'SHORTLISTED', 'HOLD', 'REJECTED', 'HIRED'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${filter === status
                                        ? 'bg-primary-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Candidates List */}
                {loading ? (
                    <div className="text-center py-12">
                        <Loader className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading candidates...</p>
                    </div>
                ) : filteredCandidates.length === 0 ? (
                    <div className="card text-center py-12">
                        <p className="text-gray-600">No candidates found matching your criteria</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredCandidates.map((candidate) => (
                            <div key={candidate.application_id} className="card hover:shadow-md transition-all duration-200 border border-gray-100">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <h3 className="text-lg font-black text-slate-900">{candidate.name}</h3>
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${statusColors[candidate.application_status]}`}>
                                                {candidate.application_status}
                                            </span>
                                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Match Score</span>
                                                <span className={`text-sm font-black ${getScoreColor(candidate.match_score)}`}>
                                                    {candidate.match_score}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p className="flex items-center gap-2">
                                                📧 <a href={`mailto:${candidate.email}`} className="hover:text-primary-600">{candidate.email}</a>
                                                <span className="text-gray-300">|</span>
                                                📱 <a href={`tel:${candidate.phone}`} className="hover:text-primary-600">{candidate.phone}</a>
                                            </p>
                                            <p>📍 {candidate.current_location}</p>
                                        </div>
                                    </div>
                                    {candidate.resume_url && (
                                        <a
                                            href={`${API_BASE}${candidate.resume_url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <Download className="w-4 h-4" />
                                            View Resume
                                        </a>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Total Exp</p>
                                        <p className="font-semibold text-gray-900">{candidate.experience_years} years</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Current CTC</p>
                                        <p className="font-semibold text-gray-900">₹{candidate.current_ctc} LPA</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Expected CTC</p>
                                        <p className="font-semibold text-gray-900">₹{candidate.expected_ctc} LPA</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Notice Period</p>
                                        <p className="font-semibold text-gray-900">{candidate.notice_period} days</p>
                                    </div>
                                </div>

                                {candidate.skills && candidate.skills.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Key Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {candidate.skills.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium border border-blue-100"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {candidate.ai_summary && (
                                    <div className="mb-4">
                                        <div
                                            className={`p-5 rounded-xl border cursor-pointer transition-all hover:shadow-md ${candidate.match_score >= 80
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                                                : candidate.match_score >= 60
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                                    : 'bg-slate-50 border-slate-200 text-slate-900'
                                                }`}
                                            onClick={() => setExpandSummary(expandSummary === candidate.application_id ? null : candidate.application_id)}
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-lg ${candidate.match_score >= 80 ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                                                        <Star className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">TalentSetu AI Analysis</p>
                                                        <p className="text-lg font-black">{candidate.match_score}% Match Score</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${candidate.match_score >= 80 ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-800'}`}>
                                                        {candidate.application_status}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-sm font-medium leading-relaxed mb-4">
                                                {candidate.ai_summary}
                                            </p>

                                            {expandSummary === candidate.application_id && candidate.gemini_data && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-black/5">
                                                    <div>
                                                        <h4 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                            Key Strengths
                                                        </h4>
                                                        <ul className="space-y-1">
                                                            {(candidate.gemini_data.strengths || []).map((s, i) => (
                                                                <li key={i} className="text-xs font-medium flex gap-2">
                                                                    <span className="text-emerald-500">•</span> {s}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5 text-amber-700">
                                                            <AlertCircle className="w-3.5 h-3.5 mr-1" />
                                                            Gap Analysis
                                                        </h4>
                                                        <ul className="space-y-1">
                                                            {(candidate.gemini_data.missingSkills || []).length > 0 ? (
                                                                candidate.gemini_data.missingSkills.map((s, i) => (
                                                                    <li key={i} className="text-xs font-medium flex gap-2">
                                                                        <span className="text-amber-500">•</span> Gap: {s}
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <li className="text-xs font-medium text-emerald-600">✓ No critical skill gaps identified</li>
                                                            )}
                                                            {(candidate.gemini_data.concerns || []).map((c, i) => (
                                                                <li key={`c-${i}`} className="text-xs font-medium flex gap-2 text-red-600/70">
                                                                    <span className="text-red-400">!!</span> {c}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => updateStatus(candidate.application_id, 'SHORTLISTED')}
                                        className={`btn-sm ${candidate.application_status === 'SHORTLISTED' ? 'opacity-50 cursor-not-allowed' : 'btn-primary'}`}
                                        disabled={candidate.application_status === 'SHORTLISTED'}
                                    >
                                        Shortlist
                                    </button>
                                    <button
                                        onClick={() => updateStatus(candidate.application_id, 'HOLD')}
                                        className={`btn-sm ${candidate.application_status === 'HOLD' ? 'opacity-50 cursor-not-allowed' : 'btn-secondary'}`}
                                        disabled={candidate.application_status === 'HOLD'}
                                    >
                                        Hold
                                    </button>
                                    <button
                                        onClick={() => updateStatus(candidate.application_id, 'REJECTED')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-200 text-red-700 hover:bg-red-50 ${candidate.application_status === 'REJECTED' ? 'opacity-50 cursor-not-allowed bg-red-50' : ''}`}
                                        disabled={candidate.application_status === 'REJECTED'}
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => updateStatus(candidate.application_id, 'HIRED')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-purple-200 text-purple-700 hover:bg-purple-50 ${candidate.application_status === 'HIRED' ? 'opacity-50 cursor-not-allowed bg-purple-50' : ''}`}
                                        disabled={candidate.application_status === 'HIRED'}
                                    >
                                        Hire
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Candidates;
