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
  Area
} from 'recharts';
import { Zap, Clock, Target, Flame, TrendingUp, Award, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/api';

interface DashboardProps {
  user: any;
  sessions: any[];
}

const StatCard = ({ icon: Icon, label, value, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass p-6 rounded-3xl"
  >
    <div className="flex items-center gap-4">
      <div className={cn("p-3 rounded-2xl", color)}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-text-dim text-sm font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-text-main">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default function Dashboard({ user, sessions }: DashboardProps) {
  const totalFocusTime = sessions.reduce((acc, s) => acc + (s.completed ? s.duration : 0), 0);
  const hours = Math.floor(totalFocusTime / 3600);
  const minutes = Math.floor((totalFocusTime % 3600) / 60);

  const chartData = sessions.slice(-7).map(s => ({
    name: new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' }),
    minutes: Math.floor(s.duration / 60)
  }));

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text-main tracking-tight">Welcome back, {user?.name}!</h2>
          <p className="text-text-dim mt-1">You're on a {user?.streak || 0} day focus streak. Keep it up!</p>
        </div>
        <div className="flex items-center gap-3 glass px-6 py-3 rounded-2xl border-accent-purple/20">
          <div className="w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center">
            <Flame className="text-accent-purple fill-accent-purple" size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-dim font-bold">Current Streak</p>
            <p className="text-lg font-bold text-text-main">{user?.streak || 0} Days</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Clock} 
          label="Total Focus" 
          value={`${hours}h ${minutes}m`} 
          color="bg-accent-blue/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
          delay={0.1}
        />
        <StatCard 
          icon={Target} 
          label="Sessions" 
          value={sessions.length} 
          color="bg-accent-purple/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
          delay={0.2}
        />
        <StatCard 
          icon={Zap} 
          label="Total XP" 
          value={user?.xp || 0} 
          color="bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          delay={0.3}
        />
        <StatCard 
          icon={Award} 
          label="Level" 
          value={user?.level || 1} 
          color="bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-8 rounded-[2.5rem]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                <TrendingUp className="text-accent-blue" size={20} />
                Focus Trends
              </h3>
              <select className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-text-dim outline-none focus:border-accent-purple/50 transition-colors">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#020617', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="minutes" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorMin)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="glass p-8 rounded-[2.5rem] flex flex-col">
          <h3 className="text-xl font-bold text-text-main mb-6">Level Progression</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
              <svg className="w-full h-full -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
                <circle 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  stroke="currentColor" 
                  strokeWidth="10" 
                  fill="transparent" 
                  strokeDasharray="440" 
                  strokeDashoffset={440 - (440 * ((user?.xp % 1000) / 1000))}
                  className="text-accent-purple"
                  style={{ strokeLinecap: 'round' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-text-main">{user?.level || 1}</span>
                <span className="text-[10px] uppercase tracking-widest text-text-dim font-bold">Level</span>
              </div>
            </div>
            <p className="text-center text-text-dim text-sm mb-2">
              <span className="text-text-main font-bold">{1000 - (user?.xp % 1000)} XP</span> to Level {user?.level + 1}
            </p>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(user?.xp % 1000) / 10}%` }}
                className="h-full bg-accent-purple shadow-[0_0_10px_rgba(168,85,247,0.5)]"
              />
            </div>
          </div>
          
          <div className="mt-8 space-y-4">
            <p className="text-xs font-bold text-text-dim uppercase tracking-widest">Recent Achievements</p>
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-dim">
                  <Award size={20} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
