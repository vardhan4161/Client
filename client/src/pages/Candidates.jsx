import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationAPI } from '../services/api';
import { ArrowLeft, Download, Filter, Search } from 'lucide-react';

const Candidates = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCandidates();
    }, [jobId]);

    const fetchCandidates = async () => {
        try {
            const response = await applicationAPI.getCandidates(jobId);
            setCandidates(response.data.candidates);
        } catch (error) {
            console.error('Failed to fetch candidates:', error);
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

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="card mb-6">
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
                        <div className="flex gap-2">
                            {['ALL', 'APPLIED', 'SHORTLISTED', 'HOLD', 'REJECTED', 'HIRED'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === status
                                            ? 'bg-primary-600 text-white'
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
                        <p className="text-gray-600">Loading candidates...</p>
                    </div>
                ) : filteredCandidates.length === 0 ? (
                    <div className="card text-center py-12">
                        <p className="text-gray-600">No candidates found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredCandidates.map((candidate) => (
                            <div key={candidate.id} className="card hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[candidate.application_status]}`}>
                                                {candidate.application_status}
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                                                Match: {candidate.match_score}%
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>📧 {candidate.email} | 📱 {candidate.phone}</p>
                                            <p>📍 {candidate.current_location}</p>
                                        </div>
                                    </div>
                                    {candidate.resume_url && (
                                        <a
                                            href={`http://localhost:5000${candidate.resume_url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Resume
                                        </a>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Total Exp</p>
                                        <p className="font-medium">{candidate.experience_years} years</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Current CTC</p>
                                        <p className="font-medium">₹{candidate.current_ctc} LPA</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Expected CTC</p>
                                        <p className="font-medium">₹{candidate.expected_ctc} LPA</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Notice Period</p>
                                        <p className="font-medium">{candidate.notice_period} days</p>
                                    </div>
                                </div>

                                {candidate.skills && candidate.skills.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500 mb-2">Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {candidate.skills.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {candidate.ai_summary && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-700">{candidate.ai_summary}</p>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => updateStatus(candidate.application_id, 'SHORTLISTED')}
                                        className="btn-primary text-sm"
                                        disabled={candidate.application_status === 'SHORTLISTED'}
                                    >
                                        Shortlist
                                    </button>
                                    <button
                                        onClick={() => updateStatus(candidate.application_id, 'HOLD')}
                                        className="btn-secondary text-sm"
                                        disabled={candidate.application_status === 'HOLD'}
                                    >
                                        Hold
                                    </button>
                                    <button
                                        onClick={() => updateStatus(candidate.application_id, 'REJECTED')}
                                        className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                                        disabled={candidate.application_status === 'REJECTED'}
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => updateStatus(candidate.application_id, 'HIRED')}
                                        className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
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
