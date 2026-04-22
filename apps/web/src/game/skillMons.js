export const SKILL_MONS_DB = {
  'variables': { name: 'Varimon', type: 'Foundation', icon: '📦', color: 'text-blue-400', bg: 'bg-blue-400/20' },
  'syntax': { name: 'Syntail', type: 'Foundation', icon: '📝', color: 'text-gray-400', bg: 'bg-gray-400/20' },
  'operators': { name: 'Operex', type: 'Logic', icon: '➗', color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
  'conditionals': { name: 'Branchy', type: 'Logic', icon: '🔀', color: 'text-green-400', bg: 'bg-green-400/20' },
  'loops': { name: 'Cyclorn', type: 'Control', icon: '🔁', color: 'text-purple-400', bg: 'bg-purple-400/20' },
  'syntax_foundations': { name: 'Arch-Syn', type: 'Boss', icon: '👑', color: 'text-brand-400', bg: 'bg-brand-400/20' },
  'Code-Dex': { name: 'Code-Dex', type: 'Key Item', icon: '📖', color: 'text-pink-400', bg: 'bg-pink-400/20' }
};

export const getSkillMonDisplay = (topic) => {
  return SKILL_MONS_DB[topic] || { name: `${topic}-mon`, type: 'Wild', icon: '❓', color: 'text-gray-400', bg: 'bg-gray-400/20' };
};

