import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Binary,
  Brain,
  Cable,
  Check,
  CheckCircle2,
  Code2,
  Lock,
  Network,
  Rocket,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from '../utils/cn';

type SkillStatus = 'locked' | 'unlocked' | 'mastered';

type SkillNode = {
  id: string;
  label: string;
  status: SkillStatus;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  xpReward: number;
  prereq?: string;
  x: number;
  y: number;
};

const skills: SkillNode[] = [
  {
    id: 'arrays',
    label: 'Array Foundations',
    status: 'mastered',
    description: 'Indexing, traversal, and two-pointer traversal patterns.',
    icon: Binary,
    xpReward: 120,
    x: 140,
    y: 130,
  },
  {
    id: 'linked-list',
    label: 'Linked Lists',
    status: 'mastered',
    description: 'Pointers, insertion/deletion flow, and cycle detection.',
    icon: Cable,
    xpReward: 160,
    prereq: 'arrays',
    x: 360,
    y: 280,
  },
  {
    id: 'stack-queue',
    label: 'Stacks & Queues',
    status: 'unlocked',
    description: 'LIFO/FIFO operations, monotonic stack, queue windows.',
    icon: Code2,
    xpReward: 180,
    prereq: 'linked-list',
    x: 560,
    y: 120,
  },
  {
    id: 'trees',
    label: 'Trees & Traversals',
    status: 'unlocked',
    description: 'DFS/BFS traversals, recursion flow, and balancing intuition.',
    icon: Network,
    xpReward: 220,
    prereq: 'stack-queue',
    x: 760,
    y: 290,
  },
  {
    id: 'graphs',
    label: 'Graph Pathfinding',
    status: 'locked',
    description: 'Adjacency structures, shortest paths, topo sorting.',
    icon: Brain,
    xpReward: 320,
    prereq: 'trees',
    x: 980,
    y: 140,
  },
];

const statusStyles: Record<SkillStatus, string> = {
  mastered:
    'border-map-water/50 bg-linear-to-br from-map-water/30 via-map-grass-light/50 to-white text-map-ink ring-2 ring-map-water/30 shadow-(--shadow-map-soft)',
  unlocked: 'border-map-brown/25 bg-linear-to-br from-map-sand/45 to-white text-map-ink shadow-(--shadow-map-soft)',
  locked: 'border-map-brown/20 bg-map-ui-muted/60 text-map-ink-muted opacity-55 grayscale',
};

function TreeNode({
  skill,
  selected,
  onSelect,
}: {
  skill: SkillNode;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const Icon = skill.icon;
  const isLocked = skill.status === 'locked';
  const isMastered = skill.status === 'mastered';

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelect(skill.id)}
      className={cn(
        'absolute -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-3xl border-2 p-3',
        'shadow-(--shadow-map-lift) hover:-translate-x-[51%] hover:-translate-y-[52%] transition-all',
        'backdrop-blur-md',
        statusStyles[skill.status],
        selected && 'ring-2 ring-map-brown/35',
      )}
      style={{ left: skill.x, top: skill.y }}
      type="button"
    >
      <div className="relative flex h-full w-full items-center justify-center rounded-2xl border border-map-brown/15 bg-white/70">
        {isLocked ? <Lock className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
        {isMastered && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-map-water/40 bg-map-water/20 text-map-water-deep">
            <Check className="h-3 w-3" />
          </span>
        )}
      </div>
    </motion.button>
  );
}

export default function SkillTree() {
  const navigate = useNavigate();
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(skills[0].id);

  const skillMap = useMemo(() => new Map(skills.map((s) => [s.id, s])), []);

  const selectedSkill = useMemo(
    () => skills.find((s) => s.id === selectedSkillId) ?? null,
    [selectedSkillId],
  );

  const connections = useMemo(
    () => skills.filter((s) => s.prereq).map((s) => ({ from: skillMap.get(s.prereq!), to: s })).filter((c) => c.from && c.to),
    [skillMap],
  );

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-map-brown/20 bg-white/80 p-6 shadow-(--shadow-map-soft)"
        >
          <p className="text-xs font-black uppercase tracking-widest text-map-brown/70">Track Progression</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">DSA Skill Tree</h1>
          <p className="mt-2 text-sm text-map-ink-muted">Unlock each branch to progress deeper into your guild path.</p>
        </motion.header>

        <section className="rounded-3xl border border-map-brown/20 bg-white/75 p-3 shadow-(--shadow-map-soft) md:p-5">
          <div className="overflow-x-auto pb-2">
            <div className="relative h-107.5 min-w-280 rounded-3xl border border-map-brown/15 bg-linear-to-br from-map-grass-light/20 via-white/80 to-map-water/10">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1120 430" fill="none">
                {connections.map((connection, idx) => {
                  const from = connection.from!;
                  const to = connection.to;
                  const midX = (from.x + to.x) / 2;
                  const d = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;

                  return (
                    <g key={`${from.id}-${to.id}`}>
                      <path d={d} stroke="currentColor" strokeWidth="2" className="text-map-brown/20" />
                      <motion.path
                        d={d}
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="text-map-water-deep"
                        strokeDasharray="8 8"
                        animate={{ strokeDashoffset: [0, -24] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', delay: idx * 0.2 }}
                      />
                    </g>
                  );
                })}
              </svg>

              {skills.map((skill) => (
                <TreeNode
                  key={skill.id}
                  skill={skill}
                  selected={selectedSkillId === skill.id}
                  onSelect={setSelectedSkillId}
                />
              ))}

              <div className="absolute left-4 top-4 rounded-xl border border-map-brown/20 bg-white/80 px-3 py-2 backdrop-blur-md shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest">Branching Route</p>
                <p className="mt-1 text-xs text-map-ink-muted">Main path + side quests</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 p-4 backdrop-blur-[1px]"
            onClick={() => setSelectedSkillId(null)}
          >
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="ml-auto h-full w-full max-w-md rounded-3xl border border-map-brown/20 bg-white/90 p-5 shadow-(--shadow-map-lift) backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-wider">Skill Detail</h2>
                <button
                  type="button"
                  onClick={() => setSelectedSkillId(null)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-map-brown/30 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-map-ui transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-map-brown/70">{selectedSkill.status}</p>
                <h3 className="text-2xl font-black leading-tight">{selectedSkill.label}</h3>
                <p className="text-sm text-map-ink-muted">{selectedSkill.description}</p>

                <div className="rounded-2xl border border-map-brown/20 bg-linear-to-br from-map-sand/40 to-white p-4 shadow-sm">
                  <p className="text-[11px] font-black uppercase tracking-widest text-map-brown/70">Reward</p>
                  <p className="mt-2 text-sm font-bold">+{selectedSkill.xpReward} XP</p>
                  {selectedSkill.prereq ? (
                    <p className="mt-2 text-xs text-map-ink-muted">Requires: {skills.find((s) => s.id === selectedSkill.prereq)?.label}</p>
                  ) : (
                    <p className="mt-2 text-xs text-map-ink-muted">Starting node for this path.</p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm font-bold">
                  {selectedSkill.status === 'mastered' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Fully mastered
                    </>
                  ) : selectedSkill.status === 'unlocked' ? (
                    'Ready for challenge battles'
                  ) : (
                    'Complete prerequisites to unlock'
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => navigate(`/skill-tree/learn/${selectedSkill.id}`)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-map-brown/30 bg-linear-to-r from-map-brown to-map-brown-soft px-4 py-3 text-sm font-black uppercase tracking-widest text-white shadow-md hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                >
                  <Rocket className="h-4 w-4" />
                  Start Learning
                </motion.button>

                <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-map-water/30 bg-map-water/10 px-2.5 py-1 text-[11px] font-semibold text-map-water-deep">
                  <Sparkles className="h-3.5 w-3.5" />
                  Completing this unlocks advanced branch routes.
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
