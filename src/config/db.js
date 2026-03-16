const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database/users.json');

// JSON dosyasını oku
function readDB() {
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

// JSON dosyasına yaz
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readDB, writeDB };