const fs = require('fs');
const path = require('path');
const { readDB } = require('../config/db');

const SCORES_PATH = path.join(__dirname, '../../database/scores.json');

const GAME_META = {
  'cat-clicker': { name: 'Dans Eden KEDY', label: 'Para', getScore: data => data?.state?.totalEarned ?? 0 },
  'flappy-cat': { name: 'Ucan KEDY', label: 'En Iyi Skor', getScore: data => data?.bestScore ?? 0 },
};

function readScores() {
  if (!fs.existsSync(SCORES_PATH)) return { saves: [] };
  return JSON.parse(fs.readFileSync(SCORES_PATH, 'utf-8'));
}

function getLeaderboard(req, res) {
  const { gameId } = req.params;

  try {
    const usersDb = readDB();
    const scoresDb = readScores();
    const meta = GAME_META[gameId] || { name: gameId, label: 'Skor', getScore: data => data?.score ?? 0 };

    const leaderboard = scoresDb.saves
      .filter(save => save.gameId === gameId)
      .map(save => {
        const user = usersDb.users.find(item => item.id === save.userId);
        return {
          userId: save.userId,
          username: user ? user.username : 'silinmis-kullanici',
          gameId,
          gameName: meta.name,
          label: meta.label,
          score: meta.getScore(save.data),
          savedAt: save.savedAt,
          resetAt: save.resetAt || null,
          resetByAdmin: Boolean(save.resetByAdmin),
        };
      })
      .sort((a, b) => b.score - a.score || new Date(b.savedAt) - new Date(a.savedAt));

    return res.status(200).json({ leaderboard });
  } catch (err) {
    console.error('getLeaderboard hatasi:', err);
    return res.status(500).json({ message: 'Sunucu hatasi.' });
  }
}

module.exports = { getLeaderboard };
