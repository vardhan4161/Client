import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Users } from 'lucide-react';
import logo from '../assets/logo.png';
import owlMascot from '../assets/owl-mascot.png';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login(formData);
            login(response.data.user, response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-600 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center max-w-5xl w-full px-4 relative z-10">
                {/* Left Side: Mascot & Intro */}
                <div className="hidden md:flex flex-col items-center text-center flex-1 animate-slide-up">
                    <img src={owlMascot} alt="TalentSetu Owl" className="w-64 h-64 drop-shadow-2xl mb-6 hover:scale-105 transition-transform duration-500" />
                    <h2 className="text-3xl font-black text-slate-800 mb-2">The Wise Way to Hire</h2>
                    <p className="text-slate-500 font-medium">Let our AI Owl bridge the gap between genius and opportunity.</p>
                </div>

                <div className="card max-w-md w-full animate-fade-in border-none shadow-2xl shadow-primary-100 p-8 sm:p-10">
                    <div className="text-center mb-10">
                        <img src={logo} alt="TalentSetu.ai" className="h-16 mx-auto mb-6" />
                        <p className="text-slate-500 font-medium font-bold uppercase tracking-widest text-xs">Recruiter Portal</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-center text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                className="input-field"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                className="input-field"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary w-full py-3 rounded-xl font-bold shadow-lg shadow-primary-200 transition-all hover:translate-y-[-1px]"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-gray-600 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-bold">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
