const isPasswordStrong = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
};

const validateLogin = (req, res, next) => {
  const { identifier, password, role } = req.body;
  
  if (!identifier || !password || !role) {
    return res.status(400).json({
      success: false,
      message: 'Identifier, password, and role are required'
    });
  }
  
  if (typeof identifier !== 'string' || identifier.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Identifier must be a non-empty string'
    });
  }
  
  if (typeof password !== 'string' || password.length < 1) {
    return res.status(400).json({
      success: false,
      message: 'Password is required'
    });
  }
  
  // Validate role
  const normalizedRole = role.toUpperCase();
  const validRoles = ['ADMIN', 'SUPER_ADMIN', 'HR', 'FINANCE', 'LOAN_COMMITTEE', 'EMPLOYEE'];
  
  if (!validRoles.includes(normalizedRole)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role'
    });
  }
  
  // Update req.body.role to the normalized version so downstream uses it correctly
  req.body.role = normalizedRole;
  
  // For non-employee roles, validate format. Allow standard usernames with @ like Admin@2026
  if (normalizedRole !== 'EMPLOYEE') {
    // Relaxed regex: must contain @ but doesn't need to be a strict email (allows Admin@2026)
    if (!identifier.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Staff and administrators must log in with their email or identifier containing @'
      });
    }
  }
  
  next();
};

const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password, new password, and confirm password are required'
    });
  }
  
  if (!isPasswordStrong(newPassword)) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    });
  }
  
  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'New password and confirm password do not match'
    });
  }
  
  next();
};

const validateUpdateProfile = (req, res, next) => {
  const { first_name, last_name, phone_number, address } = req.body;
  
  if (first_name && (typeof first_name !== 'string' || first_name.trim().length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'First name must be a non-empty string'
    });
  }
  
  if (last_name && (typeof last_name !== 'string' || last_name.trim().length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'Last name must be a non-empty string'
    });
  }
  
  if (phone_number && (typeof phone_number !== 'string' || phone_number.trim().length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'Phone number must be a non-empty string'
    });
  }
  
  if (address && (typeof address !== 'string' || address.trim().length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'Address must be a non-empty string'
    });
  }
  
  next();
};

const validateRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required'
    });
  }
  
  if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token must be a non-empty string'
    });
  }
  
  next();
};

const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }
  
  // Relaxed for forgot password as well to correspond with login
  if (!email.includes('@')) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid identifier containing @'
    });
  }
  
  next();
};

const validateResetPassword = (req, res, next) => {
  const { token, newPassword, confirmPassword } = req.body;
  
  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Token, new password, and confirm password are required'
    });
  }
  
  if (!isPasswordStrong(newPassword)) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    });
  }
  
  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'New password and confirm password do not match'
    });
  }
  
  next();
};

module.exports = {
  validateLogin,
  validateChangePassword,
  validateUpdateProfile,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword
};
