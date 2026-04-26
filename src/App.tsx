/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TimerComponent from './components/Timer';
import BlockedSites from './components/BlockedSites';
import Rewards from './components/Rewards';
import Productivity from './components/Productivity';
import Settings from './components/Settings';
import { Zap } from 'lucide-react';
import { motion } from 'motion/react';
import LandingPage from './components/LandingPage';
import { fetchUser, fetchStats, createOrUpdateUser } from './lib/api';
import { auth, logout as firebaseLogout } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { TimerProvider } from './contexts/TimerContext';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsProcessingAuth(true);
        try {
          const email = firebaseUser.email || `${firebaseUser.uid}@noemail.focusforge.app`;
          const name = firebaseUser.displayName || email.split('@')[0] || 'Forge User';
          
          const userData = await createOrUpdateUser(
            firebaseUser.uid, 
            email, 
            name
          );
          setUser(userData);
          const statsData = await fetchStats(firebaseUser.uid);
          setSessions(statsData || []);
          setIsAuthenticated(true);
        } catch (err) {
          console.error("Auth process error:", err);
          setIsAuthenticated(false);
          setUser(null);
        } finally {
          setIsProcessingAuth(false);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setSessions([]);
        setIsProcessingAuth(false);
      }
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSessionComplete = (result: any) => {
    if (result.user) setUser(result.user);
    if (result.session) setSessions(prev => [...prev, result.session]);
  };

  const logout = async () => {
    try {
      await firebaseLogout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (isInitializing || (isProcessingAuth && !isAuthenticated)) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center gap-6">
        <Zap className="text-accent-purple fill-accent-purple animate-pulse" size={48} />
        <div className="flex flex-col items-center gap-2">
          <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-accent-purple"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <p className="text-text-dim text-xs font-bold uppercase tracking-[0.2em]">
            {isProcessingAuth ? "Forging Your Profile..." : "Initializing Forge..."}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <Router>
      <TimerProvider user={user} onSessionComplete={handleSessionComplete}>
        <Layout user={user} onLogout={logout}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard user={user} sessions={sessions} />} />
            <Route path="/focus" element={<TimerComponent user={user} onSessionComplete={handleSessionComplete} />} />
            <Route path="/blocker" element={<BlockedSites user={user} />} />
            <Route path="/rewards" element={<Rewards user={user} />} />
            <Route path="/stats" element={<Productivity user={user} sessions={sessions} />} />
            <Route path="/settings" element={<Settings user={user} onUserUpdate={(updated) => setUser(updated)} />} />
          </Routes>
        </Layout>
      </TimerProvider>
    </Router>
  );
}
