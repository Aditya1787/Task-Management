import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await signup(formData.name, formData.email, formData.password, formData.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-800/80 backdrop-blur-sm border-slate-700/50 p-10 rounded-3xl shadow-xl shadow-gray-200/50 border-slate-700/50">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
            <CheckSquare className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">Create an account</h2>
          <p className="mt-2 text-sm text-slate-400">Join your team's workspace</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-400 text-sm p-4 rounded-xl border border-red-100 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-danger"></div>
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <input
                name="name" type="text" required
                className="w-full px-4 py-3 bg-slate-900/50 text-slate-100 border-slate-700/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                placeholder="John Doe"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email address</label>
              <input
                name="email" type="email" required
                className="w-full px-4 py-3 bg-slate-900/50 text-slate-100 border-slate-700/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                placeholder="you@example.com"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                name="password" type="password" required minLength="6"
                className="w-full px-4 py-3 bg-slate-900/50 text-slate-100 border-slate-700/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                placeholder="Min 6 characters"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Account Role</label>
              <select
                name="role"
                className="w-full px-4 py-3 border-slate-700/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-slate-800/80 backdrop-blur-sm border-slate-700/50"
                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition shadow-md shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
        
        <div className="text-center text-sm">
          <p className="text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary hover:text-indigo-700 transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
