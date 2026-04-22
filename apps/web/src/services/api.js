import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5055/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


export const UserService = {
  onboard: (data) => api.post('/user/onboard', data),
  getProfile: () => api.get('/user/profile'),
  updateStats: (data) => api.patch('/user/stats', data),
  saveExploredChunk: (chunkKey) => api.patch('/user/explore', { chunkKey }),
  getLeaderboard: (params) => api.get('/user/leaderboard', { params }),
};

export const GameService = {
  getChallenge: (topic, npcId) => api.get(`/game/challenge/${encodeURIComponent(topic)}`, {
    params: npcId ? { npcId } : undefined,
  }),
  getBossChallenge: (topic, npcId) => {
    let url = `/game/boss/${encodeURIComponent(topic)}`;
    if (npcId) url += `?npcId=${encodeURIComponent(npcId)}`;
    return api.get(url);
  },
  submitAnswer: (data) => api.post('/game/submit', data),
  studyTopic: (topic) => api.get(`/game/study/${encodeURIComponent(topic)}`),
  getSyntaxProvinceProgress: () => api.get('/game/progression/syntax-province'),
  getNpcInteractionStatus: (npcId) => api.get(`/game/npc/${npcId}`),
  interactWithNpc: (npcId) => api.post(`/game/npc/${encodeURIComponent(npcId)}/interact`),
  resolveLesson: (lessonId, data) => api.post(`/game/lesson/${encodeURIComponent(lessonId)}/resolve`, data),
  resolveNpcBattle: (npcId, data) => api.post(`/game/npc/${npcId}/resolve`, data),
  chatWithSupport: (message) => api.post('/game/support/chat', { message }),
  consumeItem: (itemType) => api.post('/game/inventory/consume', { itemType }),
  getHint: (questionText, topic, difficulty, hintLevel) => api.post('/game/hint', {
    questionText,
    topic,
    difficulty,
    hintLevel,
  }),
};

export const ShopService = {
  getItems: () => api.get('/shop/items'),
  purchaseItem: (itemType) => api.post('/shop/buy', { itemType }),
};
