const { GUJARAT_CITIES } = require('../utils/locationUtils');

// Middleware to verify user's location is in Gujarat
const requireGujaratLocation = (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Please log in to access this resource.',
    });
  }

  // Admins can bypass location check
  if (user.role === 'admin') {
    return next();
  }

  if (!user.location || !user.location.city) {
    return res.status(403).json({
      success: false,
      error: 'Location Required',
      message: 'Please set your Gujarat location in your profile to access this feature.',
    });
  }

  const userCity = user.location.city.toLowerCase().trim();
  const validCity = GUJARAT_CITIES.some(
    (city) => city.toLowerCase() === userCity
  );

  const userState = user.location.state ? user.location.state.toLowerCase().trim() : '';

  if (!validCity && userState !== 'gujarat') {
    return res.status(403).json({
      success: false,
      error: 'Location Restricted',
      message: 'This platform is currently available only for users in Gujarat, India.',
    });
  }

  next();
};

// Soft location check - warns but doesn't block
const suggestGujaratLocation = (req, res, next) => {
  const user = req.user;

  if (user && user.location && user.location.city) {
    const userCity = user.location.city.toLowerCase().trim();
    const validCity = GUJARAT_CITIES.some(
      (city) => city.toLowerCase() === userCity
    );

    if (!validCity) {
      req.locationWarning = 'Your location is outside Gujarat. Showing jobs from all Gujarat cities.';
    }
  }

  next();
};

module.exports = { requireGujaratLocation, suggestGujaratLocation };
