const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

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
    
    const userResult = await pool.execute(userQuery, [decoded.userId]);
    const user = userResult[0];
    
    console.log('Auth middleware - User found:', user.length > 0);
    console.log('Auth middleware - User role:', user[0]?.role);
    console.log('Auth middleware - User ID:', user[0]?.id);
    
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
    console.log('Role middleware - User role:', req.user?.role);
    console.log('Role middleware - Allowed roles:', allowedRoles);
    console.log('Role middleware - User exists:', !!req.user);
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log('Role middleware - Access denied. Role not in allowed list');
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
    console.log('SelfOrRoleCheck middleware - allowedRoles:', allowedRoles);
    console.log('SelfOrRoleCheck middleware - allowedRoles type:', typeof allowedRoles);
    console.log('SelfOrRoleCheck middleware - req.user:', req.user);
    console.log('SelfOrRoleCheck middleware - req.user.id:', req.user?.id);
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    const targetUserId = req.params.userId || req.params.id || req.body.user_id;
    console.log('SelfOrRoleCheck middleware - targetUserId:', targetUserId);
    
    // If targetUserId is undefined, this means user is accessing their own profile
    const isOwnProfile = !targetUserId;
    console.log('SelfOrRoleCheck middleware - isOwnProfile:', isOwnProfile);
    
    if (isOwnProfile || req.user.id == targetUserId || (allowedRoles && allowedRoles.includes(req.user.role))) {
      console.log('SelfOrRoleCheck middleware - ACCESS GRANTED');
      next();
    } else {
      console.log('SelfOrRoleCheck middleware - ACCESS DENIED');
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
