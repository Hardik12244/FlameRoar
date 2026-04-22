import React, { useEffect, useMemo, useState } from 'react';
import { Crown, Medal, Search, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const leaderboardData = [
  {
    rank: 1,
    username: 'Krish',
    avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Krish',
    track: 'DSA',
    skillmonsCaught: 48,
    medals: 21,
    totalXP: 15320,
  },
  {
    rank: 2,
    username: 'Aryan',
    avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Aryan',
    track: 'Web Dev',
    skillmonsCaught: 45,
    medals: 19,
    totalXP: 14980,
  },
  {
    rank: 3,
    username: 'Tushar',
    avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Tushar',
    track: 'AI',
    skillmonsCaught: 43,
    medals: 18,
    totalXP: 14690,
  },
  {
    rank: 4,
    username: 'Hardik',
    avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Hardik',
    track: 'Web Dev',
    skillmonsCaught: 40,
    medals: 16,
    totalXP: 14310,
  },
  {
    rank: 5,
    username: 'Ananya',
    avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Ananya',
    track: 'DSA',
    skillmonsCaught: 39,
    medals: 15,
    totalXP: 13980,
  },
  {
    rank: 6,
    username: 'Rohit',
    avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Rohit',
    track: 'Web Dev',
    skillmonsCaught: 36,
    medals: 13,
    totalXP: 13560,
  },
  {
    rank: 7,
    username: 'Pranav',
    avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Pranav',
    track: 'DSA',
    skillmonsCaught: 33,
    medals: 11,
    totalXP: 13290,
  },
  {
    rank: 8,
    username: 'Sana',
    avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Sana',
    track: 'AI',
    skillmonsCaught: 31,
    medals: 10,
    totalXP: 12940,
  },
  {
    rank: 9,
    username: 'Neha',
    avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Neha',
    track: 'Web Dev',
    skillmonsCaught: 29,
    medals: 9,
    totalXP: 12670,
  },
  {
    rank: 10,
    username: 'Kunal',
    avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Kunal',
    track: 'DSA',
    skillmonsCaught: 28,
    medals: 8,
    totalXP: 12390,
  },
  {
    rank: 11,
    username: 'Isha',
    avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Isha',
    track: 'AI',
    skillmonsCaught: 25,
    medals: 7,
    totalXP: 12140,
  },
  {
    rank: 12,
    username: 'Yash',
    avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Yash',
    track: 'Web Dev',
    skillmonsCaught: 24,
    medals: 6,
    totalXP: 11880,
  },
];

const scopeTabs = ['Global', 'My College'];
const tabs = ['All Tracks', 'DSA Track', 'Web Dev Track', 'AI Track'];
const currentUsername = 'Hardik';
const currentCollege = 'LPU';

const collegeByUser = {
  Krish: 'LPU',
  Aryan: 'IIT Delhi',
  Tushar: 'LPU',
  Hardik: 'LPU',
  Ananya: 'NIT Trichy',
  Rohit: 'LPU',
  Pranav: 'IIT Bombay',
  Sana: 'LPU',
  Neha: 'VIT',
  Kunal: 'LPU',
  Isha: 'IIT Kanpur',
  Yash: 'LPU',
};

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const rankByXP = (data) => {
  const sorted = [...data].sort((a, b) => b.totalXP - a.totalXP);
  return sorted.map((student, index) => ({
    ...student,
    college: student.college || collegeByUser[student.username] || 'Unknown College',
    rank: index + 1,
  }));
};

const Leaderboard = () => {
  const [liveData, setLiveData] = useState(rankByXP(leaderboardData));
  const [activeScope, setActiveScope] = useState('Global');
  const [activeTab, setActiveTab] = useState('All Tracks');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveData((prev) => {
        const updated = prev.map((student) => {
          const gain = randomBetween(8, 45);
          const medalGain = Math.random() > 0.92 ? 1 : 0;
          const skillmonGain = Math.random() > 0.88 ? 1 : 0;

          return {
            ...student,
            totalXP: student.totalXP + gain,
            medals: student.medals + medalGain,
            skillmonsCaught: student.skillmonsCaught + skillmonGain,
          };
        });

        return rankByXP(updated);
      });
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  const filteredData = useMemo(() => {
    let list = [...liveData];

    if (activeScope === 'My College') {
      list = list.filter((student) => student.college === currentCollege);
    }

    if (activeTab === 'DSA Track') {
      list = list.filter((student) => student.track === 'DSA');
    }

    if (activeTab === 'Web Dev Track') {
      list = list.filter((student) => student.track === 'Web Dev');
    }

    if (activeTab === 'AI Track') {
      list = list.filter((student) => student.track === 'AI');
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((student) => student.username.toLowerCase().includes(term));
    }

    return list;
  }, [activeScope, activeTab, searchTerm, liveData]);

  const podium = filteredData.slice(0, 3);
  const rest = filteredData.slice(3);

  const yourRank = liveData.find((student) => student.username === currentUsername);
  const yourTabRank = filteredData.findIndex((student) => student.username === currentUsername) + 1;

  return (
    <div className="relative min-h-screen w-full bg-map-grass text-map-ink overflow-x-hidden md:p-10 p-6">
      {/* MAP WORLD SURFACE (matches index.css style) */}
      <div className="fixed inset-0 pointer-events-none bg-linear-to-b from-map-water/20 via-map-grass/10 to-transparent" />
      
      {/* GRAIN OVERLAY */}
      <div className="fixed inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')]" />

      <div className="relative z-10 mx-auto max-w-6xl pb-28">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-map-brown flex items-center justify-center shadow-lg shadow-map-brown/30">
                <Trophy className="text-white w-6 h-6" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic text-map-brown">Hall of Heroes</h1>
            </div>
            <p className="text-map-ink-muted font-bold uppercase tracking-widest text-xs opacity-70">Top explorers on the learning path</p>
          </div>

          <div className="flex flex-col gap-4 w-full md:max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-map-brown/40" />
              <input
                type="text"
                placeholder="Search Hero..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/60 border border-map-brown/10 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-map-ink placeholder:text-map-brown/30 backdrop-blur-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-map-brown/20 transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {scopeTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveScope(tab)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeScope === tab
                      ? 'bg-map-water-deep text-white shadow-lg shadow-map-water/30 -translate-y-0.5'
                      : 'bg-white/50 text-map-water-deep hover:bg-white/80'
                  }`}
                >
                  {tab === 'My College' ? `${currentCollege} College` : 'Global'}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab
                      ? 'bg-map-brown text-white shadow-lg shadow-map-brown/30 -translate-y-0.5'
                      : 'bg-white/50 text-map-brown hover:bg-white/80'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Podium Layout */}
        <div className="grid gap-8 md:grid-cols-3 mb-10">
          {podium.map((student, index) => (
            <motion.div
              key={student.username}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group h-full"
            >
              <div className="absolute -inset-1 bg-map-brown/5 rounded-4xl blur transition duration-1000 group-hover:duration-200" />
              <div className="relative bg-white/80 backdrop-blur-xl border border-white rounded-4xl p-6 shadow-(--shadow-map-soft) transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shadow-sm ${
                    index === 0 ? "bg-map-gold text-white" : index === 1 ? "bg-slate-300 text-slate-600" : "bg-orange-300 text-orange-700"
                  }`}>
                    {student.rank === 1 ? <Crown className="w-5 h-5" /> : student.rank}
                  </div>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className={`absolute -inset-2 rounded-full blur-md opacity-30 ${index === 0 ? "bg-map-gold" : "bg-map-brown"}`} />
                    <img
                      src={student.avatar}
                      alt={student.username}
                      className="relative w-24 h-24 rounded-3xl border-2 border-white bg-white/50 shadow-lg object-cover"
                    />
                  </div>
                  
                  <h3 className="text-xl font-black tracking-tight text-map-ink">{student.username}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-map-brown/70 font-bold uppercase tracking-widest text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-map-brown/10 uppercase tracking-tighter">{student.track}</span>
                    <span className="px-2 py-0.5 rounded bg-map-water/10 text-map-water-deep normal-case">{student.college}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 w-full mt-6">
                    <div className="flex flex-col items-center p-2 rounded-2xl bg-white/50 border border-map-brown/5">
                      <Zap className="w-3 h-3 text-map-brown mb-1 opacity-50" />
                      <span className="text-xs font-black">{Math.floor(student.totalXP / 1000)}k</span>
                      <span className="text-[8px] font-bold text-map-ink/40 uppercase">XP</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-2xl bg-white/50 border border-map-brown/5">
                      <Medal className="w-3 h-3 text-map-brown mb-1 opacity-50" />
                      <span className="text-xs font-black">{student.medals}</span>
                      <span className="text-[8px] font-bold text-map-ink/40 uppercase">Medals</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-2xl bg-white/50 border border-map-brown/5 border-dashed">
                      <div className="w-3 h-3 rounded-full bg-map-brown/10 mb-1" />
                      <span className="text-xs font-black">{student.skillmonsCaught}</span>
                      <span className="text-[8px] font-bold text-map-ink/40 uppercase">Mons</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* List Layout */}
        <div className="relative">
          <div className="absolute -inset-1 bg-map-brown/5 rounded-4xl blur transition duration-1000" />
          <div className="relative bg-white/60 backdrop-blur-xl border border-white rounded-4xl shadow-(--shadow-map-soft) overflow-hidden transition-all duration-500">
            <div className="grid grid-cols-12 gap-4 border-b border-map-brown/5 bg-white/40 p-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-map-brown/40">
              <div className="col-span-1">No.<div className="h-0.5 w-4 bg-map-brown/20 mt-1" /></div>
              <div className="col-span-5">Hero</div>
              <div className="hidden md:col-span-2 md:block">Province</div>
              <div className="col-span-2 text-center">Mastery</div>
              <div className="col-span-2 text-right">XP</div>
            </div>

            <div className="max-h-125 overflow-y-auto custom-scrollbar">
              {rest.length === 0 ? (
                <div className="p-12 text-center text-sm font-bold text-map-ink/40 uppercase tracking-widest italic flex flex-col items-center gap-3">
                  <div className="w-12 h-0.5 bg-map-brown/10" />
                  No heroes found for this quest
                  <div className="w-12 h-0.5 bg-map-brown/10" />
                </div>
              ) : (
                rest.map((student, index) => {
                  const isCurrentUser = student.username === currentUsername;

                  return (
                    <motion.div
                      key={student.username}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`grid grid-cols-12 items-center gap-4 py-5 px-10 transition-all ${
                        isCurrentUser ? 'bg-map-sand/30 border-l-4 border-l-map-brown shadow-inner' : 'hover:bg-white/40'
                      }`}
                    >
                      <div className="col-span-1 text-base font-black italic text-map-brown/30">
                        {String(student.rank).padStart(2, '0')}
                      </div>

                      <div className="col-span-5 flex items-center gap-3">
                        <img src={student.avatar} alt={student.username} className="h-10 w-10 rounded-xl border border-white shadow-sm bg-white" />
                        <div>
                          <p className="text-sm font-black text-map-ink tracking-tight uppercase leading-none">{student.username}</p>
                          {isCurrentUser && <span className="text-[8px] font-black uppercase tracking-widest text-map-brown opacity-60">Your Avatar</span>}
                        </div>
                      </div>

                      <div className="hidden md:col-span-2 md:block">
                        <span className="text-[10px] font-black uppercase text-map-brown/40 border border-map-brown/10 rounded px-2 py-0.5 whitespace-nowrap">{student.track}</span>
                        <span className="ml-2 text-[9px] font-bold text-map-water-deep/70 whitespace-nowrap">{student.college}</span>
                      </div>

                      <div className="col-span-2 text-center flex items-center justify-center gap-1.5">
                        <Medal className="h-3 w-3 text-map-brown opacity-30" />
                        <span className="text-xs font-black text-map-ink">{student.medals}</span>
                      </div>

                      <div className="col-span-2 text-right">
                        <div className="flex flex-col items-end">
                           <span className="text-xs font-black text-map-brown">{student.totalXP.toLocaleString()}</span>
                           <div className="w-full h-1 bg-map-brown/10 rounded-full mt-1.5 overflow-hidden">
                              <div className="h-full bg-map-brown transition-all duration-1000" style={{ width: `${(student.totalXP % 1000) / 10}%` }} />
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {yourRank && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl">
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="bg-white/80 backdrop-blur-2xl border border-white rounded-3xl px-6 py-4 shadow-(--shadow-map-soft) flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-map-brown rounded-xl blur-sm opacity-20" />
                <img src={yourRank.avatar} alt={yourRank.username} className="relative h-11 w-11 rounded-xl border-2 border-white shadow-md bg-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-map-brown opacity-60">Personal Rank</p>
                <p className="text-lg font-black text-map-ink">#{yourRank.rank} <span className="text-xs font-bold opacity-40 ml-1">{yourRank.username}</span></p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-map-brown/40">Track Best</span>
                <span className="text-xs font-black"># {yourTabRank > 0 ? yourTabRank : 'N/A'}</span>
              </div>
              <div className="w-px h-8 bg-map-brown/10" />
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-map-brown/40">Total XP</span>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-map-brown" />
                  <span className="text-sm font-black">{yourRank.totalXP.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
