import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, FlaskConical, Gem, PackageSearch, Shield, Sparkles, Star } from 'lucide-react';
import { cn } from '../utils/cn';

type InventoryCategory = 'Skill-mons' | 'Medals' | 'Consumables';
type FilterType = 'All' | InventoryCategory;

type InventoryItem = {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity?: number;
  level?: number;
  rarity: 'Common' | 'Rare' | 'Epic';
  mastery: number;
  power?: string;
  flavor: string;
  visual: string;
  icon: React.ComponentType<{ className?: string }>;
};

const inventorySeed: InventoryItem[] = [
  {
    id: 'mon-arrayon',
    name: 'Arrayon',
    category: 'Skill-mons',
    quantity: 1,
    level: 14,
    rarity: 'Rare',
    mastery: 74,
    power: 'Traversal Insight +8',
    flavor: 'A nimble companion who reveals hidden loop optimizations.',
    visual: '🦎',
    icon: Sparkles,
  },
  {
    id: 'mon-triefox',
    name: 'Triefox',
    category: 'Skill-mons',
    quantity: 1,
    level: 19,
    rarity: 'Epic',
    mastery: 88,
    power: 'Prefix Speed +12',
    flavor: 'Excellent for autocomplete and dictionary battles.',
    visual: '🦊',
    icon: Gem,
  },
  {
    id: 'medal-forest',
    name: 'Forest Medal',
    category: 'Medals',
    quantity: 1,
    level: 1,
    rarity: 'Rare',
    mastery: 100,
    power: 'Region Cleared',
    flavor: 'Awarded for completing the Array Woods expedition.',
    visual: '🏅',
    icon: BadgeCheck,
  },
  {
    id: 'medal-loop',
    name: 'Loop Breaker',
    category: 'Medals',
    quantity: 1,
    level: 1,
    rarity: 'Epic',
    mastery: 100,
    power: 'Bug Hunter',
    flavor: 'Proof of defeating infinite loop anomalies.',
    visual: '🛡️',
    icon: Shield,
  },
  {
    id: 'boost-focus',
    name: 'Focus Tonic',
    category: 'Consumables',
    quantity: 4,
    rarity: 'Common',
    mastery: 40,
    power: '+20 Focus',
    flavor: 'Sharpens concentration before duel mode.',
    visual: '🧪',
    icon: FlaskConical,
  },
  {
    id: 'boost-xp',
    name: 'XP Booster',
    category: 'Consumables',
    quantity: 2,
    rarity: 'Rare',
    mastery: 62,
    power: 'XP x2 (15m)',
    flavor: 'Doubles earned XP during challenge streaks.',
    visual: '⚡',
    icon: Gem,
  },
];

const filters: FilterType[] = ['All', 'Skill-mons', 'Medals', 'Consumables'];

const rarityStyle: Record<InventoryItem['rarity'], string> = {
  Common: 'bg-map-grass-light/25 text-map-ink border-map-grass/40',
  Rare: 'bg-map-water/20 text-map-water-deep border-map-water/45',
  Epic: 'bg-map-brown text-white border-map-brown',
};

function InventorySlot({
  item,
  selected,
  onSelect,
}: {
  item: InventoryItem;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const Icon = item.icon;

  return (
    <motion.button
      key={item.id}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      type="button"
      onClick={() => onSelect(item.id)}
      className={cn(
        'relative aspect-square rounded-2xl border-2 p-2',
        'shadow-(--shadow-map-soft) hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all',
        'before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] before:content-[""]',
        selected
          ? 'border-map-water-deep bg-linear-to-br from-map-water/20 to-white ring-2 ring-map-water/25'
          : 'border-map-brown/15 bg-linear-to-br from-white to-map-sand/25',
      )}
    >
      <span className="absolute right-1 top-1 rounded-full border border-map-brown/20 bg-white/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-map-brown">
        {item.level ? `Lv.${item.level}` : `x${item.quantity ?? 1}`}
      </span>

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
        <span className="text-2xl leading-none">{item.visual}</span>
        <Icon className="h-3.5 w-3.5 opacity-70" />
        <span className="line-clamp-2 text-center text-[10px] font-black uppercase tracking-wide">{item.name}</span>
      </div>
    </motion.button>
  );
}

export default function Inventory() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [selectedId, setSelectedId] = useState<string | null>(inventorySeed[0]?.id ?? null);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'All') return inventorySeed;
    return inventorySeed.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  const selectedItem = useMemo(
    () => filteredItems.find((item) => item.id === selectedId) ?? filteredItems[0] ?? null,
    [filteredItems, selectedId],
  );

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-map-brown/20 bg-white/80 p-6 shadow-(--shadow-map-soft)"
        >
          <p className="text-xs font-black uppercase tracking-widest text-map-brown/70">Collection Dex</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Inventory View</h1>
          <p className="mt-2 text-sm text-map-ink-muted">All captured skill-mons, earned medals, and consumable boosts.</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {filters.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={cn(
                  'rounded-xl border-2 px-4 py-2 text-xs font-black uppercase tracking-wider transition hover:-translate-y-0.5',
                  activeFilter === tab
                    ? 'border-map-brown bg-map-brown text-white shadow-md shadow-map-brown/30'
                    : 'border-map-brown/20 bg-white/80 text-map-brown hover:-translate-x-0.5 hover:-translate-y-0.5',
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.header>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_330px]">
          <div className="rounded-3xl border border-map-brown/20 bg-white/80 p-4 shadow-(--shadow-map-soft) md:p-5">
            {filteredItems.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-map-brown/30 bg-map-sand/15 text-center">
                <PackageSearch className="h-6 w-6" />
                <p className="text-sm font-semibold text-map-ink-muted">Nothing here yet... keep exploring!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <InventorySlot
                      item={item}
                      selected={selectedItem?.id === item.id}
                      onSelect={setSelectedId}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {selectedItem && (
            <motion.aside
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-fit rounded-3xl border border-map-brown/20 bg-white/90 p-4 shadow-(--shadow-map-soft) backdrop-blur-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-map-brown/70">Selected Item</p>
                  <h2 className="mt-1 text-xl font-black">{selectedItem.name}</h2>
                </div>
                <span className={cn('rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider', rarityStyle[selectedItem.rarity])}>
                  {selectedItem.rarity}
                </span>
              </div>

              <div className="mt-3 rounded-2xl border border-map-brown/20 bg-linear-to-br from-map-water/10 via-white to-map-grass-light/20 p-3">
                <p className="text-xs font-black uppercase tracking-widest text-map-brown/70">Stats</p>

                <div className="mt-3 space-y-2">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                      <span>Mastery</span>
                      <span>{selectedItem.mastery}%</span>
                    </div>
                    <div className="h-2 rounded-full border border-map-brown/15 bg-white p-px">
                      <div className="h-full rounded-full bg-linear-to-r from-map-grass-deep to-map-water" style={{ width: `${selectedItem.mastery}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                      <span>Battle Readiness</span>
                      <span>{Math.min(100, selectedItem.mastery + 8)}%</span>
                    </div>
                    <div className="h-2 rounded-full border border-map-brown/15 bg-white p-px">
                      <div className="h-full rounded-full bg-linear-to-r from-map-sand-deep to-map-brown-soft" style={{ width: `${Math.min(100, selectedItem.mastery + 8)}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-map-brown/20 bg-map-sand/20 p-3">
                <p className="text-xs font-black uppercase tracking-widest text-map-brown/70">Flavor</p>
                <p className="mt-2 text-sm text-map-ink">{selectedItem.flavor}</p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold">
                <div className="rounded-lg border border-map-brown/20 bg-white/75 p-2">
                  Power: <span className="font-black">{selectedItem.power || 'N/A'}</span>
                </div>
                <div className="rounded-lg border border-map-brown/20 bg-white/75 p-2">
                  Qty: <span className="font-black">{selectedItem.quantity ?? 1}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-map-brown/30 bg-linear-to-r from-map-brown to-map-brown-soft px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-md hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
              >
                <Star className="h-4 w-4" /> Equip / Use
              </motion.button>
            </motion.aside>
          )}
        </section>

        {selectedItem && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden rounded-3xl border border-map-brown/20 bg-white/90 p-5 shadow-(--shadow-map-soft) backdrop-blur-md"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">{selectedItem.name}</h2>
              <span className={cn('rounded-full border px-2 py-1 text-[10px] font-black uppercase', rarityStyle[selectedItem.rarity])}>
                {selectedItem.rarity}
              </span>
            </div>
            <p className="mt-2 text-sm text-foreground/75">{selectedItem.flavor}</p>
          </motion.section>
        )}
      </div>
    </div>
  );
}
