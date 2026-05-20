import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Error fetching projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', { name, description });
      setName('');
      setDescription('');
      setShowForm(false);
      fetchProjects();
    } catch (error) {
      console.error('Error creating project', error);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Projects</h1>
          <p className="text-slate-400 mt-1">Manage your team's collaborative workspaces.</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-xl shadow-sm transition"
          >
            {showForm ? 'Cancel' : <><Plus className="w-5 h-5" /> New Project</>}
          </button>
        )}
      </div>

      {showForm && user?.role === 'admin' && (
        <div className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 p-6 rounded-2xl shadow-sm border-slate-700/50 mb-8 max-w-2xl">
          <h2 className="text-xl font-bold mb-4 text-slate-200">Create New Project</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1">Project Name</label>
              <input
                type="text" required
                className="w-full px-4 py-2 bg-slate-900/50 text-slate-100 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                value={name} onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full px-4 py-2 bg-slate-900/50 text-slate-100 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                rows="3" value={description} onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            <button type="submit" className="bg-success hover:bg-green-600 text-white font-medium py-2 px-6 rounded-xl transition">
              Save Project
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project._id} className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 rounded-2xl shadow-sm border-slate-700/50 p-6 flex flex-col hover:shadow-md transition group">
            <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-primary transition">{project.name}</h3>
            <p className="text-slate-400 text-sm mb-6 flex-1 line-clamp-2">
              {project.description || 'No description provided.'}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Users className="w-4 h-4" />
                <span>{project.members?.length || 0} Members</span>
              </div>
              <Link 
                to={`/projects/${project._id}`}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:text-indigo-700 transition"
              >
                Open Board <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 bg-slate-800/80 backdrop-blur-sm border-slate-700/50 rounded-2xl border border-dashed border-slate-700/50">
            {/* <FolderKanban className="w-12 h-12 mx-auto text-slate-300 mb-3" /> */}
            <p className="text-lg font-medium text-slate-100">No projects yet</p>
            <p>Get started by creating a new collaborative project.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
