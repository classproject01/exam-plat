const jwt = require('jsonwebtoken');

exports.isAuthenticated = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.redirect('/Tlogin'); // or render login with a message
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect('/Tlogin');
    }
    req.user = decoded; // Attach user info to request
    next();
  });
};
exports.isAuthenticated = (req, res, next) => {
    const token = req.cookies.jwt;
  
    if (!token) {
      return res.redirect('/Slogin'); // or render login with a message
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.redirect('/Slogin');
      }
      req.user = decoded; // Attach user info to request
      next();
    });
  };
