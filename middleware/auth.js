const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  //we want to send out token in the header with a key of auth-token
  const token = req.header('auth-token');
  //check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  //else verify the token
  try {
    const decoded = jwt.verify(token, config.get('JWT_SECRET'));
    req.user = decoded.user.id;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
