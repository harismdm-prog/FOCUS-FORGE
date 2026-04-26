import React, { useState } from 'react';
import { Zap, Shield, Trophy, ArrowRight, Timer, BarChart3, Sparkles, X, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithGoogle } from '../lib/firebase';

export default function LandingPage() {
  const [showDemo, setShowDemo] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await signInWithGoogle();
      // App.tsx handles the state transition via onAuthStateChanged
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked-by-user') {
        setLoginError("Sign-in popup was blocked or closed. Please try again.");
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Just reset, don't show error for cancel
      } else {
        console.error("Login failed:", err);
        setLoginError("Something went wrong during sign-in. Please try again.");
      }
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-text-main overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-blue/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-purple/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Zap className="text-accent-purple fill-accent-purple" size={24} />
          <span className="text-2xl font-bold tracking-tight">FocusForge</span>
        </div>
        <div className="flex items-center gap-4">
          {loginError && (
            <span className="text-red-500 text-xs font-medium bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
              {loginError}
            </span>
          )}
          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="btn btn-ghost !px-8 !py-2.5 !text-sm disabled:opacity-50"
          >
            {isLoggingIn ? 'Connecting...' : 'Sign In with Google'}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-xs font-bold uppercase tracking-widest mb-8">
            <Sparkles size={14} />
            The Ultimate Focus Tool for Students
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8">
            Master Your Time.<br />
            <span className="text-gradient">Forge Your Future.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-text-dim text-lg md:text-xl mb-12 leading-relaxed">
            Stop procrastinating and start achieving. FocusForge combines a premium Pomodoro timer with distraction blocking and RPG-style gamification to help you stay in the zone.
          </p>
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button 
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="btn btn-primary !px-12 !py-6 !text-lg shadow-2xl shadow-accent-purple/20 group disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Connecting...
                    </div>
                  ) : (
                    <>
                      Sign In with Google
                      <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setShowDemo(true)}
                  className="btn btn-ghost !px-12 !py-6 !text-lg"
                >
                  Watch Demo
                </button>
              </div>
              {loginError && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm font-medium bg-red-500/10 px-6 py-3 rounded-2xl border border-red-500/20"
                >
                  {loginError}
                </motion.p>
              )}
            </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-40">
          {[
            { icon: Timer, title: 'Smart Timer', desc: 'Customizable Pomodoro cycles with ambient sounds and background support.' },
            { icon: Shield, title: 'Distraction Blocker', desc: 'Block distracting websites and get AI-powered focus suggestions.' },
            { icon: Trophy, title: 'Gamified Growth', desc: 'Earn XP, level up, and unlock achievements as you build study habits.' }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass p-10 rounded-[2.5rem] text-left hover:border-accent-purple/30 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent-purple/10 flex items-center justify-center mb-6 text-accent-purple group-hover:scale-110 transition-transform">
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-text-main">{feature.title}</h3>
              <p className="text-text-dim leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg-dark/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass max-w-4xl w-full aspect-video rounded-[2.5rem] overflow-hidden relative"
            >
              <button 
                onClick={() => setShowDemo(false)}
                className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                <X size={24} />
              </button>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-accent-purple/20 flex items-center justify-center mb-6 text-accent-purple">
                  <PlayCircle size={48} />
                </div>
                <h3 className="text-3xl font-bold text-text-main mb-4">FocusForge Experience</h3>
                <p className="text-text-dim max-w-md mx-auto leading-relaxed">
                  Imagine a world where your productivity is rewarded. FocusForge turns deep work into a game, helping you build lasting habits through visual feedback and distraction-free environments.
                </p>
                <div className="mt-10 grid grid-cols-3 gap-6 w-full max-w-2xl">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <Timer className="mx-auto mb-2 text-accent-blue" size={24} />
                    <p className="text-xs font-bold text-text-main">Deep Work</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <Shield className="mx-auto mb-2 text-accent-purple" size={24} />
                    <p className="text-xs font-bold text-text-main">Zero Distractions</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <Trophy className="mx-auto mb-2 text-amber-500" size={24} />
                    <p className="text-xs font-bold text-text-main">Level Up</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] py-16 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Zap size={20} />
            <span className="font-bold">FocusForge</span>
          </div>
          <div className="flex gap-12 text-text-dim text-sm font-medium">
            <a href="#" className="hover:text-text-main transition-colors">Privacy</a>
            <a href="#" className="hover:text-text-main transition-colors">Terms</a>
            <a href="#" className="hover:text-text-main transition-colors">Contact</a>
          </div>
          <p className="text-text-dim/50 text-xs">© 2026 FocusForge. Built for deep work.</p>
        </div>
      </footer>
    </div>
  );
}
