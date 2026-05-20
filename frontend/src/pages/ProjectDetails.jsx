import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User as UserIcon, Plus, Trash2 } from 'lucide-react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // New task modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', dueDate: '', status: 'pending' });

  // Member invite
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');

  const fetchProjectData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get('/projects'),
        api.get(`/tasks?projectId=${id}`)
      ]);
      const currentProj = projRes.data.find(p => p._id === id);
      setProject(currentProj);
      setTasks(tasksRes.data.filter(t => t.projectId?._id === id || t.projectId === id));
    } catch (error) {
      console.error('Error fetching project data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchProjectData();
    } catch (error) {
      console.error('Error updating task status', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchProjectData();
      } catch (error) {
        console.error('Error deleting task', error);
      }
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    try {
      await api.post(`/projects/${id}/add-member`, { email: inviteEmail });
      setInviteEmail('');
      fetchProjectData();
    } catch (error) {
      setInviteError(error.response?.data?.message || 'Error adding member');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, projectId: id });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', assignedTo: '', dueDate: '', status: 'pending' });
      fetchProjectData();
    } catch (error) {
      console.error('Error creating task', error);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!project) return <div className="p-8 text-center text-red-500">Project not found</div>;

  const columns = [
    { id: 'pending', title: 'To Do', color: 'border-yellow-400', bg: 'bg-yellow-50' },
    { id: 'in-progress', title: 'In Progress', color: 'border-blue-400', bg: 'bg-blue-50' },
    { id: 'completed', title: 'Done', color: 'border-success', bg: 'bg-green-50' }
  ];

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);
  const isOverdue = (date) => new Date(date) < new Date() && new Date(date).toDateString() !== new Date().toDateString();

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/projects" className="p-2 hover:bg-slate-800 rounded-lg transition"><ArrowLeft className="w-5 h-5 text-slate-400" /></Link>
          <h1 className="text-3xl font-bold text-slate-100">{project.name}</h1>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setShowTaskModal(true)} className="flex items-center gap-2 bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 items-start">
        {/* LEFT: Project Info */}
        <div className="w-full lg:w-1/4 space-y-6">
          <div className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 rounded-xl shadow-sm border-slate-700/50 p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-2">About</h2>
            <p className="text-slate-400 text-sm mb-6">{project.description || 'No description provided.'}</p>
            
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2">Team Members ({project.members?.length})</h3>
            
            {user?.role === 'admin' && (
              <form onSubmit={handleInvite} className="mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Add Member by Email</label>
                <div className="flex flex-col gap-2">
                  <input type="email" required placeholder="user@example.com" className="w-full text-sm bg-slate-900/50 text-slate-100 border border-slate-700/50 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                  <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm transition">Invite</button>
                </div>
                {inviteError && <p className="text-xs text-red-400 mt-2 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-danger inline-block"></span>{inviteError}</p>}
              </form>
            )}

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {project.members?.map(member => (
                <div key={member._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-700/50 transition group cursor-default">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary text-sm font-bold shadow-sm border border-primary/10">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-100 truncate group-hover:text-primary transition">{member.name}</p>
                    <p className="text-xs text-slate-400 truncate">{member.email}</p>
                  </div>
                </div>
              ))}
              {project.members?.length === 0 && (
                <div className="text-center py-6 text-slate-400 bg-slate-900 rounded-xl border border-dashed border-slate-700/50">
                  <p className="text-sm font-medium">No members added yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Kanban Board */}
        <div className="w-full lg:w-3/4 flex gap-6 overflow-x-auto pb-4 h-full">
          {columns.map(col => (
            <div key={col.id} className={`flex-1 min-w-[300px] bg-slate-900/50 rounded-xl border-slate-700/50 flex flex-col max-h-[calc(100vh-140px)]`}>
              <div className={`p-4 border-t-4 ${col.color} bg-slate-800/80 backdrop-blur-sm border-slate-700/50 rounded-t-xl border-b border-slate-700/50 flex justify-between items-center sticky top-0`}>
                <h3 className="font-bold text-slate-200">{col.title}</h3>
                <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded-full text-xs font-medium">
                  {getTasksByStatus(col.id).length}
                </span>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                {getTasksByStatus(col.id).map(task => (
                  <div key={task._id} className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 p-4 rounded-xl shadow-sm border-slate-700/50 hover:shadow-md transition group">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h4 className="font-semibold text-slate-100">{task.title}</h4>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          disabled={task.status === 'completed'}
                          className={`p-1 rounded transition shrink-0 ${
                            task.status === 'completed' 
                              ? 'text-slate-600 cursor-not-allowed opacity-40' 
                              : 'text-red-400 hover:text-red-300 hover:bg-slate-700/50'
                          }`}
                          title={task.status === 'completed' ? 'Completed tasks cannot be deleted' : 'Delete Task'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {task.description && <p className="text-xs text-slate-400 mb-4 line-clamp-2">{task.description}</p>}
                    
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                      <div className="flex items-center gap-1" title="Assigned to">
                        <UserIcon className="w-3.5 h-3.5" />
                        <span className="font-medium text-slate-300">{task.assignedTo?.name || 'Unassigned'}</span>
                      </div>
                      {task.dueDate && (
                        <div className={`flex items-center gap-1 ${isOverdue(task.dueDate) && task.status !== 'completed' ? 'text-red-400 font-semibold' : ''}`}>
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-3 border-t border-slate-700/50">
                      <select
                        className="w-full text-xs bg-slate-900 text-slate-100 border border-slate-700/50 rounded-lg px-2 py-1.5 focus:ring-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        disabled={task.status === 'completed' && user?.role !== 'admin'}
                      >
                        <option value="pending">Move to To Do</option>
                        <option value="in-progress">Move to In Progress</option>
                        <option value="completed">Move to Done</option>
                      </select>
                    </div>
                  </div>
                ))}
                {getTasksByStatus(col.id).length === 0 && (
                  <div className="text-center py-8 text-sm text-slate-400 border-2 border-dashed border-slate-700/50 rounded-xl">
                    No tasks here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simple Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Create Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                <input required type="text" className="w-full px-3 py-2 bg-slate-900/50 text-slate-100 border border-slate-700/50 rounded-lg focus:ring-primary outline-none" 
                  value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea className="w-full px-3 py-2 bg-slate-900/50 text-slate-100 border border-slate-700/50 rounded-lg focus:ring-primary outline-none" rows="2"
                  value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Assignee</label>
                <select className="w-full px-3 py-2 bg-slate-900/50 text-slate-100 border border-slate-700/50 rounded-lg focus:ring-primary outline-none"
                  value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}>
                  <option value="">Unassigned</option>
                  {project.members?.map(m => <option key={m._id} value={m._id} className="bg-slate-900">{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Due Date</label>
                <input type="date" className="w-full px-3 py-2 bg-slate-900/50 text-slate-100 border border-slate-700/50 rounded-lg focus:ring-primary outline-none"
                  value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 bg-slate-800 text-slate-300 py-2 rounded-lg font-medium hover:bg-gray-200">Cancel</button>
                <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:bg-indigo-700">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
