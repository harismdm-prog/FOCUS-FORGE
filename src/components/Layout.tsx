import React, { useState, useEffect } from 'react';
import { 
  Timer, 
  LayoutDashboard, 
  ShieldAlert, 
  Trophy, 
  Settings, 
  LogOut,
  Menu,
  X,
  Zap,
  ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/src/lib/api';
import { motion, AnimatePresence } from 'motion/react';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick?: () => void;
  key?: string;
}

const NavItem = ({ to, icon: Icon, label, active, onClick }: NavItemProps) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 group relative",
      active 
        ? "bg-accent-purple/10 text-accent-purple border border-accent-purple/20" 
        : "text-text-dim hover:bg-white/5 hover:text-text-main"
    )}
    title={label}
  >
    <Icon size={24} className={cn("transition-transform duration-200", active ? "scale-110" : "group-hover:scale-110")} />
    {active && (
      <motion.div 
        layoutId="active-pill"
        className="absolute -right-6 w-1.5 h-1.5 rounded-full bg-accent-purple shadow-[0_0_8px_rgba(168,85,247,0.6)]"
      />
    )}
  </Link>
);

export default function Layout({ children, user, onLogout }: { children: React.ReactNode, user: any, onLogout: () => void }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/focus', icon: Timer, label: 'Focus Timer' },
    { to: '/stats', icon: Zap, label: 'Productivity' },
    { to: '/blocker', icon: ShieldAlert, label: 'Blocker' },
    { to: '/rewards', icon: Trophy, label: 'Rewards' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen flex bg-bg-dark">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-20 border-r border-white/[0.08] bg-bg-dark/50 backdrop-blur-xl p-4 sticky top-0 h-screen items-center">
        <div className="mb-12 mt-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-lg shadow-accent-blue/20">
            <Zap className="text-white fill-white" size={20} />
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-6">
          {navItems.map((item) => (
            <NavItem 
              key={item.to} 
              {...item} 
              active={location.pathname === item.to} 
            />
          ))}
        </nav>

        <div className="mt-auto pb-6">
          <button 
            onClick={onLogout}
            className="w-12 h-12 flex items-center justify-center rounded-xl text-text-dim hover:bg-red-500/10 hover:text-red-400 transition-all duration-200" 
            title="Sign Out"
          >
            <LogOut size={24} />
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-dark border-b border-white/[0.08] z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Zap className="text-accent-purple" size={20} />
          <span className="font-bold text-text-main">FocusForge</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-text-main">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] glass-dark p-6 lg:hidden"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-2">
                <Zap className="text-accent-purple" size={24} />
                <span className="font-bold text-2xl text-text-main">FocusForge</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-text-main">
                <X size={24} />
              </button>
            </div>
            <nav className="space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    location.pathname === item.to 
                      ? "bg-accent-purple/10 text-accent-purple border border-accent-purple/20" 
                      : "text-text-dim hover:bg-white/5 hover:text-text-main"
                  )}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="hidden lg:flex items-center justify-between px-10 py-8 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-text-main">FocusForge</h1>
            <p className="text-sm text-text-dim">Session: {location.pathname.substring(1).charAt(0).toUpperCase() + location.pathname.substring(2)}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-semibold text-text-main">{user?.name || 'Alex Rivera'}</div>
              <div className="text-xs text-accent-purple font-medium">Level {user?.level || 14} Focus Architect</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-accent-purple flex items-center justify-center text-white font-bold overflow-hidden">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 p-6 lg:px-10 lg:pb-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
