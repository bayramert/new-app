const fs = require('fs');
const path = require('path');
const { readDB, writeDB } = require('../config/db');

const SCORES_PATH = path.join(__dirname, '../../database/scores.json');

const RESET_DATA = {
  'cat-clicker': {
    state: { currency: 0, totalEarned: 0, totalClicks: 0, perClick: 1 },
    upgrades: [
      { id: 'u1', purchased: false },
      { id: 'u2', purchased: false },
      { id: 'u3', purchased: false },
      { id: 'u4', purchased: false },
      { id: 'u5', purchased: false },
    ],
    autoClickers: [
      { id: 'a1', count: 0 },
      { id: 'a2', count: 0 },
      { id: 'a3', count: 0 },
      { id: 'a4', count: 0 },
      { id: 'a5', count: 0 },
    ],
  },
  'flappy-cat': { bestScore: 0 },
};

function readScores() {
  if (!fs.existsSync(SCORES_PATH)) return { saves: [] };
  return JSON.parse(fs.readFileSync(SCORES_PATH, 'utf-8'));
}

function writeScores(data) {
  fs.writeFileSync(SCORES_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function buildResetSave(userId, gameId) {
  const now = new Date().toISOString();
  return {
    userId,
    gameId,
    savedAt: now,
    resetAt: now,
    resetByAdmin: true,
    data: RESET_DATA[gameId] || { score: 0 },
  };
}

function listUsers(req, res) {
  try {
    const db = readDB();
    const users = db.users.map(({ password, ...user }) => user);
    return res.status(200).json({ users });
  } catch (err) {
    console.error('listUsers hatasi:', err);
    return res.status(500).json({ message: 'Sunucu hatasi.' });
  }
}

function deleteUser(req, res) {
  const userId = Number(req.params.userId);
  if (!userId) return res.status(400).json({ message: 'Gecersiz kullanici.' });

  try {
    const db = readDB();
    const before = db.users.length;
    db.users = db.users.filter(user => user.id !== userId);
    if (db.users.length === before) return res.status(404).json({ message: 'Kullanici bulunamadi.' });

    writeDB(db);

    const scoresDb = readScores();
    scoresDb.saves = scoresDb.saves.filter(save => save.userId !== userId);
    writeScores(scoresDb);

    return res.status(200).json({ message: 'Kullanici ve skor kayitlari silindi.' });
  } catch (err) {
    console.error('deleteUser hatasi:', err);
    return res.status(500).json({ message: 'Sunucu hatasi.' });
  }
}

function setBan(req, res) {
  const userId = Number(req.params.userId);
  const { banned } = req.body;
  if (!userId) return res.status(400).json({ message: 'Gecersiz kullanici.' });

  try {
    const db = readDB();
    const user = db.users.find(item => item.id === userId);
    if (!user) return res.status(404).json({ message: 'Kullanici bulunamadi.' });

    user.banned = Boolean(banned);
    writeDB(db);

    return res.status(200).json({
      message: user.banned ? 'Kullanici yasaklandi.' : 'Kullanici yasagi kaldirildi.',
      user: { id: user.id, banned: user.banned },
    });
  } catch (err) {
    console.error('setBan hatasi:', err);
    return res.status(500).json({ message: 'Sunucu hatasi.' });
  }
}

function resetUserGame(req, res) {
  const userId = Number(req.params.userId);
  const { gameId } = req.body;
  if (!userId || !gameId) return res.status(400).json({ message: 'Kullanici ve oyun gerekli.' });

  try {
    const db = readDB();
    if (!db.users.some(user => user.id === userId)) {
      return res.status(404).json({ message: 'Kullanici bulunamadi.' });
    }

    const scoresDb = readScores();
    const idx = scoresDb.saves.findIndex(save => save.userId === userId && save.gameId === gameId);
    const resetSave = buildResetSave(userId, gameId);

    if (idx === -1) scoresDb.saves.push(resetSave);
    else scoresDb.saves[idx] = resetSave;

    writeScores(scoresDb);
    return res.status(200).json({ message: 'Oyuncunun bu oyundaki skoru sifirlandi.' });
  } catch (err) {
    console.error('resetUserGame hatasi:', err);
    return res.status(500).json({ message: 'Sunucu hatasi.' });
  }
}

function resetGameForAll(req, res) {
  const { gameId } = req.body;
  if (!gameId) return res.status(400).json({ message: 'Oyun gerekli.' });

  try {
    const db = readDB();
    const scoresDb = readScores();
    const users = db.users.filter(user => user.role !== 'admin');

    users.forEach(user => {
      const idx = scoresDb.saves.findIndex(save => save.userId === user.id && save.gameId === gameId);
      const resetSave = buildResetSave(user.id, gameId);
      if (idx === -1) scoresDb.saves.push(resetSave);
      else scoresDb.saves[idx] = resetSave;
    });

    writeScores(scoresDb);
    return res.status(200).json({ message: 'Secilen oyunda herkesin skoru sifirlandi.' });
  } catch (err) {
    console.error('resetGameForAll hatasi:', err);
    return res.status(500).json({ message: 'Sunucu hatasi.' });
  }
}

module.exports = { listUsers, deleteUser, setBan, resetUserGame, resetGameForAll };
