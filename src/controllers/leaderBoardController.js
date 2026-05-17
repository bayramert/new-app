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
};

function readScores() {
  if (!fs.existsSync(SCORES_PATH)) return { saves: [] };
  return JSON.parse(fs.readFileSync(SCORES_PATH, 'utf-8'));
}

function buildLeaderboard(currentUserId, gameId = null) {
  const usersDb = readDB();
  const scoresDb = readScores();

  const rows = usersDb.users.map(user => {
    const userSaves = scoresDb.saves.filter(save => {
      if (save.userId !== user.id) return false;
      return !gameId || save.gameId === gameId;
    });
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
  const gameId = req.params.gameId || null;

  try {
    const leaderboard = buildLeaderboard(currentUserId, gameId);
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
  } catch (err) {
    console.error('getLeaderboard hatasi:', err);
    return res.status(500).json({ message: 'Sunucu hatasi.' });
  }
}

module.exports = { getLeaderboard };
