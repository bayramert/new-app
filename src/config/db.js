// Dosya sistemi modülünü dahil et (dosya okuma/yazma için)
const fs = require('fs');

// Dosya yolu oluşturmak için path modülünü dahil et
const path = require('path');

// users.json dosyasının tam yolunu oluştur
// __dirname: bu dosyanın bulunduğu klasör
// ../../database/users.json: iki üst klasöre çık, database klasörüne gir
const DB_PATH = path.join(__dirname, '../../database/users.json');

// JSON dosyasını okuyup JavaScript objesine çeviren fonksiyon
function readDB() {

  // Dosyayı oku, utf-8 formatında metin olarak al
  const data = fs.readFileSync(DB_PATH, 'utf-8');

  // Metni JavaScript objesine çevir ve döndür
  return JSON.parse(data);
}

// JavaScript objesini JSON dosyasına yazan fonksiyon
function writeDB(data) {

  // Objeyi metne çevir, null ve 2 güzel görünüm için (girintili yaz)
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// İki fonksiyonu dışarıya aktar, diğer dosyalar kullanacak
module.exports = { readDB, writeDB };