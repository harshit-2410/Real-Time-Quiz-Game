const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const {ApiResponseCodes} = require('../helpers/responseHelper');

exports.verifyUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(ApiResponseCodes.UNAUTHORIZED).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user || !req.user.isLoggedIn) {
      return res.status(ApiResponseCodes.UNAUTHORIZED).json({ message: 'Invalid or expired token' });
    }
    next();
  } catch (err) {
    res.status(ApiResponseCodes.UNAUTHORIZED).json({ message: 'Invalid token' });
  }
};
