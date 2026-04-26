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
import LandingPage from './components/LandingPage';
import { fetchUser, fetchStats, createOrUpdateUser } from './lib/api';
import { auth, logout as firebaseLogout } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { TimerProvider } from './contexts/TimerContext';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const userData = await createOrUpdateUser(firebaseUser.uid, firebaseUser.email!, firebaseUser.displayName!);
          setUser(userData);
          const statsData = await fetchStats(firebaseUser.uid);
          setSessions(statsData || []);
          setIsAuthenticated(true);
        } catch (err) {
          console.error("Auth process error:", err);
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setSessions([]);
      }
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a051a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent-purple/20 border-t-accent-purple rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage onStart={() => {}} />;
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
