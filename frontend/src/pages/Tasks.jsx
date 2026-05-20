import { useState, useEffect, useContext } from 'react';
import { Search, Filter, Clock, User as UserIcon, Calendar, CheckSquare, Trash2 } from 'lucide-react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching tasks', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchTasks();
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task', error);
      }
    }
  };

  const isOverdue = (date) => new Date(date) < new Date() && new Date(date).toDateString() !== new Date().toDateString();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">Done</span>;
      case 'in-progress': return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">In Progress</span>;
      default: return <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider">To Do</span>;
    }
  };

  // Apply filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">All Tasks</h1>
          <p className="text-slate-400 mt-1">View and manage all your assigned tasks across projects.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="pl-10 pr-4 py-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-slate-100 placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-64"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              className="pl-10 pr-8 py-2 border-slate-700/50 rounded-xl appearance-none bg-slate-800/80 backdrop-blur-sm border-slate-700/50 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Done</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 shadow-sm rounded-2xl border-slate-700/50 overflow-hidden">
        {filteredTasks.length > 0 ? (
          <ul className="divide-y divide-slate-700/50">
            {filteredTasks.map((task) => (
              <li key={task._id} className="p-6 hover:bg-slate-900/50 transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-100">{task.title}</h3>
                      {getStatusBadge(task.status)}
                    </div>
                    {task.description && <p className="text-sm text-slate-400 mb-3">{task.description}</p>}
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
                      <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        Assignee: <span className="text-slate-300">{task.assignedTo?.name || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg">
                        <CheckSquare className="w-4 h-4 text-slate-400" />
                        Project: <span className="text-slate-300">{task.projectId?.name || 'Unknown'}</span>
                      </div>
                      {task.dueDate && (
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${isOverdue(task.dueDate) && task.status !== 'completed' ? 'bg-red-50 text-red-400' : 'bg-slate-800'}`}>
                          <Calendar className="w-4 h-4" />
                          Due: <span className={isOverdue(task.dueDate) && task.status !== 'completed' ? 'font-bold' : 'text-slate-300'}>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 flex items-center gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Update Status</label>
                      <select
                        className="w-full md:w-auto text-sm border-slate-700/50 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 outline-none px-4 py-2 cursor-pointer bg-slate-800/80 backdrop-blur-sm border-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={task.status}
                        onChange={(e) => updateStatus(task._id, e.target.value)}
                        disabled={task.status === 'completed' && user?.role !== 'admin'}
                      >
                        <option value="pending">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Done</option>
                      </select>
                    </div>
                    {user?.role === 'admin' && (
                      <div className="self-end pb-0.5">
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          disabled={task.status === 'completed'}
                          className={`p-2.5 rounded-xl border transition ${
                            task.status === 'completed'
                              ? 'border-slate-700/50 text-slate-600 cursor-not-allowed opacity-40'
                              : 'border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/30'
                          }`}
                          title={task.status === 'completed' ? 'Completed tasks cannot be deleted' : 'Delete Task'}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-20 text-center text-slate-400">
            <CheckSquare className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-100">No tasks found</p>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
