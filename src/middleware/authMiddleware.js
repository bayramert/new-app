// Kullanıcı giriş yapmış mı kontrol eden fonksiyon
// req: gelen istek, res: gönderilecek cevap, next: devam et
function isLoggedIn(req, res, next) {

  // Session var mı ve içinde kullanıcı bilgisi var mı bak
  if (req.session && req.session.user) {

    // Varsa devam et, bir sonraki adıma geç
    return next();
  }

  // Yoksa 401 hata kodu ile mesaj dön, istek burada durur
  return res.status(401).json({ message: 'Önce giriş yapmalısın.' });
}

// Kullanıcı admin mi kontrol eden fonksiyon
function isAdmin(req, res, next) {

  // Session var mı, kullanıcı var mı ve rolü admin mi kontrol et
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }

  // Admin değilse 403 (yetkisiz) kodu ile mesaj dön
  return res.status(403).json({ message: 'Bu işlem için yetkin yok.' });
}

// İki fonksiyonu dışarıya aktar
module.exports = { isLoggedIn, isAdmin };