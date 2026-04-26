import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Trash2, Globe, ExternalLink, AlertCircle, Laptop, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  cn, 
  fetchBlockedSites, 
  addBlockedSite, 
  removeBlockedSite, 
  fetchBlockedApps, 
  addBlockedApp, 
  removeBlockedApp,
  fetchBlockedMobileApps,
  addBlockedMobileApp,
  removeBlockedMobileApp
} from '../lib/api';

export default function BlockedSites({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<'websites' | 'apps' | 'mobile'>('websites');
  const [sites, setSites] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [mobileApps, setMobileApps] = useState<any[]>([]);
  const [newInput, setNewInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("BlockedSites: User ID:", user?.id);
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [sitesData, appsData, mobileData] = await Promise.all([
        fetchBlockedSites(user.id),
        fetchBlockedApps(user.id),
        fetchBlockedMobileApps(user.id)
      ]);
      setSites(sitesData || []);
      setApps(appsData || []);
      setMobileApps(mobileData || []);
    } catch (err: any) {
      console.error("Failed to load data:", err);
      setError("Failed to load your block list. " + (err.message || ""));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = newInput.trim();
    if (!value || !user?.id || isAdding) {
      console.warn("Add blocked: ", { value, userId: user?.id, isAdding });
      return;
    }
    
    setIsAdding(true);
    try {
      console.log(`Adding ${activeTab}: ${value} for user ${user.id}`);
      if (activeTab === 'websites') {
        let url = value.toLowerCase();
        if (!url.startsWith('http')) url = 'https://' + url;
        const updated = await addBlockedSite(user.id, url);
        console.log("Updated sites:", updated);
        if (Array.isArray(updated)) setSites(updated);
      } else if (activeTab === 'apps') {
        const updated = await addBlockedApp(user.id, value);
        console.log("Updated apps:", updated);
        if (Array.isArray(updated)) setApps(updated);
      } else {
        const updated = await addBlockedMobileApp(user.id, value);
        console.log("Updated mobile apps:", updated);
        if (Array.isArray(updated)) setMobileApps(updated);
      }
      setNewInput('');
    } catch (err) {
      console.error("Failed to add item:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      if (activeTab === 'websites') {
        await removeBlockedSite(id);
        setSites(prev => prev.filter(s => s.id !== id));
      } else if (activeTab === 'apps') {
        await removeBlockedApp(id);
        setApps(prev => prev.filter(a => a.id !== id));
      } else {
        await removeBlockedMobileApp(id);
        setMobileApps(prev => prev.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const currentItems = activeTab === 'websites' ? sites : activeTab === 'apps' ? apps : mobileApps;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
          <ShieldAlert className="text-red-400" size={32} />
        </div>
        <h2 className="text-3xl font-bold text-text-main">Distraction Blocker</h2>
        <p className="text-text-dim mt-2">Add websites and apps that pull you away from your work.</p>
      </header>

      {/* Tabs */}
      <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
        <button
          onClick={() => setActiveTab('websites')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
            activeTab === 'websites' ? "bg-accent-purple text-white shadow-lg shadow-accent-purple/20" : "text-text-dim hover:text-text-main"
          )}
        >
          <Globe size={18} />
          Websites
        </button>
        <button
          onClick={() => setActiveTab('apps')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
            activeTab === 'apps' ? "bg-accent-purple text-white shadow-lg shadow-accent-purple/20" : "text-text-dim hover:text-text-main"
          )}
        >
          <Laptop size={18} />
          Desktop
        </button>
        <button
          onClick={() => setActiveTab('mobile')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
            activeTab === 'mobile' ? "bg-accent-purple text-white shadow-lg shadow-accent-purple/20" : "text-text-dim hover:text-text-main"
          )}
        >
          <Smartphone size={18} />
          Mobile
        </button>
      </div>

      <form onSubmit={handleAdd} className="w-full">
        <div className="relative">
          {activeTab === 'websites' ? (
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
          ) : activeTab === 'apps' ? (
            <Laptop className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
          ) : (
            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
          )}
          <input
            type="text"
            value={newInput}
            onChange={(e) => setNewInput(e.target.value)}
            placeholder={
              activeTab === 'websites' ? "e.g. youtube.com" : 
              activeTab === 'apps' ? "e.g. Discord, Slack" : 
              "e.g. Instagram, TikTok"
            }
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-text-main outline-none focus:border-accent-purple/50 transition-all"
          />
        </div>
      </form>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
        >
          <AlertCircle size={16} />
          {error}
        </motion.div>
      )}

      <div className="glass rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <h3 className="font-bold text-text-main">
            {activeTab === 'websites' ? 'Blocked Websites' : activeTab === 'apps' ? 'Blocked Desktop Apps' : 'Blocked Mobile Apps'}
          </h3>
          <span className="text-xs font-bold text-text-dim uppercase tracking-widest">
            {currentItems.length} Active
          </span>
        </div>
        
        <div className="divide-y divide-white/5">
          <AnimatePresence mode="wait">
            {currentItems.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 text-center"
              >
                <p className="text-text-dim italic">
                  {activeTab === 'websites' ? "No sites blocked yet." : 
                   activeTab === 'apps' ? "No desktop apps blocked yet." : 
                   "No mobile apps blocked yet."}
                </p>
              </motion.div>
            ) : (
              currentItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-4 flex items-center justify-between group hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-dim">
                      {activeTab === 'websites' ? <Globe size={16} /> : 
                       activeTab === 'apps' ? <Laptop size={16} /> : 
                       <Smartphone size={16} />}
                    </div>
                    <span className="text-text-main font-medium">
                      {activeTab === 'websites' ? item.url.replace(/^https?:\/\//, '') : item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeTab === 'websites' && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-text-dim hover:text-text-main transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-2 text-text-dim hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex gap-4">
        <AlertCircle className="text-amber-500 shrink-0" size={24} />
        <div>
          <p className="text-amber-200 font-bold text-sm">How it works</p>
          <p className="text-amber-200/60 text-xs mt-1 leading-relaxed">
            {activeTab === 'websites' 
              ? "While a focus session is active, FocusForge monitors your tab activity. If you switch to a blocked site, we'll show a gentle reminder to get back to work."
              : activeTab === 'apps'
              ? "App blocking requires the FocusForge Desktop Client. Once installed, it will automatically minimize or close the apps listed above during your focus sessions."
              : "Mobile blocking requires the FocusForge Mobile App. Once installed and granted Accessibility permissions, it will prevent you from opening the apps listed above during focus mode."}
          </p>
        </div>
      </div>
    </div>
  );
}
