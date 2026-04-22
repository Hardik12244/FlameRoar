import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorldUIProvider } from './context/WorldUIContext';
import { GameSyncProvider } from './context/GameSyncContext';
import { Layout } from './components/Layout';
import { ClerkAxiosInterceptor } from './components/ClerkAxiosInterceptor';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import GamePage from './pages/GamePage';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import LandingPitch from './pages/LandingPitch';
import ExplorePage from './pages/ExplorePage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import CommunitiesPage from './pages/CommunitiesPage';
import MentorsPage from './pages/MentorsPage';
import GuildPage from './pages/GuildPage';
import SkillTree from './pages/SkillTree';
import Inventory from './pages/Inventory';
import SkillLearningPage from './pages/SkillLearningPage';

const ProtectedRoute = ({ children }) => {
  const { user, needsOnboarding, loading } = useAuth();
  
  if (loading) return null;
  if (!user || needsOnboarding) return <Navigate to="/auth" replace />;
  
  return (
    <GameSyncProvider>
      <Layout>{children}</Layout>
    </GameSyncProvider>
  );
};

const PublicRoute = ({ children }) => {
  const { user, needsOnboarding, loading } = useAuth();
  if (loading) return null;
  if (user && !needsOnboarding) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPitch /></PublicRoute>} />
      <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/game" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
      <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
      <Route path="/opportunities" element={<ProtectedRoute><OpportunitiesPage /></ProtectedRoute>} />
      <Route path="/communities" element={<ProtectedRoute><CommunitiesPage /></ProtectedRoute>} />
      <Route path="/mentors" element={<ProtectedRoute><MentorsPage /></ProtectedRoute>} />
      <Route path="/guilds" element={<ProtectedRoute><GuildPage /></ProtectedRoute>} />
      <Route path="/skill-tree" element={<ProtectedRoute><SkillTree /></ProtectedRoute>} />
      <Route path="/skill-tree/learn/:topicId" element={<ProtectedRoute><SkillLearningPage /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <WorldUIProvider>
        <AuthProvider>
          <ClerkAxiosInterceptor>
            <AppRoutes />
          </ClerkAxiosInterceptor>
        </AuthProvider>
      </WorldUIProvider>
    </BrowserRouter>
  );
}

export default App;
