import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Moon, 
  Volume2, 
  Shield, 
  Trash2, 
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, updateUser, resetStats } from '../lib/api';

interface SettingsProps {
  user: any;
  onUserUpdate: (updatedUser: any) => void;
}

export default function Settings({ user, onUserUpdate }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    autoStartBreaks: user?.settings?.autoStartBreaks ?? false,
    autoStartFocus: user?.settings?.autoStartFocus ?? false,
    soundNotifications: user?.settings?.soundNotifications ?? true,
    browserNotifications: user?.settings?.browserNotifications ?? true,
    publicProfile: user?.settings?.publicProfile ?? false,
    shareFocusTrends: user?.settings?.shareFocusTrends ?? true,
    focusDuration: user?.settings?.focusDuration ?? 25,
    breakDuration: user?.settings?.breakDuration ?? 5,
  });

  const updateNumericSetting = (key: 'focusDuration' | 'breakDuration', value: number) => {
    setSettings(prev => ({ ...prev, [key]: Math.max(1, Math.min(120, value)) }));
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updateUser(user.id, { 
        name,
        settings 
      });
      onUserUpdate(updated);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all productivity data? This cannot be undone.")) return;
    
    setIsResetting(true);
    try {
      await resetStats(user.id);
      const updated = { ...user, xp: 0, level: 1, streak: 0, lastSessionDate: null };
      onUserUpdate(updated);
      alert("Data reset successfully.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const Toggle = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
    <div 
      onClick={onClick}
      className={cn(
        "w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300",
        active ? "bg-accent-purple" : "bg-white/10"
      )}
    >
      <motion.div 
        animate={{ x: active ? 24 : 4 }}
        initial={false}
        className={cn(
          "absolute top-1 w-4 h-4 rounded-full shadow-sm transition-colors duration-300",
          active ? "bg-white" : "bg-text-dim"
        )}
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <header>
        <h2 className="text-4xl font-bold text-text-main">Settings</h2>
        <p className="text-text-dim mt-2">Personalize your focus experience and manage your account.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Tabs (Vertical) */}
        <aside className="space-y-2">
          {[
            { id: 'profile', icon: User, label: 'Profile' },
            { id: 'timer', icon: Moon, label: 'Timer & Modes' },
            { id: 'notifications', icon: Bell, label: 'Notifications' },
            { id: 'privacy', icon: Shield, label: 'Privacy & Security' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                activeTab === tab.id 
                  ? "bg-accent-purple/10 text-accent-purple border border-accent-purple/20" 
                  : "text-text-dim hover:bg-white/5 hover:text-text-main"
              )}
            >
              <tab.icon size={20} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Profile Section */}
                <section className="glass p-8 rounded-[2.5rem] space-y-6">
                  <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                    <User className="text-accent-purple" size={20} />
                    Profile Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-2">Display Name</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-text-main outline-none focus:border-accent-purple/50 transition-all"
                        placeholder="Your Name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-2">Email Address</label>
                      <input 
                        type="email" 
                        value={user?.email}
                        disabled
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-text-dim cursor-not-allowed"
                      />
                      <p className="text-[10px] text-text-dim/50 mt-2 italic">Email cannot be changed for demo accounts.</p>
                    </div>
                  </div>
                </section>

                {/* Danger Zone */}
                <section className="glass p-8 rounded-[2.5rem] border-red-500/20 bg-red-500/5 space-y-6">
                  <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                    <AlertCircle size={20} />
                    Danger Zone
                  </h3>
                  <p className="text-sm text-red-400/70">Once you delete your account or reset your stats, there is no going back. Please be certain.</p>
                  <button 
                    onClick={handleReset}
                    disabled={isResetting}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all font-bold text-sm disabled:opacity-50"
                  >
                    {isResetting ? (
                      <div className="w-4 h-4 border-2 border-red-400/20 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                    Reset All Productivity Data
                  </button>
                </section>
              </motion.div>
            )}

            {activeTab === 'timer' && (
              <motion.div
                key="timer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <section className="glass p-8 rounded-[2.5rem] space-y-6">
                  <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                    <Moon className="text-accent-purple" size={20} />
                    Timer Settings
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-dim uppercase tracking-widest">Focus Duration (min)</label>
                      <input 
                        type="number" 
                        value={settings.focusDuration}
                        onChange={(e) => updateNumericSetting('focusDuration', parseInt(e.target.value) || 0)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-text-main outline-none focus:border-accent-purple/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-dim uppercase tracking-widest">Break Duration (min)</label>
                      <input 
                        type="number" 
                        value={settings.breakDuration}
                        onChange={(e) => updateNumericSetting('breakDuration', parseInt(e.target.value) || 0)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-text-main outline-none focus:border-accent-purple/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div>
                        <p className="font-medium text-text-main">Auto-start Breaks</p>
                        <p className="text-xs text-text-dim">Automatically start the break timer.</p>
                      </div>
                      <Toggle 
                        active={settings.autoStartBreaks} 
                        onClick={() => toggleSetting('autoStartBreaks')} 
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div>
                        <p className="font-medium text-text-main">Auto-start Focus</p>
                        <p className="text-xs text-text-dim">Automatically start the next focus session.</p>
                      </div>
                      <Toggle 
                        active={settings.autoStartFocus} 
                        onClick={() => toggleSetting('autoStartFocus')} 
                      />
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <section className="glass p-8 rounded-[2.5rem] space-y-6">
                  <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                    <Bell className="text-accent-blue" size={20} />
                    Notification Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div>
                        <p className="font-medium text-text-main">Sound Notifications</p>
                        <p className="text-xs text-text-dim">Play a sound when the timer ends.</p>
                      </div>
                      <Toggle 
                        active={settings.soundNotifications} 
                        onClick={() => toggleSetting('soundNotifications')} 
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div>
                        <p className="font-medium text-text-main">Browser Notifications</p>
                        <p className="text-xs text-text-dim">Show desktop alerts when sessions end.</p>
                      </div>
                      <Toggle 
                        active={settings.browserNotifications} 
                        onClick={() => toggleSetting('browserNotifications')} 
                      />
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <section className="glass p-8 rounded-[2.5rem] space-y-6">
                  <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                    <Shield className="text-accent-purple" size={20} />
                    Privacy & Security
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div>
                        <p className="font-medium text-text-main">Public Profile</p>
                        <p className="text-xs text-text-dim">Allow others to see your focus stats.</p>
                      </div>
                      <Toggle 
                        active={settings.publicProfile} 
                        onClick={() => toggleSetting('publicProfile')} 
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div>
                        <p className="font-medium text-text-main">Share Focus Trends</p>
                        <p className="text-xs text-text-dim">Contribute anonymous data to global trends.</p>
                      </div>
                      <Toggle 
                        active={settings.shareFocusTrends} 
                        onClick={() => toggleSetting('shareFocusTrends')} 
                      />
                    </div>
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-4">
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-emerald-400 font-medium text-sm"
              >
                <CheckCircle2 size={18} />
                Settings saved successfully!
              </motion.div>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary !px-12 !py-4 shadow-2xl shadow-accent-purple/20 flex items-center gap-2"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-bg-dark/20 border-t-bg-dark rounded-full animate-spin" />
              ) : (
                <Save size={20} />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
