const fs = require('fs');
const path = require('path');

const GAMES_PATH = path.join(__dirname, '../../database/games.json');

function getGames(req, res) {
  try {
    const data = JSON.parse(fs.readFileSync(GAMES_PATH, 'utf-8'));
    const { type, search } = req.query;

    let games = data.games;

    // Tür filtresi
    if (type && type !== 'Tümü') {
      games = games.filter(g => g.type === type);
    }

    // Arama filtresi
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

module.exports = { getGames };