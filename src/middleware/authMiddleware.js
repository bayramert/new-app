// Kullanıcı giriş yapmış mı kontrol eder
function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ message: 'Önce giriş yapmalısın.' });
}

// Admin mi kontrol eder
function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Bu işlem için yetkin yok.' });
}

module.exports = { isLoggedIn, isAdmin };