import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, AlertTriangle, ListTodo, CheckSquare, TrendingUp, Zap, Target } from 'lucide-react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/tasks')
        ]);
        setStats(statsRes.data);
        setAllTasks(tasksRes.data);
        
        const sortedTasks = tasksRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        setRecentTasks(sortedTasks);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!stats) return <div className="p-8 text-center text-red-500">Failed to load statistics</div>;

  // Calculate Weekly Goal Data (completed in last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const completedLastSevenDays = allTasks.filter(task => 
    task.status === 'completed' && new Date(task.updatedAt) >= sevenDaysAgo
  ).length;

  const weeklyGoal = 20;
  const goalProgress = Math.min((completedLastSevenDays / weeklyGoal) * 100, 100);

  // Calculate Weekly Chart Data (Completed tasks per day for the last 7 days)
  const getWeeklyData = () => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      
      const count = allTasks.filter(task => {
        if (task.status !== 'completed' || !task.updatedAt) return false;
        const taskDate = new Date(task.updatedAt);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === d.getTime();
      }).length;
      
      data.push(count);
    }
    return data;
  };

  const weeklyData = getWeeklyData();
  const maxWeekly = Math.max(...weeklyData, 1);
  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const lastSevenDayNames = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    lastSevenDayNames.push(dayNamesShort[d.getDay()]);
  }

  // Calculate coordinates for the line graph
  const chartPoints = weeklyData.map((val, idx) => {
    const x = (idx / 6) * 1000;
    const y = 100 - (val / (maxWeekly * 1.2)) * 100; // Multiply by 1.2 to give some padding at top
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,100 ${chartPoints} 1000,100`;

  const statCards = [
    { name: 'Total Tasks', value: stats.total, icon: ListTodo, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { name: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { name: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-100 tracking-tight">Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">{user?.name.split(' ')[0]}</span>! 👋</h1>
          <p className="text-slate-400 mt-2 text-lg">Here's your productivity overview for today.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95"
          >
            <Target className="w-5 h-5" />
            New Goal
          </button>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="relative bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 flex items-center gap-5 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-300 group border border-slate-700/50 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">{item.name}</p>
                <p className="text-3xl font-black text-slate-100 tracking-tight">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Productivity Line Chart Section */}
          <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Weekly Performance Trend
              </h2>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full font-bold flex items-center gap-1 uppercase tracking-tighter">
                <Zap className="w-3 h-3" />
                Live Tracking
              </span>
            </div>
            
            <div className="h-64 relative mt-4">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-full border-b border-white h-0"></div>
                ))}
              </div>
              
              <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Area under the line */}
                <polyline
                  points={areaPoints}
                  fill="url(#gradient)"
                  className="transition-all duration-1000"
                />
                
                {/* The Line */}
                <polyline
                  points={chartPoints}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_0_12px_rgba(249,115,22,0.6)] transition-all duration-1000"
                />
              </svg>

              {/* Data points (circles) and Labels */}
              <div className="absolute inset-0 flex justify-between overflow-visible">
                {weeklyData.map((val, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-end h-full group relative" style={{ width: '40px', left: `${(idx / 6) * 100}%`, transform: 'translateX(-50%)', position: 'absolute' }}>
                    
                    {/* Hover tooltip */}
                    <div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-300 bg-slate-900 border border-orange-500/50 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-2xl -top-12 z-20 pointer-events-none whitespace-nowrap transform -translate-y-2 group-hover:translate-y-0">
                      <div className="font-bold text-orange-400">{val} Tasks</div>
                      <div className="text-[8px] text-slate-400">{lastSevenDayNames[idx]}</div>
                    </div>
                    
                    {/* Circle on the line */}
                    <div 
                      className="absolute w-4 h-4 bg-orange-500 border-4 border-slate-900 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.8)] z-10 transition-all duration-300 group-hover:scale-150 cursor-pointer"
                      style={{ 
                        bottom: `${(val / (maxWeekly * 1.2)) * 100}%`,
                        transform: 'translateY(50%)'
                      }}
                    ></div>
                    
                    {/* X-Axis Label */}
                    <div className="absolute -bottom-8 flex flex-col items-center">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{lastSevenDayNames[idx]}</span>
                      {idx === 6 && <span className="text-[8px] text-orange-500/80 font-bold mt-1">Today</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Recent Activity
              </h2>
              <button onClick={() => navigate('/tasks')} className="text-sm text-orange-500 hover:text-orange-400 font-medium transition-colors">View All</button>
            </div>
            <div className="divide-y divide-slate-700/50">
              {recentTasks.map(task => (
                <div key={task._id} className="p-6 hover:bg-slate-700/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                  <div className="flex gap-4 items-center">
                    <div className={`w-2 h-12 rounded-full ${task.status === 'completed' ? 'bg-emerald-500' : task.status === 'in-progress' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                    <div>
                      <h3 className="font-bold text-slate-100 mb-1 group-hover:text-orange-400 transition-colors">{task.title}</h3>
                      <p className="text-sm text-slate-400 line-clamp-1">{task.description || 'No description provided for this task.'}</p>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      task.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {task.status === 'in-progress' ? 'In Progress' : task.status}
                    </span>
                    {task.dueDate && (
                      <span className={`text-xs font-medium flex items-center gap-1 ${(new Date(task.dueDate) < new Date() && task.status !== 'completed') ? 'text-red-400' : 'text-slate-500'}`}>
                        <Clock className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {recentTasks.length === 0 && (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 mb-4 border border-slate-700">
                    <CheckSquare className="w-10 h-10 text-slate-500" />
                  </div>
                  <h3 className="text-slate-100 font-bold text-lg mb-2">No activity yet</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto">
                    Start creating and completing tasks to see your progress here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* REAL Weekly Goal Mini */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Target className="w-40 h-40" />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-1">Weekly Goal</h3>
              <p className="text-orange-100 text-sm mb-6">Tasks completed in last 7 days</p>
              
              <div className="flex items-end gap-2 mb-4">
                <span className="text-6xl font-black">{completedLastSevenDays}</span>
                <span className="text-orange-200 text-xl pb-2 font-bold">/ {weeklyGoal}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-orange-100">
                  <span>Progress</span>
                  <span>{Math.round(goalProgress)}%</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-3 relative">
                  <div 
                    className="bg-white rounded-full h-3 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                    style={{ width: `${goalProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="mt-6 text-xs text-orange-100 italic">
                {goalProgress >= 100 ? "Goal achieved! Excellent work." : `Complete ${weeklyGoal - completedLastSevenDays} more tasks to hit your target!`}
              </p>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              Quick Tip
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Achieving your weekly goal helps maintain team momentum. Try breaking larger projects into smaller, manageable tasks for better tracking!
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
