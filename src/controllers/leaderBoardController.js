const fs = require('fs');
const path = require('path');
const { readDB } = require('../config/db');

const SCORES_PATH = path.join(__dirname, '../../database/scores.json');

const GAME_META = {
  'cat-clicker': {
    name: 'Dans Eden KEDY',
    label: 'Para',
    getScore: data => Number(data?.state?.totalEarned) || 0,
  },
  'flappy-cat': {
    name: 'Ucan KEDY',
    label: 'En Iyi Skor',
    getScore: data => Number(data?.bestScore) || 0,
  },
  'rps-cat': {
    name: 'Tas Kagit Makas KEDY',
    label: 'Puan',
    getScore: data => (Number(data?.wins) || 0) * 3 + (Number(data?.draws) || 0),
  },
  'cat-clicker': { name: 'Dans Eden KEDY', label: 'Para', getScore: data => data?.state?.totalEarned ?? 0 },
  'flappy-cat': { name: 'Ucan KEDY', label: 'En Iyi Skor', getScore: data => data?.bestScore ?? 0 },
};

function readScores() {
  if (!fs.existsSync(SCORES_PATH)) return { saves: [] };
  return JSON.parse(fs.readFileSync(SCORES_PATH, 'utf-8'));
}

function buildLeaderboard(currentUserId) {
  const usersDb = readDB();
  const scoresDb = readScores();

  const rows = usersDb.users.map(user => {
    const userSaves = scoresDb.saves.filter(save => save.userId === user.id);
    const games = userSaves.map(save => {
      const meta = GAME_META[save.gameId] || {
        name: save.gameId,
        label: 'Skor',
        getScore: () => 0,
      };

      return {
        gameId: save.gameId,
        gameName: meta.name,
        label: meta.label,
        score: meta.getScore(save.data),
        savedAt: save.savedAt,
      };
    });

    const totalScore = games.reduce((sum, game) => sum + game.score, 0);
    const lastPlayedAt = games.reduce((latest, game) => {
      if (!game.savedAt) return latest;
      if (!latest || new Date(game.savedAt) > new Date(latest)) return game.savedAt;
      return latest;
    }, null);

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      totalScore,
      games,
      lastPlayedAt,
      isCurrentUser: user.id === currentUserId,
    };
  });

  return rows
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return (a.username || '').localeCompare(b.username || '');
    })
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function getLeaderboard(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const currentUserId = req.session.user.id;

  try {
    const leaderboard = buildLeaderboard(currentUserId);
    const total = leaderboard.length;
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const start = (page - 1) * limit;
    const items = leaderboard.slice(start, start + limit);
    const currentUser = leaderboard.find(row => row.id === currentUserId) || null;

    return res.status(200).json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
      currentUser,
    });
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
