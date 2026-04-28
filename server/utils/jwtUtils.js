const jwt = require('jsonwebtoken');

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
};

const cookieOptions = () => {
  const secureCookies = process.env.COOKIE_SECURE === 'true';
  return {
    httpOnly: true,
    secure: secureCookies,
    // Cross-site (Netlify frontend ↔ Render backend) needs 'none'+secure.
    // Local dev keeps 'lax' so cookies still flow over http.
    sameSite: secureCookies ? 'none' : 'lax',
    path: '/',
  };
};

const setTokenCookie = (res, token, cookieName = 'token') => {
  res.cookie(cookieName, token, {
    ...cookieOptions(),
    maxAge: cookieName === 'refreshToken'
      ? 30 * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000,
  });
};

const clearTokenCookies = (res) => {
  const opts = { ...cookieOptions(), maxAge: 0 };
  res.clearCookie('token', opts);
  res.clearCookie('refreshToken', opts);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setTokenCookie,
  clearTokenCookies,
};
