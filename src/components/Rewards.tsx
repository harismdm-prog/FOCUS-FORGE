import React from 'react';
import { Trophy, Star, Zap, Award, Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/api';

export default function Rewards({ user }: { user: any }) {
  const achievements = [
    { id: 1, title: 'First Steps', description: 'Complete your first focus session', icon: Star, unlocked: (user?.xp || 0) > 0 },
    { id: 2, title: 'Deep Diver', description: 'Focus for 5 hours total', icon: Zap, unlocked: (user?.xp || 0) >= 3000 },
    { id: 3, title: 'Consistency King', description: 'Maintain a 7-day streak', icon: Trophy, unlocked: (user?.streak || 0) >= 7 },
    { id: 4, title: 'Early Bird', description: 'Complete a session before 8 AM', icon: Award, unlocked: false },
    { id: 5, title: 'Focus Master', description: 'Reach Level 10', icon: Star, unlocked: (user?.level || 1) >= 10 },
    { id: 6, title: 'Night Owl', description: 'Complete a session after 10 PM', icon: Zap, unlocked: false },
  ];

  return (
    <div className="space-y-10">
      <header className="text-center max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold text-text-main">Rewards & Achievements</h2>
        <p className="text-text-dim mt-3 text-lg">Earn XP by focusing and unlock exclusive badges and themes to personalize your experience.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement, idx) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "glass p-8 rounded-[2.5rem] relative overflow-hidden group transition-all duration-300",
              achievement.unlocked ? "border-accent-purple/30" : "opacity-60 grayscale"
            )}
          >
            {achievement.unlocked && (
              <div className="absolute top-0 right-0 p-4">
                <CheckCircle2 className="text-accent-purple" size={20} />
              </div>
            )}
            
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110",
              achievement.unlocked ? "bg-accent-purple/20 text-accent-purple" : "bg-white/5 text-text-dim"
            )}>
              <achievement.icon size={32} />
            </div>

            <h3 className="text-xl font-bold text-text-main mb-2">{achievement.title}</h3>
            <p className="text-text-dim text-sm leading-relaxed">{achievement.description}</p>
            
            {!achievement.unlocked && (
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-text-dim uppercase tracking-widest">
                <Lock size={12} />
                Locked
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="glass p-10 rounded-[3rem] bg-gradient-to-br from-accent-purple/10 to-accent-blue/10 border-accent-purple/20">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="shrink-0">
            <div className="w-32 h-32 rounded-full bg-accent-purple flex items-center justify-center shadow-2xl shadow-accent-purple/40">
              <Star className="text-white fill-white" size={48} />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-text-main mb-2">Unlock Premium Themes</h3>
            <p className="text-text-dim mb-6">Reach Level 5 to unlock the "Midnight Nebula" and "Cyberpunk Dusk" themes. You're currently Level {user?.level || 1}.</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-text-dim font-bold text-sm flex items-center gap-2">
                <Lock size={16} />
                Midnight Nebula
              </div>
              <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-text-dim font-bold text-sm flex items-center gap-2">
                <Lock size={16} />
                Cyberpunk Dusk
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
