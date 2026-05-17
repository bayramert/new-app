const fs   = require('fs');
const path = require('path');

const GAMES_PATH  = path.join(__dirname, '../../database/games.json');
const SCORES_PATH = path.join(__dirname, '../../database/scores.json');

// ── Yardımcı: scores.json oku/yaz ──
function readScores() {
  if (!fs.existsSync(SCORES_PATH)) return { saves: [] };
  return JSON.parse(fs.readFileSync(SCORES_PATH, 'utf-8'));
}
function writeScores(data) {
  fs.writeFileSync(SCORES_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// ── GET /api/games ──
function getGames(req, res) {
  try {
    const data = JSON.parse(fs.readFileSync(GAMES_PATH, 'utf-8'));
    const { type, search } = req.query;
    let games = data.games;

    if (type && type !== 'Tümü')
      games = games.filter(g => g.type === type);

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      games = games.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({ games });
  } catch (err) {
    console.error('getGames hatası:', err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

// ── GET /api/games/save/:gameId ──
// Kullanıcının bu oyundaki kayıtlı ilerlemeyi döner
function loadSave(req, res) {
  const userId = req.session.user.id;
  const gameId = req.params.gameId;

  try {
    const db   = readScores();
    const save = db.saves.find(s => s.userId === userId && s.gameId === gameId);

    if (!save) return res.status(200).json({ save: null }); // İlk kez oynuyor
    return res.status(200).json({ save: save.data });
  } catch (err) {
    console.error('loadSave hatası:', err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

// ── POST /api/games/save/:gameId ──
// Kullanıcının ilerlemeini kaydeder (upsert)
function writeSave(req, res) {
  const userId = req.session.user.id;
  const gameId = req.params.gameId;
  const data   = req.body.data;

  if (!data) return res.status(400).json({ message: 'data eksik.' });

  try {
    const db  = readScores();
    const idx = db.saves.findIndex(s => s.userId === userId && s.gameId === gameId);

    const record = {
      userId,
      gameId,
      savedAt: new Date().toISOString(),
      data,
    };

    if (idx === -1) db.saves.push(record);
    else            db.saves[idx] = record;

    writeScores(db);
    return res.status(200).json({ message: 'Kaydedildi.' });
  } catch (err) {
    console.error('writeSave hatası:', err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

module.exports = { getGames, loadSave, writeSave };