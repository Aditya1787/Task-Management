import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary">TaskMaster</span>
            </div>
            <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/dashboard" className="border-transparent text-slate-400 hover:border-slate-600/50 hover:text-slate-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/projects" className="border-transparent text-slate-400 hover:border-slate-600/50 hover:text-slate-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Projects
              </Link>
              <Link to="/tasks" className="border-transparent text-slate-400 hover:border-slate-600/50 hover:text-slate-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Tasks
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative flex items-center gap-4">
              <div className="text-sm">
                <span className="block font-medium text-slate-300">{user.name}</span>
                <span className="block text-xs text-slate-400 capitalize">{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 p-1 rounded-full text-slate-400 hover:text-slate-400 focus:outline-none"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
