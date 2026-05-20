import { useState, useEffect, useContext } from 'react';
import { User, Mail, Shield, CheckSquare, Clock } from 'lucide-react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchTasks();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  // Calculate heatmap data (last 90 days)
  const heatmapDays = 90;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create array of last 90 days
  const daysArray = Array.from({ length: heatmapDays }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (heatmapDays - 1 - i));
    return d;
  });

  // Map completed tasks to their updatedAt dates
  const completedCounts = {};
  tasks.filter(t => t.status === 'completed').forEach(task => {
    const d = new Date(task.updatedAt);
    d.setHours(0, 0, 0, 0);
    const key = d.getTime();
    completedCounts[key] = (completedCounts[key] || 0) + 1;
  });

  // Determine color intensity based on count
  const getColor = (count) => {
    if (count === 0) return 'bg-slate-800';
    if (count === 1) return 'bg-green-200';
    if (count <= 3) return 'bg-green-400';
    if (count <= 5) return 'bg-green-600';
    return 'bg-green-800';
  };

  const totalCompleted = tasks.filter(t => t.status === 'completed').length;
  const totalPending = tasks.filter(t => t.status !== 'completed').length;

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-100 mb-8">My Profile</h1>
      
      {/* Profile Info Card */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 rounded-2xl shadow-sm border-slate-700/50 p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold">
          {user?.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-slate-100 mb-1">{user?.name}</h2>
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-slate-400 mt-3">
            <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border-slate-700/50">
              <Mail className="w-4 h-4" /> {user?.email}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border-slate-700/50 uppercase tracking-wider font-semibold">
              <Shield className="w-4 h-4 text-primary" /> {user?.role}
            </span>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="text-center bg-slate-900 px-6 py-3 rounded-xl border-slate-700/50">
            <p className="text-2xl font-bold text-emerald-400">{totalCompleted}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase">Completed</p>
          </div>
          <div className="text-center bg-slate-900 px-6 py-3 rounded-xl border-slate-700/50">
            <p className="text-2xl font-bold text-amber-400">{totalPending}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase">Pending</p>
          </div>
        </div>
      </div>

      {/* GitHub Style Heatmap */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 rounded-2xl shadow-sm border-slate-700/50 p-8">
        <div className="flex items-center gap-2 mb-6">
          <CheckSquare className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-slate-200">Daily Task Streak</h2>
        </div>
        
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[700px]">
            {/* Grid for days */}
            <div className="flex gap-1.5 items-end flex-wrap">
              {daysArray.map((date, idx) => {
                const count = completedCounts[date.getTime()] || 0;
                return (
                  <div 
                    key={idx}
                    title={`${date.toDateString()}: ${count} tasks completed`}
                    className={`w-4 h-4 rounded-sm ${getColor(count)} hover:ring-2 hover:ring-gray-300 transition-all cursor-pointer`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-3 px-1 font-medium">
              <span>90 Days Ago</span>
              <span>Today</span>
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-2 mt-6 text-xs text-slate-400 justify-end">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-slate-800"></div>
                <div className="w-3 h-3 rounded-sm bg-green-200"></div>
                <div className="w-3 h-3 rounded-sm bg-green-400"></div>
                <div className="w-3 h-3 rounded-sm bg-green-600"></div>
                <div className="w-3 h-3 rounded-sm bg-green-800"></div>
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
