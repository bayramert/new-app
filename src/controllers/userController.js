const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { readDB, writeDB } = require('../config/db');

const SCORES_PATH = path.join(__dirname, '../../database/scores.json');

// gameId slug -> { görünen ad, skor etiketi, veri okuyucu }
const GAME_META = {
  'cat-clicker': { name: 'Dans Eden KEDY', label: 'Para',        getScore: d => d?.state?.totalEarned ?? 0 },
  'rps-cat':      { name: 'Tas Kagit Makas KEDY', label: 'Puan',  getScore: d => ((d?.wins ?? 0) * 3) + (d?.draws ?? 0) },
  'flappy-cat':  { name: 'Ucan KEDY',      label: 'En İyi Skor', getScore: d => d?.bestScore ?? 0 },
};

// ── GET /api/users/profile ──
function getProfile(req, res) {
  const userId = req.session.user.id;
  try {
    const db   = readDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    const scoresDb = fs.existsSync(SCORES_PATH)
      ? JSON.parse(fs.readFileSync(SCORES_PATH, 'utf-8'))
      : { saves: [] };

    const scores = scoresDb.saves
      .filter(s => s.userId === userId)
      .map(s => {
        const meta = GAME_META[s.gameId] || { name: s.gameId, label: 'Skor', getScore: () => 0 };
        return {
          gameId:   s.gameId,
          gameName: meta.name,
          label:    meta.label,
          score:    meta.getScore(s.data),
          savedAt:  s.savedAt,
        };
      });

    return res.status(200).json({
      user: {
        id:          user.id,
        firstName:   user.firstName,
        lastName:    user.lastName,
        username:    user.username,
        email:       user.email,
        total_score: user.total_score,
        created_at:  user.created_at,
      },
      scores,
    });
  } catch (err) {
    console.error('getProfile hatası:', err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

// ── PUT /api/users/username ──
async function updateUsername(req, res) {
  const userId = req.session.user.id;
  const { username } = req.body;

  if (!username || username.trim().length < 3)
    return res.status(400).json({ message: 'Kullanıcı adı en az 3 karakter olmalı.' });

  const trimmed = username.trim();
  try {
    const db  = readDB();
    const dup = db.users.find(u => u.username === trimmed && u.id !== userId);
    if (dup) return res.status(409).json({ message: 'Bu kullanıcı adı zaten alınmış.' });

    const idx = db.users.findIndex(u => u.id === userId);
    if (idx === -1) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    db.users[idx].username = trimmed;
    writeDB(db);
    req.session.user.username = trimmed;

    return res.status(200).json({ message: 'Kullanıcı adı güncellendi.' });
  } catch (err) {
    console.error('updateUsername hatası:', err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

// ── PUT /api/users/password ──
async function updatePassword(req, res) {
  const userId = req.session.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: 'Tüm alanları doldur.' });

  if (newPassword.length < 6)
    return res.status(400).json({ message: 'Yeni şifre en az 6 karakter olmalı.' });

  try {
    const db  = readDB();
    const idx = db.users.findIndex(u => u.id === userId);
    if (idx === -1) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    const isMatch = await bcrypt.compare(currentPassword, db.users[idx].password);
    if (!isMatch) return res.status(401).json({ message: 'Mevcut şifre yanlış.' });

    db.users[idx].password = await bcrypt.hash(newPassword, 10);
    writeDB(db);

    return res.status(200).json({ message: 'Şifre başarıyla güncellendi.' });
  } catch (err) {
    console.error('updatePassword hatası:', err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

module.exports = { getProfile, updateUsername, updatePassword };
