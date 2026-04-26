import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  History, 
  CheckCircle2, 
  XCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/api';

interface ProductivityProps {
  user: any;
  sessions: any[];
}

export default function Productivity({ user, sessions }: ProductivityProps) {
  const chartData = sessions.slice(-14).map(s => ({
    name: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    minutes: Math.floor(s.duration / 60),
    completed: s.completed ? 1 : 0
  }));

  const totalMinutes = sessions.reduce((acc, s) => acc + (s.completed ? Math.floor(s.duration / 60) : 0), 0);
  const avgSession = sessions.length > 0 ? Math.floor(totalMinutes / sessions.length) : 0;
  const completionRate = sessions.length > 0 
    ? Math.round((sessions.filter(s => s.completed).length / sessions.length) * 100) 
    : 0;

  const COLORS = ['#a855f7', '#3b82f6', '#10b981', '#f59e0b'];

  const handleExportCSV = () => {
    if (sessions.length === 0) return;
    
    const headers = ['Date', 'Duration (seconds)', 'Status', 'XP Earned'];
    const rows = sessions.map(s => [
      new Date(s.date).toLocaleString(),
      s.duration,
      s.completed ? 'Completed' : 'Interrupted',
      s.completed ? Math.floor(s.duration / 60) * 10 : 0
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FocusForge_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h2 className="text-4xl font-bold text-text-main">Productivity Analytics</h2>
        <p className="text-text-dim mt-2">Deep dive into your focus patterns and session history.</p>
      </header>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-3xl border-accent-blue/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-accent-blue/10 text-accent-blue">
              <Clock size={20} />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowUpRight size={10} /> +12%
            </span>
          </div>
          <p className="text-text-dim text-xs font-bold uppercase tracking-widest">Avg. Session</p>
          <p className="text-3xl font-bold text-text-main mt-1">{avgSession}m</p>
        </div>

        <div className="glass p-6 rounded-3xl border-accent-purple/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-accent-purple/10 text-accent-purple">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowUpRight size={10} /> +5%
            </span>
          </div>
          <p className="text-text-dim text-xs font-bold uppercase tracking-widest">Completion Rate</p>
          <p className="text-3xl font-bold text-text-main mt-1">{completionRate}%</p>
        </div>

        <div className="glass p-6 rounded-3xl border-amber-500/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Calendar size={20} />
            </div>
            <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowDownRight size={10} /> -2%
            </span>
          </div>
          <p className="text-text-dim text-xs font-bold uppercase tracking-widest">Active Days</p>
          <p className="text-3xl font-bold text-text-main mt-1">{new Set(sessions.map(s => new Date(s.date).toDateString())).size}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass p-8 rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
              <TrendingUp className="text-accent-blue" size={20} />
              Focus Intensity (14 Days)
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ 
                    backgroundColor: '#020617', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Bar 
                  dataKey="minutes" 
                  fill="#a855f7" 
                  radius={[6, 6, 0, 0]} 
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution */}
        <div className="glass p-8 rounded-[2.5rem] flex flex-col">
          <h3 className="text-xl font-bold text-text-main mb-8">Session Quality</h3>
          <div className="flex-1 flex items-center justify-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: sessions.filter(s => s.completed).length },
                      { name: 'Interrupted', value: sessions.filter(s => !s.completed).length },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#a855f7" />
                    <Cell fill="rgba(255,255,255,0.05)" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent-purple" />
                <span className="text-text-dim">Completed</span>
              </div>
              <span className="text-text-main font-bold">{sessions.filter(s => s.completed).length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <span className="text-text-dim">Interrupted</span>
              </div>
              <span className="text-text-main font-bold">{sessions.filter(s => !s.completed).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Session History Table */}
      <div className="glass rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
            <History className="text-accent-purple" size={20} />
            Focus History
          </h3>
          <button 
            onClick={handleExportCSV}
            className="text-xs font-bold text-accent-purple hover:underline uppercase tracking-widest"
          >
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-text-dim text-[10px] font-bold uppercase tracking-widest">
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4">Duration</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">XP Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sessions.slice().reverse().map((session) => (
                <tr key={session.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-4 text-sm text-text-main">
                    {new Date(session.date).toLocaleDateString()} 
                    <span className="text-text-dim ml-2 text-xs">
                      {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-sm text-text-main font-medium">
                    {Math.floor(session.duration / 60)}m
                  </td>
                  <td className="px-8 py-4">
                    {session.completed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full uppercase">
                        <CheckCircle2 size={10} /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded-full uppercase">
                        <XCircle size={10} /> Interrupted
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-4 text-sm font-bold text-amber-500">
                    +{session.completed ? Math.floor(session.duration / 60) * 10 : 0} XP
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-text-dim italic">
                    No focus sessions recorded yet. Time to start your first one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
