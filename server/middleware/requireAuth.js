const { getUserByToken, COOKIE_NAME } = require('../auth');

function attachUser(req, res, next) {
  const token = req.cookies ? req.cookies[COOKIE_NAME] : null;
  req.user = getUserByToken(token);
  req.sessionToken = token;
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not signed in' });
  }
  next();
}

module.exports = { attachUser, requireAuth };
