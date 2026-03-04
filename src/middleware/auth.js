const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const userQuery = `
      SELECT u.*, ep.first_name, ep.last_name, ep.department, ep.job_grade 
      FROM users u 
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id 
      WHERE u.id = ? AND u.is_active = true
    `;
    
    const user = await query(userQuery, [decoded.userId]);
    
    if (!user || user.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token or user not found.' 
      });
    }

    req.user = user[0];
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};

const selfOrRoleCheck = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    const targetUserId = req.params.userId || req.params.id || req.body.user_id;
    
    if (req.user.id == targetUserId || allowedRoles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only access your own data.' 
      });
    }
  };
};

module.exports = {
  authMiddleware,
  roleMiddleware,
  selfOrRoleCheck
};
