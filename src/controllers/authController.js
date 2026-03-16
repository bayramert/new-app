// Şifre hashleme kütüphanesini dahil et
const bcrypt = require('bcryptjs');

// JSON okuma/yazma fonksiyonlarını al
const { readDB, writeDB } = require('../config/db');


// ───────────────────────────────────────
// KAYIT OL
// ───────────────────────────────────────
async function register(req, res) {

  // Frontend'den gelen form verilerini al
  const { username, email, password } = req.body;

  // Herhangi bir alan boşsa hata dön ve işlemi durdur
  if (!username || !email || !password)
    return res.status(400).json({ message: 'Tüm alanları doldur.' });

  // Şifre 6 karakterden kısaysa hata dön
  if (password.length < 6)
    return res.status(400).json({ message: 'Şifre en az 6 karakter olmalı.' });

  try {
    // users.json dosyasını oku
    const db = readDB();

    // Bu email veya kullanıcı adıyla daha önce kayıt olunmuş mu ara
    const existing = db.users.find(u => u.email === email || u.username === username);

    // Bulunduysa 409 (çakışma) kodu ile hata dön
    if (existing)
      return res.status(409).json({ message: 'Bu email veya kullanıcı adı zaten kullanılıyor.' });

    // Şifreyi hashle, 10 güvenlik seviyesi (standart değer)
    // await: bu işlem biraz zaman aldığı için bekle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı objesi oluştur
    const newUser = {
      id: Date.now(),           // O anki zaman milisaniye cinsinden, benzersiz id olarak kullanıyoruz
      username,
      email,
      password: hashedPassword, // Şifrenin kendisini değil, hashlenmiş halini kaydet
      role: 'user',             // Varsayılan rol user, adminler manuel atanır
      total_score: 0,           // Başlangıç puanı 0
      created_at: new Date().toISOString(), // Kayıt tarihi
    };

    // Kullanıcıyı listeye ekle
    db.users.push(newUser);

    // Listeyi users.json dosyasına yaz
    writeDB(db);

    // 201 = başarıyla oluşturuldu, frontend bu mesajı ekranda gösterir
    return res.status(201).json({ message: 'Kayıt başarılı! Giriş yapabilirsin.' });

  } catch (err) {
    console.error('Register hatası:', err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}


// ───────────────────────────────────────
// GİRİŞ YAP
// ───────────────────────────────────────
async function login(req, res) {

  // Frontend'den gelen email ve şifreyi al
  const { email, password } = req.body;

  // Boş alan kontrolü
  if (!email || !password)
    return res.status(400).json({ message: 'Email ve şifre gerekli.' });

  try {
    // users.json dosyasını oku
    const db = readDB();

    // Bu emaile sahip kullanıcıyı listede ara
    const user = db.users.find(u => u.email === email);

    // Kullanıcı bulunamadıysa 401 dön
    // "Email bulunamadı" demiyoruz, güvenlik için ikisini aynı mesajla gösteriyoruz
    if (!user)
      return res.status(401).json({ message: 'Email veya şifre hatalı.' });

    // Girilen şifreyi, veritabanındaki hashlenmiş şifreyle karşılaştır
    const isMatch = await bcrypt.compare(password, user.password);

    // Şifre yanlışsa 401 dön
    if (!isMatch)
      return res.status(401).json({ message: 'Email veya şifre hatalı.' });

    // Doğruysa kullanıcı bilgisini session'a yaz
    // Şifreyi buraya koymuyoruz, güvenlik için
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      total_score: user.total_score,
    };

    // Frontend'e başarı mesajı ve kullanıcı bilgisini gönder
    return res.status(200).json({ message: 'Giriş başarılı!', user: req.session.user });

  } catch (err) {
    console.error('Login hatası:', err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}


// ───────────────────────────────────────
// ÇIKIŞ YAP
// ───────────────────────────────────────
function logout(req, res) {

  // Session'ı tamamen sil
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Çıkış yapılamadı.' });

    // Tarayıcıdaki session cookie'sini de temizle
    res.clearCookie('connect.sid');

    return res.status(200).json({ message: 'Çıkış yapıldı.' });
  });
}


// ───────────────────────────────────────
// KİM GİRİŞ YAPMIŞ?
// ───────────────────────────────────────
function me(req, res) {

  // Session'da kullanıcı varsa bilgileri dön
  // Frontend sayfa yüklenince bunu çağırır, kullanıcı hala giriş yapmış mı kontrol eder
  if (req.session && req.session.user)
    return res.status(200).json({ user: req.session.user });

  // Yoksa 401 dön
  return res.status(401).json({ message: 'Giriş yapılmamış.' });
}

// Dört fonksiyonu dışarıya aktar
module.exports = { register, login, logout, me };