import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Atom,
  Brain,
  Code2,
  Globe,
  Shield,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../utils/cn';

type GuildStatus = 'Active' | 'Locked' | 'Mastered';
type GuildScope = 'college' | 'global';
type GuildFilter = 'All Guilds' | 'My College Guilds' | 'Other Guilds';
type PlayerSort = 'rank' | 'joined';

type GuildPlayer = {
  id: string;
  name: string;
  role: 'Leader' | 'Co-Leader' | 'Member';
  rank: number;
  trophies: number;
  joinedAt: string;
};

type Guild = {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: GuildStatus;
  icon: LucideIcon;
  skills: string[];
  skillmons: string[];
  scope: GuildScope;
  college?: string;
  players: GuildPlayer[];
};

const MY_COLLEGE = 'LPU';

const guilds: Guild[] = [
  {
    id: 'lpu-alpha',
    name: 'LPU Alpha Raiders',
    description: 'Main college guild for high-rank explorers from LPU.',
    progress: 78,
    status: 'Active',
    icon: Shield,
    skills: ['React', 'Node', 'SQL'],
    skillmons: ['Nodeon', 'Querylisk'],
    scope: 'college',
    college: 'LPU',
    players: [
      { id: 'p1', name: 'Hardik', role: 'Leader', rank: 1, trophies: 1840, joinedAt: '2025-11-03' },
      { id: 'p2', name: 'Krish', role: 'Co-Leader', rank: 2, trophies: 1765, joinedAt: '2025-11-10' },
      { id: 'p3', name: 'Sana', role: 'Member', rank: 4, trophies: 1620, joinedAt: '2026-01-14' },
      { id: 'p4', name: 'Yash', role: 'Member', rank: 7, trophies: 1498, joinedAt: '2026-02-20' },
    ],
  },
  {
    id: 'lpu-builders',
    name: 'LPU Builder Core',
    description: 'Product-focused college guild with build-week missions.',
    progress: 61,
    status: 'Active',
    icon: Globe,
    skills: ['UI Systems', 'APIs', 'Testing'],
    skillmons: ['DivTagon', 'APIra'],
    scope: 'college',
    college: 'LPU',
    players: [
      { id: 'p5', name: 'Tushar', role: 'Leader', rank: 3, trophies: 1710, joinedAt: '2025-12-06' },
      { id: 'p6', name: 'Rohit', role: 'Member', rank: 8, trophies: 1421, joinedAt: '2026-03-01' },
      { id: 'p7', name: 'Kunal', role: 'Member', rank: 9, trophies: 1390, joinedAt: '2026-03-19' },
    ],
  },
  {
    id: 'global-dsa',
    name: 'Order of DSA',
    description: 'Global elite guild for algorithms and coding duels.',
    progress: 88,
    status: 'Mastered',
    icon: Code2,
    skills: ['DP', 'Graphs', 'Greedy'],
    skillmons: ['Heapzilla', 'Trieceratops'],
    scope: 'global',
    players: [
      { id: 'p8', name: 'Aryan', role: 'Leader', rank: 1, trophies: 2010, joinedAt: '2025-10-05' },
      { id: 'p9', name: 'Ananya', role: 'Co-Leader', rank: 2, trophies: 1933, joinedAt: '2025-10-18' },
      { id: 'p10', name: 'Neha', role: 'Member', rank: 5, trophies: 1580, joinedAt: '2026-02-08' },
    ],
  },
  {
    id: 'global-neural',
    name: 'Neural Sages',
    description: 'AI/ML guild focused on model training and applied intelligence.',
    progress: 49,
    status: 'Active',
    icon: Brain,
    skills: ['Python', 'Pandas', 'Model Evaluation'],
    skillmons: ['Tensorix', 'Neuronyx'],
    scope: 'global',
    players: [
      { id: 'p11', name: 'Isha', role: 'Leader', rank: 3, trophies: 1768, joinedAt: '2025-12-30' },
      { id: 'p12', name: 'Pranav', role: 'Member', rank: 6, trophies: 1510, joinedAt: '2026-01-28' },
    ],
  },
  {
    id: 'global-kernel',
    name: 'Kernel Keepers',
    description: 'Systems guild with distributed and infra quests.',
    progress: 15,
    status: 'Locked',
    icon: Atom,
    skills: ['OS', 'Caching', 'Queues'],
    skillmons: ['Daemonir', 'Cacheodon'],
    scope: 'global',
    players: [
      { id: 'p13', name: 'Aarav', role: 'Leader', rank: 4, trophies: 1659, joinedAt: '2026-02-16' },
    ],
  },
];

const filters: GuildFilter[] = ['All Guilds', 'My College Guilds', 'Other Guilds'];

const statusClasses: Record<GuildStatus, string> = {
  Active: 'bg-map-grass/20 text-map-grass-deep border-map-grass/40',
  Locked: 'bg-map-ink/5 text-map-ink-muted border-map-brown/20',
  Mastered: 'bg-map-water/20 text-map-water-deep border-map-water/35',
};

export default function GuildPage() {
  const [activeFilter, setActiveFilter] = useState<GuildFilter>('All Guilds');
  const [selectedGuildId, setSelectedGuildId] = useState<string>(guilds[0].id);
  const [openedGuildId, setOpenedGuildId] = useState<string | null>(null);
  const [playerSort, setPlayerSort] = useState<PlayerSort>('rank');

  const filteredGuilds = useMemo(() => {
    if (activeFilter === 'My College Guilds') {
      return guilds.filter((g) => g.scope === 'college' && g.college === MY_COLLEGE);
    }

    if (activeFilter === 'Other Guilds') {
      return guilds.filter((g) => g.scope === 'global');
    }

    return guilds;
  }, [activeFilter]);

  const selectedGuild =
    filteredGuilds.find((guild) => guild.id === selectedGuildId) ?? filteredGuilds[0] ?? guilds[0];

  const openedGuild = guilds.find((g) => g.id === openedGuildId) || null;

  const sortedPlayers = useMemo(() => {
    if (!openedGuild) return [];
    const copy = [...openedGuild.players];

    if (playerSort === 'rank') {
      copy.sort((a, b) => a.rank - b.rank);
    } else {
      copy.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
    }

    return copy;
  }, [openedGuild, playerSort]);

  return (
    <div className="relative min-h-screen px-4 py-8 text-map-ink md:px-8" style={{ fontFamily: 'Hanken Grotesk, Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div className="fixed inset-0 pointer-events-none bg-linear-to-b from-map-water/20 via-map-grass/10 to-transparent" />
      <div className="fixed inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')]" />

      <div className="mx-auto max-w-7xl space-y-6">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 rounded-4xl border border-white bg-white/80 p-6 shadow-(--shadow-map-soft)"
        >
          <p className="text-xs font-black uppercase tracking-[0.25em] text-map-brown/70">Guild Command Center</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Guild Wars Board</h1>
          <p className="mt-2 max-w-2xl text-sm text-map-ink-muted">
            Filter college guilds, inspect global guilds, open a guild roster, and sort warriors by rank or join date.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  'rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-wider transition',
                  activeFilter === filter
                    ? 'border-map-brown bg-map-brown text-white shadow-md shadow-map-brown/30'
                    : 'border-map-brown/15 bg-white/60 text-map-brown hover:-translate-y-0.5 hover:bg-white/80',
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </motion.header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr]">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredGuilds.map((guild, index) => {
              const Icon = guild.icon;
              const isSelected = selectedGuild.id === guild.id;

              return (
                <motion.button
                  key={guild.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedGuildId(guild.id)}
                  className={cn(
                    'group rounded-3xl border p-4 text-left transition shadow-(--shadow-map-soft)',
                    'bg-white/80',
                    isSelected
                      ? 'border-map-brown ring-2 ring-map-brown/15'
                      : 'border-map-brown/10 hover:border-map-brown/25',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-map-brown/10 bg-linear-to-br from-map-sand to-white">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className={cn('inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-wider', statusClasses[guild.status])}>
                      {guild.status}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-black leading-tight">{guild.name}</h3>
                  <p className="mt-1 text-sm text-map-ink-muted">{guild.description}</p>

                  <div className="mt-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-map-brown/70">
                    <Users className="h-3.5 w-3.5" />
                    {guild.players.length} Players • {guild.scope === 'college' ? guild.college : 'Global'}
                  </div>

                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-map-brown/70">
                      <span>Progress</span>
                      <span>{guild.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full border border-map-brown/10 bg-map-ui p-px">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${guild.progress}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full bg-linear-to-r from-map-grass-deep to-map-water"
                      />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </section>

          <motion.aside
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-6 h-fit rounded-3xl border border-white bg-white/85 p-5 shadow-(--shadow-map-soft)"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">{selectedGuild.name}</h2>
              <Sparkles className="h-5 w-5 text-map-brown" />
            </div>
            <p className="mt-2 text-sm text-map-ink-muted">{selectedGuild.description}</p>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-map-brown/70">Key Skills</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedGuild.skills.map((skill) => (
                    <span key={skill} className="rounded-lg border border-map-brown/10 bg-white/70 px-2 py-1 text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-map-brown/70">Skill-mons in this realm</p>
                <ul className="mt-2 space-y-1">
                  {selectedGuild.skillmons.map((mon) => (
                    <li key={mon} className="text-sm font-semibold text-map-ink">• {mon}</li>
                  ))}
                </ul>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOpenedGuildId(selectedGuild.id)}
              className="mt-6 w-full rounded-xl border border-map-brown bg-map-brown px-4 py-3 text-sm font-black uppercase tracking-wider text-white shadow-md shadow-map-brown/30"
            >
              Open Guild
            </motion.button>
          </motion.aside>
        </div>

        {openedGuild && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white bg-white/85 p-5 shadow-(--shadow-map-soft)"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-map-brown/70">Guild Roster</p>
                <h3 className="text-2xl font-black">{openedGuild.name}</h3>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-map-brown/70">Sort by</label>
                <select
                  value={playerSort}
                  onChange={(e) => setPlayerSort(e.target.value as PlayerSort)}
                  className="rounded-lg border border-map-brown/20 bg-white px-3 py-2 text-sm font-bold text-map-ink"
                >
                  <option value="rank">High Rank</option>
                  <option value="joined">Date Joined</option>
                </select>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-map-brown/15">
              <div className="grid grid-cols-12 gap-2 bg-map-ui px-4 py-3 text-[10px] font-black uppercase tracking-widest text-map-brown/60">
                <div className="col-span-4">Player</div>
                <div className="col-span-2 text-center">Role</div>
                <div className="col-span-2 text-center">Rank</div>
                <div className="col-span-2 text-center">Trophies</div>
                <div className="col-span-2 text-right">Joined</div>
              </div>

              <div className="divide-y divide-map-brown/10 bg-white/90">
                {sortedPlayers.map((player) => (
                  <div key={player.id} className="grid grid-cols-12 items-center gap-2 px-4 py-3 text-sm">
                    <div className="col-span-4 font-black text-map-ink">{player.name}</div>
                    <div className="col-span-2 text-center text-xs font-bold text-map-ink-muted">{player.role}</div>
                    <div className="col-span-2 text-center font-black text-map-brown">#{player.rank}</div>
                    <div className="col-span-2 text-center font-bold">{player.trophies}</div>
                    <div className="col-span-2 text-right text-xs text-map-ink-muted">{new Date(player.joinedAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
