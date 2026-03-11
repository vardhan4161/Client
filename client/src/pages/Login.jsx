import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Copy, Check, LogIn } from 'lucide-react';
import logo from '../assets/logo.png';
import owlMascot from '../assets/owl-mascot.png';



const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await authAPI.login(formData);
            const { user, token } = response.data.data;
            login(user, token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary-400 rounded-full blur-[120px] opacity-[0.06] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-600 rounded-full blur-[120px] opacity-[0.06] translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="flex flex-col md:flex-row gap-10 items-center max-w-5xl w-full px-4 relative z-10">

                {/* Left — Mascot */}
                <div className="hidden md:flex flex-col items-center text-center flex-1 animate-slide-up">
                    <img src={owlMascot} alt="TalentSetu Owl" className="w-64 h-64 drop-shadow-2xl mb-6 hover:scale-105 transition-transform duration-500" />
                    <h2 className="text-3xl font-black text-slate-800 mb-2">The Wise Way to Hire</h2>
                    <p className="text-slate-500 font-medium">Let our AI Owl bridge the gap between genius and opportunity.</p>
                </div>

                {/* Right — Login Card */}
                <div className="card max-w-md w-full animate-fade-in border-none shadow-2xl shadow-primary-100 p-8 sm:p-10 space-y-6">
                    <div className="text-center">
                        <img src={logo} alt="TalentSetu.ai" className="h-14 mx-auto mb-5" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Recruiter Portal</p>
                    </div>



                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                id="email"
                                type="email"
                                className="input-field"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="you@company.com"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-field pr-10"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            id="login-btn"
                            type="submit"
                            className="btn-primary w-full py-3 rounded-xl font-bold shadow-lg shadow-primary-200 transition-all hover:translate-y-[-1px] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? (
                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                            ) : (
                                <LogIn className="w-5 h-5" />
                            )}
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
