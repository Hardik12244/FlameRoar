import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorldUI } from '../context/WorldUIContext';
import { mockEvents } from '../data/mockWorld';
import { User, Shield, Zap, Sparkles, Sword, Brain, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const Profile = () => {
  const { user } = useAuth();
  const { savedEventIds } = useWorldUI();
  const savedStalls = mockEvents.filter((e) => savedEventIds.has(e.id));

  if (!user) return (
     <div className="w-full h-[60vh] flex items-center justify-center">
       <Activity className="h-8 w-8 animate-spin text-map-brown" />
     </div>
  );

  // Derive mock radar data from the user's level and xp for aesthetics
  const radarData = [
    { subject: 'Logic', A: Math.min(100, user.level * 10 + 20), fullMark: 100 },
    { subject: 'Syntax', A: Math.min(100, user.level * 8 + 40), fullMark: 100 },
    { subject: 'Algorithms', A: Math.min(100, user.level * 15 + 10), fullMark: 100 },
    { subject: 'Focus', A: user.focusEnergy || 100, fullMark: 100 },
    { subject: 'Speed', A: Math.min(100, (user.streak || 1) * 10 + 30), fullMark: 100 },
    { subject: 'Memory', A: Math.min(100, user.level * 12 + 25), fullMark: 100 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-6xl mx-auto pb-12"
    >
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-map-brown/25 bg-white/70 shadow-sm">
           <User className="h-6 w-6 text-map-brown" />
        </div>
        <div>
          <h1 className="font-heading text-3xl text-map-ink">Hero Codex</h1>
          <p className="text-map-ink-muted">Identity and skills</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="font-heading text-lg text-map-ink">Travel pouch</h2>
          <p className="text-sm text-map-ink-muted">
            {savedStalls.length} bookmarked event{savedStalls.length === 1 ? '' : 's'} from the marketplace.
          </p>
        </div>
        <Link
          to="/explore"
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-map-brown/25 bg-white/70 px-4 py-2 text-sm font-semibold text-map-brown shadow-sm transition hover:bg-white"
        >
          Browse stalls
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: ID Card */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.1 }}
           className="glass-panel group relative flex flex-col items-center overflow-hidden p-8 text-center"
        >
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-map-water/20 blur-3xl" />
          
          <div className="relative w-32 h-32 mb-6">
            <div className="absolute inset-0 z-10 rounded-full border-4 border-white/80 shadow-[var(--shadow-map-soft)] transition-all duration-500 group-hover:shadow-[var(--shadow-map-lift)]" />
            <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}&backgroundColor=transparent`} alt="Avatar" className="h-full w-full rounded-full border border-map-brown/20 object-cover bg-white/60" />
          </div>
          
          <h2 className="mb-2 text-3xl font-bold text-map-ink">{user.username}</h2>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-map-brown/25 bg-white/70 px-3 py-1 text-sm font-bold text-map-brown shadow-sm">
            <Shield className="w-4 h-4" /> 
            {user.class}
          </div>

          <div className="mt-4 grid w-full grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/55 bg-white/60 p-4 shadow-sm">
              <p className="mb-1 text-xs uppercase text-map-ink-muted">Rank level</p>
              <p className="font-mono text-2xl font-bold text-map-ink">{user.level}</p>
            </div>
            <div className="rounded-xl border border-white/55 bg-white/60 p-4 shadow-sm">
              <p className="mb-1 text-xs uppercase text-map-ink-muted">Total XP</p>
              <p className="font-mono text-2xl font-bold text-map-ink">{user.xp}</p>
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-xl border border-white/55 bg-white/60 p-4 shadow-sm">
              <div>
                 <p className="mb-1 flex justify-start text-xs uppercase text-map-ink-muted">Status</p>
                 <p className="text-sm font-bold text-map-water-deep">Active</p>
              </div>
              <Activity className="h-6 w-6 text-map-brown" />
            </div>
          </div>
        </motion.div>

        {/* Right Column: Skill Matrix Radar */}
        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.2 }}
           className="glass-panel p-8 lg:col-span-2"
        >
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-heading flex items-center gap-3 text-2xl text-map-ink">
              <Brain className="h-6 w-6 text-map-brown" />
              DSA capability matrix
            </h2>
          </div>

          <div className="h-[350px] w-full rounded-2xl border border-map-brown/15 bg-white/50 shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(45,58,45,0.12)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-map-ink-muted)', fontSize: 12, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Hero"
                  dataKey="A"
                  stroke="var(--color-map-water-deep)"
                  strokeWidth={2}
                  fill="var(--color-map-water)"
                  fillOpacity={0.35}
                  activeDot={{ r: 6, fill: '#fff', stroke: 'var(--color-map-water-deep)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default Profile;
