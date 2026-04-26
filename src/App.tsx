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
import { fetchUser, fetchStats } from './lib/api';
import { TimerProvider } from './contexts/TimerContext';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mock authentication for demo
  const login = async (email: string = "demo@focusforge.app") => {
    setLoading(true);
    try {
      const userData = await fetchUser(email);
      setUser(userData);
      const statsData = await fetchStats(userData.id);
      setSessions(statsData);
      setIsAuthenticated(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionComplete = (result: any) => {
    setUser(result.user);
    setSessions([...sessions, result.session]);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setSessions([]);
  };

  if (!isAuthenticated) {
    return <LandingPage onStart={() => login()} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a051a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
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
