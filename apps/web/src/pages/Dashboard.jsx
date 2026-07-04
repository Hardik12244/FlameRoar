import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Shield, 
  Zap, 
  Trophy, 
  Coins, 
  Flame, 
  Star, 
  Crown, 
  Target,
  Sparkles,
  Sword,
  History
} from "lucide-react";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading || !user) return null;

  const username = user.username || "MockHero";
  const userClass = user.class || "Array Knight";
  const level = Number(user.level || 1);
  const xp = Number(user.xp || 0);
  const coins = Number(user.coins || 0);
  const streak = Number(user.streak || 0);
  const focus = Number(user.focusEnergy || 100);
  const title = user.activeTitle || "Rookie Coder";
  const solved = Number(user.questionsSolved || 0);

  const nextLevelXP = level * 100;
  const progress = (xp / nextLevelXP) * 100;
  const timeSpent = `${Math.max(1, Math.floor(xp / 120))}h`;
  const attempted = Number(user.questionsAttempted || solved || 0);
  const accuracy = attempted > 0 ? Math.round((solved / attempted) * 100) : 100;
  const recentActivities = Array.isArray(user.activityHistory) ? user.activityHistory.slice(0, 3) : [];

  const quickActions = [
    { label: 'Marketplace', icon: Coins, color: 'text-map-brown', bg: 'bg-white', border: 'border-white', route: '/explore' },
    { label: 'Guilds', icon: Trophy, color: 'text-map-brown', bg: 'bg-white', border: 'border-white', route: '/guilds' },
    { label: 'Skill Tree', icon: Star, color: 'text-map-brown', bg: 'bg-white', border: 'border-white', route: '/skill-tree' },
    { label: 'History', icon: History, color: 'text-map-brown', bg: 'bg-white', border: 'border-white', route: '/history' },
  ];

  return (
    <div className="relative w-full text-map-ink overflow-x-hidden">
      <div className="relative z-10">


        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 items-start">

          {/* 🌟 ENHANCED PROFILE CARD (LIGHT THEME) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative group"
          >
            {/* SOFT SHADOW EFFECT */}
            <div className="absolute -inset-1 bg-map-brown/5 rounded-4xl blur transition duration-1000 group-hover:duration-200" />
            
            <div className="relative bg-white/80 backdrop-blur-2xl border border-white rounded-4xl p-8 shadow-(--shadow-map-soft) flex flex-col gap-6 overflow-hidden">
              
              {/* SHINE ANIMATION (LIGHT MODE) */}
              <div className="absolute top-0 -left-full w-full h-full bg-linear-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] group-hover:left-full transition-all duration-1000 ease-in-out" />

              {/* CARD HEADER: RANK & TITLE */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-map-brown/10 border border-map-brown/20 text-[10px] font-black tracking-[0.2em] text-map-brown uppercase">
                    <Crown className="w-3 h-3" />
                    {title}
                  </div>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-map-ink leading-none">{username}</h2>
                  <p className="text-map-brown text-xs font-bold uppercase tracking-widest mt-1 opacity-70">{userClass} • LVL {level}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-map-sand to-map-sand-deep border border-white flex items-center justify-center text-xl font-black text-map-brown shadow-sm">
                  {level}
                </div>
              </div>

              {/* MAIN AVATAR SECTION */}
              <div className="relative py-4">
                <div className="absolute inset-0 bg-map-water/10 blur-3xl rounded-full scale-75 animate-pulse" />
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 w-40 h-40 mx-auto"
                >
                  <img
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${username}`}
                    alt="Hero"
                    className="w-full h-full drop-shadow-[0_8px_16px_rgba(139,90,43,0.15)]"
                  />
                </motion.div>
                
                {/* FLOATING BADGES */}
                <div className="absolute top-0 right-4 p-2 bg-white border border-map-brown/10 rounded-xl shadow-md">
                  <Flame className="w-5 h-5 text-orange-500 animate-bounce" />
                </div>
              </div>

              {/* EXPERIENCE PROGRESS */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-map-ink-muted">Experience</span>
                  <span className="text-xs font-mono text-map-brown">{xp} / {nextLevelXP} XP</span>
                </div>
                <div className="h-2.5 bg-map-ui rounded-full border border-map-brown/5 overflow-hidden p-0.5 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-linear-to-r from-map-grass-deep via-map-grass to-map-water rounded-full shadow-sm"
                  />
                </div>
              </div>

              {/* STAT GRID */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-white/50 border border-map-brown/5 p-2.5 rounded-2xl flex flex-col items-center gap-1 group/stat hover:bg-white transition-colors shadow-sm">
                  <Zap className="w-4 h-4 text-yellow-600 group-hover/stat:scale-125 transition-transform" />
                  <span className="text-[9px] text-map-ink-muted uppercase font-black">Focus</span>
                  <span className="text-xs font-black text-map-ink">{focus}%</span>
                </div>
                <div className="bg-white/50 border border-map-brown/5 p-2.5 rounded-2xl flex flex-col items-center gap-1 group/stat hover:bg-white transition-colors shadow-sm">
                  <Flame className="w-4 h-4 text-orange-500 group-hover/stat:scale-125 transition-transform" />
                  <span className="text-[9px] text-map-ink-muted uppercase font-black">Streak</span>
                  <span className="text-xs font-black text-map-ink">{streak}d</span>
                </div>
                <div className="bg-white/50 border border-map-brown/5 p-2.5 rounded-2xl flex flex-col items-center gap-1 group/stat hover:bg-white transition-colors shadow-sm">
                  <Target className="w-4 h-4 text-emerald-600 group-hover/stat:scale-125 transition-transform" />
                  <span className="text-[9px] text-map-ink-muted uppercase font-black">Solved</span>
                  <span className="text-xs font-black text-map-ink">{solved}</span>
                </div>
                <div className="bg-white/50 border border-map-brown/5 p-2.5 rounded-2xl flex flex-col items-center gap-1 group/stat hover:bg-white transition-colors shadow-sm">
                  <Shield className="w-4 h-4 text-blue-600 group-hover/stat:scale-125 transition-transform" />
                  <span className="text-[9px] text-map-ink-muted uppercase font-black">Accuracy</span>
                  <span className="text-xs font-black text-map-ink">{accuracy}%</span>
                </div>
                <div className="bg-white/50 border border-map-brown/5 p-2.5 rounded-2xl flex flex-col items-center gap-1 group/stat hover:bg-white transition-colors shadow-sm">
                  <Trophy className="w-4 h-4 text-map-brown group-hover/stat:scale-125 transition-transform" />
                  <span className="text-[9px] text-map-ink-muted uppercase font-black">Rank</span>
                  <span className="text-xs font-black text-map-ink">#124</span>
                </div>
                <div className="bg-white/50 border border-map-brown/5 p-2.5 rounded-2xl flex flex-col items-center gap-1 group/stat hover:bg-white transition-colors shadow-sm">
                  <Coins className="w-4 h-4 text-amber-500 group-hover/stat:scale-125 transition-transform" />
                  <span className="text-[9px] text-map-ink-muted uppercase font-black">Coins</span>
                  <span className="text-xs font-black text-map-ink">{coins}</span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col gap-3 mt-2">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/inventory")}
                  className="w-full py-4 bg-linear-to-r from-map-brown to-map-brown-soft rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-md border border-white/10 flex items-center justify-center gap-2 group/btn"
                >
                  <Sword className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                  View Inventory
                </motion.button>
              </div>

            </div>
          </motion.div>

          {/* RIGHT SIDE: WORLD & MAP */}
          <div className="flex flex-col gap-10">

            {/* MAIN MAP INTERFACE */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group rounded-[2.5rem] overflow-hidden bg-map-sand border-4 border-white shadow-(--shadow-map-soft)"
            >
              <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/30 to-transparent z-10 pointer-events-none" />
              
              <div className="absolute top-8 left-8 z-20">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-map-brown/10 shadow-sm">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-map-ink">Active Region: The Crossroads</span>
                </div>
              </div>

              <img
                src="/assets/map.png"
                alt="Map"
                className="w-full aspect-video object-cover opacity-90 group-hover:scale-105 transition-all duration-700"
              />

              <div className="absolute inset-0 bg-linear-to-t from-map-brown/40 via-transparent to-transparent opacity-80" />

              <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end z-20">
                <div className="max-w-xs">
                  <h3 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none drop-shadow-lg">Enter the World</h3>
                  <p className="mt-2 text-white text-sm font-medium leading-relaxed drop-shadow-md">Continue your quest for mastery. New challenges await in the Forbidden Array Woods.</p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.06, x: 2, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate("/game?mode=fullscreen")}
                  className="min-w-44 h-16 px-5 rounded-2xl border-2 border-map-brown/25 bg-linear-to-b from-map-sand to-map-sand-deep text-map-brown shadow-[0_10px_20px_rgba(99,76,54,0.25)] flex items-center justify-center gap-2 group/play transition-transform"
                >
                  <Sword className="w-5 h-5 group-hover/play:rotate-12 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-[0.18em]">Enter the Game</span>
                  <ChevronRight className="w-4 h-4 text-map-brown/80 translate-x-0.5 group-hover/play:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>

            {/* QUICK ACTIONS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickActions.map((item, i) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.9)' }}
                  onClick={() => navigate(item.route)}
                  className={`p-5 rounded-3xl bg-white/60 border ${item.border} flex flex-col items-center gap-3 transition-all shadow-(--shadow-map-soft)`}
                >
                  <div className={`p-3.5 rounded-2xl ${item.bg} shadow-inner`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-map-ink text-center">{item.label}</span>
                </motion.button>
              ))}
            </div>

            {/* RECENT ACTIVITY & ANALYTICS PREVIEW */}
            <div className="bg-white/80 backdrop-blur-md border border-white rounded-[2.5rem] p-6 shadow-(--shadow-map-soft)">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-map-brown" />
                  <h4 className="font-black text-sm uppercase tracking-wider text-map-ink">Recent Learning Activity</h4>
                </div>
                <button 
                  onClick={() => navigate('/history')}
                  className="text-xs font-bold text-map-brown hover:underline"
                >
                  View All History →
                </button>
              </div>
              
              {recentActivities.length === 0 ? (
                <p className="text-xs text-map-ink-muted italic py-4 text-center bg-white/50 rounded-2xl border border-dashed border-map-brown/10">
                  No recent activities recorded. Jump into the game world to start solving coding challenges!
                </p>
              ) : (
                <div className="space-y-2.5">
                  {recentActivities.map((act, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white/60 border border-map-brown/5 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-bold text-map-ink capitalize">{act.topic || 'Coding Challenge'}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-map-brown/10 text-map-brown font-bold uppercase">{act.type}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600">+{act.xpGained || 0} XP</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FOOTER STATS */}
            <div className="flex justify-between items-center bg-white/60 p-6 rounded-[2.5rem] border border-white shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="flex -space-x-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-map-sand flex items-center justify-center text-[10px] font-bold text-map-brown">
                        H{i}
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-4 border-white bg-map-grass flex items-center justify-center text-[10px] font-bold text-map-ink">
                      +12
                    </div>
                  </div>
                  <p className="text-xs text-map-ink-muted font-medium">15 Heroes currently exploring this region</p>
                </div>
                <div className="flex items-center gap-2 text-map-ink-muted">
                  <Sparkles className="w-4 h-4 text-map-brown" />
                  <span className="text-xs font-bold uppercase tracking-wider">Playtime: {timeSpent}</span>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;