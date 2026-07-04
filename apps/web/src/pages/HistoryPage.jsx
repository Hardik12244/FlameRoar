import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserService } from '../services/api';
import { motion } from 'framer-motion';
import { 
  History, 
  Sword, 
  BookOpen, 
  Crown, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Target, 
  Award, 
  Sparkles,
  Filter
} from 'lucide-react';
import { MapZone } from '../components/world/MapZone';

export default function HistoryPage() {
  const { user } = useAuth();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await UserService.getHistory();
        if (res.data && res.data.activityHistory) {
          setHistoryData(res.data.activityHistory);
        } else if (user && user.activityHistory) {
          setHistoryData(user.activityHistory);
        }
      } catch (err) {
        if (user && user.activityHistory) {
          setHistoryData(user.activityHistory);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const attempted = user?.questionsAttempted || historyData.length || 0;
  const solved = user?.questionsSolved || historyData.filter(h => h.isCorrect).length || 0;
  const accuracy = attempted > 0 ? Math.round((solved / attempted) * 100) : 100;
  const topicsCount = user?.learnedTopics?.length || 0;

  const filteredHistory = useMemo(() => {
    if (filter === 'all') return historyData;
    return historyData.filter(item => item.type === filter);
  }, [historyData, filter]);

  const getIcon = (type) => {
    switch (type) {
      case 'challenge': return <Sword className="w-5 h-5 text-amber-600" />;
      case 'lesson': return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'boss': return <Crown className="w-5 h-5 text-purple-600" />;
      default: return <Sparkles className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-8 pb-12 text-map-ink">
      <MapZone
        title="Learning History & Analytics"
        subtitle="Review your past challenge attempts, lessons completed, and boss victories across all provinces."
        icon={History}
      >
        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 border border-map-brown/10 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-map-ink-muted">Attempted</p>
              <p className="text-2xl font-black text-map-ink">{attempted}</p>
            </div>
          </div>

          <div className="bg-white/80 border border-map-brown/10 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-map-ink-muted">Solved</p>
              <p className="text-2xl font-black text-map-ink">{solved}</p>
            </div>
          </div>

          <div className="bg-white/80 border border-map-brown/10 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-map-ink-muted">Accuracy</p>
              <p className="text-2xl font-black text-map-ink">{accuracy}%</p>
            </div>
          </div>

          <div className="bg-white/80 border border-map-brown/10 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-map-ink-muted">Topics Studied</p>
              <p className="text-2xl font-black text-map-ink">{topicsCount}</p>
            </div>
          </div>
        </div>

        {/* FILTER TAB BAR */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-4 border-b border-map-brown/10">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-map-brown" />
            <span className="text-xs font-bold uppercase tracking-wider text-map-brown">Filter Activity:</span>
          </div>
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All Activities' },
              { id: 'challenge', label: 'Challenges' },
              { id: 'lesson', label: 'Lessons' },
              { id: 'boss', label: 'Boss Battles' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === tab.id 
                    ? 'bg-map-brown text-white shadow-md' 
                    : 'bg-white/60 text-map-ink hover:bg-white border border-map-brown/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ACTIVITY LIST */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-white/50 rounded-2xl animate-pulse border border-map-brown/5" />
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-16 bg-white/40 rounded-3xl border border-dashed border-map-brown/20">
            <History className="w-12 h-12 text-map-brown/40 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-map-ink">No Activity Found</h3>
            <p className="text-sm text-map-ink-muted mt-1 max-w-md mx-auto">
              {filter === 'all' 
                ? 'You have not completed any activities yet. Jump into the game world and start solving coding challenges!'
                : `No ${filter} activities found in your recent history.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="bg-white/80 hover:bg-white border border-map-brown/10 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-map-sand/50 rounded-2xl border border-map-brown/10">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-map-ink capitalize">{item.topic || 'General Challenge'}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-map-brown/10 text-map-brown uppercase tracking-wider">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-map-ink-muted mt-0.5">
                      {new Date(item.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {item.xpGained > 0 && (
                    <span className="text-xs font-black text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      +{item.xpGained} XP
                    </span>
                  )}
                  {item.isCorrect ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Success</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-500/10 px-3 py-1 rounded-full">
                      <XCircle className="w-4 h-4" />
                      <span>Attempted</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </MapZone>
    </div>
  );
}
