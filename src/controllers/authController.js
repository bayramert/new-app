const bcrypt = require('bcryptjs');
const { readDB, writeDB } = require('../config/db');

async function register(req, res) {
  const { firstName, lastName, username, email, password } = req.body;

  if (!firstName || !lastName || !username || !email || !password) {
    return res.status(400).json({ message: 'Tum alanlari doldur.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Sifre en az 6 karakter olmali.' });
  }

  if (!email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ message: 'Gecerli bir email gir.' });
  }

  try {
    const db = readDB();
    const existing = db.users.find(user => user.email === email || user.username === username);
    if (existing) {
      return res.status(409).json({ message: 'Bu email veya kullanici adi zaten kullaniliyor.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now(),
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      role: 'user',
      banned: false,
      total_score: 0,
      created_at: new Date().toISOString(),
    };

    db.users.push(newUser);
    writeDB(db);

    return res.status(201).json({ message: 'Kayit basarili! Giris yapabilirsin.' });
  } catch (err) {
    console.error('Register hatasi:', err);
    return res.status(500).json({ message: 'Sunucu hatasi.' });
  }
}

async function login(req, res) {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Tum alanlari doldur.' });
  }

  try {
    if (identifier === 'admin123' && password === 'admin123') {
      req.session.user = {
        id: 'admin',
        firstName: 'Admin',
        lastName: 'Panel',
        username: 'admin123',
        email: 'admin@local',
        role: 'admin',
        total_score: 0,
      };

      return res.status(200).json({ message: 'Admin girisi basarili!', user: req.session.user });
    }

    const db = readDB();
    const user = identifier.includes('@')
      ? db.users.find(item => item.email === identifier)
      : db.users.find(item => item.username === identifier);

    if (!user) {
      return res.status(401).json({ message: 'Bilgiler hatali.' });
    }

    if (user.banned) {
      return res.status(403).json({ message: 'Hesabin yasaklanmis.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Bilgiler hatali.' });
    }

    req.session.user = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role,
      total_score: user.total_score,
      banned: Boolean(user.banned),
    };

    return res.status(200).json({ message: 'Giris basarili!', user: req.session.user });
  } catch (err) {
    console.error('Login hatasi:', err);
    return res.status(500).json({ message: 'Sunucu hatasi.' });
  }
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Cikis yapilamadi.' });
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Cikis yapildi.' });
  });
}

function me(req, res) {
  if (req.session && req.session.user) {
    return res.status(200).json({ user: req.session.user });
  }
  return res.status(401).json({ message: 'Giris yapilmamis.' });
}

module.exports = { register, login, logout, me };
