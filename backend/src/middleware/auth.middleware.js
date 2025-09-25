import jwt from 'jsonwebtoken';
import User from '../model/user.model.js';

export const protectedRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);

    req.user = await User.findById(decoded.userId).select('-password');
    console.log("User from DB:", req.user);

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (err) {
    console.log('Authentication middleware error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

