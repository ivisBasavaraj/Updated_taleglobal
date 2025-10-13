const jwt = require('jsonwebtoken');
const Candidate = require('../models/Candidate');
const Employer = require('../models/Employer');
const Admin = require('../models/Admin');
const SubAdmin = require('../models/SubAdmin');
const Placement = require('../models/Placement');

const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        console.log('Auth failed: No token provided');
        return res.status(401).json({ message: 'No token, authorization denied' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      let user;

      console.log('Token decoded successfully, role:', decoded.role, 'id:', decoded.id);

      if (decoded.role === 'candidate') {
        user = await Candidate.findById(decoded.id).select('-password');
      } else if (decoded.role === 'employer') {
        user = await Employer.findById(decoded.id).select('-password');
      } else if (decoded.role === 'admin') {
        user = await Admin.findById(decoded.id).select('-password');
      } else if (decoded.role === 'sub-admin') {
        user = await SubAdmin.findById(decoded.id).select('-password');
      } else if (decoded.role === 'placement') {
        user = await Placement.findById(decoded.id).select('-password');
      }
      
      if (!user) {
        console.log('Auth failed: User not found for role:', decoded.role, 'id:', decoded.id);
        return res.status(401).json({ message: 'User not found or account deactivated' });
      }

      // Check if placement officer is active or pending
      if (decoded.role === 'placement' && user.status !== 'active' && user.status !== 'pending') {
        console.log('Auth failed: Placement officer account is not active:', user.status);
        return res.status(401).json({ message: 'Account is not active. Please contact admin.' });
      }

      if (roles.length && !roles.includes(decoded.role)) {
        // Allow sub-admin to access admin routes
        if (decoded.role === 'sub-admin' && roles.includes('admin')) {
          // Sub-admin can access admin routes
        } else {
          console.log('Auth failed: Role access denied. Required:', roles, 'Got:', decoded.role);
          return res.status(403).json({ message: 'Access denied - insufficient permissions' });
        }
      }

      req.user = user;
      req.userRole = decoded.role;
      next();
    } catch (error) {
      console.log('Auth failed: Token verification error:', error.message);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired, please login again' });
      }
      res.status(401).json({ message: 'Invalid token' });
    }
  };
};

module.exports = auth;