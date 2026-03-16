const bcrypt = require('bcryptjs');
const { readDB, writeDB } = require('../config/db');

// KAYIT OL
async function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Tüm alanları doldur.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Şifre en az 6 karakter olmalı.' });
  }

  try {
    const db = readDB();

    // Email veya username daha önce alınmış mı?
    const existing = db.users.find(
      (u) => u.email === email || u.username === username
    );

    if (existing) {
      return res.status(409).json({ message: 'Bu email veya kullanıcı adı zaten kullanılıyor.' });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluştur
    const newUser = {
      id: Date.now(),
      username,
      email,
      password: hashedPassword,
      role: 'user',
      total_score: 0,
      created_at: new Date().toISOString(),
    };

    db.users.push(newUser);
    writeDB(db);

    return res.status(201).json({ message: 'Kayıt başarılı! Giriş yapabilirsin.' });

  } catch (err) {
    console.error('Register hatası:', err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

// GİRİŞ YAP
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email ve şifre gerekli.' });
  }

  try {
    const db = readDB();

    const user = db.users.find((u) => u.email === email);

    if (!user) {
      return res.status(401).json({ message: 'Email veya şifre hatalı.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Email veya şifre hatalı.' });
    }

    // Session'a kullanıcı bilgisini kaydet (şifre hariç)
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      total_score: user.total_score,
    };

    return res.status(200).json({
      message: 'Giriş başarılı!',
      user: req.session.user,
    });

  } catch (err) {
    console.error('Login hatası:', err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}

// ÇIKIŞ YAP
function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Çıkış yapılamadı.' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Çıkış yapıldı.' });
  });
}

// KİM GİRİŞ YAPMIŞ?
function me(req, res) {
  if (req.session && req.session.user) {
    return res.status(200).json({ user: req.session.user });
  }
  return res.status(401).json({ message: 'Giriş yapılmamış.' });
}

module.exports = { register, login, logout, me };