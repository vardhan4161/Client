import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Briefcase, Users, LogOut, ExternalLink, Copy, Check } from 'lucide-react';

const Dashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await jobAPI.getAll();
            setJobs(response.data.jobs);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const copyApplicationLink = (jobId) => {
        const link = `${window.location.origin}/apply/${jobId}`;
        navigator.clipboard.writeText(link);
        setCopiedId(jobId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <img src={logo} alt="TalentSetu.ai" className="h-10" />
                            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden sm:block">Recruiter Hub</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                <img src={owlSmall} alt="" className="w-5 h-5 rounded-full" />
                                <span className="text-sm font-medium text-slate-600">
                                    Hey, <span className="text-slate-900 font-bold">{user?.name}</span>
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-red-600 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="card group hover:border-primary-200 transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors">
                                <Briefcase className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Jobs</p>
                                <p className="text-3xl font-black text-slate-900">
                                    {loading ? '...' : jobs.length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="card group hover:border-emerald-200 transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                                <Check className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Status</p>
                                <p className="text-3xl font-black text-slate-900">
                                    {loading ? '...' : jobs.filter(j => j.status === 'OPEN').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="card group hover:border-violet-200 transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-violet-50 rounded-xl group-hover:bg-violet-100 transition-colors">
                                <Users className="w-6 h-6 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Talent</p>
                                <p className="text-3xl font-black text-slate-900">
                                    {loading ? '...' : jobs.reduce((sum, job) => sum + (job.applicantCount || 0), 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Jobs Section */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Job Pipeline</h2>
                        <p className="text-slate-500 text-sm">Manage your open positions and talent flow</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-200 px-6 py-3"
                    >
                        <Plus className="w-5 h-5" />
                        New Posting
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">Loading jobs...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="card text-center py-12">
                        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs yet</h3>
                        <p className="text-gray-600 mb-4">Create your first job to start receiving applications</p>
                        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                            Create Job
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {jobs.map((job) => (
                            <div key={job._id} className="card hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                                        <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${job.status === 'OPEN'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {job.status}
                                            </span>
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {job.applicantCount || 0} Applicants
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                Created {new Date(job.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => copyApplicationLink(job._id)}
                                            className="btn-secondary flex items-center gap-2"
                                            title="Copy application link"
                                        >
                                            {copiedId === job._id ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    Copy Link
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => navigate(`/job/${job._id}/candidates`)}
                                            className="btn-primary flex items-center gap-2"
                                        >
                                            <Users className="w-4 h-4" />
                                            View Candidates
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Job Modal */}
            {showCreateModal && (
                <CreateJobModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchJobs();
                    }}
                />
            )}
        </div>
    );
};

// Create Job Modal Component
const CreateJobModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        minExperience: '',
        maxNoticePeriod: '',
        maxExpectedCtc: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const requirements = {
                minExperience: formData.minExperience ? parseFloat(formData.minExperience) : undefined,
                maxNoticePeriod: formData.maxNoticePeriod ? parseInt(formData.maxNoticePeriod) : undefined,
                maxExpectedCtc: formData.maxExpectedCtc ? parseFloat(formData.maxExpectedCtc) : undefined,
            };

            await jobAPI.create({
                title: formData.title,
                description: formData.description,
                requirements,
            });

            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-slide-up">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Job</h2>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Job Title *
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Job Description *
                        </label>
                        <textarea
                            className="input-field"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Min Experience (years)
                            </label>
                            <input
                                type="number"
                                step="0.5"
                                className="input-field"
                                value={formData.minExperience}
                                onChange={(e) => setFormData({ ...formData, minExperience: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Notice Period (days)
                            </label>
                            <input
                                type="number"
                                className="input-field"
                                value={formData.maxNoticePeriod}
                                onChange={(e) => setFormData({ ...formData, maxNoticePeriod: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Expected CTC (LPA)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                className="input-field"
                                value={formData.maxExpectedCtc}
                                onChange={(e) => setFormData({ ...formData, maxExpectedCtc: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary flex-1" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Dashboard;
