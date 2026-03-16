const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./src/routes/auth');

const app = express();
const PORT = 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session ayarları
app.use(session({
  secret: 'oyun_sitesi_gizli_anahtar',// Express kütüphanesini dahil et (web sunucusu için)
const express = require('express');

// Session yönetimi için kütüphaneyi dahil et
const session = require('express-session');

// Dosya yolu oluşturmak için path modülünü dahil et
const path = require('path');

// Auth route dosyasını dahil et
const authRoutes = require('./src/routes/auth');

// Express uygulamasını oluştur
const app = express();

// Port numarasını belirle
// Canlıya alınca platform kendi portunu verir (process.env.PORT)
// Yoksa 8080 kullan
const PORT = process.env.PORT || 8080;

// Gelen JSON verilerini okuyabilmek için middleware ekle
app.use(express.json());

// Gelen form verilerini okuyabilmek için middleware ekle
app.use(express.urlencoded({ extended: true }));

// Session ayarlarını yap
app.use(session({
  // Session şifreleme anahtarı, tahmin edilemez bir şey olmalı
  secret: 'oyun_sitesi_gizli_anahtar',

  // Session değişmemişse tekrar kaydetme
  resave: false,

  // Boş session'ları kaydetme
  saveUninitialized: false,

  cookie: {
    // JavaScript'in cookie'ye erişmesini engelle (XSS koruması)
    httpOnly: true,

    // Cookie'nin geçerlilik süresi: 1 gün (milisaniye cinsinden)
    maxAge: 1000 * 60 * 60 * 24,
  },
}));

// public klasöründeki dosyaları (HTML, CSS, JS) direkt tarayıcıya sun
app.use(express.static(path.join(__dirname, 'public')));

// /api/auth ile başlayan istekleri auth route dosyasına yönlendir
app.use('/api/auth', authRoutes);

// Ana sayfaya istek gelince index.html dosyasını gönder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Sunucuyu başlat ve belirtilen portu dinle
app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 gün
  },
}));

// Statik dosyalar
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);

// Ana sayfa
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});